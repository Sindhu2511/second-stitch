"""
backend/models/sd_pipeline.py

Key fixes:
  1. Non-garment pixels (person, background) hard-erased to white BEFORE inpainting
  2. Edit mask strength 0.55-0.70 — enough to actually change hem/sleeves
  3. Composite step restores UNMASKED garment pixels from original after inpainting
     so only the target region changes and everything else is pixel-perfect original
  4. SegFormer label debug always printed so we can verify segmentation
"""

import torch
import numpy as np
from PIL import Image, ImageFilter
import cv2

CLOTHING_LABELS = {4, 5, 6, 7}  # top, outer, skirt, dress, pants, leggings

_seg_processor = None
_seg_model     = None


def _get_segformer():
    from transformers import SegformerImageProcessor, SegformerForSemanticSegmentation
    processor = SegformerImageProcessor.from_pretrained("sayeed99/segformer-b3-fashion")
    model     = SegformerForSemanticSegmentation.from_pretrained("sayeed99/segformer-b3-fashion")
    model.eval()
    return processor, model


def segment_garment(image: Image.Image) -> tuple[np.ndarray, np.ndarray]:
    """
    Returns:
      garment_mask : (H,W) uint8 — 255=garment pixels only
      seg_map      : (H,W) uint8 — full label map
    """
    global _seg_processor, _seg_model
    if _seg_processor is None:
        print("  Loading SegFormer …")
        _seg_processor, _seg_model = _get_segformer()
        print("  ✓ SegFormer ready")

    inputs = _seg_processor(images=image, return_tensors="pt")
    with torch.no_grad():
        logits = _seg_model(**inputs).logits

    upsampled = torch.nn.functional.interpolate(
        logits, size=(image.height, image.width),
        mode="bilinear", align_corners=False,
    )
    seg_map = upsampled.argmax(dim=1).squeeze().numpy().astype(np.uint8)
    print("\n===== SEGMENTATION DEBUG =====")
    labels = np.unique(seg_map)
    print("SegFormer labels found:", labels)
    
    for l in labels:
        count = (seg_map == l).sum()
        print(f"label {l} pixels: {count}")

    mask = np.zeros_like(seg_map, dtype=np.uint8)
    
    # Keep only clothing labels
    for label in CLOTHING_LABELS:
        mask[seg_map == label] = 255
    
    # Explicitly remove non-garment parts
    NON_GARMENT = {2, 11, 14, 15, 16}
    
    for label in NON_GARMENT:
        mask[seg_map == label] = 0

    # Morphological cleanup — fill holes in garment region
    k    = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k, iterations=2)

    # Keep only largest connected component
    n, cc, stats, _ = cv2.connectedComponentsWithStats(mask)
    if n > 1:
        largest = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        mask    = ((cc == largest) * 255).astype(np.uint8)

    # Fallback to rembg if SegFormer fails
    if mask.max() == 0:
        print("  ⚠ SegFormer empty — using rembg fallback")
        from rembg import remove as rembg_remove
        rgba = rembg_remove(image.convert("RGBA"))
        arr  = np.array(rgba)
        mask = (arr[:, :, 3] > 128).astype(np.uint8) * 255

    print(f"  Garment pixels: {(mask == 255).sum():,}")
    Image.fromarray(mask).save("debug_garment_mask.png")
    return mask, seg_map


def erase_non_garment(image: Image.Image, garment_mask: np.ndarray) -> Image.Image:
    """
    Hard-erase everything outside the garment mask to white.
    This removes person, background, accessories BEFORE inpainting.
    """
    arr    = np.array(image.convert("RGB"))
    result = np.full_like(arr, 255)  # white canvas
    result[garment_mask == 255] = arr[garment_mask == 255]
    return Image.fromarray(result)


# ── Region mask helpers ───────────────────────────────────────────────────────

