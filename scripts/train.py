# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  DeepFashion2 Garment Classifier  —  JupyterHub / GPU Server Edition       ║
# ║  Architecture : EfficientNet-B3 + custom head                              ║
# ║  Handles      : 128x class imbalance · fp16 · early stopping · TensorBoard ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# Run as a notebook (cell by cell) or as a plain script:
#   python train.py
#   python train.py --resume          # auto-picks latest.pt
#   python train.py --resume path/to/checkpoint.pt

# ═══════════════════════════════════════════════════════════════════════════════
# CELL 1 — Install / upgrade dependencies
# ═══════════════════════════════════════════════════════════════════════════════

import subprocess, sys

def pip(*pkgs):
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "--upgrade", *pkgs])

pip("timm", "tensorboard")
# torch + torchvision should already be installed on your GPU server (CUDA 12.2).
# If not: pip("torch", "torchvision", "--index-url", "https://download.pytorch.org/whl/cu121")

# ═══════════════════════════════════════════════════════════════════════════════
# CELL 2 — Imports
# ═══════════════════════════════════════════════════════════════════════════════

import argparse, csv, json, math, random, time, warnings
from collections import Counter
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torch.utils.tensorboard import SummaryWriter
from torch.amp import GradScaler, autocast
from torchvision import transforms
from PIL import Image
from tqdm import tqdm
import timm

warnings.filterwarnings("ignore")

# Reproducibility
SEED = 42
random.seed(SEED); np.random.seed(SEED)
torch.manual_seed(SEED); torch.cuda.manual_seed_all(SEED)
torch.backends.cudnn.benchmark = True  # fastest kernels for fixed input size

# ═══════════════════════════════════════════════════════════════════════════════
# CELL 3 — CONFIG  (only section you need to edit)
# ═══════════════════════════════════════════════════════════════════════════════

class CFG:
    # ── Paths ──────────────────────────────────────────────────────────────────
    # Set PROJECT_ROOT to wherever your "data/" folder lives on the server.
    # If this file sits at the same level as "data/", leave it as-is.
    PROJECT_ROOT   = Path(__file__).resolve().parent if "__file__" in dir() else Path.cwd()

    LABELS_FILE    = PROJECT_ROOT / "data/processed/train/labels.json"
    IMAGES_BASE    = PROJECT_ROOT / "data/processed/train"   # image_path in labels.json is relative to here
    CKPT_DIR       = PROJECT_ROOT / "checkpoints"
    LOG_DIR        = PROJECT_ROOT / "runs"                   # TensorBoard logs

    # ── Model ──────────────────────────────────────────────────────────────────
    MODEL_NAME     = "efficientnet_b3"   # swap: "resnet50" | "convnext_small" | "vit_small_patch16_224"
    PRETRAINED     = True
    NUM_CLASSES    = 13
    IMG_SIZE       = 224

    # ── Training ───────────────────────────────────────────────────────────────
    EPOCHS         = 30
    BATCH_SIZE     = 256         # RTX A6000 has 49 GB VRAM — 256 fits easily with fp16
                                 # could go 512 but 256 gives better gradient noise / generalisation
    NUM_WORKERS    = 8           # Linux server with NVMe — 8 workers saturates the GPU nicely

    VAL_SPLIT      = 0.10
    TEST_SPLIT     = 0.10

    # ── Optimiser ──────────────────────────────────────────────────────────────
    LR             = 3e-4        # head
    BACKBONE_LR    = 3e-5        # pretrained backbone — stay low to preserve ImageNet weights
    WEIGHT_DECAY   = 1e-4
    LABEL_SMOOTHING= 0.1         # reduces overconfidence on the majority class

    # ── LR Scheduler ───────────────────────────────────────────────────────────
    SCHEDULER      = "cosine"    # "cosine" | "onecycle" | "step"

    # ── Regularisation ─────────────────────────────────────────────────────────
    DROPOUT        = 0.3
    MIXUP_ALPHA    = 0.2         # 0.0 to disable — helps on visually similar classes

    # ── Runtime ────────────────────────────────────────────────────────────────
    FP16           = True        # mixed precision — always True on CUDA server
    GRAD_CLIP      = 1.0
    EARLY_STOP     = 7           # patience (epochs without val improvement)

    # ── DeepFashion2 categories ────────────────────────────────────────────────
    CATEGORY_MAP = {
        1: "short sleeve top",     2: "long sleeve top",
        3: "short sleeve outwear", 4: "long sleeve outwear",
        5: "vest",                 6: "sling",
        7: "shorts",               8: "trousers",
        9: "skirt",                10: "short sleeve dress",
        11: "long sleeve dress",   12: "vest dress",
        13: "sling dress",
    }



