"""
backend/utils/image_utils.py
Image helper functions.
"""

import base64
import io
from PIL import Image


def image_to_base64(image: Image.Image, format: str = "JPEG") -> str:
    """Convert PIL Image to base64 string for embedding directly in JSON response."""
    buffer = io.BytesIO()
    image.save(buffer, format=format, quality=90)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def create_side_by_side(
    original:  Image.Image,
    generated: Image.Image,
    size:      tuple = (512, 512),
    gap:       int   = 16,
) -> Image.Image:
    """
    Combine original and generated images side by side on a light grey canvas.
    Returns a single wide PIL Image.
    """
    orig = original.convert("RGB").resize(size)
    gen  = generated.convert("RGB").resize(size)

    total_w = size[0] * 2 + gap
    canvas  = Image.new("RGB", (total_w, size[1]), color=(235, 235, 235))
    canvas.paste(orig, (0, 0))
    canvas.paste(gen,  (size[0] + gap, 0))
    return canvas
