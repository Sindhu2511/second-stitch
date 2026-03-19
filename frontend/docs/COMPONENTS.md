# Components Documentation

This document describes all the React components used in the Second Stitch application.

## UI Components (`src/components/ui/`)

### Button.jsx
A reusable button component for user interactions.

**Usage:**
```
jsx
import { Button } from '../components/ui/Button';

<Button>Click Me</Button>
<Button variant="secondary">Secondary</Button>
<Button disabled>Disabled</Button>
```

### Card.jsx
A container component for grouping related content.

**Usage:**
```
jsx
import { Card } from '../components/ui/Card';

<Card>
  <h2>Title</h2>
  <p>Content here</p>
</Card>
```

### Icon.jsx
Component for displaying icons throughout the application.

**Usage:**
```
jsx
import { Icon } from '../components/ui/Icon';

<Icon name="user" />
<Icon name="settings" size="large" />
```

### Input.jsx
Form input component with consistent styling.

**Usage:**
```jsx
import { Input } from '../components/ui/Input';

<Input 
  type="text" 
  placeholder="Enter value"
  value={value}
  onChange={handleChange}
/>
```

### Navbar.jsx
Navigation bar component for site-wide navigation.

**Usage:**
```
jsx
import { Navbar } from '../components/ui/Navbar';

<Navbar links={[{ label: 'Home', path: '/' }]} />
```

---

## Feature Components

### AnimatedBackground.jsx
Provides animated background effects for the application. Creates visual interest with subtle motion.

**Location:** `src/components/AnimatedBackground.jsx`

**Features:**
- Smooth animations
- Performance optimized
- Responsive design

**Usage:**
```
jsx
import AnimatedBackground from '../components/AnimatedBackground';

<AnimatedBackground />
```

### CornerLogos.jsx
Decorative corner elements displaying logos or branding.

**Location:** `src/components/CornerLogos.jsx`

### FashionCarouselBG.jsx
Background component featuring a fashion carousel with rotating images.

**Location:** `src/components/FashionCarouselBG.jsx`

### PageWrapper.jsx
Higher-order component that wraps pages with common layout and animation patterns.

**Location:** `src/components/PageWrapper.jsx`

**Usage:**
```
jsx
import PageWrapper from '../components/PageWrapper';

<PageWrapper>
  <YourPageContent />
</PageWrapper>
```

### SustainabilityElements.jsx
Decorative elements that convey the sustainability theme of the application.

**Location:** `src/components/SustainabilityElements.jsx`

### ThemeToggle.jsx
Component for toggling between light and dark themes.

**Location:** `src/components/ThemeToggle.jsx`

**Features:**
- Persists preference to localStorage
- Smooth transition between themes
- Accessible toggle button

**Usage:**
```
jsx
import ThemeToggle from '../components/ThemeToggle';

<ThemeToggle />
```

---

## Custom Components (Defined in App.jsx)

### CustomCursor
A custom animated cursor that follows mouse movement.

**Location:** `src/App.jsx`

**Features:**
- Smooth spring animation
- Responsive (hidden on mobile)
- Orange border styling

**Usage:**
```
jsx
import { CustomCursor } from '../App';

<CustomCursor />
```

---

## Component Patterns

### Creating New Components

When creating a new component, follow these patterns:

1. **Functional Component with Props:**
```
jsx
export default function MyComponent({ title, children, onClick }) {
  return (
    <div className="my-component" onClick={onClick}>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
```

2. **Using Tailwind CSS:**
```
jsx
export default function StyledComponent({ variant = 'primary' }) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium';
  const variantClasses = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-200 text-gray-800',
  };
  
  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      Click me
    </button>
  );
}
```

3. **With Framer Motion:**
```
jsx
import { motion } from 'framer-motion';

export default function AnimatedComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Content
    </motion.div>
  );
}
```

### Component Organization Guidelines

1. **File Naming:** Use PascalCase (e.g., `MyComponent.jsx`)
2. **Location:** Put in `src/components/` or `src/components/ui/` for base components
3. **Export:** Use named exports for better tree-shaking
4. **Props Documentation:** Document props with JSDoc comments

---

## Best Practices

1. **Keep components small and focused** - Each component should do one thing well
2. **Use composition** - Build complex UIs from simple components
3. **Extract reusable logic** - Move logic to custom hooks when needed
4. **Use proper prop types** - Consider TypeScript or PropTypes for type safety
5. **Optimize for performance** - Use `React.memo`, `useMemo`, and `useCallback` when needed
6. **Ensure accessibility** - Use semantic HTML and ARIA attributes
7. **Test your components** - Write unit tests for critical components