CFG.CAT_IDS  = sorted(CFG.CATEGORY_MAP.keys())
CFG.ID2IDX   = {cid: i for i, cid in enumerate(CFG.CAT_IDS)}
CFG.IDX2NAME = {i: CFG.CATEGORY_MAP[cid] for cid, i in CFG.ID2IDX.items()}

CFG.CKPT_DIR.mkdir(parents=True, exist_ok=True)
CFG.LOG_DIR.mkdir(parents=True, exist_ok=True)

# Sanity check paths before anything else
assert CFG.LABELS_FILE.exists(), (
    f"\n\n❌  labels.json not found:\n   {CFG.LABELS_FILE}\n"
    f"   Update CFG.PROJECT_ROOT to match your server layout.\n"
)
print(f"✓  labels.json  →  {CFG.LABELS_FILE}  "
      f"({CFG.LABELS_FILE.stat().st_size / 1e6:.1f} MB)")


# ═══════════════════════════════════════════════════════════════════════════════
# CELL 4 — Dataset
# ═══════════════════════════════════════════════════════════════════════════════

class DeepFashion2Dataset(Dataset):
    def __init__(self, records: list, images_base: Path, transform=None):
        self.records     = records
        self.images_base = images_base
        self.transform   = transform

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        rec   = self.records[idx]
        label = CFG.ID2IDX[rec["category_id"]]
        path  = self.images_base / rec["image_path"]
        try:
            img = Image.open(path).convert("RGB")
        except Exception:
            img = Image.new("RGB", (CFG.IMG_SIZE, CFG.IMG_SIZE))
        if self.transform:
            img = self.transform(img)
        return img, label


