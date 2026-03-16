import json
from pathlib import Path
from PIL import Image

# ===== CHANGE THIS ONLY =====
SPLIT = "train"  # "train" or "validation"
# ===========================

# PROJECT ROOT (THIS IS THE FIX)
PROJECT_ROOT = Path(__file__).resolve().parent

ANNOTATION_DIR = PROJECT_ROOT / f"data/deepfashion2/annotations/{SPLIT}"
IMAGE_DIR = PROJECT_ROOT / f"data/deepfashion2/images/{SPLIT}"
OUTPUT_DIR = PROJECT_ROOT / f"data/processed/{SPLIT}/images"
LABELS_FILE = PROJECT_ROOT / f"data/processed/{SPLIT}/labels.json"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Load existing labels if resuming
labels = []
existing_ids = set()

if LABELS_FILE.exists() and LABELS_FILE.stat().st_size > 0:
    with open(LABELS_FILE, "r") as f:
        labels = json.load(f)
    existing_ids = {entry["image_id"] for entry in labels}


json_files = sorted(ANNOTATION_DIR.glob("*.json"))
print(f"[{SPLIT}] Processing {len(json_files)} annotation files...")

for json_file in json_files:
    image_id = json_file.stem

    with open(json_file, "r") as f:
        data = json.load(f)
    
    image_path = IMAGE_DIR / f"{image_id}.jpg"
    if not image_path.exists():
        continue

    img = Image.open(image_path).convert("RGB")

    for key in data:
        if not key.startswith("item"):
            continue
    
        item = data[key]

        x1, y1, x2, y2 = item["bounding_box"]
        crop = img.crop((x1, y1, x2, y2))
        w, h = crop.size

        if w < 50 or h < 50:
            continue

        out_image_id = f"{SPLIT}_{image_id}_{key}"
        out_image_name = f"{out_image_id}.jpg"
        out_path = OUTPUT_DIR / out_image_name

    # Skip if already processed
        if out_image_id in existing_ids:
            continue

        crop.save(out_path)

        label_entry = {
            "image_id": out_image_id,
            "image_path": f"images/{out_image_name}",
            "category_id": item["category_id"],
            "occlusion": item["occlusion"]
        }

        labels.append(label_entry)
        existing_ids.add(out_image_id)

with open(LABELS_FILE, "w") as f:
    json.dump(labels, f, indent=2)

print(f"[{SPLIT}] Done. Total saved samples: {len(labels)}")