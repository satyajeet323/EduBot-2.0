# Design Document

## Overview

This design covers two parallel workstreams:
1. A new public `LandingPage` component rendered at `/` for unauthenticated visitors, with GSAP + ScrollTrigger animations.
2. Fixes to broken component connections across the existing app (Dashboard quick actions, Subjects page feature links, routing).

The existing `Splash.jsx` post-login screen is preserved unchanged.

---

## Architecture

### Route Structure Changes

Current `App.jsx` redirects `/` to `/dashboard` for all users. We change this to render `LandingPage` for unauthenticated users and redirect authenticated users to `/dashboard`.

```
/ (root)
  ├── unauthenticated → <LandingPage />
  └── authenticated   → <Navigate to="/dashboard" />

/login     → PublicRoute → <Login />
/register  → PublicRoute → <Register />
/splash    → ProtectedRoute → <Splash />
/dashboard → ProtectedRoute → <Layout><Dashboard /></Layout>
... (all other protected routes unchanged)
```

### New Component: `LandingPage`

File: `client/src/pages/LandingPage.jsx`

Self-contained page with three sections:
- `HeroSection` — full-viewport, GSAP entrance timeline on mount
- `FeaturesSection` — 6 feature cards, ScrollTrigger stagger on scroll
- `CTASection` — fade-in on scroll, links to `/register`

No `Layout` wrapper — the landing page has its own minimal navbar.

---

## Component Design

### LandingPage.jsx

```jsx
// Responsibilities:
// 1. Register GSAP ScrollTrigger plugin on mount
// 2. Kill all ScrollTriggers on unmount (cleanup)
// 3. Respect prefers-reduced-motion
// 4. Redirect authenticated users to /dashboard

useEffect(() => {
  gsap.registerPlugin(ScrollTrigger)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!prefersReduced) {
    // hero timeline
    // features stagger
    // cta fade
  }
  return () => ScrollTrigger.getAll().forEach(t => t.kill())
}, [])
```

### Hero Section

- Full viewport height (`min-h-screen`)
- Gradient background matching app brand (blue-600 → indigo-700)
- Elements: logo/brand name, headline, subheadline, two CTA buttons
- GSAP timeline: `from { opacity: 0, y: 40 }` → `to { opacity: 1, y: 0 }` staggered 0.2s

### Features Section

- 6 cards in a responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Each card: icon, title, short description
- Features: AI Quizzes, Code Editor, Networking Playground, English Fluency, Syllabus Browser, Progress Tracking
- ScrollTrigger: `start: "top 80%"`, `once: true`, stagger 0.15s, `from { opacity: 0, y: 50 }`

### CTA Section

- Centered, gradient background
- Headline + description + "Sign Up Free" button → `/register`
- ScrollTrigger fade-in: `start: "top 80%"`, `once: true`

### Minimal Navbar (inside LandingPage)

- Brand name left, "Log In" + "Get Started" buttons right
- Responsive: hamburger on mobile
- No auth dependency — purely presentational

---

## GSAP Integration

### Installation

```bash
npm install gsap
```

`gsap` package includes `ScrollTrigger` as a built-in plugin at `gsap/ScrollTrigger`.

### Usage Pattern

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Hero entrance (runs immediately on mount)
const tl = gsap.timeline()
tl.from(heroRef.current.querySelectorAll('.animate-hero'), {
  opacity: 0, y: 40, duration: 0.8, stagger: 0.2, ease: 'power2.out'
})

// Features scroll trigger
gsap.from(featureCardsRef.current.querySelectorAll('.feature-card'), {
  opacity: 0, y: 50, duration: 0.6, stagger: 0.15, ease: 'power2.out',
  scrollTrigger: {
    trigger: featureCardsRef.current,
    start: 'top 80%',
    once: true
  }
})

// CTA scroll trigger
gsap.from(ctaRef.current, {
  opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
  scrollTrigger: {
    trigger: ctaRef.current,
    start: 'top 80%',
    once: true
  }
})
```

### Reduced Motion

```js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (prefersReduced) return // skip all animations, elements render in final state
```

---

## Existing Component Fixes

### 1. App.jsx — Root Route

Change:
```jsx
// Before
<Route path="/" element={<Navigate to="/dashboard" replace />} />

// After
<Route path="/" element={
  user ? <Navigate to="/dashboard" replace /> : <LandingPage />
} />
```

Since `AppRoutes` already has access to `useAuth`, this is a one-line change inside `AppRoutes`.

### 2. Dashboard.jsx — "View Progress" Quick Action

The `onClick` for "View Progress" is currently `() => {/* Navigate to progress */}` — a no-op.

Fix:
```jsx
onClick={() => navigate('/profile')}
```

### 3. Subjects.jsx — Feature Navigation Links

Each subject card currently only has "View Syllabus". Add subject-specific action buttons:

| Subject | Extra Button | Route |
|---|---|---|
| Computer Network | Networking Playground | `/networking-playground` |
| Database Management | DBMS Quiz | `/dbms-quiz` |
| Python | Code Editor | `/code-editor` |
| Java | Code Editor | `/code-editor` |
| C++ | Code Editor | `/code-editor` |
| C Programming | Code Editor | `/code-editor` |

Add a `actionLink` and `actionLabel` field to each subject object, then render a second button in `SubjectCard`.

---

## Data Flow

```
Visitor hits /
  → AppRoutes checks useAuth()
  → loading=true → <LoadingSpinner />
  → loading=false, user=null → <LandingPage />
  → loading=false, user=exists → <Navigate to="/dashboard" />

Visitor clicks "Get Started" or "Sign Up Free"
  → navigate('/register')

Visitor clicks "Log In"
  → navigate('/login')

User logs in successfully
  → Login.jsx calls navigate('/splash')
  → Splash.jsx plays animation, then navigate('/dashboard', { replace: true })
```

---

## Styling

- Landing page uses Tailwind CSS (already installed)
- Brand colors: `blue-600`, `indigo-700` for gradients
- Feature cards: white background, subtle shadow, hover lift effect
- Consistent with existing app design language
- Dark mode: landing page does not need dark mode toggle (public page)