def create_sleeve_mask(garment_mask: np.ndarray) -> np.ndarray:
    """Mask sleeves using garment bounding box instead of full image width."""

    ys, xs = np.where(garment_mask > 0)
    if len(xs) == 0:
        return garment_mask

    min_x, max_x = xs.min(), xs.max()
    min_y, max_y = ys.min(), ys.max()

    width  = max_x - min_x
    height = max_y - min_y

    result = np.zeros_like(garment_mask)

    # Sleeve region = upper part of garment
    top_limit = min_y + int(height * 0.45)

    # Sleeve region = outer edges of garment
    left_boundary  = min_x + int(width * 0.22)
    right_boundary = max_x - int(width * 0.22)

    result[min_y:top_limit, min_x:left_boundary] = garment_mask[min_y:top_limit, min_x:left_boundary]
    result[min_y:top_limit, right_boundary:max_x] = garment_mask[min_y:top_limit, right_boundary:max_x]

    return _smooth_mask(result)


def create_hem_mask(garment_mask: np.ndarray, keep_top: float = 0.70) -> np.ndarray:
    """
    Mask the BOTTOM hem region only.
    keep_top=0.52 → mask bottom 48% of garment height.
    Larger keep_top = less of the garment masked = smaller change.
    """
    H, W   = garment_mask.shape
    result = garment_mask.copy()
    rows   = np.where(garment_mask.any(axis=1))[0]
    if len(rows) == 0:
        return result
    top_row = rows[0]
    bot_row = rows[-1]
    cut_row = int(top_row + (bot_row - top_row) * keep_top)
    # Zero out above cut (keep only below cut as the mask)
    result[:cut_row, :] = 0
    return _smooth_mask(result)


def create_lower_leg_mask(garment_mask: np.ndarray) -> np.ndarray:
    """Mask lower 45% of trouser legs."""
    return create_hem_mask(garment_mask, keep_top=0.55)


def create_sleeve_and_hem_mask(garment_mask: np.ndarray) -> np.ndarray:
    """Mask sleeves + bottom hem — for long top → crop short sleeve."""
    sleeve   = create_sleeve_mask(garment_mask)
    hem      = create_hem_mask(garment_mask, keep_top=0.58)
    combined = np.clip(sleeve.astype(int) + hem.astype(int), 0, 255).astype(np.uint8)
    return _smooth_mask(combined)


def _smooth_mask(mask: np.ndarray) -> np.ndarray:
    k    = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))
    mask = cv2.dilate(mask, k, iterations=1)
    mask = cv2.GaussianBlur(mask, (9, 9), 0)
    _, mask = cv2.threshold(mask, 100, 255, cv2.THRESH_BINARY)

def get_edit_mask(garment_mask: np.ndarray, mask_type: str) -> np.ndarray:
    if mask_type == "sleeve":
        return create_sleeve_mask(garment_mask)
    elif mask_type == "hem":
        return create_hem_mask(garment_mask)
    elif mask_type == "lower_leg":
        return create_lower_leg_mask(garment_mask)
    elif mask_type == "sleeve_and_hem":
        return create_sleeve_and_hem_mask(garment_mask)
    else:
        return garment_mask.copy()


# ── Crop + center ─────────────────────────────────────────────────────────────

def _crop_and_center(
    clean_image:  Image.Image,   # garment on white (person already erased)
    garment_mask: np.ndarray,
    edit_mask:    np.ndarray,
    target_size:  tuple = (1024, 1024),
    padding:      int   = 60,
) -> tuple[Image.Image, Image.Image, Image.Image]:
    coords = cv2.findNonZero(garment_mask)
    if coords is None:
        x1, y1, x2, y2 = 0, 0, clean_image.width, clean_image.height
    else:
        x, y, w, h = cv2.boundingRect(coords)
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(clean_image.width,  x + w + padding)
        y2 = min(clean_image.height, y + h + padding)

    img_crop = clean_image.crop((x1, y1, x2, y2))
    gm_crop  = Image.fromarray(garment_mask).crop((x1, y1, x2, y2))
    em_crop  = Image.fromarray(edit_mask).crop((x1, y1, x2, y2))

    cw, ch = img_crop.size
    scale  = min(target_size[0] / cw, target_size[1] / ch) * 0.85
    nw, nh = int(cw * scale), int(ch * scale)

    img_crop = img_crop.resize((nw, nh), Image.LANCZOS)
    gm_crop  = gm_crop.resize((nw, nh),  Image.NEAREST)
    em_crop  = em_crop.resize((nw, nh),  Image.NEAREST)

    ox = (target_size[0] - nw) // 2
    oy = (target_size[1] - nh) // 2

    canvas = Image.new("RGB", target_size, (255, 255, 255))
    canvas.paste(img_crop, (ox, oy))  # clean image — person already erased

    gm_canvas = Image.new("L", target_size, 0)
    gm_canvas.paste(gm_crop, (ox, oy))

    em_canvas = Image.new("L", target_size, 0)
    em_canvas.paste(em_crop, (ox, oy))

    print("\n===== CROP DEBUG =====")
    print("Original size:", clean_image.size)
    print("Crop box:", x1, y1, x2, y2)
    print("Crop size:", img_crop.size)
    
    return canvas, gm_canvas, em_canvas


