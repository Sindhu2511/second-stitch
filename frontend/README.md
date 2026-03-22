# Second Stitch - Frontend

A sustainable fashion web application built with React, Vite, and Tailwind CSS. This project enables users to upload clothing images for sustainable redesign analysis.

## 🚀 Quick Start

```
bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   └── ui/         # Base UI components (Button, Card, Input, etc.)
│   ├── pages/          # Route pages
│   ├── constants/      # App constants and configuration
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Third-party library configurations
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── eslint.config.js    # ESLint configuration
```

## 🛠️ Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Routing:** React Router DOM 7
- **Styling:** Tailwind CSS 3
- **Animations:** Framer Motion 12
- **Backend:** Supabase
- **Image Processing:** HTML2Canvas

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## 🔗 Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Landing | Home/Welcome page |
| `/login` | Login | User login page |
| `/register` | Register | User registration page |
| `/upload` | Upload | Image upload page |
| `/processing` | Processing | Processing animation page |
| `/result` | Result | Results display page |
| `/dashboard` | Dashboard | User dashboard |

## 📦 Dependencies

### Production
- `@supabase/supabase-js` - Supabase client
- `framer-motion` - Animations
- `html2canvas` - Image processing
- `react` - UI library
- `react-dom` - React DOM
- `react-router-dom` - Routing

### Development
- `@vitejs/plugin-react` - Vite React plugin
- `autoprefixer` - CSS processing
- `eslint` - Linting
- `postcss` - CSS processing
- `tailwindcss` - Utility CSS
- `vite` - Build tool

## 🎨 Features

- User authentication (Login/Register)
- Image upload functionality
- Processing animation with progress steps
- Custom cursor animation
- Animated backgrounds
- Theme toggle (light/dark)
- Responsive design

## 📄 License

Private - All rights reserved
