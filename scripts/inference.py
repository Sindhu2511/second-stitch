"""
inference.py  —  Test the trained DeepFashion2 garment classifier
═══════════════════════════════════════════════════════════════════
Usage:
    # Single image
    python inference.py --image path/to/image.jpg

    # Multiple images
    python inference.py --image img1.jpg img2.jpg img3.jpg

    # Entire folder
    python inference.py --folder path/to/folder/

    # Custom checkpoint
    python inference.py --image photo.jpg --ckpt checkpoints/best.pt
═══════════════════════════════════════════════════════════════════
"""

import argparse
import json
from pathlib import Path

import torch
import torch.nn as nn
from torch.amp import autocast
from torchvision import transforms
from PIL import Image
import timm
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

# ── Config (must match train.py) ─────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent
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
CAT_IDS  = sorted(CATEGORY_MAP.keys())
ID2IDX   = {cid: i for i, cid in enumerate(CAT_IDS)}
IDX2NAME = {i: CATEGORY_MAP[cid] for cid, i in ID2IDX.items()}
NUM_CLASSES = len(CAT_IDS)

# ── Colours for each class in the output chart ───────────────────────────────
COLORS = plt.cm.tab20(np.linspace(0, 1, NUM_CLASSES))

# ── Model ─────────────────────────────────────────────────────────────────────
def load_model(ckpt_path: Path, device):
    model = timm.create_model(MODEL_NAME, pretrained=False,
                               num_classes=0, drop_rate=DROPOUT)
    in_feat = model.num_features
    model.classifier = nn.Sequential(
        nn.BatchNorm1d(in_feat), nn.Dropout(DROPOUT),
        nn.Linear(in_feat, 512), nn.GELU(),
        nn.BatchNorm1d(512), nn.Dropout(DROPOUT / 2),
        nn.Linear(512, NUM_CLASSES),
    )
    ckpt = torch.load(ckpt_path, map_location=device, weights_only=False)
    model.load_state_dict(ckpt["model"])
    model.eval().to(device)
    print(f"✓  Loaded checkpoint  →  {ckpt_path.name}")
    print(f"   Best val acc during training : {ckpt.get('best_val_acc', '?'):.4f}")
    return model


# ── Transform ─────────────────────────────────────────────────────────────────
def get_transform():
    return transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])


# ── Single image prediction ───────────────────────────────────────────────────
@torch.no_grad()
def predict(image_path: str | Path, model, transform, device,
            top_k: int = 5) -> list[dict]:
    """
    Returns top_k predictions sorted by confidence.
    [{"rank": 1, "category": "shorts", "confidence": 0.912, "pct": "91.2%"}, …]
    """
    img    = Image.open(image_path).convert("RGB")
    tensor = transform(img).unsqueeze(0).to(device)

    with autocast("cuda", enabled=(device.type == "cuda")):
        logits = model(tensor)
        probs  = torch.softmax(logits, dim=1)[0]

    top_p, top_i = probs.topk(min(top_k, NUM_CLASSES))
    return [
        {
            "rank":       r + 1,
            "category":   IDX2NAME[i.item()],
            "confidence": round(p.item(), 4),
            "pct":        f"{p.item()*100:.1f}%",
        }
        for r, (p, i) in enumerate(zip(top_p, top_i))
    ]


