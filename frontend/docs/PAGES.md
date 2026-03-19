# Pages Documentation

This document describes all the page components in the Second Stitch application and their routing configuration.

## Routing Configuration

Routes are configured in `src/App.jsx` using React Router:

```
jsx
<Routes location={location} key={location.pathname}>
  <Route path="/" element={<Landing />} />
  <Route path="/processing" element={<Processing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/upload" element={<Upload />} />
  <Route path="/result" element={<Result />} />
  <Route path="/dashboard" element={<Dashboard />} />
</Routes>
```

## Route Definitions

| Path | Component | Description | Access |
|------|-----------|-------------|--------|
| `/` | Landing | Home/Welcome page | Public |
| `/login` | Login | User login | Public |
| `/register` | Register | User registration | Public |
| `/upload` | Upload | Image upload | Auth |
| `/processing` | Processing | Processing animation | Auth |
| `/result` | Result | Results display | Auth |
| `/dashboard` | Dashboard | User dashboard | Auth |

---

## Page Components

### Landing.jsx
**Path:** `/`
**Description:** The home/welcome page that introduces the application.

**Features:**
- Hero section with app introduction
- Call-to-action buttons for login/register
- Animated background
- Sustainability messaging

**File Location:** `src/pages/Landing.jsx`

---

### Login.jsx
**Path:** `/login`
**Description:** User authentication page for existing users.

**Features:**
- Email/password form
- Form validation
- Error handling
- Link to registration page
- Supabase authentication integration

**File Location:** `src/pages/Login.jsx`

**Expected Props:** None (uses internal state)

---

### Register.jsx
**Path:** `/register`
**Description:** User registration page for new users.

**Features:**
- Registration form (email, password, confirm password)
- Form validation
- Error handling
- Link to login page
- Supabase authentication integration

**File Location:** `src/pages/Register.jsx`

---

### Upload.jsx
**Path:** `/upload`
**Description:** Image upload page for uploading clothing photos.

**Features:**
- Drag and drop file upload
- File type validation (images only)
- Preview of uploaded image
- Submit to processing
- Requires authentication

**File Location:** `src/pages/Upload.jsx`

---

### Processing.jsx
**Path:** `/processing`
**Description:** Animated processing page shown while the image is being analyzed.

**Features:**
- Animated progress indicator
- Processing steps display:
  - Analyzing fabric texture 👕
  - Identifying stitch patterns 🧵
  - Detecting wear & tear 🔍
  - Generating sustainable redesign ♻️
  - Finalizing upcycled look ✨
- Automatic redirect to results

**File Location:** `src/pages/Processing.jsx`

---

### Result.jsx
**Path:** `/result`
**Description:** Display page for processing results.

**Features:**
- Display processed/redesigned image
- Sustainability information
- Download options
- Share functionality (future)
- Requires authentication

**File Location:** `src/pages/Result.jsx`

---

### Dashboard.jsx
**Path:** `/dashboard`
**Description:** User dashboard for managing their uploads and history.

**Features:**
- User profile information
- Upload history
- Past results
- Account settings link
- Requires authentication

**File Location:** `src/pages/Dashboard.jsx`

---

## Navigation

### Navigation Flow

```
Landing Page
    ├── Login → Login Page
    │           └── (on success) → Dashboard
    ├── Register → Register Page
    │              └── (on success) → Dashboard
    └── (Auth Required)
        ├── Upload → Upload Page
        │           └── (on submit) → Processing → Result
        ├── Dashboard
        └── Result (from previous upload)
```

### Protected Routes

Routes requiring authentication should check for user session:

```
jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);
  
  if (!session) {
    return <Navigate to="/login" />;
  }
  
  return children;
}
```

---

## Adding New Pages

To add a new page:

1. **Create the page component:**
   
```
jsx
   // src/pages/NewPage.jsx
   export default function NewPage() {
     return (
       <div>
         <h1>New Page</h1>
       </div>
     );
   }
   
```

2. **Import and add the route in App.jsx:**
   
```
jsx
   import NewPage from './pages/NewPage';
   
   // Add to Routes:
   <Route path="/new-page" element={<NewPage />} />
   
```

3. **Add route constant (optional but recommended):**
   
```
js
   // src/constants/index.js
   export const ROUTES = {
     // existing routes
     NEW_PAGE: '/new-page',
   };
   
```

---

## Page Transitions

The application uses Framer Motion for page transitions with `AnimatePresence`:

```
jsx
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    {/* routes */}
  </Routes>
</AnimatePresence>
```

This provides smooth fade transitions between pages.

---

## Error Handling

Each page should handle:
- Loading states
- Error states
- Empty states
- Authentication errors
- Network errors

Use consistent error messages and user feedback throughout the application.
