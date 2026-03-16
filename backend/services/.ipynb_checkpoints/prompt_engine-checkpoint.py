"""
backend/services/prompt_engine.py
Strengths raised to 0.55-0.70 so SDXL actually modifies the masked region.
Prompts anchored to input garment for fabric/color/pattern preservation.
"""

_BASE = (
    "preserve the original garment fabric, color, pattern and texture, "
    "edit only the masked region of the garment, "
    "maintain original garment shape outside the mask, "
    "preserve fabric continuity across edited areas, "
    "realistic clothing construction, clean tailoring seams, "
    "sharp focus, high resolution"
)

_NEG = (
    "person, human face, human body, mannequin, model pose, "
    "different color, different fabric, different pattern, "
    "grey background, dark background, background clutter, "
    "low quality, blurry, distorted, watermark, text"
)

BEST_UPCYCLE = {

    "short sleeve top": {
        "upcycle_name":    "Sleeveless Top",
        "description":     "Sleeves removed",
        "mask_type":       "sleeve",
        "prompt":          f"{_BASE}, sleeves completely removed, clean armhole hem, sleeveless",
        "negative_prompt": _NEG + ", sleeves, long sleeves, short sleeves",
        "strength":        0.65,
    },

    "long sleeve top": {
        "upcycle_name":    "Crop Short Sleeve",
        "description":     "Sleeves shortened and hem cropped",
        "mask_type":       "sleeve_and_hem",
        "prompt":          f"{_BASE}, sleeves cut short above elbow, hemline cropped at midriff",
        "negative_prompt": _NEG + ", long sleeves, full length",
        "strength":        0.65,
    },

    "short sleeve outwear": {
        "upcycle_name":    "Sleeveless Vest",
        "description":     "Sleeves removed",
        "mask_type":       "sleeve",
        "prompt":          f"{_BASE}, sleeves removed, clean armhole, sleeveless vest",
        "negative_prompt": _NEG + ", sleeves",
        "strength":        0.65,
    },

    "long sleeve outwear": {
        "upcycle_name":    "Short Sleeve Jacket",
        "description":     "Sleeves cut short",
        "mask_type":       "sleeve",
        "prompt":          f"{_BASE}, sleeves cut short above elbow, clean hemmed edge",
        "negative_prompt": _NEG + ", long sleeves",
        "strength":        0.60,
    },

    "vest": {
        "upcycle_name":    "Cropped Vest",
        "description":     "Hem cropped",
        "mask_type":       "hem",
        "prompt":          f"{_BASE}, hemline cropped to midriff, shorter length",
        "negative_prompt": _NEG + ", full length",
        "strength":        0.65,
    },

    "sling": {
        "upcycle_name":    "Crop Sling",
        "description":     "Hem cropped",
        "mask_type":       "hem",
        "prompt":          f"{_BASE}, hemline cropped to midriff",
        "negative_prompt": _NEG + ", full length",
        "strength":        0.65,
    },

    "shorts": {
        "upcycle_name":    "Mini Skirt",
        "description":     "Reshaped into mini skirt",
        "mask_type":       "lower_leg",
        "prompt":          f"{_BASE}, transformed into mini skirt, no leg division, skirt silhouette",
        "negative_prompt": _NEG + ", shorts, divided legs, trousers",
        "strength":        0.70,
    },

    "trousers": {
        "upcycle_name":    "Tailored Shorts",
        "description":     "Lower legs removed",
        "mask_type":       "lower_leg",
        "prompt":          f"{_BASE}, lower legs cut off, clean straight hemline above knee, shorts",
        "negative_prompt": _NEG + ", full length trousers, long pants",
        "strength":        0.68,
    },

    "skirt": {
        "upcycle_name":    "Mini Skirt",
        "description":     "Hemline shortened to mini",
        "mask_type":       "hem",
        "prompt":          f"{_BASE}, hemline dramatically shortened to well above knee, mini skirt",
        "negative_prompt": _NEG + ", long skirt, maxi, midi",
        "strength":        0.65,
    },

    "short sleeve dress": {
        "upcycle_name":    "Sleeveless Mini Dress",
        "description":     "Sleeves removed and hem shortened",
        "mask_type":       "sleeve_and_hem",
        "prompt":          f"{_BASE}, sleeves removed, hemline shortened to above knee, mini dress",
        "negative_prompt": _NEG + ", sleeves, long dress, maxi, midi",
        "strength":        0.65,
    },

    "long sleeve dress": {
        "upcycle_name":    "Short Sleeve Mini Dress",
        "description":     "Sleeves and hem both shortened",
        "mask_type":       "sleeve_and_hem",
        "prompt":          f"{_BASE}, sleeves cut short, hemline above knee, mini dress length",
        "negative_prompt": _NEG + ", long sleeves, long dress, maxi, midi",
        "strength":        0.65,
    },

    "vest dress": {
        "upcycle_name":    "Mini Vest Dress",
        "description":     "Hemline shortened to mini",
        "mask_type":       "hem",
        "prompt":          f"{_BASE}, hemline shortened to above knee, mini length",
        "negative_prompt": _NEG + ", long dress, maxi, midi",
        "strength":        0.65,
    },

    "sling dress": {
        "upcycle_name":    "Mini Sling Dress",
        "description":     "Hemline shortened to mini",
        "mask_type":       "hem",
        "prompt":          f"{_BASE}, hemline shortened to above knee, mini length",
        "negative_prompt": _NEG + ", long dress, maxi, midi",
        "strength":        0.65,
    },
}


def get_best_upcycle(garment: str) -> dict:
    return BEST_UPCYCLE.get(garment, {
        "upcycle_name":    "Restyled",
        "description":     "Restyled garment",
        "mask_type":       "hem",
        "prompt":          f"{_BASE}, modernised silhouette, shorter length",
        "negative_prompt": _NEG,
        "strength":        0.65,
    })
