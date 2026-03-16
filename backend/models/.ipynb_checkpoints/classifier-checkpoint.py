"""
backend/models/classifier.py
Loads best.pt and runs EfficientNet-B3 inference.
Singleton — model loads once at startup, reused for every request.
"""

from pathlib import Path
import torch
import torch.nn as nn
from torch.amp import autocast
from torchvision import transforms
from PIL import Image
import timm

# ── Config (must match train.py) ──────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
CKPT_PATH    = PROJECT_ROOT / "checkpoints" / "best.pt"
IMG_SIZE     = 224
MODEL_NAME   = "efficientnet_b3"
DROPOUT      = 0.3

CATEGORY_MAP = {
    1: "short sleeve top",     2: "long sleeve top",
    3: "short sleeve outwear", 4: "long sleeve outwear",
    5: "vest",                 6: "sling",
    7: "shorts",               8: "trousers",
    9: "skirt",                10: "short sleeve dress",
    11: "long sleeve dress",   12: "vest dress",
    13: "sling dress",
}
CAT_IDS     = sorted(CATEGORY_MAP.keys())
ID2IDX      = {cid: i for i, cid in enumerate(CAT_IDS)}
IDX2NAME    = {i: CATEGORY_MAP[cid] for cid, i in ID2IDX.items()}
NUM_CLASSES = len(CAT_IDS)

TRANSFORM = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])


class GarmentClassifier:
    _instance = None

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model  = self._load_model()
        print(f"  ✓ GarmentClassifier ready on {self.device}")

    def _load_model(self):
        model = timm.create_model(
            MODEL_NAME,
            pretrained  = False,
            num_classes = 0,
            drop_rate   = DROPOUT,
        )
        in_feat = model.num_features
        model.classifier = nn.Sequential(
            nn.BatchNorm1d(in_feat), nn.Dropout(DROPOUT),
            nn.Linear(in_feat, 512), nn.GELU(),
            nn.BatchNorm1d(512),     nn.Dropout(DROPOUT / 2),
            nn.Linear(512, NUM_CLASSES),
        )
        ckpt = torch.load(CKPT_PATH, map_location=self.device, weights_only=False)
        model.load_state_dict(ckpt["model"])
        model.eval().to(self.device)
        print(f"  ✓ Loaded {CKPT_PATH.name}  "
              f"(best_val_acc={ckpt.get('best_val_acc', 0):.4f})")
        return model

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = GarmentClassifier()
        return cls._instance

    @torch.no_grad()
    def predict(self, image: Image.Image) -> dict:
        
        image.save("debug_classifier_input.png")
    
        print("\n===== CLASSIFIER DEBUG =====")
        print("Input image size:", image.size)
        print("Image mode:", image.mode)
    
        tensor = TRANSFORM(image).unsqueeze(0).to(self.device)
    
        print("Tensor shape:", tensor.shape)
        print("Tensor min:", tensor.min().item())
        print("Tensor max:", tensor.max().item())
    
        with autocast("cuda", enabled=(self.device.type == "cuda")):
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)[0]
    
        # print all class probabilities
        print("\nClass probabilities:")
        for i, p in enumerate(probs):
            print(f"{IDX2NAME[i]:25s} : {p.item():.4f}")
    
        top_p, top_i = probs.topk(1)
    
        result = {
            "category": IDX2NAME[top_i[0].item()],
            "confidence": round(top_p[0].item(), 4),
        }

        if result["confidence"] < 0.4:
            print("⚠ WARNING: Low classification confidence!")
    
        print("\nPrediction:", result)
    
        return result