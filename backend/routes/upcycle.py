"""
backend/routes/upcycle.py

Single endpoint:
  POST /api/upcycle
    - Upload image
    - EfficientNet classifies garment
    - Best upcycle auto-selected
    - SD img2img generates upcycled version
    - Returns original + generated + side-by-side base64
"""

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.services.detection   import load_and_validate
from backend.services.generation  import run_upcycle
from backend.utils.image_utils    import image_to_base64, create_side_by_side
from pathlib import Path

router = APIRouter()

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"


class UpcycleResponse(BaseModel):
    success:          bool
    detected_garment: str
    confidence:       float
    upcycle_name:     str
    description:      str
    original_url:     str
    generated_url:    str
    side_by_side_b64: str   # base64 JPEG — display directly in <img src="data:image/jpeg;base64,...">


@router.post("/upcycle", response_model=UpcycleResponse)
async def upcycle(file: UploadFile = File(...)):
    """
    Upload any garment image.
    Returns the AI-generated upcycled version + side-by-side comparison.

    Frontend usage:
      const form = new FormData()
      form.append("file", imageFile)
      const res = await fetch("/api/upcycle", { method: "POST", body: form })
      const data = await res.json()
      // data.side_by_side_b64 → show in <img src={`data:image/jpeg;base64,${data.side_by_side_b64}`} />
      // data.generated_url    → or use as <img src={`http://SERVER:8080${data.generated_url}`} />
    """
    contents = await file.read()
    image    = load_and_validate(contents, file.content_type)
    result   = run_upcycle(image)

    # Build side-by-side
    orig_img = Image.open(UPLOADS_DIR / result["original_url"].split("/")[-1])
    gen_img  = Image.open(UPLOADS_DIR / result["generated_url"].split("/")[-1])
    sbs      = create_side_by_side(orig_img, gen_img)
    sbs_b64  = image_to_base64(sbs)

    return UpcycleResponse(
        success          = True,
        detected_garment = result["detected_garment"],
        confidence       = result["confidence"],
        upcycle_name     = result["upcycle_name"],
        description      = result["description"],
        original_url     = result["original_url"],
        generated_url    = result["generated_url"],
        side_by_side_b64 = sbs_b64,
    )


# fix missing PIL import
from PIL import Image
