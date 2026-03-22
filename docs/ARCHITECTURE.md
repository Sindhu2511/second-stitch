# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│   Upload Page → Result Page (before/after slider)          │
│   Supabase Auth · Favourites · Save · Share                │
└────────────────────────┬────────────────────────────────────┘
                         │ POST /api/upcycle (multipart/form-data)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. detection.py — Validate image (type, size)      │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  2. classifier.py — EfficientNet-B3                 │   │
│  │     503K DeepFashion2 images · 13 categories        │   │
│  │     91.45% test accuracy                            │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  3. prompt_engine.py — Upcycle rule lookup          │   │
│  │     Determines transform_type + fabric_prompt       │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  4. sd_pipeline.py — Main transformation            │   │
│  │                                                     │   │
│  │  a) SegFormer-B3 (sayeed99/segformer-b3-fashion)    │   │
│  │     → 19-label fashion segmentation                 │   │
│  │     → Extract garment mask (labels 1-6)             │   │
│  │     → Erase person + background → white canvas      │   │
│  │                                                     │   │
│  │  b) Geometric Transformation (deterministic)        │   │
│  │     → shorten_hem: cut pixels below cut_row         │   │
│  │     → remove_sleeves: erase outer sleeve regions    │   │
│  │     → shorten_sleeves: erase lower sleeve portion   │   │
│  │     → combinations of above                         │   │
│  │                                                     │   │
│  │  c) Crop + Center on 1024×1024 white canvas         │   │
│  │                                                     │   │
│  │  d) SDXL Inpainting (hem edge finishing only)       │   │
│  │     → 80px strip at cut_row                         │   │
│  │     → strength=0.75, guidance=12.0, steps=40        │   │
│  │     → Generates clean sewn-looking hem edge         │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  5. Save to /uploads/ · Return JSON response        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
              GET /uploads/{filename}
              (Static file serving via FastAPI)
```

---

## Key Design Decisions

### Why geometric cutting instead of full inpainting?

We extensively tested diffusion-based approaches (see [Development Journey](DEVELOPMENT_JOURNEY.md)) and found that no inpainting approach could reliably perform **structural geometric transformation** (shortening a hem by 40%) while preserving fabric identity. Generative models either:
- Changed too little (strength too low)
- Completely redrew the garment in a different style (strength too high)

Geometric pixel cutting is **deterministic and guaranteed** — if you want to shorten a dress, you delete the bottom pixels. SDXL is then used only for the 80px edge strip where it excels: generating a realistic fabric texture for the new hem edge.

### Why SegFormer over rembg?

`rembg` performs foreground/background separation. When a person wears a garment, both the person and the garment are "foreground." SegFormer-B3 trained on fashion data segments 19 specific labels including `top`, `dress`, `pants`, `skin`, `hair` separately — allowing us to extract **only clothing pixels** and erase the person completely.

### Why EfficientNet-B3?

- Better accuracy/parameter tradeoff than ResNet architectures
- Faster inference than ViT models
- Works well on fashion imagery with compound scaling
- timm library provides pretrained weights and easy fine-tuning

### API Design

Single endpoint `POST /api/upcycle` handles everything. The frontend sends a raw image file and receives a JSON response with:
- `generated_url` — path to the transformed image
- `original_url` — path to the saved original
- `detected_garment` — what the classifier found
- `upcycle_name` — name of the transformation applied
- `description` — human-readable description

---

## SegFormer Label Map (sayeed99/segformer-b3-fashion)

| Label | Class | Used? |
|-------|-------|-------|
| 0 | Background | ❌ |
| 1 | Top | ✅ |
| 2 | Outer | ✅ |
| 3 | Skirt | ✅ |
| 4 | Dress | ✅ |
| 5 | Pants | ✅ |
| 6 | Leggings | ✅ |
| 7 | Headwear | ❌ |
| 8 | Eyeglass | ❌ |
| 9 | Neckwear | ❌ |
| 10 | Belt | ❌ |
| 11 | Footwear | ❌ |
| 12 | Bag | ❌ |
| 13 | Hair | ❌ |
| 14 | Face | ❌ |
| 15 | Skin | ❌ |
| 16 | Ring | ❌ |
| 17 | Wrist | ❌ |
| 18 | Tights | ❌ |
| 19 | Others | ❌ |

---

## Transform Types

| transform_type | Operation |
|---|---|
| `shorten_hem` | Delete pixels below 62% of garment height |
| `shorten_legs` | Delete pixels below 50% of garment height |
| `remove_sleeves` | Erase outer 18% of width in top 40% of garment height |
| `shorten_sleeves` | Erase outer sleeves from 22% to 40% height |
| `shorten_sleeves_and_hem` | Both sleeve shortening and hem shortening |
| `remove_sleeves_and_shorten_hem` | Full sleeve removal and hem shortening |
