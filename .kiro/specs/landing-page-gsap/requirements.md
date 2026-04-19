# Requirements Document

## Introduction

This feature adds a public-facing landing page to the EduBot platform that is displayed to unauthenticated users when they visit the root URL. The landing page uses GSAP (GreenSock Animation Platform) with ScrollTrigger to deliver smooth, scroll-driven animations across multiple content sections. Additionally, this feature completes all broken or missing component connections throughout the app — including routing gaps, dead navigation links, and disconnected quick-action buttons.

The existing `Splash.jsx` (post-login animated intro screen) is preserved and remains part of the authenticated login flow. The new landing page is a separate, public-facing marketing/entry page.

## Glossary

- **Landing_Page**: The public-facing page rendered at the root URL (`/`) for unauthenticated visitors, distinct from the post-login Splash screen.
- **Splash_Screen**: The existing animated intro screen (`/splash`) shown to users immediately after a successful login, before redirecting to the dashboard.
- **GSAP**: GreenSock Animation Platform — a JavaScript animation library used for timeline-based and scroll-triggered animations.
- **ScrollTrigger**: A GSAP plugin that ties animation playback to the user's scroll position.
- **Hero_Section**: The first full-viewport section of the Landing_Page containing the primary headline, subheadline, and call-to-action buttons.
- **Features_Section**: A section of the Landing_Page that showcases the platform's key capabilities (quizzes, code editor, networking playground, etc.).
- **CTA_Section**: A call-to-action section near the bottom of the Landing_Page prompting visitors to register or log in.
- **Layout**: The authenticated shell component (`Layout.jsx`) containing the sidebar navigation and top bar, used for all protected pages.
- **AuthContext**: The React context providing authentication state (`user`, `loading`, `login`, `logout`, etc.) to all components.
- **ProtectedRoute**: A route wrapper that redirects unauthenticated users to `/login`.
- **PublicRoute**: A route wrapper that redirects authenticated users to `/dashboard`.
- **Router**: The React Router DOM instance managing all client-side navigation.

---

## Requirements

### Requirement 1: Public Landing Page Route

**User Story:** As a visitor, I want to see an engaging landing page when I open the app, so that I understand what EduBot offers before deciding to sign up or log in.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to `/`, THE Router SHALL render the Landing_Page component.
2. WHEN an authenticated user navigates to `/`, THE Router SHALL redirect the user to `/dashboard` without rendering the Landing_Page.
3. WHEN the Landing_Page is loading authentication state, THE Landing_Page SHALL display a loading indicator until the AuthContext resolves.
4. THE Landing_Page SHALL be accessible without any authentication token.

---

### Requirement 2: Landing Page Hero Section

**User Story:** As a visitor, I want a visually striking hero section with a clear value proposition, so that I immediately understand what the platform does.

#### Acceptance Criteria

1. THE Hero_Section SHALL display a headline, a subheadline describing the platform, and at least two call-to-action buttons ("Get Started" and "Log In").
2. WHEN a visitor clicks "Get Started", THE Router SHALL navigate to `/register`.
3. WHEN a visitor clicks "Log In", THE Router SHALL navigate to `/login`.
4. THE Hero_Section SHALL occupy the full viewport height on initial page load.
5. WHEN the Landing_Page mounts, THE GSAP SHALL animate the Hero_Section headline, subheadline, and buttons into view using a staggered fade-and-slide-up timeline.

---

### Requirement 3: Landing Page Features Section

**User Story:** As a visitor, I want to see the platform's key features highlighted, so that I can evaluate whether EduBot meets my learning needs.

#### Acceptance Criteria

1. THE Features_Section SHALL display at least six feature cards, each representing a platform capability (e.g., AI Quizzes, Code Editor, Networking Playground, English Fluency, Syllabus Browser, Progress Tracking).
2. WHEN a visitor scrolls to the Features_Section, THE ScrollTrigger SHALL trigger a staggered entrance animation for each feature card.
3. THE Features_Section entrance animation SHALL play once per page load and SHALL NOT replay when the user scrolls back up.
4. WHEN the Features_Section animation triggers, THE GSAP SHALL animate each card from an initial state of `opacity: 0, y: 50` to a final state of `opacity: 1, y: 0` with a stagger of 0.15 seconds between cards.

---

### Requirement 4: Landing Page CTA Section

**User Story:** As a visitor who has scrolled through the features, I want a final prompt to sign up, so that I am guided toward creating an account.

#### Acceptance Criteria

