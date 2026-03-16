# Development Journey

A complete account of every approach tried, what failed, why it failed, and what was changed. This document exists so future developers understand the reasoning behind every architectural decision.

---

## Phase 1 — Data Processing & Model Training ✅

### Goal
Build a classifier that identifies garment type from any photo.

### What we did
- Downloaded DeepFashion2 — 503,000 cropped garment images, 13 categories
- Chose EfficientNet-B3 over ResNet/ViT for accuracy/speed balance
- Encountered severe class imbalance (up to 128× between categories)

### Fixes applied
- **WeightedRandomSampler** to oversample rare classes during training
- **Sqrt-inverse frequency loss** — `CrossEntropyLoss(weight=1/sqrt(freq))` — balances without over-penalising the majority class
- Differential learning rates: 3e-4 for the classifier head, 3e-5 for the backbone

### Result
**91.45% test accuracy.** Classifier works reliably in production.

---

## Phase 2 — SD v1.5 img2img ❌

### Goal
Generate an upcycled version of the garment using Stable Diffusion v1.5 img2img.

### What we tried
Feed the garment image + an upcycle prompt (e.g. "sleeveless version of this dress, flat lay, white background") into SD v1.5 img2img.

### What failed
- Generated completely different garments — wrong color, wrong fabric, wrong style
- Consistently hallucinated humans wearing the clothes
- 512×512 output was too low quality
- Prompt engineering had no meaningful effect on structure preservation

### Why it failed
SD v1.5 has insufficient capacity for structure-preserving garment transformation. At img2img it treats the input as a loose style guide, not a strict constraint.

### Decision
**Scrapped.** Moved to SDXL + ControlNet.

---

## Phase 3 — SDXL + ControlNet (Canny Edges) ❌

### Goal
Use ControlNet to preserve garment structure via edge guidance while SDXL redesigns the style.

### What we tried
1. Extract Canny edges from input image
2. Feed edges to ControlNet-SDXL-1.0 (diffusers/controlnet-canny-sdxl-1.0)
3. SDXL guided by edges generates garment at 1024×1024

Downloaded ~14GB of models (SDXL base + ControlNet + refiner + VAE).

### What failed
- Output was grey pencil sketches on grey background
- ControlNet extracted edges of the **person wearing the clothes**, not the garment
- The person's body silhouette bled into every output
- White lace dress became grey sketch
- Wrong color throughout — original garment color never preserved

### Why it failed
Canny edge detection on a person-worn garment photo produces edges of the person's body, pose, and silhouette — all mixed together with garment edges. ControlNet cannot separate them. The model sees one connected shape.

### Decision
**Scrapped.** ControlNet requires a clean garment-only input. Need to remove the person first.

---

## Phase 4 — SDXL Inpainting + rembg ❌

### Goal
Remove background first using rembg, then use the alpha mask as the inpainting region.

### What we tried
1. `rembg.remove()` on input image → RGBA output
2. Alpha channel used as garment mask
3. SDXL Inpainting redraws within mask

### What failed
- rembg segments **foreground vs background** — the person's body, hair, and hands are all "foreground"
- The entire person + dress was kept in the mask
- Output showed a ghosted/blurry person with a slightly modified dress

### Why it failed
rembg has no concept of clothing. It separates subject from background. When a person wears clothes, both are the subject.

### Decision
**rembg alone is insufficient.** Need clothing-specific segmentation.

---

## Phase 5 — SDXL Inpainting + SegFormer (Private Model) ❌

### Goal
Use a fashion-specific segmentation model to isolate only garment pixels.

### First attempt
Used `matei-dorian/segformer-b5-finetuned-human-parsing-v2`.

### What failed
Model was **private/gated on HuggingFace** — 401 Unauthorized error on every request, even without needing special data.

### Fix
Switched to `sayeed99/segformer-b3-fashion` — fully public, no token required, trained on 19 fashion-specific labels (top, dress, pants, skirt, skin, hair, face, etc.).

SegFormer now **correctly isolates garment pixels.** Person erased. Clean garment on white background. ✅

---

## Phase 5b — SDXL Inpainting with Full Garment Mask ❌

### Goal
With clean garment segmentation, use SDXL to inpaint the transformation.

### What we tried
Mask = full garment region. Various strength values tested.

### What failed

| Strength | Result |
|----------|--------|
| 0.28–0.35 | Nothing changed. Output identical to input. |
| 0.55–0.65 | Garment completely redrawn — different fabric, different color, different style |
| 0.70+ | Hallucinated entirely different garments |

No value produced "shorten the hem while keeping everything else identical."

### Why it failed
SDXL Inpainting is designed for texture and style edits within a region. It cannot perform **geometric structural operations** like "remove the bottom 40% of this dress." It interprets the mask as "draw something here" not "modify the geometry here."

### Decision
Full-garment masking cannot achieve structural transformation. Need partial masking targeting only the region to change.

