# 🧵 Second Stitch
### AI-Powered Sustainable Wardrobe Upcycling System

> Upload a photo of any garment → AI classifies it → automatically transforms it into an upcycled version → view side-by-side before/after comparison.

---

## 🌿 What is Second Stitch?

Second Stitch is a full-stack AI application that takes photos of second-hand or existing clothing and automatically upcycles them into new, modern garments — reducing textile waste through intelligent automation.

The system combines:
- **Deep learning classification** (EfficientNet-B3, 91.45% accuracy) to identify the garment type
- **Semantic segmentation** (SegFormer-B3) to isolate garment pixels and erase the person/background
- **Deterministic geometric transformation** to physically shorten hems and remove/shorten sleeves
- **Generative AI finishing** (SDXL Inpainting) to produce a clean, sewn-looking edge at the cut

---

## ✨ Features

- 📸 Upload any clothing photo — product shots, worn photos, flat lays
- 🤖 Automatic garment type detection across 13 categories
- ✂️ Smart upcycling: long dress → mini dress, trousers → shorts, long sleeve → crop top, etc.
- 🖼️ Interactive before/after slider comparison
- 💾 Save, favourite, and share your upcycled designs
- 🔐 User authentication via Supabase
- ⚡ FastAPI backend with GPU acceleration

---

## 🗂️ Project Structure

```
Second_Stitch/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── models/
│   │   ├── classifier.py        # EfficientNet-B3 garment classifier
│   │   └── sd_pipeline.py       # SegFormer + geometric transform + SDXL pipeline
│   ├── services/
│   │   ├── detection.py         # Image validation
│   │   ├── generation.py        # Orchestration: classify → transform → save
│   │   └── prompt_engine.py     # Upcycle rules + SDXL fabric prompts
│   ├── routes/
│   │   └── upcycle.py           # POST /api/upcycle endpoint
│   └── uploads/                 # Generated images served statically
├── frontend/
│   ├── src/
│   │   ├── pages/               # Route page components
│   │   ├── components/          # Reusable UI components
│   │   ├── lib/                 # Supabase client config
│   │   └── main.jsx             # Entry point
│   ├── public/
│   ├── vite.config.js
│   └── package.json
├── checkpoints/
│   └── best.pt                  # Trained EfficientNet-B3 checkpoint
├── scripts/
│   ├── train.py                 # Model training script
│   └── inference.py             # Standalone inference script
└── docs/
    ├── ARCHITECTURE.md
    ├── TRAINING.md
    ├── API.md
    └── DEVELOPMENT_JOURNEY.md
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- CUDA-capable GPU (recommended: 16GB+ VRAM)
- Supabase account

### 1. Clone the repository

```bash
git clone -b Final_Project https://github.com/HarshitaSoni24/second-stitch.git
cd second-stitch
```

### 2. Backend setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Models download automatically on first run (~8GB):
# - sayeed99/segformer-b3-fashion
# - diffusers/stable-diffusion-xl-1.0-inpainting-0.1

# Start the backend
cd Second_Stitch
uvicorn backend.main:app --host 0.0.0.0 --port 8080
```

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8080" > .env

# Start development server
npm run dev
```

### 4. Open in browser

```
http://localhost:5173
```

---

## 🧠 Model Performance

| Metric | Value |
|--------|-------|
| Test Accuracy | **91.45%** |
| Best Validation Accuracy | 0.9142 |
| Training Dataset | DeepFashion2 (503K images) |
| Model Architecture | EfficientNet-B3 |
| Training Epochs | 30 |
| GPU | NVIDIA RTX A6000 (49GB) |

---

## 🔄 Upcycle Logic

| Input Garment | Output |
|---|---|
| Short sleeve top | Sleeveless top |
| Long sleeve top | Crop short sleeve top |
| Short sleeve outwear | Sleeveless vest |
| Long sleeve outwear | Short sleeve jacket |
| Trousers | Tailored shorts |
| Skirt | Mini skirt |
| Short sleeve dress | Mini dress |
| Long sleeve dress | Short sleeve mini dress |
| Vest / Sling | Cropped version |

---

## 🛠️ Tech Stack

**Backend:** Python 3.12, FastAPI, PyTorch 2.5.1, CUDA 12.2, timm, HuggingFace Transformers, Diffusers, OpenCV, rembg, Pillow

**Frontend:** React 18, Vite 7, Tailwind CSS, Framer Motion, React Router DOM, lucide-react, html2canvas

**Database & Auth:** Supabase (PostgreSQL + JWT Auth)

**Infrastructure:** NVIDIA RTX A6000, JupyterHub GPU Server, ngrok

---

## 👩‍💻 Team

| Name | Role |
|------|------|
| Harshita Soni | ML Pipeline, Backend, Integration |
| P. Sathvika | Frontend Development |
| Rishitha Boyapati | Frontend Development |
| K. Sree Sindhu | Data Processing, Training |

**Guided by:** Dr. P. Kayal, Professor & HoD, Department of IT  
**Institution:** BVRIT HYDERABAD College of Engineering for Women

---

## 📄 License

This project is developed for academic purposes at BVRIT Hyderabad.

---

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Model Training Guide](docs/TRAINING.md)
- [API Reference](docs/API.md)
- [Development Journey](docs/DEVELOPMENT_JOURNEY.md)
