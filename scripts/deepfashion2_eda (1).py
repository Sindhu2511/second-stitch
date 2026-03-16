"""
deepfashion2_eda.py
────────────────────────────────────────────────────────────
EDA for the processed DeepFashion2 dataset.

Expected layout (produced by your preprocessing script):
  data/processed/train/
      images/          ← cropped garment JPGs
      labels.json      ← list of {image_id, image_path, category_id, occlusion}

Run:
  python deepfashion2_eda.py
"""

import json, random
from pathlib import Path
from collections import Counter

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
from PIL import Image
from tqdm import tqdm

# ── CONFIG ────────────────────────────────────────────────────────────────────
PROJECT_ROOT   = Path(__file__).resolve().parent
SPLIT          = "train"
LABELS_FILE    = PROJECT_ROOT / f"data/processed/{SPLIT}/labels.json"
IMAGES_DIR     = PROJECT_ROOT / f"data/processed/{SPLIT}/images"
OUTPUT_DIR     = PROJECT_ROOT / "eda_outputs"
PIXEL_SAMPLE_N = 500        # images to sample for pixel-level stats
RANDOM_SEED    = 42

OUTPUT_DIR.mkdir(exist_ok=True)
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)
sns.set_theme(style="darkgrid", palette="muted", font_scale=1.1)

CATEGORY_MAP = {
    1: "short sleeve top",    2: "long sleeve top",
    3: "short sleeve outwear",4: "long sleeve outwear",
    5: "vest",                6: "sling",
    7: "shorts",              8: "trousers",
    9: "skirt",               10: "short sleeve dress",
    11: "long sleeve dress",  12: "vest dress",
    13: "sling dress",
}

OCCLUSION_MAP = {1: "no occlusion", 2: "slight", 3: "medium", 4: "heavy"}

# ── Helpers ───────────────────────────────────────────────────────────────────
def save(fig, name):
    p = OUTPUT_DIR / name
    fig.savefig(p, dpi=150, bbox_inches="tight")
    print(f"  ✓  {p.name}")
    plt.close(fig)

def load_labels() -> pd.DataFrame:
    with open(LABELS_FILE) as f:
        raw = json.load(f)
    df = pd.DataFrame(raw)
    df["category_name"] = df["category_id"].map(CATEGORY_MAP)
    df["occlusion_name"] = df["occlusion"].map(OCCLUSION_MAP).fillna("unknown")
    df["abs_path"] = df["image_path"].apply(
        lambda p: PROJECT_ROOT / f"data/processed/{SPLIT}" / p
    )
    return df

def read_image_size(path):
    try:
        return Image.open(path).size   # (w, h)
    except Exception:
        return None, None

