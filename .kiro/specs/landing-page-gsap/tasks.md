/
# Implementation Tasks

## Tasks

- [x] 1. Install GSAP dependency
  - [x] 1.1 Run `npm install gsap` in the `client` directory
  - [x] 1.2 Verify `gsap` appears in `client/package.json` dependencies

- [x] 2. Create the LandingPage component
  - [x] 2.1 Create `client/src/pages/LandingPage.jsx` with a minimal navbar (brand name left, "Log In" and "Get Started" buttons right)
  - [x] 2.2 Implement the Hero section: full-viewport height, gradient background, headline, subheadline, and two CTA buttons ("Get Started" → `/register`, "Log In" → `/login`)
  - [x] 2.3 Implement the Features section: 6 feature cards in a responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) for AI Quizzes, Code Editor, Networking Playground, English Fluency, Syllabus Browser, and Progress Tracking
  - [x] 2.4 Implement the CTA section: centered headline, description, and "Sign Up Free" button → `/register`
  - [x] 2.5 Add GSAP hero entrance timeline on mount: staggered `opacity: 0, y: 40` → `opacity: 1, y: 0` for headline, subheadline, and buttons
  - [x] 2.6 Add GSAP ScrollTrigger stagger for feature cards: `opacity: 0, y: 50` → `opacity: 1, y: 0`, stagger 0.15s, `start: "top 80%"`, `once: true`
  - [x] 2.7 Add GSAP ScrollTrigger fade-in for CTA section: `start: "top 80%"`, `once: true`
  - [x] 2.8 Register `ScrollTrigger` plugin on mount and kill all triggers on unmount
  - [x] 2.9 Skip all GSAP animations when `prefers-reduced-motion: reduce` is detected

- [x] 3. Update App.jsx routing for the landing page
  - [x] 3.1 Import `LandingPage` in `App.jsx`
  - [x] 3.2 Replace the root `/` route (`<Navigate to="/dashboard" replace />`) with a conditional: render `<LandingPage />` for unauthenticated users and `<Navigate to="/dashboard" replace />` for authenticated users
  - [x] 3.3 Show `<LoadingSpinner />` at the root route while `AuthContext` is resolving

- [x] 4. Fix Dashboard "View Progress" quick action
  - [x] 4.1 In `Dashboard.jsx`, update the "View Progress" `QuickActionCard` `onClick` from the no-op `() => {}` to `() => navigate('/profile')`

- [x] 5. Fix Subjects page feature navigation links
  - [x] 5.1 Add `actionLabel` and `actionLink` fields to each subject object in `Subjects.jsx`: Computer Network → Networking Playground (`/networking-playground`), Database Management → DBMS Quiz (`/dbms-quiz`), Python/Java/C++/C Programming → Code Editor (`/code-editor`)
  - [x] 5.2 Update `SubjectCard` to render a second action button using `actionLabel` and `actionLink` alongside the existing "View Syllabus" button

- [ ] 6. Verify post-login Splash screen flow
  - [ ] 6.1 Confirm `Login.jsx` navigates to `/splash` on successful email/password login
  - [ ] 6.2 Confirm `FaceLogin.jsx` navigates to `/splash` on successful face recognition login
  - [ ] 6.3 Confirm `Splash.jsx` navigates to `/dashboard` with `replace: true` after its animation completes
  - [ ] 6.4 Confirm the `/splash` route in `App.jsx` is wrapped in `ProtectedRoute`