def build_transforms():
    mean = [0.485, 0.456, 0.406]
    std  = [0.229, 0.224, 0.225]

    train_tf = transforms.Compose([
        transforms.Resize((CFG.IMG_SIZE + 32, CFG.IMG_SIZE + 32)),
        transforms.RandomCrop(CFG.IMG_SIZE),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3,
                               saturation=0.3, hue=0.1),
        transforms.RandomGrayscale(p=0.05),
        transforms.ToTensor(),
        transforms.Normalize(mean, std),
        transforms.RandomErasing(p=0.2, scale=(0.02, 0.15)),
    ])
    val_tf = transforms.Compose([
        transforms.Resize((CFG.IMG_SIZE, CFG.IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean, std),
    ])
    return train_tf, val_tf


def load_and_split():
    with open(CFG.LABELS_FILE) as f:
        records = json.load(f)
    random.shuffle(records)
    n      = len(records)
    n_test = int(n * CFG.TEST_SPLIT)
    n_val  = int(n * CFG.VAL_SPLIT)
    test_r  = records[:n_test]
    val_r   = records[n_test: n_test + n_val]
    train_r = records[n_test + n_val:]
    print(f"  Split  →  train: {len(train_r):,}   val: {len(val_r):,}   test: {len(test_r):,}")
    return train_r, val_r, test_r


def build_sampler(train_records: list) -> WeightedRandomSampler:
    """Inverse-frequency sampling — every batch sees a balanced class distribution."""
    labels  = [CFG.ID2IDX[r["category_id"]] for r in train_records]
    counts  = Counter(labels)
    w       = {cls: 1.0 / cnt for cls, cnt in counts.items()}
    weights = [w[l] for l in labels]
    return WeightedRandomSampler(weights, num_samples=len(weights), replacement=True)


def compute_class_weights(train_records: list, device) -> torch.Tensor:
    """Sqrt-inverse frequency for CrossEntropyLoss — softer than raw inverse."""
    labels  = [CFG.ID2IDX[r["category_id"]] for r in train_records]
    counts  = Counter(labels)
    w       = torch.zeros(CFG.NUM_CLASSES)
    for cls, cnt in counts.items():
        w[cls] = 1.0 / math.sqrt(cnt)
    w = w / w.sum() * CFG.NUM_CLASSES
    return w.to(device)


def build_loaders(train_r, val_r, test_r):
    train_tf, val_tf = build_transforms()

    kw = dict(
        num_workers        = CFG.NUM_WORKERS,
        pin_memory         = True,
        persistent_workers = True,   # keep workers alive between epochs
        prefetch_factor    = 2,
    )

    train_loader = DataLoader(
        DeepFashion2Dataset(train_r, CFG.IMAGES_BASE, train_tf),
        batch_size = CFG.BATCH_SIZE,
        sampler    = build_sampler(train_r),
        drop_last  = True,
        **kw,
    )
    val_loader = DataLoader(
        DeepFashion2Dataset(val_r, CFG.IMAGES_BASE, val_tf),
        batch_size = CFG.BATCH_SIZE * 2,
        shuffle    = False,
        **kw,
    )
    test_loader = DataLoader(
        DeepFashion2Dataset(test_r, CFG.IMAGES_BASE, val_tf),
        batch_size = CFG.BATCH_SIZE * 2,
        shuffle    = False,
        **kw,
    )
    return train_loader, val_loader, test_loader


# ═══════════════════════════════════════════════════════════════════════════════
# CELL 5 — Model
# ═══════════════════════════════════════════════════════════════════════════════

def build_model() -> nn.Module:
    model = timm.create_model(
        CFG.MODEL_NAME,
        pretrained  = CFG.PRETRAINED,
        num_classes = 0,           # strip timm's default head
        drop_rate   = CFG.DROPOUT,
    )
    in_feat = model.num_features

    # Custom head: BN → Dropout → FC(512) → GELU → BN → Dropout → FC(num_classes)
    # Two BatchNorm layers keep activations stable despite the class-weight scaling
    model.classifier = nn.Sequential(
        nn.BatchNorm1d(in_feat),
        nn.Dropout(CFG.DROPOUT),
        nn.Linear(in_feat, 512),
        nn.GELU(),
        nn.BatchNorm1d(512),
        nn.Dropout(CFG.DROPOUT / 2),
        nn.Linear(512, CFG.NUM_CLASSES),
    )
    return model


def build_optimiser(model: nn.Module):
    """Differential LR: lower for pretrained backbone, higher for new head."""
    backbone = [p for n, p in model.named_parameters() if "classifier" not in n]
    head     = [p for n, p in model.named_parameters() if "classifier"     in n]
    return optim.AdamW(
        [{"params": backbone, "lr": CFG.BACKBONE_LR},
         {"params": head,     "lr": CFG.LR}],
        weight_decay=CFG.WEIGHT_DECAY,
    )


def build_scheduler(opt, steps_per_epoch: int):
    if CFG.SCHEDULER == "onecycle":
        return optim.lr_scheduler.OneCycleLR(
            opt,
            max_lr          = [CFG.BACKBONE_LR * 10, CFG.LR * 10],
            epochs          = CFG.EPOCHS,
            steps_per_epoch = steps_per_epoch,
            pct_start       = 0.1,
            anneal_strategy = "cos",
        )
    elif CFG.SCHEDULER == "cosine":
        return optim.lr_scheduler.CosineAnnealingLR(opt, T_max=CFG.EPOCHS, eta_min=1e-6)
    else:
        return optim.lr_scheduler.StepLR(opt, step_size=8, gamma=0.5)


# ═══════════════════════════════════════════════════════════════════════════════
# CELL 6 — Mixup
# ═══════════════════════════════════════════════════════════════════════════════

def mixup(x, y, alpha=0.2):
    if alpha <= 0:
        return x, y, y, 1.0
    lam = np.random.beta(alpha, alpha)
    idx = torch.randperm(x.size(0), device=x.device)
    return lam * x + (1 - lam) * x[idx], y, y[idx], lam

def mixup_loss(criterion, pred, ya, yb, lam):
    return lam * criterion(pred, ya) + (1 - lam) * criterion(pred, yb)


# ═══════════════════════════════════════════════════════════════════════════════
# CELL 7 — Train / Eval loops
# ═══════════════════════════════════════════════════════════════════════════════

def train_epoch(model, loader, criterion, opt, scaler, scheduler, device, epoch, writer):
    model.train()
    loss_sum = correct = total = 0
    step_sched = (CFG.SCHEDULER == "onecycle")

    pbar = tqdm(loader, desc=f"Ep {epoch:03d} [train]", leave=False, ncols=90)
    for imgs, labels in pbar:
        imgs   = imgs.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)

        imgs, ya, yb, lam = mixup(imgs, labels, CFG.MIXUP_ALPHA)

        opt.zero_grad(set_to_none=True)
        with autocast("cuda", enabled=CFG.FP16):
            logits = model(imgs)
            loss   = mixup_loss(criterion, logits, ya, yb, lam)

        scaler.scale(loss).backward()
        scaler.unscale_(opt)
        nn.utils.clip_grad_norm_(model.parameters(), CFG.GRAD_CLIP)
        scaler.step(opt)
        scaler.update()
        if step_sched:
            scheduler.step()

        bs        = imgs.size(0)
        loss_sum += loss.item() * bs
        correct  += (logits.argmax(1) == labels).sum().item()
        total    += bs
        pbar.set_postfix(loss=f"{loss.item():.3f}", acc=f"{correct/total:.3f}")

    avg_loss = loss_sum / total
    avg_acc  = correct / total
    writer.add_scalar("train/loss", avg_loss, epoch)
    writer.add_scalar("train/acc",  avg_acc,  epoch)
    writer.add_scalar("lr/backbone", opt.param_groups[0]["lr"], epoch)
    writer.add_scalar("lr/head",     opt.param_groups[1]["lr"], epoch)
    return avg_loss, avg_acc


