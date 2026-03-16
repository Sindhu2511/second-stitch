"""
backend/services/detection.py
Validates and loads uploaded image before passing to classifier.
"""

import io
from PIL import Image
from fastapi import HTTPException

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_SIZE_MB   = 10


def load_and_validate(contents: bytes, content_type: str) -> Image.Image:
    """
    Validate uploaded file and return PIL Image.
    Raises HTTPException on invalid input.
    """
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Use JPEG, PNG, or WebP.",
        )

    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum is {MAX_SIZE_MB} MB.",
        )

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image file.")

    if image.width < 50 or image.height < 50:
        raise HTTPException(
            status_code=400,
            detail="Image too small. Minimum 50×50 pixels.",
        )

    return image