# ── SDXL Pipeline ─────────────────────────────────────────────────────────────

class SDXLPipeline:
    _instance = None

    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.dtype  = torch.float16 if self.device == "cuda" else torch.float32
        print(f"  Loading SDXL Inpainting on {self.device} …")

        from diffusers import StableDiffusionXLInpaintPipeline
        self.pipe = StableDiffusionXLInpaintPipeline.from_pretrained(
            "diffusers/stable-diffusion-xl-1.0-inpainting-0.1",
            torch_dtype     = self.dtype,
            use_safetensors = True,
        ).to(self.device)
        self.pipe.enable_model_cpu_offload()
        self.pipe.vae.enable_slicing()
        print("  ✓ SDXL Inpainting ready")

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = SDXLPipeline()
        return cls._instance

    def generate(
        self,
        image:           Image.Image,
        prompt:          str,
        negative_prompt: str,
        mask_type:       str   = "full",
        strength:        float = 0.60,
        guidance_scale:  float = 12.0,
        num_steps:       int   = 50,
        size:            tuple = (1024, 1024),
    ) -> Image.Image:

        image_rgb = image.convert("RGB")

        # Step 1 — Segment garment only
        garment_mask, seg_map = segment_garment(image_rgb)

        # Step 2 — Hard erase person/background → garment on white
        clean = erase_non_garment(image_rgb, garment_mask)
        
        print("\n===== CLEAN IMAGE DEBUG =====")
        clean.save("debug_clean_garment.png")

        # Step 3 — Build region-specific edit mask
        edit_mask = get_edit_mask(garment_mask, mask_type)
        overlay = np.array(image_rgb).copy()
        overlay[edit_mask == 255] = [255, 0, 0]
        Image.fromarray(overlay).save("debug_mask_overlay.png")
        print("\n===== EDIT MASK DEBUG =====")
        print("mask_type:", mask_type)
        print("edit pixels:", (edit_mask == 255).sum())
        if (edit_mask == 255).sum() < 500:
            print("⚠ WARNING: Edit mask extremely small!")
        Image.fromarray(edit_mask).save("debug_edit_mask.png")
        print(f"  mask_type={mask_type}  edit_pixels={( edit_mask==255).sum():,}")

        # Step 4 — Crop garment + center on white canvas
        canvas, gm_pil, em_pil = _crop_and_center(clean, garment_mask, edit_mask, size)
        
        print("\n===== CANVAS DEBUG =====")
        canvas.save("debug_canvas.png")
        gm_pil.save("debug_garment_mask_canvas.png")
        em_pil.save("debug_edit_mask_canvas.png")

        # Step 5 — Save pre-inpaint canvas for composite step
        canvas_arr = np.array(canvas)

        # Step 6 — SDXL inpaints ONLY the edit region
        result = self.pipe(
            prompt              = prompt,
            negative_prompt     = negative_prompt,
            image               = canvas,
            mask_image          = em_pil.convert("L"),
            strength            = strength,
            guidance_scale      = guidance_scale,
            num_inference_steps = num_steps,
            width               = size[0],
            height              = size[1],
        ).images[0]

        result.save("debug_sdxl_raw.png")

        print("\n===== INPAINT MASK DEBUG =====")
        print("mask min:", np.array(em_pil).min())
        print("mask max:", np.array(em_pil).max())

        # Step 7 — Composite: restore all UNMASKED garment pixels from original
        # Only the edit region pixels come from SDXL
        em_arr    = np.array(em_pil)
        result_arr = np.array(result)
        composite  = result_arr.copy()
        unmasked   = em_arr < 128
        composite[unmasked] = canvas_arr[unmasked]

        Image.fromarray(composite).save("debug_final.png")

        return Image.fromarray(composite)
