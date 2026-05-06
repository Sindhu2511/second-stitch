# 🧵 Second Stitch
### AI-Powered Sustainable Wardrobe Upcycling System

> Upload a photo of any garment → AI classifies it → automatically transforms it into an upcycled version → view side-by-side before/after comparison.

## 🌿 What is Second Stitch?

Second Stitch is a full-stack AI application that takes photos of second-hand or existing clothing and automatically upcycles them into new, modern garments — reducing textile waste through intelligent automation.

The system combines:
- **Deep learning classification** (EfficientNet-B3, 91.45% accuracy) to identify the garment type
- **Semantic segmentation** (SegFormer-B3) to isolate garment pixels and erase the person/background
- **Deterministic geometric transformation** to physically shorten hems and remove/shorten sleeves
- **Generative AI finishing** (SDXL Inpainting) to produce a clean, sewn-looking edge at the cut

## ✨ Features

- 📸 Upload any clothing photo — product shots, worn photos, flat lays
- 🤖 Automatic garment type detection across 13 categories
- ✂️ Smart upcycling: long dress → mini dress, trousers → shorts, long sleeve → crop top
- 🖼️ Interactive before/after slider comparison
- 💾 Save, favourite, and share your upcycled designs
- 🔐 User authentication via Supabase
- ⚡ FastAPI backend with GPU acceleration

## 🗂️ Project Structure
```
second-stitch/
├── backend/
│   ├── main.py
│   ├── models/
│   │   ├── classifier.py
│   │   └── sd_pipeline.py
│   ├── services/
│   │   ├── detection.py
│   │   ├── generation.py
│   │   └── prompt_engine.py
│   ├── routes/
│   │   └── upcycle.py
│   └── uploads/
├── frontend/
│   └── src/
│       ├── contexts/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── lib/
│       └── utils/
├── checkpoints/
├── scripts/
└── docs/
```

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+
- CUDA-capable GPU (recommended: 16GB+ VRAM)
- Supabase account

### 1. Clone the repository
```bash
git clone https://github.com/Sindhu2511/second-stitch.git
cd second-stitch
```

### 2. Backend setup
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Fill in your values in .env

# Start the backend
uvicorn backend.main:app --host 0.0.0.0 --port 8080
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

## 🧠 Model Performance

| Metric | Value |
|--------|-------|
| Test Accuracy | **91.45%** |
| Training Dataset | DeepFashion2 (503K images) |
| Model Architecture | EfficientNet-B3 |
| Training Epochs | 30 |

## 🛠️ Tech Stack

**Backend:** Python 3.12, FastAPI, PyTorch, HuggingFace Transformers, Diffusers, OpenCV, Pillow

**Frontend:** React 19, Vite 7, Tailwind CSS, Framer Motion, React Router DOM

**Database & Auth:** Supabase (PostgreSQL + JWT Auth)