---

## Phase 6 — Partial Masking (Sleeve Mask, Hem Mask) ❌

### Goal
Instead of masking the whole garment, mask only the region that needs to change.

### What we built
- `create_sleeve_mask()` — outer 28% of image width, top 50% of height
- `create_hem_mask()` — bottom 45-48% of garment height
- `create_lower_leg_mask()` — bottom 45% for trousers
- Composite step: after inpainting, restore all unmasked pixels from original

### What failed
1. **Sleeve mask cut into shirt body** — dress shirts have wide sleeves extending far across the image; 28% from edge was too aggressive
2. **The composite step made hem shortening impossible** — if we restore unmasked pixels (everything above the cut), the dress stays full length. If we don't restore them, the background bleeds in.
3. **Fundamental contradiction:** inpainting cannot "delete" pixels. It can only replace them with generated content. But generated content in the hem region still looks like hem fabric, not like the garment ended there.

### Root cause
Diffusion inpainting models generate **content that fills a region**. They cannot **remove** a region geometrically. Shortening a hem requires deletion of pixels, not replacement.

### Decision
**Inpainting-based transformation is the wrong paradigm for structural geometric changes.** Move to deterministic geometric cutting.

---

## Phase 7 — Geometric Cutting Pipeline ✅

### The insight
Stop asking a generative model to perform a deterministic geometric operation. Just do it deterministically.

### What we built
```python
# shorten_hem: literally delete pixels below cut_row
arr[cut_row:, :] = 255  # white

# remove_sleeves: literally erase sleeve pixel regions
arr[top_row:mid_row, min_x:left_col]  = 255
arr[top_row:mid_row, right_col:max_x] = 255
```

SDXL only runs on an **80px strip at the cut edge** to generate a clean, sewn-looking hem.

### Bugs encountered and fixed

| Bug | Fix |
|-----|-----|
| `_smooth_mask()` missing `return mask` — returned None, crashed pipeline | Added `return mask` |
| `CLOTHING_LABELS = {4,5,6,7}` — wrong IDs for sayeed99 model | Corrected to `{1,2,3,4,5,6}` |
| `generation.py` calling `mask_type` but pipeline expected `transform_type` | Updated both files |
| `prompt_engine.py` on server still had old `mask_type` keys | Rewrote via Python script (heredoc got mangled in terminal) |
| Sleeve removal cutting into shirt body | Tightened boundary from 28% to 18% from garment edges |
| `short sleeve dress` sleeves being removed (puff sleeves looked chopped off) | Changed transform to `shorten_hem` only |
| Hem cut too aggressive | Increased `keep_fraction` from 0.55 to 0.62 |

### Result
- Green midi dress → mini dress: **confirmed working and visually correct** ✅
- Wide leg trousers → tailored shorts: **confirmed working** ✅
- Sleeve removal: works but boundary tuning is still garment-dependent ⚠️

---

## Phase 8 — Frontend Integration

### Issues encountered

| Problem | Fix |
|---------|-----|
| Node.js v12 on server — all packages unsupported | Installed Node 20 via nvm |
| Missing `lucide-react` package | `npm install lucide-react` |
| Frontend not accessible from home (college LAN) | ngrok tunnel |
| ngrok free plan only allows 1 tunnel | Served frontend as static files from FastAPI, single ngrok tunnel for backend |
| `vite.config.js` base path wrong | Set `base: '/'` |
| Frontend blank white page | Wrong base path in Vite config |
| Result page: original image zoomed/cropped by slider | `object-cover` → `object-contain`, fixed inner container width math |
| API returning 21 bytes "Internal Server Error" | Multiple bugs: missing return, wrong label IDs, wrong key names |
| `prompt_engine.py` mismatch (mask_type vs transform_type) | Rewrote file on server via Python |

---

## Summary: What Worked vs What Didn't

| Approach | Outcome |
|----------|---------|
| SD v1.5 img2img | ❌ Wrong garments, hallucinated humans |
| SDXL + ControlNet (Canny) | ❌ Grey sketches, person silhouette bleeding |
| SDXL Inpainting + rembg | ❌ Person kept in mask |
| SegFormer private model | ❌ 401 Unauthorized |
| SDXL Inpainting + SegFormer full mask | ❌ Either nothing changed or full redraw |
| SDXL Inpainting partial masks | ❌ Composite restored original, defeating the purpose |
| **Geometric cutting + SDXL edge finishing** | ✅ **Working in production** |
| EfficientNet-B3 classifier | ✅ 91.45% accuracy |
| SegFormer garment segmentation | ✅ Clean garment isolation |

### Key Lesson
Generative AI (diffusion models) excels at **texture, style, and appearance** editing. It fails at **deterministic geometric operations** like "remove the bottom 40% of this garment." The right tool for geometric transformation is geometry — delete the pixels. Use AI only where AI excels: generating a realistic fabric texture for the new edge.