@torch.no_grad()
def eval_epoch(model, loader, criterion, device, epoch, writer, split="val"):
    model.eval()
    loss_sum = correct = total = 0
    all_preds, all_labels = [], []

    for imgs, labels in tqdm(loader, desc=f"Ep {epoch:03d} [{split}]", leave=False, ncols=90):
        imgs   = imgs.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)
        with autocast("cuda", enabled=CFG.FP16):
            logits = model(imgs)
            loss   = criterion(logits, labels)

        loss_sum += loss.item() * imgs.size(0)
        preds     = logits.argmax(1)
        correct  += (preds == labels).sum().item()
        total    += imgs.size(0)
        all_preds .extend(preds.cpu().tolist())
        all_labels.extend(labels.cpu().tolist())

    avg_loss = loss_sum / total
    avg_acc  = correct / total
    writer.add_scalar(f"{split}/loss", avg_loss, epoch)
    writer.add_scalar(f"{split}/acc",  avg_acc,  epoch)

    per_class = {}
    for ci in range(CFG.NUM_CLASSES):
        n_ci = sum(l == ci for l in all_labels)
        if n_ci == 0: continue
        per_class[CFG.IDX2NAME[ci]] = (
            sum(p == l for p, l in zip(all_preds, all_labels) if l == ci) / n_ci
        )
    return avg_loss, avg_acc, per_class


# ═══════════════════════════════════════════════════════════════════════════════
# CELL 8 — Checkpoint helpers
# ═══════════════════════════════════════════════════════════════════════════════

