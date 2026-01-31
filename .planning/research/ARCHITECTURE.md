# Architecture Research: Interactive Debezium Course Website

**Project:** Interactive Debezium Course Platform
**Domain:** Educational course website (static, interactive)
**Researched:** 2026-01-31
**Overall Confidence:** HIGH

---

## Executive Summary

An interactive course website with roadmap navigation and progress tracking requires a **component-based static architecture** with selective client-side interactivity. The recommended approach follows the **"islands architecture" pattern** popularized by Astro and modern static site generators, where most content is static HTML with interactive "islands" for dynamic features like progress tracking, code playgrounds, and interactive diagrams.

**Key architectural decisions:**
- **Static-first with islands of interactivity** (Astro pattern)
- **Feature-based file organization** (course modules as first-class citizens)
- **Client-side state management** via localStorage for progress + lightweight state library (Zustand/Context)
- **Component hierarchy:** Layout → Feature modules → Content components
- **Mobile-first responsive design** with sidebar navigation on desktop

---

## Component Overview

### 1. Core Layout Components

| Component | Responsibility | State Management | Interactivity |
|-----------|---------------|------------------|---------------|
| **AppShell** | Global layout wrapper, header, footer | None (static) | Static |
| **NavigationSidebar** | Course module tree, progress indicators | Reads from ProgressTracker | Conditional render based on viewport |
| **ContentArea** | Main content display region | None | Static wrapper |
| **ProgressBar** | Visual completion indicator | Reads from ProgressTracker | Dynamic updates |
| **Header** | Site branding, global nav, search | None | Static |
| **Footer** | Credits, links | None | Static |

**Architecture pattern:** Layout components follow the **wrapper/container pattern** where layout shells are static and only inject dynamic children where needed.