# ── Visualise single prediction ───────────────────────────────────────────────
def visualise(image_path: str | Path, predictions: list[dict], save_path=None):
    img = Image.open(image_path).convert("RGB")

    fig, axes = plt.subplots(1, 2, figsize=(12, 5),
                             gridspec_kw={"width_ratios": [1, 1.4]})

    # Left — image
    axes[0].imshow(img)
    axes[0].axis("off")
    top_pred = predictions[0]
    axes[0].set_title(
        f"Predicted: {top_pred['category'].upper()}\n"
        f"Confidence: {top_pred['pct']}",
        fontsize=13, fontweight="bold", color="#2ecc71",
        pad=10,
    )

    # Right — bar chart of top-k
    cats   = [p["category"]   for p in predictions]
    confs  = [p["confidence"] for p in predictions]
    colors = [COLORS[CAT_IDS.index(
                  next(k for k, v in CATEGORY_MAP.items() if v == c)
              )] for c in cats]

    bars = axes[1].barh(range(len(cats)), confs, color=colors,
                         edgecolor="white", height=0.6)
    axes[1].set_yticks(range(len(cats)))
    axes[1].set_yticklabels(cats, fontsize=11)
    axes[1].set_xlim(0, 1)
    axes[1].set_xlabel("Confidence", fontsize=11)
    axes[1].set_title("Top Predictions", fontsize=13, fontweight="bold")
    axes[1].invert_yaxis()
    axes[1].grid(axis="x", alpha=0.3)

    for bar, conf in zip(bars, confs):
        axes[1].text(
            conf + 0.01, bar.get_y() + bar.get_height() / 2,
            f"{conf*100:.1f}%", va="center", fontsize=10, fontweight="bold",
        )

    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        print(f"  📊  Saved visualisation → {save_path}")
    else:
        plt.show()
    plt.close()


# ── Batch prediction ──────────────────────────────────────────────────────────
def predict_batch(image_paths: list[Path], model, transform, device,
                  top_k=3, save_dir: Path = None):
    results = {}
    for img_path in image_paths:
        print(f"\n{'─'*50}")
        print(f"  Image : {img_path.name}")
        try:
            preds = predict(img_path, model, transform, device, top_k=top_k)
            results[str(img_path)] = preds

            for p in preds:
                bar = "█" * int(p["confidence"] * 30)
                print(f"  #{p['rank']}  {p['category']:<25} {p['pct']:>6}  {bar}")

            # Save visualisation
            if save_dir:
                save_path = save_dir / f"{img_path.stem}_prediction.png"
                visualise(img_path, preds, save_path=save_path)

        except Exception as e:
            print(f"  ❌  Error: {e}")
            results[str(img_path)] = []

    return results


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Garment classifier inference")
    parser.add_argument("--image",  nargs="+", type=str, default=None,
                        help="Path(s) to image file(s)")
    parser.add_argument("--folder", type=str, default=None,
                        help="Path to folder of images")
    parser.add_argument("--ckpt",   type=str, default=str(CKPT_PATH),
                        help="Path to checkpoint (default: checkpoints/best.pt)")
    parser.add_argument("--topk",   type=int, default=5,
                        help="Number of top predictions to show (default: 5)")
    parser.add_argument("--save",   action="store_true",
                        help="Save visualisation images alongside predictions")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n  Device : {device}")

    model     = load_model(Path(args.ckpt), device)
    transform = get_transform()

    # Collect image paths
    image_paths = []
    if args.image:
        image_paths = [Path(p) for p in args.image]
    elif args.folder:
        folder = Path(args.folder)
        image_paths = sorted(
            p for p in folder.iterdir()
            if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
        )
        print(f"  Found {len(image_paths)} images in {folder}")
    else:
        parser.print_help()
        return

    # Output dir for visualisations
    save_dir = None
    if args.save:
        save_dir = PROJECT_ROOT / "predictions"
        save_dir.mkdir(exist_ok=True)
        print(f"  Saving visualisations → {save_dir}")

    # Run predictions
    results = predict_batch(image_paths, model, transform, device,
                            top_k=args.topk, save_dir=save_dir)

    # Save JSON results
    out_json = PROJECT_ROOT / "predictions" / "results.json"
    out_json.parent.mkdir(exist_ok=True)
    with open(out_json, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n  Results JSON → {out_json}")
    print(f"\n{'═'*50}")
    print(f"  Done. Processed {len(results)} image(s).")


if __name__ == "__main__":
    main()