1. THE CTA_Section SHALL display a headline, a brief motivational description, and a "Sign Up Free" button.
2. WHEN a visitor clicks "Sign Up Free", THE Router SHALL navigate to `/register`.
3. WHEN a visitor scrolls to the CTA_Section, THE ScrollTrigger SHALL trigger a fade-in animation for the CTA_Section content.

---

### Requirement 5: GSAP ScrollTrigger Integration

**User Story:** As a visitor, I want smooth scroll-driven animations throughout the landing page, so that the experience feels polished and modern.

#### Acceptance Criteria

1. THE Landing_Page SHALL install and import `gsap` and `@gsap/react` (or `gsap/ScrollTrigger`) as dependencies.
2. WHEN the Landing_Page mounts, THE GSAP SHALL register the ScrollTrigger plugin before any scroll animations are created.
3. WHEN the Landing_Page unmounts, THE Landing_Page SHALL call `ScrollTrigger.getAll().forEach(t => t.kill())` to clean up all active scroll triggers and prevent memory leaks.
4. WHEN a scroll animation is defined, THE ScrollTrigger SHALL use `start: "top 80%"` as the default trigger threshold so animations begin before the element fully enters the viewport.
5. IF the user's device has `prefers-reduced-motion: reduce` set, THEN THE Landing_Page SHALL skip GSAP animations and render all sections in their final visible state immediately.

---

### Requirement 6: Responsive Landing Page Layout

**User Story:** As a visitor on any device, I want the landing page to display correctly, so that I can access it from mobile, tablet, or desktop.

#### Acceptance Criteria

1. THE Landing_Page SHALL use a responsive layout that adapts to viewport widths of 320px, 768px, and 1280px without horizontal overflow.
2. WHILE the viewport width is less than 768px, THE Features_Section SHALL display feature cards in a single-column layout.
3. WHILE the viewport width is 768px or greater, THE Features_Section SHALL display feature cards in a two-column or three-column grid layout.

---

### Requirement 7: Post-Login Splash Screen Flow (Existing — Verified Connection)

**User Story:** As a user who has just logged in, I want to see the animated splash screen before reaching my dashboard, so that the transition feels intentional and branded.

#### Acceptance Criteria

1. WHEN a user successfully logs in via email/password, THE Router SHALL navigate to `/splash`.
2. WHEN a user successfully logs in via face recognition, THE Router SHALL navigate to `/splash`.
3. WHEN the Splash_Screen has completed its animation sequence (5 seconds), THE Router SHALL navigate to `/dashboard` using `replace: true`.
4. THE `/splash` route SHALL be a ProtectedRoute so unauthenticated users cannot access it directly.

---

### Requirement 8: Sidebar Navigation Completeness

**User Story:** As an authenticated user, I want all sidebar navigation links to work correctly, so that I can reach every part of the app without dead ends.

#### Acceptance Criteria

1. THE Layout SHALL include navigation links for: Dashboard (`/dashboard`), Subjects (`/subjects`), Questions (`/questions`), English Fluency (`/english-fluency`), and Profile (`/profile`).
2. WHEN a user clicks any navigation link in the Layout sidebar, THE Router SHALL render the corresponding page component without a 404 or redirect to an unintended route.
3. THE Layout SHALL NOT include navigation links to routes that do not have a corresponding registered Route in the Router.

---

### Requirement 9: Dashboard Quick Action Connections

**User Story:** As an authenticated user on the dashboard, I want all quick action buttons to navigate to the correct pages, so that I can start any activity without manually typing URLs.

#### Acceptance Criteria

1. WHEN a user clicks "Start Practice" on the Dashboard, THE Router SHALL navigate to `/questions`.
2. WHEN a user clicks "View Progress" on the Dashboard, THE Router SHALL navigate to `/profile`.
3. WHEN a user clicks "Browse Subjects" on the Dashboard, THE Router SHALL navigate to `/subjects`.

---

### Requirement 10: Subjects Page Feature Navigation

**User Story:** As an authenticated user on the Subjects page, I want to navigate to subject-specific tools (quizzes, playground, code editor) from each subject card, so that I can start practicing immediately.

#### Acceptance Criteria

1. WHEN a user clicks "View Syllabus" on a subject card, THE Router SHALL navigate to the corresponding syllabus route (e.g., `/syllabus/python`).
2. THE Subjects page SHALL provide a visible link or button to the Networking Playground (`/networking-playground`) for the Computer Network subject.
3. THE Subjects page SHALL provide a visible link or button to the Code Editor (`/code-editor`) for programming language subjects (Python, Java, C++, C Programming).
4. THE Subjects page SHALL provide a visible link or button to the DBMS Quiz (`/dbms-quiz`) for the Database Management subject.
