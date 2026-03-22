"""
backend/services/generation.py
"""
import uuid
from pathlib import Path
from PIL import Image

from backend.models.classifier      import GarmentClassifier
from backend.models.sd_pipeline     import SDXLPipeline
from backend.services.prompt_engine import get_best_upcycle

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)


def run_upcycle(image: Image.Image) -> dict:
    # Classify
    classifier = GarmentClassifier.get()
    prediction = classifier.predict(image)
    garment    = prediction["category"]
    confidence = prediction["confidence"]
    print(f"  Detected: {garment} ({confidence:.2%})")

    # Get config
    upcycle = get_best_upcycle(garment)
    print(f"  Transform: {upcycle['transform_type']} → {upcycle['upcycle_name']}")

    # Save original
    orig_name = f"orig_{uuid.uuid4().hex[:10]}.jpg"
    image.convert("RGB").save(UPLOADS_DIR / orig_name, quality=90)

    # Generate
    sd = SDXLPipeline.get()
    generated = sd.generate(
        image           = image,
        transform_type  = upcycle["transform_type"],
        fabric_prompt   = upcycle["fabric_prompt"],
        negative_prompt = upcycle["negative_prompt"],
    )

    # Save
    gen_name = f"gen_{uuid.uuid4().hex[:10]}.jpg"
    generated.save(UPLOADS_DIR / gen_name, quality=95)

    return {
        "detected_garment": garment,
        "confidence":       confidence,
        "upcycle_name":     upcycle["upcycle_name"],
        "description":      upcycle["description"],
        "original_url":     f"/uploads/{orig_name}",
        "generated_url":    f"/uploads/{gen_name}",
    }
