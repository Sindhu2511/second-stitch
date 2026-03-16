"""
backend/main.py  —  Second Stitch API
═══════════════════════════════════════════════════════════════════════════════
Run:
  cd ~/Second_Stitch
  uvicorn backend.main:app --host 0.0.0.0 --port 8080 --reload

Endpoints:
  GET  /api/health   — check GPU + model status
  POST /api/upcycle  — upload image → get upcycled result
  GET  /docs         — interactive Swagger UI
═══════════════════════════════════════════════════════════════════════════════
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from backend.routes import upcycle
from backend.models.classifier  import GarmentClassifier
from backend.models.sd_pipeline import SDXLPipeline

app = FastAPI(
    title       = "Second Stitch API",
    description = "AI-powered garment classification and upcycling",
    version     = "1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],   # tighten to your frontend URL in production
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Serve uploaded/generated images statically ────────────────────────────────
UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(upcycle.router, prefix="/api")


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    import torch
    return {
        "status": "ok",
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "gpu":    torch.cuda.get_device_name(0) if torch.cuda.is_available() else "none",
    }


# ── Warm up both models at startup ───────────────────────────────────────────
@app.on_event("startup")
async def startup():
    print("\n  Warming up models …")
    GarmentClassifier.get()
    SDXLPipeline.get()
    print("  ✓ All models ready\n")
