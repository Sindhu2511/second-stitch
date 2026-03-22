# Project Structure Documentation

This document provides a detailed explanation of the Second Stitch frontend project structure.

## Directory Overview

```
frontend/
├── public/                  # Static assets served directly
│   └── vite.svg            # Vite logo
│
├── src/                    # Main source code
│   ├── assets/             # Imported assets (images, fonts, etc.)
│   ├── components/         # Reusable React components
│   │   └── ui/            # Base UI components
│   ├── constants/          # Application constants
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Third-party library configurations
│   ├── pages/              # Route page components
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   ├── App.css             # App-specific styles
│   ├── index.css           # Global styles
│   └── main.jsx            # Entry point
│
├── docs/                   # Project documentation
│
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── eslint.config.js       # ESLint configuration
```

## Source Code Structure (`src/`)

### `assets/`
Static assets that are imported into components:
- `react.svg` - React logo asset

### `components/`
Reusable React components organized by purpose:

#### UI Components (`components/ui/`)
Base components for building the interface:
- `Button.jsx` - Reusable button component
- `Card.jsx` - Card container component
- `Icon.jsx` - Icon component
- `Input.jsx` - Form input component
- `Navbar.jsx` - Navigation bar component

#### Feature Components
- `AnimatedBackground.jsx` - Animated background effect
- `CornerLogos.jsx` - Corner logo decorations
- `FashionCarouselBG.jsx` - Fashion carousel background
- `PageWrapper.jsx` - Page layout wrapper with animations
- `SustainabilityElements.jsx` - Sustainability-themed decorative elements
- `ThemeToggle.jsx` - Light/dark theme toggle

### `constants/`
Application-wide constants and configuration:
- `index.js` - Exports all constants:
  - `PROCESSING_STEPS` - Array of processing step descriptions
  - `ROUTES` - Route path constants
  - `THEME` - Theme mode constants

### `hooks/`
Custom React hooks (currently empty, ready for future use)

### `lib/`
Third-party library configurations:
- `supabaseClient.js` - Supabase client initialization

### `pages/`
Route page components:
- `Dashboard.jsx` - User dashboard
- `Landing.jsx` - Home/Landing page
- `Login.jsx` - Login page
- `Processing.jsx` - Processing animation page
- `Register.jsx` - Registration page
- `Result.jsx` - Results display page
- `Upload.jsx` - Image upload page

### `utils/`
Utility functions:
- `motionVariants.js` - Framer Motion animation variants

## Key Files

### `App.jsx`
Main application component that sets up:
- React Router routes
- AnimatedBackground component
- ThemeToggle component
- Custom cursor component

### `main.jsx`
Application entry point that:
- Mounts the React app
- Applies global styles

### `index.css`
Global styles including:
- Tailwind CSS directives
- Custom cursor styles
- Base element styles

## Routing

The application uses React Router with the following routes:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Landing | Home page |
| `/login` | Login | Login form |
| `/register` | Register | Registration form |
| `/upload` | Upload | Image upload |
| `/processing` | Processing | Processing animation |
| `/result` | Result | Results display |
| `/dashboard` | Dashboard | User dashboard |

## State Management

Currently uses React's built-in state management:
- `useState` for local component state
- `useEffect` for side effects
- Context or props for sharing state between components

## Styling Approach

- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations
- Custom CSS for specific components
- Dark/Light theme support via Tailwind configuration

## Environment Variables

The project uses Supabase for backend services:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

Note: Currently hardcoded in `lib/supabaseClient.js` - consider using environment variables for production.