def save_ckpt(state: dict, path: Path):
    tmp = path.with_suffix(".tmp")
    torch.save(state, tmp)
    tmp.rename(path)
    print(f"  💾  {path.name}  (val_acc={state.get('best_val_acc', 0):.4f})")


def load_ckpt(path: Path, model, opt=None, scaler=None):
    ckpt = torch.load(path, map_location="cpu", weights_only=False)
    model.load_state_dict(ckpt["model"])
    if opt    and "opt"    in ckpt: opt.load_state_dict(ckpt["opt"])
    if scaler and "scaler" in ckpt: scaler.load_state_dict(ckpt["scaler"])
    epoch        = ckpt.get("epoch", 0)
    best_val_acc = ckpt.get("best_val_acc", 0.0)
    print(f"  ✓  Resumed from epoch {epoch}  (best_val_acc={best_val_acc:.4f})")
    return epoch, best_val_acc


# ═══════════════════════════════════════════════════════════════════════════════
# CELL 9 — Main training loop
# ═══════════════════════════════════════════════════════════════════════════════

def train(resume_path: str | None = None):

    # ── Device info ────────────────────────────────────────────────────────────
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n{'═'*60}")
    print(f"  Device   : {device}", end="")
    if device.type == "cuda":
        p = torch.cuda.get_device_properties(0)
        print(f"  —  {p.name}  ({p.total_memory/1e9:.1f} GB VRAM)")
        print(f"  CUDA     : {torch.version.cuda}")
    else:
        print("\n  ⚠  No GPU found — training will be very slow on CPU")
    print(f"  PyTorch  : {torch.__version__}")
    print(f"  FP16     : {CFG.FP16}")
    print(f"  Model    : {CFG.MODEL_NAME}")
    print(f"  Batch    : {CFG.BATCH_SIZE}  ×  workers: {CFG.NUM_WORKERS}")
    print(f"{'═'*60}\n")

    # ── Data ───────────────────────────────────────────────────────────────────
    train_r, val_r, test_r          = load_and_split()
    train_loader, val_loader, test_loader = build_loaders(train_r, val_r, test_r)

    # ── Model ──────────────────────────────────────────────────────────────────
    model     = build_model().to(device)
    class_w   = compute_class_weights(train_r, device)
    criterion = nn.CrossEntropyLoss(weight=class_w, label_smoothing=CFG.LABEL_SMOOTHING)
    opt       = build_optimiser(model)
    scheduler = build_scheduler(opt, len(train_loader))
    scaler    = GradScaler("cuda", enabled=CFG.FP16 and device.type == "cuda")
    writer    = SummaryWriter(log_dir=str(CFG.LOG_DIR))

    # Print TensorBoard command once
    print(f"  TensorBoard  →  tensorboard --logdir {CFG.LOG_DIR} --port 6006")
    print(f"  Checkpoints  →  {CFG.CKPT_DIR}\n")

    # ── Resume logic ───────────────────────────────────────────────────────────
    start_epoch  = 0
    best_val_acc = 0.0
    patience     = 0

    if resume_path:
        rp = Path(resume_path)
        if not rp.exists():
            # --resume with no path: find the latest checkpoint automatically
            candidates = sorted(CFG.CKPT_DIR.glob("*.pt"))
            rp = candidates[-1] if candidates else None
        if rp:
            start_epoch, best_val_acc = load_ckpt(rp, model, opt, scaler)

    # ── Header ─────────────────────────────────────────────────────────────────
    history = []
    print(f"  {'Epoch':<7} {'TrainLoss':>10} {'TrainAcc':>9} "
          f"{'ValLoss':>9} {'ValAcc':>8} {'LR(head)':>10} {'Time':>7}")
    print("  " + "─" * 62)

    for epoch in range(start_epoch + 1, CFG.EPOCHS + 1):
        t0 = time.time()

        tr_loss, tr_acc = train_epoch(
            model, train_loader, criterion, opt, scaler, scheduler, device, epoch, writer)
        vl_loss, vl_acc, per_class = eval_epoch(
            model, val_loader, criterion, device, epoch, writer, "val")

        if CFG.SCHEDULER != "onecycle":
            scheduler.step()

        elapsed    = time.time() - t0
        is_best    = vl_acc > best_val_acc
        marker     = "  ★ best" if is_best else ""
        cur_lr     = opt.param_groups[1]["lr"]

        print(f"  {epoch:<7} {tr_loss:>10.4f} {tr_acc:>9.4f} "
              f"{vl_loss:>9.4f} {vl_acc:>8.4f} {cur_lr:>10.2e} {elapsed:>6.0f}s{marker}")

        history.append(dict(epoch=epoch, tr_loss=tr_loss, tr_acc=tr_acc,
                            vl_loss=vl_loss, vl_acc=vl_acc, lr=cur_lr))

        # Per-class accuracy every 5 epochs
        if epoch % 5 == 0:
            print("\n  Per-class val accuracy:")
            for name, acc in sorted(per_class.items(), key=lambda x: x[1]):
                bar = "█" * int(acc * 25)
                print(f"    {name:<25} {acc:.3f}  {bar}")
            print()

        # ── Checkpointing ──────────────────────────────────────────────────────
        state = dict(epoch=epoch, model=model.state_dict(),
                     opt=opt.state_dict(), scaler=scaler.state_dict(),
                     best_val_acc=best_val_acc,
                     cfg=dict(model_name=CFG.MODEL_NAME,
                              num_classes=CFG.NUM_CLASSES,
                              img_size=CFG.IMG_SIZE))

        if is_best:
            best_val_acc      = vl_acc
            state["best_val_acc"] = best_val_acc
            save_ckpt(state, CFG.CKPT_DIR / "best.pt")
            patience = 0
        else:
            patience += 1

        # Save numbered checkpoint every 5 epochs (easy rollback)
        if epoch % 5 == 0:
            save_ckpt(state, CFG.CKPT_DIR / f"epoch_{epoch:03d}.pt")

        # Always overwrite latest (fast recovery)
        save_ckpt(state, CFG.CKPT_DIR / "latest.pt")

        # ── Early stopping ──────────────────────────────────────────────────────
        if patience >= CFG.EARLY_STOP:
            print(f"\n  Early stop: {CFG.EARLY_STOP} epochs without improvement.")
            break

    # ── Final test evaluation ───────────────────────────────────────────────────
    print(f"\n{'─'*60}")
    print("  Loading best.pt for final test evaluation …")
    load_ckpt(CFG.CKPT_DIR / "best.pt", model)
    te_loss, te_acc, te_per_class = eval_epoch(
        model, test_loader, criterion, device, 0, writer, "test")

    print(f"\n  ══ TEST RESULTS ══════════════════════════════════")
    print(f"  Loss : {te_loss:.4f}")
    print(f"  Acc  : {te_acc:.4f}  ({te_acc*100:.2f}%)\n")
    print("  Per-class test accuracy:")
    for name, acc in sorted(te_per_class.items(), key=lambda x: x[1]):
        bar = "█" * int(acc * 25)
        print(f"    {name:<25} {acc:.3f}  {bar}")

    # Save history CSV
    hist_path = CFG.CKPT_DIR / "history.csv"
    with open(hist_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=history[0].keys())
        w.writeheader(); w.writerows(history)

    writer.close()
    print(f"\n  History  →  {hist_path}")
    print(f"  Best     →  {CFG.CKPT_DIR / 'best.pt'}")
    print(f"  Logs     →  tensorboard --logdir {CFG.LOG_DIR} --port 6006\n")

    return history