# ══════════════════════════════════════════════════════════════════════════════
def main():
    print(f"\n{'='*58}")
    print(f"  DeepFashion2 Processed-Dataset EDA  |  split = {SPLIT}")
    print(f"{'='*58}\n")

    df = load_labels()
    print(f"  Total samples  : {len(df):,}")
    print(f"  Unique images  : {df['image_id'].nunique():,}")
    print(f"  Categories     : {df['category_name'].nunique()}")
    print(f"  Occlusion vals : {sorted(df['occlusion'].unique().tolist())}\n")
    print(df[["category_id","occlusion"]].describe().round(2).to_string())

    # ── 1. Class distribution ─────────────────────────────────────────────────
    print("\n[1] Class distribution …")
    cat_cnt = df["category_name"].value_counts()

    fig, axes = plt.subplots(1, 2, figsize=(16, 6))
    colors = sns.color_palette("tab20", len(cat_cnt))

    cat_cnt.plot(kind="barh", ax=axes[0], color=colors)
    axes[0].set_title("Sample Count per Category")
    axes[0].set_xlabel("Count")
    for i, v in enumerate(cat_cnt.values):
        axes[0].text(v + 30, i, f"{v:,}", va="center", fontsize=8)

    cat_cnt.plot(kind="pie", ax=axes[1], autopct="%1.1f%%",
                 colors=colors, startangle=140, legend=False)
    axes[1].set_ylabel("")
    axes[1].set_title("Class Share (%)")

    fig.suptitle("Class Distribution", fontsize=14, fontweight="bold")
    save(fig, "01_class_distribution.png")

    # Imbalance metrics
    ir = cat_cnt.max() / cat_cnt.min()
    print(f"  Max class : {cat_cnt.idxmax()} ({cat_cnt.max():,})")
    print(f"  Min class : {cat_cnt.idxmin()} ({cat_cnt.min():,})")
    print(f"  Imbalance ratio (max/min) : {ir:.1f}x")
    if ir > 5:
        print("  ⚠  Severe imbalance — use class-weighted loss or WeightedRandomSampler")

    # ── 2. Occlusion distribution ─────────────────────────────────────────────
    print("\n[2] Occlusion distribution …")
    occ_cnt  = df["occlusion_name"].value_counts()
    occ_cat  = df.groupby(["category_name", "occlusion_name"]).size().unstack(fill_value=0)

    fig, axes = plt.subplots(1, 2, figsize=(16, 6))
    occ_cnt.plot(kind="bar", ax=axes[0], color=sns.color_palette("pastel", 4),
                 edgecolor="white")
    axes[0].set_title("Overall Occlusion Level")
    axes[0].set_xlabel(""); axes[0].tick_params(axis="x", rotation=20)

    occ_cat.plot(kind="bar", stacked=True, ax=axes[1],
                 color=sns.color_palette("Set2", 4))
    axes[1].set_title("Occlusion per Category")
    axes[1].tick_params(axis="x", rotation=45)
    axes[1].legend(title="Occlusion", bbox_to_anchor=(1, 1))

    fig.suptitle("Occlusion Analysis", fontsize=14, fontweight="bold")
    save(fig, "02_occlusion.png")

    # ── 3. Occlusion vs category heatmap ─────────────────────────────────────
    print("\n[3] Occlusion heatmap …")
    pivot = df.pivot_table(index="category_name", columns="occlusion_name",
                           values="image_id", aggfunc="count", fill_value=0)
    pivot_pct = pivot.div(pivot.sum(axis=1), axis=0) * 100

    fig, axes = plt.subplots(1, 2, figsize=(16, 6))
    sns.heatmap(pivot, annot=True, fmt="d", cmap="Blues", ax=axes[0])
    axes[0].set_title("Raw counts"); axes[0].set_xlabel("")
    sns.heatmap(pivot_pct.round(1), annot=True, fmt=".1f", cmap="YlOrRd", ax=axes[1])
    axes[1].set_title("Row-normalised (%)"); axes[1].set_xlabel("")
    fig.suptitle("Category × Occlusion Heatmap", fontsize=14, fontweight="bold")
    save(fig, "03_occlusion_heatmap.png")

    # ── 4. Image size (width, height, aspect ratio) ───────────────────────────
    print("\n[4] Scanning image sizes …")
    sample_df = (df.groupby("category_name", group_keys=False)
                   .apply(lambda g: g.sample(min(300, len(g)), random_state=RANDOM_SEED))
                   .reset_index(drop=True))

    sizes = []
    for _, row in tqdm(sample_df.iterrows(), total=len(sample_df), desc="  Reading sizes"):
        w, h = read_image_size(row["abs_path"])
        if w:
            sizes.append({"category": row["category_name"],
                          "occlusion": row["occlusion_name"],
                          "w": w, "h": h})
    size_df = pd.DataFrame(sizes)
    size_df["aspect"] = size_df["w"] / (size_df["h"] + 1e-6)

    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    axes[0].scatter(size_df["w"], size_df["h"], alpha=0.25, s=8,
                    c=pd.factorize(size_df["category"])[0], cmap="tab20")
    axes[0].set_title("Width vs Height (sampled)")
    axes[0].set_xlabel("Width"); axes[0].set_ylabel("Height")

    size_df["w"].hist(bins=50, ax=axes[1], color="#4C72B0", alpha=0.8, label="Width")
    size_df["h"].hist(bins=50, ax=axes[1], color="#DD8452", alpha=0.8, label="Height")
    axes[1].set_title("Dimension Distribution"); axes[1].legend()

    size_df.groupby("category")["aspect"].mean().sort_values().plot(
        kind="barh", ax=axes[2],
        color=sns.color_palette("tab20", size_df["category"].nunique()))
    axes[2].set_title("Mean Aspect Ratio (W/H) per Category")
    axes[2].axvline(1.0, color="red", linestyle="--", linewidth=1, label="square")
    axes[2].legend()
    save(fig, "04_image_sizes.png")

    print(f"  Width  — mean: {size_df['w'].mean():.0f}  std: {size_df['w'].std():.0f}  "
          f"min: {size_df['w'].min()}  max: {size_df['w'].max()}")
    print(f"  Height — mean: {size_df['h'].mean():.0f}  std: {size_df['h'].std():.0f}  "
          f"min: {size_df['h'].min()}  max: {size_df['h'].max()}")

    # ── 5. Aspect ratio violin per category ───────────────────────────────────
    print("\n[5] Aspect-ratio violins …")
    fig, ax = plt.subplots(figsize=(16, 6))
    order = size_df.groupby("category")["aspect"].median().sort_values().index.tolist()
    sns.violinplot(data=size_df, x="category", y="aspect", order=order,
                   palette="tab20", inner="quartile", ax=ax)
    ax.set_title("Aspect-Ratio Distribution per Category", fontsize=13)
    ax.set_xlabel(""); ax.tick_params(axis="x", rotation=40)
    ax.axhline(1.0, color="red", linestyle="--", linewidth=1, label="square (1:1)")
    ax.legend()
    save(fig, "05_aspect_ratio_violin.png")

    # ── 6. Pixel / colour statistics ─────────────────────────────────────────
    print("\n[6] Pixel statistics (sampled) …")
    pix_sample = df.sample(min(PIXEL_SAMPLE_N, len(df)), random_state=RANDOM_SEED)

    r_all, g_all, b_all, bright_all = [], [], [], []
    per_cat_bright = {}

    for _, row in tqdm(pix_sample.iterrows(), total=len(pix_sample), desc="  Pixel stats"):
        try:
            arr = np.array(Image.open(row["abs_path"]).convert("RGB").resize((128, 128)),
                           dtype=np.float32)
            r_all.append(arr[:,:,0].mean())
            g_all.append(arr[:,:,1].mean())
            b_all.append(arr[:,:,2].mean())
            bright_all.append(arr.mean())
            per_cat_bright.setdefault(row["category_name"], []).append(arr.mean())
        except Exception:
            pass

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    axes[0].hist(r_all, bins=40, color="red",   alpha=0.5, label="R")
    axes[0].hist(g_all, bins=40, color="green", alpha=0.5, label="G")
    axes[0].hist(b_all, bins=40, color="blue",  alpha=0.5, label="B")
    axes[0].set_title("Per-channel Mean Pixel Intensity")
    axes[0].set_xlabel("Mean pixel value (0–255)"); axes[0].legend()

    axes[1].hist(bright_all, bins=40, color="#4C72B0", edgecolor="white")
    axes[1].set_title("Overall Brightness Distribution")
    axes[1].set_xlabel("Mean pixel value (0–255)")
    save(fig, "06_pixel_stats.png")

    fig, ax = plt.subplots(figsize=(14, 5))
    cat_bright_df = pd.DataFrame(
        [(cat, v) for cat, vals in per_cat_bright.items() for v in vals],
        columns=["category", "brightness"])
    order2 = cat_bright_df.groupby("category")["brightness"].median().sort_values().index
    sns.boxplot(data=cat_bright_df, x="category", y="brightness",
                order=order2, palette="tab20", ax=ax)
    ax.set_title("Brightness Distribution per Category")
    ax.tick_params(axis="x", rotation=40); ax.set_xlabel("")
    save(fig, "07_brightness_per_category.png")

    # ── 7. Missing / corrupt file check ──────────────────────────────────────
    print("\n[7] Checking for missing/corrupt files …")
    missing, corrupt = [], []
    for _, row in tqdm(df.iterrows(), total=len(df), desc="  Checking files"):
        p = row["abs_path"]
        if not p.exists():
            missing.append(row["image_id"])
        else:
            try:
                Image.open(p).verify()
            except Exception:
                corrupt.append(row["image_id"])

    print(f"  Missing files : {len(missing):,}")
    print(f"  Corrupt files : {len(corrupt):,}")
    if missing:
        (OUTPUT_DIR / "missing_files.txt").write_text("\n".join(missing))
        print(f"  → IDs written to eda_outputs/missing_files.txt")
    if corrupt:
        (OUTPUT_DIR / "corrupt_files.txt").write_text("\n".join(corrupt))
        print(f"  → IDs written to eda_outputs/corrupt_files.txt")

    # ── 8. Sample image grid per category ────────────────────────────────────
    print("\n[8] Sample grid per category …")
    COLS = 6
    categories = sorted(df["category_name"].dropna().unique())
    fig = plt.figure(figsize=(COLS * 2.2, len(categories) * 2.2))
    gs  = gridspec.GridSpec(len(categories), COLS, figure=fig,
                            hspace=0.05, wspace=0.05)

    for r, cat in enumerate(categories):
        paths = df[df["category_name"] == cat]["abs_path"].tolist()
        chosen = random.sample(paths, min(COLS, len(paths)))
        for c in range(COLS):
            ax = fig.add_subplot(gs[r, c])
            if c < len(chosen):
                try:
                    ax.imshow(Image.open(chosen[c]).convert("RGB"))
                except Exception:
                    pass
            ax.axis("off")
            if c == 0:
                ax.set_ylabel(cat, fontsize=7, rotation=0,
                              labelpad=90, va="center")

    fig.suptitle("Sample Crops per Category (6 per row)",
                 fontsize=14, fontweight="bold", y=1.002)
    save(fig, "08_sample_grid.png")

    # ── 9. Sample grid per occlusion level ───────────────────────────────────
    print("\n[9] Sample grid per occlusion level …")
    occ_levels = sorted(df["occlusion_name"].unique())
    fig, axes = plt.subplots(len(occ_levels), COLS,
                             figsize=(COLS * 2.2, len(occ_levels) * 2.5))
    if len(occ_levels) == 1:
        axes = [axes]
    for r, occ in enumerate(occ_levels):
        paths = df[df["occlusion_name"] == occ]["abs_path"].tolist()
        chosen = random.sample(paths, min(COLS, len(paths)))
        for c in range(COLS):
            ax = axes[r][c]
            if c < len(chosen):
                try:
                    ax.imshow(Image.open(chosen[c]).convert("RGB"))
                except Exception:
                    pass
            ax.axis("off")
            if c == 0:
                ax.set_ylabel(occ, fontsize=8, rotation=0,
                              labelpad=70, va="center")
    fig.suptitle("Sample Crops per Occlusion Level",
                 fontsize=13, fontweight="bold")
    save(fig, "09_occlusion_sample_grid.png")

    # ── 10. Classification readiness summary ─────────────────────────────────
    print("\n" + "─"*58)
    print("  CLASSIFICATION READINESS SUMMARY")
    print("─"*58)
    total = len(df)
    print(f"  Total samples         : {total:,}")
    print(f"  Classes               : {df['category_name'].nunique()}")
    print(f"  Min samples (class)   : {cat_cnt.min():,}  → {cat_cnt.idxmin()}")
    print(f"  Max samples (class)   : {cat_cnt.max():,}  → {cat_cnt.idxmax()}")
    print(f"  Imbalance ratio       : {ir:.1f}x")
    print(f"  Missing files         : {len(missing):,}")
    print(f"  Corrupt files         : {len(corrupt):,}")
    print(f"  Sizes are mixed       : {'YES — add Resize() in transforms' if size_df['w'].std() > 5 else 'NO'}")
    print()
    print("  Suggested splits (80/10/10):")
    print(f"    Train : {int(total*0.80):,}")
    print(f"    Val   : {int(total*0.10):,}")
    print(f"    Test  : {int(total*0.10):,}")
    print()
    print("  Recommended transforms (torchvision):")
    print("""    train:
      transforms.Resize((224, 224))
      transforms.RandomHorizontalFlip(p=0.5)
      transforms.RandomRotation(15)
      transforms.ColorJitter(brightness=0.3, contrast=0.3,
                             saturation=0.3, hue=0.1)
      transforms.RandomResizedCrop(224, scale=(0.7, 1.0))
      transforms.ToTensor()
      transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])

    val / test:
      transforms.Resize((224, 224))
      transforms.ToTensor()
      transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])""")

    if ir > 5:
        print(f"""
  ⚠  Imbalance ratio {ir:.1f}x — recommended remedies:
      1. class_weights = 1 / torch.tensor([cat_cnt[c] for c in classes])
         loss = nn.CrossEntropyLoss(weight=class_weights.to(device))
      2. WeightedRandomSampler so each batch sees equal class presence
      3. Oversample minority classes with Albumentations augmentation""")

    print(f"\n✅  All plots saved to: {OUTPUT_DIR}/\n")

    # ── Save summary CSV ──────────────────────────────────────────────────────
    summary = df.groupby("category_name").agg(
        count=("image_id", "count"),
        no_occlusion=("occlusion", lambda x: (x == 1).sum()),
        slight_occlusion=("occlusion", lambda x: (x == 2).sum()),
        medium_occlusion=("occlusion", lambda x: (x == 3).sum()),
        heavy_occlusion=("occlusion", lambda x: (x == 4).sum()),
    ).reset_index()
    summary["pct_of_total"] = (summary["count"] / total * 100).round(2)
    summary.to_csv(OUTPUT_DIR / "class_summary.csv", index=False)
    print(f"  Class summary CSV → {OUTPUT_DIR / 'class_summary.csv'}")
    print(summary.to_string(index=False))


if __name__ == "__main__":
    main()
