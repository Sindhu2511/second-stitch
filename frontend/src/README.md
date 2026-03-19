# Frontend Project Structure Guide

## Directory Organization

```
src/
├── components/          # Reusable React components
│   ├── AnimatedBackground.jsx    # Animated gradient background
│   ├── BackgroundCarousel.jsx    # Image carousel background
│   ├── CornerLogos.jsx          # Floating corner logo animations
│   ├── FashionCarouselBG.jsx    # Fashion image carousel
│   ├── PageWrapper.jsx          # Page transition wrapper
│   └── ThemeToggle.jsx          # Dark/Light theme switcher
│
├── pages/               # Page components (routes)
│   ├── Landing.jsx              # Home/welcome page
│   ├── Login.jsx                # User login page
│   ├── Register.jsx             # User registration page
│   ├── Upload.jsx               # Image upload with camera
│   ├── Processing.jsx           # AI processing animation
│   └── Result.jsx               # Design comparison slider
│
├── hooks/               # Custom React hooks
│   └── .gitkeep         # Placeholder for custom hooks
│
├── utils/               # Utility functions
│   └── .gitkeep         # Placeholder for helpers/APIs
│
├── constants/           # Application constants
│   └── index.js         # Routes, theme, processing steps
│
├── assets/              # Images, fonts, static files
│
├── App.jsx              # Main application component
├── App.css              # App-specific styles
├── main.jsx             # Entry point
└── index.css            # Global styles & Tailwind directives
```

## Key Files

### Configuration Files
- `tailwind.config.js` - Tailwind CSS configuration with custom colors
- `vite.config.js` - Vite bundler configuration
- `postcss.config.js` - PostCSS configuration
- `eslint.config.js` - ESLint rules

### Dependencies
- **React** - UI library
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Tailwind CSS** - Utility-first CSS framework

## Guidelines

1. **Components**: Reusable UI elements in `components/`
2. **Pages**: Full-page components tied to routes in `pages/`
3. **Hooks**: Extract repeated logic into custom hooks
4. **Utils**: Place API calls, helpers, and formatters
5. **Constants**: Centralize configuration and static values
6. **Styles**: Use Tailwind classes; keep CSS minimal

## Design System

- **Colors**: Eco-green, charcoal, dark theme support
- **Animations**: Smooth transitions with Framer Motion
- **Components**: Glass-morphism effects with Tailwind
- **Responsive**: Mobile-first design patterns

## Cleanup Summary

✅ **Fixed Issues:**
- Removed duplicate `<ThemeToggle />` declarations in App.jsx
- Fixed nested AnimatePresence structure
- Removed duplicate `<FashionCarouselBG />` and `<CornerLogos />` in Landing.jsx
- Cleaned empty comment sections (`{/* headline */}`, etc.)
- Removed unused `BackgroundCarousel` import
- Fixed malformed component closures
- Removed boilerplate CSS from App.css

✅ **Added Structure:**
- `hooks/` directory for custom React hooks
- `utils/` directory for helper functions
- `constants/` directory with centralized configuration
