_FABRIC_BASE = (
    "clean finished hem edge, same fabric, same color, same texture, "
    "same pattern, sewn edge, flat lay on white background, "
    "no person, no model, sharp focus"
)

_NEG = (
    "person, human, face, body, skin, hair, model, mannequin, "
    "different color, different fabric, different pattern, "
    "grey background, dark background, low quality, blurry, distorted, watermark"
)

BEST_UPCYCLE = {
    "short sleeve top":     {"upcycle_name": "Sleeveless Top",        "description": "Sleeves removed",                  "transform_type": "remove_sleeves",                 "fabric_prompt": f"clean armhole edge, {_FABRIC_BASE}",                          "negative_prompt": _NEG},
    "long sleeve top":      {"upcycle_name": "Crop Short Sleeve",     "description": "Sleeves shortened and hem cropped", "transform_type": "shorten_sleeves_and_hem",        "fabric_prompt": f"clean cut sleeve and cropped hem, {_FABRIC_BASE}",           "negative_prompt": _NEG},
    "short sleeve outwear": {"upcycle_name": "Sleeveless Vest",       "description": "Sleeves removed",                  "transform_type": "remove_sleeves",                 "fabric_prompt": f"clean armhole edge, {_FABRIC_BASE}",                          "negative_prompt": _NEG},
    "long sleeve outwear":  {"upcycle_name": "Short Sleeve Jacket",   "description": "Sleeves cut short",                "transform_type": "shorten_sleeves",                "fabric_prompt": f"clean cut sleeve edge above elbow, {_FABRIC_BASE}",          "negative_prompt": _NEG},
    "vest":                 {"upcycle_name": "Cropped Vest",          "description": "Hem cropped",                      "transform_type": "shorten_hem",                    "fabric_prompt": f"clean cropped hemline, {_FABRIC_BASE}",                       "negative_prompt": _NEG},
    "sling":                {"upcycle_name": "Crop Sling",            "description": "Hem cropped",                      "transform_type": "shorten_hem",                    "fabric_prompt": f"clean cropped hemline, {_FABRIC_BASE}",                       "negative_prompt": _NEG},
    "shorts":               {"upcycle_name": "Mini Skirt",            "description": "Reshaped into mini skirt",         "transform_type": "shorten_hem",                    "fabric_prompt": f"clean mini skirt hemline, {_FABRIC_BASE}",                    "negative_prompt": _NEG},
    "trousers":             {"upcycle_name": "Tailored Shorts",       "description": "Lower legs removed",               "transform_type": "shorten_legs",                   "fabric_prompt": f"clean cut hemline above knee, {_FABRIC_BASE}",                "negative_prompt": _NEG},
    "skirt":                {"upcycle_name": "Mini Skirt",            "description": "Hemline shortened to mini",        "transform_type": "shorten_hem",                    "fabric_prompt": f"clean mini skirt hemline, {_FABRIC_BASE}",                    "negative_prompt": _NEG},
    "short sleeve dress":   {"upcycle_name": "Mini Dress",            "description": "Hemline shortened to mini",        "transform_type": "shorten_hem", "fabric_prompt": f"clean armhole and short hemline, {_FABRIC_BASE}",             "negative_prompt": _NEG},
    "long sleeve dress":    {"upcycle_name": "Mini Dress",            "description": "Hemline shortened to mini",        "transform_type": "shorten_hem",        "fabric_prompt": f"clean cut sleeve and shortened hemline, {_FABRIC_BASE}",     "negative_prompt": _NEG},
    "vest dress":           {"upcycle_name": "Mini Vest Dress",       "description": "Hemline shortened to mini",        "transform_type": "shorten_hem",                    "fabric_prompt": f"clean mini hemline, {_FABRIC_BASE}",                          "negative_prompt": _NEG},
    "sling dress":          {"upcycle_name": "Mini Sling Dress",      "description": "Hemline shortened to mini",        "transform_type": "shorten_hem",                    "fabric_prompt": f"clean mini hemline, {_FABRIC_BASE}",                          "negative_prompt": _NEG},
}

def get_best_upcycle(garment: str) -> dict:
    return BEST_UPCYCLE.get(garment, {
        "upcycle_name": "Restyled", "description": "Hemline shortened",
        "transform_type": "shorten_hem",
        "fabric_prompt": f"clean hemline, {_FABRIC_BASE}",
        "negative_prompt": _NEG,
    })