**Source confidence:** HIGH - Based on [Docusaurus architecture](https://docusaurus.io/) and [modern component patterns](https://www.patterns.dev/react/react-2026/).

### 2. Navigation Components

| Component | Responsibility | State Management | Data Flow |
|-----------|---------------|------------------|-----------|
| **RoadmapView** | Interactive roadmap diagram (SVG-based) | Reads progress, handles click navigation | User click → Router navigation + Progress update |
| **ModuleTree** | Hierarchical sidebar navigation | Reads progress for checkmarks | Displays completion status |
| **Breadcrumbs** | Current location indicator | Router state | Read-only display |
| **NextPrevButtons** | Sequential navigation | Router + Module structure | Navigate between lessons |

**Recommended library for roadmap:** [React Flow](https://reactflow.dev) (17.6K stars, nodes as React components) or custom SVG solution depending on complexity needs.

**Architecture pattern:** Navigation components are **read-heavy**—they consume progress state but rarely update it directly. Updates happen through ContentArea interactions.

**Source confidence:** MEDIUM - Based on [roadmap.sh implementation](https://roadmap.sh/about) (Astro + Tailwind, GitHub Pages deployed) and [React diagram libraries](https://reactflow.dev).

### 3. Content Components

| Component | Responsibility | State Management | Interactivity Level |
|-----------|---------------|------------------|---------------------|
| **TheorySection** | Markdown/MDX content renderer | None | Static (unless interactive examples embedded) |
| **CodeBlock** | Syntax-highlighted code examples | None | Static with copy button |
| **CodePlayground** | Interactive code editor + preview | Local component state | High - live editing |
| **DiagramViewer** | Interactive diagrams (Debezium architecture, data flow) | Local state for zoom/pan | Medium - SVG interactions |
| **ExerciseCard** | Practical exercises with validation | Local state + ProgressTracker on completion | High - user input validation |
| **QuizQuestion** | Knowledge checks | Local state + ProgressTracker on completion | Medium - selection + feedback |

**Recommended libraries:**
- **Syntax highlighting:** [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) with Prism backend (2kB gzipped core, supports async loading)
- **Interactive diagrams:** [React Flow](https://reactflow.dev) for node-based diagrams or custom SVG with pan/zoom
- **Code playground:** Embed pattern with [CodeSandbox](https://codesandbox.io) or [StackBlitz](https://stackblitz.com) for live Debezium examples (recommended for 2026 per [React playground comparison](https://www.creolestudios.com/top-react-js-playgrounds/))

**Architecture pattern:** Content components follow the **composition pattern**—TheorySection can contain CodeBlocks, Diagrams, and Exercises as children. Each content type is self-contained.

**Source confidence:** HIGH - Based on [React syntax highlighter architecture](https://github.com/react-syntax-highlighter/react-syntax-highlighter), [interactive playground patterns](https://www.creolestudios.com/top-react-js-playgrounds/), and [diagram component architecture](https://reactflow.dev).

### 4. Progress Tracking System

| Component | Responsibility | Storage | Update Trigger |
|-----------|---------------|---------|----------------|
| **ProgressTracker** | Centralized progress state manager | localStorage (5MB limit) | Lesson completion, exercise submission |
| **ProgressProvider** | React Context provider for progress state | In-memory sync with localStorage | Context subscription |
| **CompletionMarker** | Mark lesson/exercise as complete | Triggers ProgressTracker update | User action (button click) |
| **ProgressExporter** | Export/import progress JSON | localStorage → file download | User-initiated |

**Data structure (localStorage):**
```typescript
interface CourseProgress {
  version: string; // Schema version for migrations
  lastUpdated: string; // ISO timestamp
  modules: {
    [moduleId: string]: {
      completed: boolean;
      lessons: {
        [lessonId: string]: {
          completed: boolean;
          lastVisited: string;
          exercises: {
            [exerciseId: string]: {
              completed: boolean;
              attempts: number;
            }
          }
        }
      }
    }
  }
}
```

**Architecture pattern:** **Publish-subscribe with localStorage sync**. Progress updates follow this flow:
1. User completes action (e.g., clicks "Mark Complete")
2. Component calls ProgressTracker update method
3. ProgressTracker updates in-memory state
4. State change triggers localStorage write (debounced)
5. Storage event notifies other tabs (if multi-tab support needed)
6. Subscribed components re-render with new progress

**Best practices from research:**
- **Debounce localStorage writes** to avoid blocking main thread ([localStorage can block UI](https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo))
- **Store as JSON strings** (localStorage only supports strings)
- **Implement schema versioning** for future migrations
- **Provide export/import** as backup mechanism (localStorage can be cleared by users)
- **Validate on read** to handle corrupted data

**Source confidence:** HIGH - Based on [localStorage architecture patterns](https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo) and [state management best practices](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns).

---

## Data Flow Architecture

### State Management Strategy

**Hybrid approach recommended for 2026:**
- **Progress state:** Zustand or React Context (lightweight, ~1KB)
- **Router state:** React Router (or framework-native routing)
- **Local component state:** useState for UI interactions (expandable sections, modals)
- **Persistent state:** localStorage as single source of truth for progress

**Why not Redux?** For a course website, Redux is overkill. Research shows [Redux usage down to ~10% in new projects](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns), with [Zustand seeing 30%+ growth and appearing in 40% of projects](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns). For simple progress tracking, **React Context + localStorage is sufficient**.

**Data flow diagram:**

```
┌─────────────────────────────────────────────────────────┐
│                     User Interaction                     │
│  (clicks "Complete", submits exercise, navigates)        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Content Component    │
         │  (ExerciseCard, etc)  │
         └───────────┬───────────┘
                     │ Calls update method
                     ▼
         ┌───────────────────────┐
         │  ProgressTracker      │◄──────┐
         │  (State Manager)      │       │
         └───────────┬───────────┘       │
                     │                   │
        ┌────────────┴────────────┐      │
        │                         │      │
        ▼                         ▼      │
┌───────────────┐         ┌─────────────────┐
│ localStorage  │         │ Component State │
│  (persist)    │         │   (in-memory)   │
└───────────────┘         └────────┬────────┘
                                   │ Notifies subscribers
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                     ▼                           ▼
          ┌──────────────────┐        ┌─────────────────┐
          │ NavigationSidebar│        │  ProgressBar    │
          │ (reads progress) │        │ (reads progress)│
          └──────────────────┘        └─────────────────┘
```

**Key principles:**
1. **Unidirectional data flow** (user action → state update → UI re-render)
2. **Single source of truth** (localStorage is authoritative)
3. **Optimistic updates** (update UI immediately, persist asynchronously)
4. **Sync on load** (read from localStorage on app initialization)

**Source confidence:** HIGH - Based on [2026 state management patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) and [localStorage architecture guide](https://rxdb.info/articles/localstorage.html).

---

## File Structure Recommendation

**Feature-based organization** with course modules as top-level features:

```
debezium-course/
├── public/                          # Static assets (deployed as-is)
│   ├── diagrams/                    # Static diagram images
│   ├── fonts/
│   └── favicon.ico
│
├── src/
│   ├── components/                  # Shared/reusable components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── NavigationSidebar.tsx
│   │   ├── content/
│   │   │   ├── TheorySection.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── CodePlayground.tsx
│   │   │   ├── DiagramViewer.tsx
│   │   │   ├── ExerciseCard.tsx
│   │   │   └── QuizQuestion.tsx
│   │   ├── navigation/
│   │   │   ├── RoadmapView.tsx
│   │   │   ├── ModuleTree.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── NextPrevButtons.tsx
│   │   └── ui/                      # Basic UI primitives
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── ProgressBar.tsx
│   │
│   ├── features/                    # Feature modules (course content)
│   │   ├── roadmap/
│   │   │   ├── RoadmapPage.tsx
│   │   │   └── roadmap-data.ts
│   │   ├── module-1-intro/
│   │   │   ├── index.tsx            # Module landing page
│   │   │   ├── lesson-1-what-is-debezium.tsx
│   │   │   ├── lesson-2-cdc-basics.tsx
│   │   │   └── exercises/
│   │   │       └── exercise-1.tsx
│   │   ├── module-2-setup/
│   │   │   ├── index.tsx
│   │   │   └── ...
│   │   └── module-3-connectors/
│   │       └── ...
│   │
│   ├── lib/                         # Core business logic
│   │   ├── progress/
│   │   │   ├── ProgressTracker.ts   # Progress state manager
│   │   │   ├── ProgressProvider.tsx # React Context provider
│   │   │   ├── storage.ts           # localStorage abstraction
│   │   │   └── types.ts             # TypeScript interfaces
│   │   ├── routing/
│   │   │   └── course-structure.ts  # Module/lesson hierarchy
│   │   └── utils/
│   │       └── debounce.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── syntax-theme.css         # Prism theme
│   │   └── responsive.css
│   │
│   ├── App.tsx                      # Root component
│   └── main.tsx                     # Entry point
│
├── content/                         # Markdown/MDX content (if using MDX)
│   ├── module-1/
│   │   ├── lesson-1.mdx
│   │   └── lesson-2.mdx
│   └── ...
│
├── .planning/                       # GSD planning artifacts
├── package.json
├── tsconfig.json
└── vite.config.ts (or next.config.js, astro.config.mjs)
```

**Key organizational principles:**

1. **Components by type, features by domain**
   - `/components/` contains reusable UI components (type-based)
   - `/features/` contains course modules (domain-based)
   - This follows [recommended React structure for 2025-2026](https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc)

2. **Co-locate related files**
   - Keep exercises with their modules
   - Keep styles with components (if using CSS modules)

3. **Separate content from code**
   - Option 1: `/content/` directory with Markdown/MDX files
   - Option 2: Embed content directly in React components
   - **Recommendation:** Start with Option 2 for simplicity, migrate to Option 1 if content team grows

4. **Limit nesting depth**
   - Maximum 3-4 levels of nesting ([React folder structure best practice](https://www.joshwcomeau.com/react/file-structure/))
   - Flatten if directories feel too deep

**Alternative: Docusaurus-style structure** (if using a documentation framework):

```
debezium-course/
├── docs/                    # All course content as Markdown
│   ├── intro/
│   ├── setup/
│   └── connectors/
├── src/
│   ├── components/          # Custom React components
│   └── css/
├── static/                  # Static assets
├── docusaurus.config.js
└── sidebars.js              # Navigation structure
```

**Source confidence:** HIGH - Based on [React folder structure patterns 2025-2026](https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc), [feature-based organization](https://www.joshwcomeau.com/react/file-structure/), and [Docusaurus structure](https://docusaurus.io/).

---

## Build Order & Dependency Graph

**Recommended build sequence** (phases based on component dependencies):

### Phase 1: Static Foundation
**Goal:** Get basic content rendering working with routing

**Components to build:**
1. `AppShell` (layout wrapper)
2. `Header` / `Footer`
3. `TheorySection` (basic content renderer)
4. Routing setup (define module/lesson routes)
5. Basic responsive styles (mobile-first)

**Deliverable:** Static site with navigable lessons (no progress tracking yet)

**Why first:** Establishes the content structure and validates deployment pipeline (GitHub Pages / Vercel).

---

### Phase 2: Navigation System
**Goal:** Enable multiple navigation patterns

**Components to build:**
1. `NavigationSidebar` (module tree, static version without progress)
2. `Breadcrumbs`
3. `NextPrevButtons`
4. Course structure data model (`course-structure.ts`)

**Dependencies:** Phase 1 (requires routing and layout)

**Deliverable:** Full navigation between all lessons via sidebar and buttons

**Why second:** Validates course structure before adding interactivity.

---

### Phase 3: Progress Tracking Core
**Goal:** Implement persistent progress tracking

**Components to build:**
1. `ProgressTracker` (state manager)
2. `storage.ts` (localStorage abstraction)
3. `ProgressProvider` (React Context)
4. `CompletionMarker` (mark complete button)
5. `ProgressBar` (visual indicator)

**Dependencies:** Phase 2 (requires course structure data)

**Deliverable:** Users can mark lessons complete, progress persists across sessions

**Why third:** Core feature that unblocks interactive roadmap and exercises.

---

### Phase 4: Interactive Roadmap
**Goal:** Visual course overview with progress

**Components to build:**
1. `RoadmapView` (SVG or React Flow based diagram)
2. Integration with ProgressTracker (read-only)
3. Click-to-navigate functionality

**Dependencies:** Phase 3 (requires progress state)

**Deliverable:** Interactive roadmap showing course structure and completion status

**Why fourth:** Requires stable progress system. Can be built in parallel with Phase 5.

---

### Phase 5: Rich Content Components
**Goal:** Add code examples, diagrams, exercises

**Components to build:**
1. `CodeBlock` (syntax highlighting)
2. `DiagramViewer` (interactive diagrams)
3. `ExerciseCard` (practical exercises)
4. `QuizQuestion` (knowledge checks)
5. `CodePlayground` (optional, can defer)

**Dependencies:** Phase 3 (exercises update progress)

**Deliverable:** Full content experience with multiple media types

**Why fifth:** Can be built incrementally. Start with CodeBlock (easiest), add diagrams and exercises, defer playground to post-MVP if needed.

---

### Phase 6: Enhancements & Polish
**Goal:** Improve UX and add nice-to-haves

**Components to build:**
1. Search functionality
2. Theme switcher (dark/light mode)
3. `ProgressExporter` (backup/restore)
4. Mobile navigation refinements
5. Accessibility improvements (keyboard nav, ARIA labels)

**Dependencies:** All previous phases

**Deliverable:** Production-ready course website

**Why last:** Polish features that enhance existing functionality.

---

### Dependency Graph

```
Phase 1: Static Foundation
    ↓
Phase 2: Navigation ──┐
    ↓                 │
Phase 3: Progress ────┤
    ↓                 ↓
    ├──→ Phase 4: Roadmap (parallel)
    │
    └──→ Phase 5: Rich Content (parallel)
            ↓
Phase 6: Enhancements
```

**Build order rationale:**
- **Bottom-up approach:** Start with layout, add navigation, add state, add interactivity
- **Parallelization opportunity:** Phases 4 and 5 can be built simultaneously by different developers
- **Incremental value:** Each phase delivers a working site (Phase 1 is deployable, Phase 2 adds navigation, etc.)
- **Risk management:** Core complexity (progress tracking) built early before dependent features

**Source confidence:** MEDIUM - Derived from component dependencies and general software architecture principles. Not specific to research sources but logically sound.

---

## Responsive Design Considerations

### Mobile-First Strategy

**Viewport breakpoints:**
```css
/* Mobile (default) */
@media (min-width: 640px) { /* sm - Large phones */ }
@media (min-width: 768px) { /* md - Tablets */ }
@media (min-width: 1024px) { /* lg - Laptops */ }
@media (min-width: 1280px) { /* xl - Desktops */ }
```

**Recommended approach:** [Mobile-first design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) - start with single-column mobile layout, progressively enhance for larger screens.

### Layout Adaptations by Viewport

| Component | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|-----------|----------------|---------------------|-------------------|
| **NavigationSidebar** | Hidden, toggle via hamburger menu | Collapsible sidebar (icons + text) | Persistent sidebar (expanded) |
| **RoadmapView** | Vertical scrolling, simplified | Zoomable, pan gestures | Full interactive diagram |
| **CodeBlock** | Horizontal scroll, smaller font | Wrap with overflow scroll | Full width, optimal font size |
| **ContentArea** | Single column, full width | Single column with margins | Two-column for comparisons |
| **NextPrevButtons** | Bottom of page (sticky) | Bottom of page | Sidebar + bottom |

### Mobile Navigation Patterns

**Recommended:** [Hamburger menu pattern](https://webflow.com/blog/navigation-bar-design) for mobile
- Hamburger icon in header opens full-screen navigation overlay
- Overlay contains ModuleTree with progress indicators
- Close button or swipe gesture to dismiss

**Accessibility requirement:** Navigation must work with keyboard-only and screen readers ([consistent navigation improves accessibility](https://accessibility.asu.edu/articles/navigation)).

### Performance Considerations

**Mobile performance optimizations:**
1. **Lazy load code playgrounds** - defer until user interacts (saves bandwidth)
2. **Optimize images** - use responsive images with `srcset`, compress diagrams
3. **Reduce bundle size** - code-split by route (load only current lesson's code)
4. **Prefetch next lesson** - improve perceived performance for sequential learners
5. **Service worker** - cache visited lessons for offline access (optional enhancement)

**Recommended approach:** Astro's [islands architecture](https://crystallize.com/blog/react-static-site-generators) ships zero JS by default, loads interactivity on demand. This is ideal for course content (mostly static).

### Touch Interactions

**Interactive diagram considerations:**
- **Pinch-to-zoom** for roadmap on mobile
- **Tap targets** minimum 44x44px ([accessibility guideline](https://accessibility.asu.edu/articles/navigation))
- **Swipe gestures** for next/previous lessons (optional, ensure keyboard alternative)

### Testing Strategy

**Responsive testing checklist:**
- [ ] Test on actual devices (iPhone, Android, iPad)
- [ ] Test in Chrome DevTools device mode
- [ ] Verify sidebar navigation on all breakpoints
- [ ] Verify code blocks scroll horizontally on narrow screens
- [ ] Test roadmap interactivity on touch devices
- [ ] Verify progress bar visibility on mobile

**Source confidence:** HIGH - Based on [responsive design fundamentals](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design), [navigation best practices](https://webflow.com/blog/navigation-bar-design), and [mobile-first design patterns](https://www.w3schools.com/css/css_rwd_intro.asp).

---

## Architecture Patterns to Follow

### 1. Islands Architecture (Static-First)

**Pattern:** Render most content as static HTML, hydrate only interactive components.

**Implementation:**
- Use Astro, Next.js with `output: 'export'`, or similar framework
- Mark components that need interactivity with explicit hydration directive
- Example (Astro): `<CodePlayground client:visible />` (hydrate when visible)

**Benefits:**
- Faster initial load (less JavaScript)
- Better SEO (content is server-rendered)
- Reduced complexity for static content

**Source:** [Astro islands architecture](https://crystallize.com/blog/react-static-site-generators), [Jamstack patterns 2025-2026](https://www.keencomputer.com/solutions/software-engineering/880-research-white-paper-the-future-of-web-architecture-jamstack-and-static-site-generators-as-the-foundation-of-agile-digital-transformation-2025-2026)

---

### 2. Composition Over Configuration

**Pattern:** Build complex UIs by composing small, single-purpose components.

**Example:**
```tsx
// Bad: Monolithic component with config flags
<LessonPage type="theory" hasCode hasExercise hasDiagram />

// Good: Composition of focused components
<LessonPage>
  <TheorySection content={...} />
  <CodeBlock language="sql" code={...} />
  <DiagramViewer src="..." />
  <ExerciseCard exercise={...} />
</LessonPage>
```

**Benefits:**
- Easier to understand component boundaries
- Reusable components across different lesson types
- Simpler testing (test each component in isolation)

**Source:** [React composition patterns 2026](https://www.patterns.dev/react/react-2026/)

---

### 3. Container/Presenter Pattern (for Progress Components)

**Pattern:** Separate data fetching/state logic from UI rendering.

**Implementation:**
```tsx
// Container: Handles progress state
function ProgressContainer({ lessonId, children }) {
  const progress = useProgress(lessonId);
  return children({ progress, markComplete: () => {...} });
}

// Presenter: Pure UI component
function CompletionButton({ onComplete, completed }) {
  return <button onClick={onComplete}>{completed ? '✓' : 'Mark Complete'}</button>;
}

// Usage
<ProgressContainer lessonId="intro-1">
  {({ progress, markComplete }) => (
    <CompletionButton onComplete={markComplete} completed={progress.completed} />
  )}
</ProgressContainer>
```

**Benefits:**
- Easier to test UI components (no state logic)
- Reusable state logic across different UIs
- Clear separation of concerns

**Source:** [React design patterns 2026](https://www.sayonetech.com/blog/react-design-patterns/)

---

### 4. Optimistic UI Updates

**Pattern:** Update UI immediately, sync to localStorage asynchronously.

**Implementation:**
```typescript
function markLessonComplete(lessonId: string) {
  // 1. Update in-memory state immediately (UI reflects change instantly)
  setState(prev => ({ ...prev, [lessonId]: { completed: true } }));

  // 2. Persist to localStorage asynchronously (debounced)
  debouncedSave();
}
```

**Benefits:**
- Faster perceived performance
- Smoother user experience (no loading states for local actions)

**Trade-off:** Must handle edge cases (localStorage write failure, quota exceeded)

**Source:** [localStorage architecture patterns](https://medium.com/@lcs2021021/the-art-of-persistent-local-storage-a-developers-guide-to-state-persistence-29ed77816ea6)

---

## Anti-Patterns to Avoid

### 1. ❌ Treating localStorage as a Database

**What goes wrong:** Storing complex relational data, running queries against localStorage, storing large binary data.

**Why it's bad:**
- localStorage is synchronous (blocks main thread)
- 5MB limit per origin
- String-only storage (inefficient for complex data)

**Instead:**
- Keep progress data simple and flat
- Use IndexedDB if you need >5MB or complex queries
- Store only essential state, derive everything else

**Source:** [localStorage limitations](https://rxdb.info/articles/localstorage.html)

---

### 2. ❌ Over-Componentizing

**What goes wrong:** Creating a separate component for every tiny piece of UI.

**Example:**
```tsx
// Bad: Too granular
<LessonTitle />
<LessonDescription />
<LessonMetadata />
<LessonEstimatedTime />

// Better: Logical grouping
<LessonHeader title={...} description={...} metadata={...} />
```

**Why it's bad:**
- More files to navigate
- Harder to see the big picture
- Premature abstraction

**Instead:**
- Start with larger components, split only when you see duplication
- Follow [3-folder depth limit](https://www.joshwcomeau.com/react/file-structure/)

---

### 3. ❌ Client-Side Routing Without Static Fallbacks

**What goes wrong:** Using React Router with no static HTML generation.

**Why it's bad:**
- Breaks "view source" (SEO issues)
- Slower initial load (wait for JS to render)
- Doesn't work without JavaScript

**Instead:**
- Use a framework with static generation (Next.js, Astro, Gatsby)
- Pre-render all routes at build time
- Use client-side routing only for navigation (progressive enhancement)

**Source:** [Jamstack best practices](https://www.keencomputer.com/solutions/software-engineering/880-research-white-paper-the-future-of-web-architecture-jamstack-and-static-site-generators-as-the-foundation-of-agile-digital-transformation-2025-2026)

---

### 4. ❌ Global State for Everything

**What goes wrong:** Putting all app state (UI state, form state, progress state) in one global store.

**Why it's bad:**
- Unnecessary re-renders (components subscribe to unrelated state)
- Harder to debug (state changes happen from anywhere)
- Overkill for simple UI state (modal open/closed doesn't need global state)

**Instead:**
- **Local state** (useState): Component-specific UI (collapsed/expanded, selected tab)
- **Context/Zustand**: Shared app state (progress, user preferences)
- **localStorage**: Persistent state
- Keep state as local as possible, lift only when necessary

**Source:** [State management in 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)

---

## Technology Stack Recommendations

| Category | Recommended | Alternative | Rationale |
|----------|-------------|-------------|-----------|
| **Framework** | Astro 5.0+ | Next.js 15+ | Astro's islands architecture is ideal for content-heavy sites with selective interactivity |
| **UI Library** | React 19 | Vue 3, Svelte | Largest ecosystem, easiest to find developers, works with Astro |
| **State Management** | Zustand 5.0+ | React Context | Zustand is lightweight (1KB), zero-boilerplate, growing 30% YoY |
| **Routing** | Framework-native | React Router 7 | Use Astro's file-based routing or Next.js App Router |
| **Styling** | Tailwind CSS 4.0 | CSS Modules | Utility-first, rapid prototyping, good mobile-first support |
| **Syntax Highlighting** | react-syntax-highlighter | Prism.js direct | React-friendly, supports Prism backend, async loading |
| **Diagrams** | React Flow | Mermaid.js | Interactive node-based diagrams, good for architecture visualizations |
| **Deployment** | Vercel | GitHub Pages, Netlify | Best Astro/Next.js support, automatic previews, edge functions |

**Source confidence:** HIGH - Based on [static site generator comparison 2026](https://kinsta.com/blog/static-site-generator/), [state management trends](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns), and [React ecosystem patterns](https://www.patterns.dev/react/react-2026/).

---

## Migration Path (If Using Docusaurus)

If the team decides to use Docusaurus instead of custom React:

**Pros:**
- ✅ Built-in sidebar navigation with progress plugin
- ✅ MDX support (embed React components in Markdown)
- ✅ Versioning and i18n out-of-the-box
- ✅ Faster initial development (less custom code)

**Cons:**
- ❌ Less control over roadmap visualization (would need custom plugin)
- ❌ Harder to customize progress tracking (plugin ecosystem may not support exact requirements)
- ❌ Heavier bundle size than Astro

**Recommendation:** Start with **Astro** for maximum control over roadmap and progress features. Consider Docusaurus only if team prioritizes speed over customization.

**Source:** [Docusaurus architecture overview](https://docusaurus.io/), [Docusaurus review 2026](https://ferndesk.com/blog/docusaurus-review)

---

## Open Questions for Phase-Specific Research

1. **Code playground architecture:** Embed vs. custom implementation? (Defer to Phase 5 research)
2. **Diagram source format:** Static SVGs, Mermaid.js, or data-driven React Flow? (Depends on complexity of Debezium diagrams)
3. **Multi-language support:** Is i18n needed for Debezium course? (May require architecture changes if yes)
4. **Offline support:** Should course work offline via service worker? (Enhancement opportunity)

---

## Sources

### High Confidence (Official Documentation & Authoritative Sources)
- [Astro Documentation - Islands Architecture](https://crystallize.com/blog/react-static-site-generators)
- [Docusaurus Official Documentation](https://docusaurus.io/)
- [React Official Docs - File Structure](https://legacy.reactjs.org/docs/faq-structure.html)
- [MDN - Responsive Web Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
- [React Flow Documentation](https://reactflow.dev)
- [react-syntax-highlighter GitHub](https://github.com/react-syntax-highlighter/react-syntax-highlighter)

### Medium Confidence (Industry Analysis & Community Resources)
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)
- [The Complete Guide to Frontend Architecture Patterns in 2026](https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo)
- [Recommended Folder Structure for React 2025](https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc)
- [Josh W. Comeau - Delightful React File/Directory Structure](https://www.joshwcomeau.com/react/file-structure/)
- [React Design Patterns for 2026 Projects](https://www.sayonetech.com/blog/react-design-patterns/)
- [Top 5 Static Site Generators in 2026](https://kinsta.com/blog/static-site-generator/)
- [Top React JS Playgrounds for 2026](https://www.creolestudios.com/top-react-js-playgrounds/)
- [Navigation Bar Design Best Practices](https://webflow.com/blog/navigation-bar-design)

### Ecosystem References
- [roadmap.sh - About](https://roadmap.sh/about)
- [roadmap.sh GitHub Repository](https://github.com/kamranahmedse/developer-roadmap)
- [The Future of Web Architecture: Jamstack and SSGs 2025-2026](https://www.keencomputer.com/solutions/software-engineering/880-research-white-paper-the-future-of-web-architecture-jamstack-and-static-site-generators-as-the-foundation-of-agile-digital-transformation-2025-2026)

---

## Summary for Roadmap Creation

**Component build order:** Layout → Navigation → Progress → Roadmap/Content (parallel) → Enhancements

**Critical architectural decisions:**
1. Use **islands architecture** (Astro or Next.js) for static-first rendering
2. Use **Zustand or Context** for progress state (not Redux)
3. Use **localStorage** as single source of truth for progress
4. Follow **feature-based file organization** (modules as features)
5. Implement **mobile-first responsive design** with sidebar navigation

**Phase structure implications:**
- Phase 1-3 are sequential (dependencies)
- Phase 4-5 can be parallel (independent features)
- Progress tracking (Phase 3) is critical path—unblocks all interactive features

**Risk areas needing deeper research:**
- Code playground implementation (Phase 5)
- Interactive diagram complexity (Phase 4-5)
- Mobile navigation UX (Phase 2, test early)

**Overall confidence:** HIGH - Architecture patterns are well-established in 2026, with strong community adoption of islands architecture, Zustand for state, and React component patterns. The main unknowns are Debezium-specific content complexity, which won't affect overall architecture.
