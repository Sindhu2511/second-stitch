# Model Training Guide

## Dataset: DeepFashion2

- **Source:** [DeepFashion2](https://github.com/switchablenorms/DeepFashion2)
- **Size:** 503,000 cropped garment images
- **Categories:** 13 garment classes
- **Preprocessing:** Images cropped to bounding box annotations, resized to 224×224

### Category Map

| ID | Category |
|----|----------|
| 1 | Short sleeve top |
| 2 | Long sleeve top |
| 3 | Short sleeve outwear |
| 4 | Long sleeve outwear |
| 5 | Vest |
| 6 | Sling |
| 7 | Shorts |
| 8 | Trousers |
| 9 | Skirt |
| 10 | Short sleeve dress |
| 11 | Long sleeve dress |
| 12 | Vest dress |
| 13 | Sling dress |

### Class Imbalance

DeepFashion2 has severe class imbalance — some categories (e.g. short sleeve top) have up to **128×** more samples than rare categories (e.g. sling dress). This was addressed with:

1. **WeightedRandomSampler** — oversamples rare classes during training
2. **Sqrt-inverse frequency loss weights** — CrossEntropyLoss with `weight = 1/sqrt(class_freq)`, which balances without over-penalising majority classes

---

## Model Architecture

**Base:** EfficientNet-B3 (from `timm` library), pretrained on ImageNet

**Custom classifier head:**
```python
nn.Sequential(
    nn.BatchNorm1d(in_features),
    nn.Dropout(0.3),
    nn.Linear(in_features, 512),
    nn.GELU(),
    nn.BatchNorm1d(512),
    nn.Dropout(0.15),
    nn.Linear(512, 13),  # 13 garment classes
)
```

---

## Training Configuration

| Parameter | Value |
|-----------|-------|
| Model | EfficientNet-B3 (timm) |
| Image size | 224 × 224 |
| Batch size | 256 |
| Epochs | 30 |
| Optimizer | AdamW |
| Head LR | 3e-4 |
| Backbone LR | 3e-5 |
| Precision | FP16 (mixed precision) |
| Workers | 8 |
| GPU | NVIDIA RTX A6000 (49GB) |

---

## Running Training

```bash
cd Second_Stitch/scripts

# Fresh training
python train.py

# Resume from checkpoint
python train.py --resume
```

Checkpoints are saved to `checkpoints/`:
- `best.pt` — best validation accuracy
- `latest.pt` — most recent epoch
- `history.csv` — epoch-by-epoch metrics

TensorBoard logs saved to `runs/`:
```bash
tensorboard --logdir ~/Second_Stitch/runs --port 6006
```

---

## Results

| Metric | Value |
|--------|-------|
| Test Accuracy | **91.45%** |
| Best Validation Accuracy | **0.9142** |

---

## Running Inference

```bash
cd Second_Stitch/scripts

# Single image
python inference.py --image path/to/image.jpg

# Multiple images + save results
python inference.py --image img1.jpg img2.jpg img3.jpg --save
```

Results saved to `outputs/predictions/`.

---

## Image Preprocessing (Inference)

```python
transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std= [0.229, 0.224, 0.225]
    ),
])
```