# ═══════════════════════════════════════════════════════════════════════════════
# CELL 10 — Inference  (use this in your app)
# ═══════════════════════════════════════════════════════════════════════════════

def predict(image_source, ckpt_path: str | None = None, top_k: int = 3) -> list[dict]:
    """
    Classify a single garment image.

    Args:
        image_source : file path (str / Path)  OR  PIL.Image  OR  http/https URL
        ckpt_path    : path to best.pt — defaults to CFG.CKPT_DIR/best.pt
        top_k        : how many top predictions to return

    Returns:
        [{"category": "shorts", "confidence": 0.9123}, …]  sorted by confidence

    Example:
        results = predict("uploads/user_photo.jpg")
        print(results[0])   # → {"category": "trousers", "confidence": 0.8841}
    """
    device    = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    ckpt_path = Path(ckpt_path) if ckpt_path else CFG.CKPT_DIR / "best.pt"

    model = build_model().to(device)
    ckpt  = torch.load(ckpt_path, map_location=device, weights_only=False)
    model.load_state_dict(ckpt["model"])
    model.eval()

    tf = transforms.Compose([
        transforms.Resize((CFG.IMG_SIZE, CFG.IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    if isinstance(image_source, (str, Path)) and str(image_source).startswith("http"):
        import io, urllib.request
        with urllib.request.urlopen(str(image_source)) as r:
            img = Image.open(io.BytesIO(r.read())).convert("RGB")
    elif isinstance(image_source, Image.Image):
        img = image_source.convert("RGB")
    else:
        img = Image.open(image_source).convert("RGB")

    tensor = tf(img).unsqueeze(0).to(device)
    with torch.no_grad(), autocast("cuda", enabled=CFG.FP16 and device.type == "cuda"):
        probs = torch.softmax(model(tensor), dim=1)[0]

    top_p, top_i = probs.topk(min(top_k, CFG.NUM_CLASSES))
    return [{"category": CFG.IDX2NAME[i.item()], "confidence": round(p.item(), 4)}
            for p, i in zip(top_p, top_i)]


# ═══════════════════════════════════════════════════════════════════════════════
# CELL 11 — Plot training curves  (run after training completes)
# ═══════════════════════════════════════════════════════════════════════════════

def plot_history(history: list | None = None):
    import matplotlib.pyplot as plt

    if history is None:
        with open(CFG.CKPT_DIR / "history.csv") as f:
            rows = list(csv.DictReader(f))
        history = [{k: (int(v) if k == "epoch" else float(v)) for k, v in r.items()}
                   for r in rows]

    epochs  = [r["epoch"]   for r in history]
    tr_loss = [r["tr_loss"] for r in history]
    vl_loss = [r["vl_loss"] for r in history]
    tr_acc  = [r["tr_acc"]  for r in history]
    vl_acc  = [r["vl_acc"]  for r in history]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    ax1.plot(epochs, tr_loss, "o-", label="train", linewidth=2)
    ax1.plot(epochs, vl_loss, "o-", label="val",   linewidth=2)
    ax1.set_title("Loss", fontsize=13); ax1.set_xlabel("Epoch")
    ax1.legend(); ax1.grid(True, alpha=0.3)

    ax2.plot(epochs, tr_acc, "o-", label="train", linewidth=2)
    ax2.plot(epochs, vl_acc, "o-", label="val",   linewidth=2)
    best_ep  = history[max(range(len(history)), key=lambda i: history[i]["vl_acc"])]
    ax2.axvline(best_ep["epoch"], color="red", linestyle="--", alpha=0.5,
                label=f"best val = {best_ep['vl_acc']:.4f}")
    ax2.set_title("Accuracy", fontsize=13); ax2.set_xlabel("Epoch")
    ax2.legend(); ax2.grid(True, alpha=0.3)

    fig.suptitle(f"Training — {CFG.MODEL_NAME}", fontsize=14, fontweight="bold")
    plt.tight_layout()
    out = CFG.CKPT_DIR / "training_curves.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    print(f"  Saved → {out}")
    plt.show()


# ═══════════════════════════════════════════════════════════════════════════════
# CELL 12 — Entry point
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--resume", nargs="?", const="auto", default=None,
        help="Resume training. Pass a path, or just --resume to auto-pick latest.pt",
    )
    args = parser.parse_args()
    history = train(resume_path=args.resume)
    plot_history(history)
