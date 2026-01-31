# Phase 2: Navigation & Roadmap - Research

**Researched:** 2026-01-31
**Domain:** Interactive navigation systems with Astro 5, React 19, and Mermaid visualizations
**Confidence:** HIGH

## Summary

This phase requires building two interconnected navigation systems: (1) an interactive visual roadmap showing course structure, and (2) a responsive sidebar menu for topic navigation. The research focused on integration patterns between Astro's static generation, React's client-side interactivity, and Mermaid's diagram capabilities.

The standard approach uses Astro's content collections with `getCollection()` to programmatically generate navigation structures, React components with client directives for interactive elements (hamburger menu, roadmap clicks), and nanostores for shared state management across islands. Mermaid provides SVG-based visualizations with click event support when configured with `securityLevel: 'loose'`.

Key architectural decisions: use `client:load` for immediately visible navigation (hamburger toggle), `client:visible` for below-the-fold roadmap, and organize navigation data through content collection queries rather than hardcoded structures.

**Primary recommendation:** Build navigation from content collection queries, use nanostores for menu state sharing between islands, and implement Mermaid flowchart (not timeline) for roadmap due to superior click event support.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @nanostores/react | ^0.10.3 | Cross-island state management | Official Astro recommendation for sharing state between framework islands; 286 bytes, framework-agnostic |
| nanostores | ^0.11.3 | State stores (atoms, maps) | Replaces React Context in partially hydrated components; required for hamburger menu state |
| Mermaid | 11.12.2 (already installed) | Interactive diagram rendering | Already in project; supports click events for roadmap navigation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React 19 | 19.2.4 (already installed) | Interactive UI components | Hamburger menu, roadmap clicks - already available |
| Tailwind CSS 4 | 4.1.18 (already installed) | Responsive styles | Mobile-first navigation - already configured |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Nanostores | React Context | Context doesn't work in Astro islands; requires full tree hydration |
| Mermaid flowchart | Custom SVG | Custom SVG requires manual interactivity; Mermaid provides declarative syntax |
| Mermaid flowchart | Mermaid timeline | Timeline diagrams lack click event support; flowcharts support callbacks and links |

**Installation:**
```bash
npm install nanostores @nanostores/react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Navigation.tsx          # Sidebar navigation (React island)
│   ├── MobileMenuToggle.tsx    # Hamburger button (React island)
│   ├── CourseRoadmap.tsx       # Interactive roadmap (React island)
│   └── Mermaid.tsx             # Existing diagram component
├── stores/
│   └── navigation.ts           # Nanostores for menu state
├── utils/
│   └── navigation.ts           # Navigation tree generation from collections
└── layouts/
    └── BaseLayout.astro        # Layout with sidebar/header slots
```

### Pattern 1: Content Collection Navigation Tree
**What:** Generate hierarchical navigation from content collections using `getCollection()` and metadata
**When to use:** Always - keeps navigation in sync with content automatically
**Example:**
```typescript
// Source: Astro Content Collections docs
// src/utils/navigation.ts
import { getCollection } from 'astro:content';

export async function getNavigationTree() {
  const allCourses = await getCollection('course');

  // Filter and sort
  const published = allCourses.filter(entry => !entry.data.draft);
  const sorted = published.sort((a, b) => a.data.order - b.data.order);

  // Group by module (extract from id path)
  const modules = new Map();
  for (const entry of sorted) {
    const [moduleId] = entry.id.split('/');
    if (!modules.has(moduleId)) {
      modules.set(moduleId, []);
    }
    modules.get(moduleId).push({
      title: entry.data.title,
      slug: entry.id,
      order: entry.data.order,
      difficulty: entry.data.difficulty,
      estimatedTime: entry.data.estimatedTime
    });
  }

  return modules;
}
```

### Pattern 2: Nanostores State Management
**What:** Shared state atoms for menu open/close across disconnected React islands
**When to use:** Any state shared between multiple React components in Astro
**Example:**
```typescript
// Source: https://docs.astro.build/en/recipes/sharing-state-islands/
// src/stores/navigation.ts
import { atom } from 'nanostores';

export const isSidebarOpen = atom(false);

// In React component:
import { useStore } from '@nanostores/react';
import { isSidebarOpen } from '../stores/navigation';

function MobileMenuToggle() {
  const $isOpen = useStore(isSidebarOpen);

  return (
    <button onClick={() => isSidebarOpen.set(!$isOpen)}>
      {$isOpen ? 'Close' : 'Menu'}
    </button>
  );
}
```

### Pattern 3: Mermaid Click Events for Roadmap
**What:** Interactive flowchart with click callbacks for navigation
**When to use:** Course roadmap visualization with clickable modules
**Example:**
```typescript
// Source: https://mermaid.js.org/syntax/flowchart.html
// Mermaid initialization with security config
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose', // Required for click events
});

// Roadmap diagram syntax
const roadmapChart = `
flowchart TB
    INTRO[Module 1: Intro to CDC]
    SETUP[Module 2: Setup]
    CONFIG[Module 3: Configuration]

    INTRO --> SETUP
    SETUP --> CONFIG

    click INTRO "/course/01-intro"
    click SETUP "/course/02-setup"
    click CONFIG "/course/03-config"

    style INTRO fill:#3b82f6
    style SETUP fill:#10b981
    style CONFIG fill:#f59e0b
`;
```

### Pattern 4: Client Directive Strategy
**What:** Selective hydration using appropriate client directives
**When to use:** Always - optimize JavaScript delivery
**Example:**
```astro
<!-- Source: https://docs.astro.build/en/guides/framework-components/ -->
<!-- Header: immediately interactive -->
<MobileMenuToggle client:load />

<!-- Sidebar: immediately interactive on desktop -->
<Navigation client:load />

<!-- Roadmap: lazy load when scrolled into view -->
<CourseRoadmap client:visible />
```

### Pattern 5: Responsive Sidebar with Tailwind
**What:** Mobile-first responsive navigation using Tailwind breakpoints
**When to use:** Sidebar that transforms into drawer on mobile
**Example:**
```astro
<!-- Source: Tailwind responsive design patterns -->
<aside class="
  fixed inset-y-0 left-0 z-50 w-64
  transform transition-transform duration-300
  lg:relative lg:translate-x-0
  {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  bg-gray-800 border-r border-gray-700
">
  <Navigation client:load />
</aside>

<!-- Overlay for mobile -->
<div
  class="fixed inset-0 bg-black/50 lg:hidden {isSidebarOpen ? 'block' : 'hidden'}"
  onClick={() => isSidebarOpen.set(false)}
/>
```

### Anti-Patterns to Avoid
- **Hardcoded navigation arrays:** Navigation should derive from content collections, not static data
- **React Context in Astro:** Context providers don't work across islands; use nanostores instead
- **client:only for navigation:** Causes layout shift; use client:load for critical navigation
- **Timeline diagrams for interactive roadmaps:** Mermaid timelines don't support click events; use flowcharts
- **Forgetting securityLevel:** Mermaid click events require `securityLevel: 'loose'` configuration

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State management between islands | Custom event bus, localStorage | nanostores + @nanostores/react | Tiny (286 bytes), framework-agnostic, handles serialization, recommended by Astro |
| Mobile menu animations | Custom CSS transitions | Tailwind transition utilities | Pre-optimized, cross-browser tested, consistent with design system |
| Hamburger icon animation | Custom SVG animation | Tailwind + simple SVG transform | Accessible, performant, maintainable |
| Navigation tree generation | Manual array maintenance | Content collection queries | Single source of truth, auto-updates when content changes |
| Responsive breakpoints | Custom media queries | Tailwind breakpoint system | Mobile-first, consistent with rest of app (lg:1024px already decided) |

**Key insight:** Astro's islands architecture breaks traditional React patterns. Tools designed for partial hydration (nanostores) prevent common mistakes like trying to share context across islands or over-hydrating components.

## Common Pitfalls

### Pitfall 1: Using React Context Across Islands
**What goes wrong:** React Context doesn't work in Astro's partially hydrated islands. Menu toggle in header can't communicate with sidebar.
**Why it happens:** Developers familiar with React expect Context to work, but Astro renders each island independently.
**How to avoid:** Use nanostores for any state shared between components. Import the same store in each island.
**Warning signs:** State updates in one component don't reflect in another; "useContext must be wrapped in provider" errors.

### Pitfall 2: Mermaid Security Level Blocking Clicks
**What goes wrong:** Click events in Mermaid flowcharts silently fail, roadmap isn't interactive.
**Why it happens:** Default `securityLevel: 'strict'` disables click handlers for XSS protection.
**How to avoid:** Set `securityLevel: 'loose'` in mermaid.initialize() when click events are needed. Content is author-controlled (safe).
**Warning signs:** Flowchart renders but clicks do nothing; no console errors.

### Pitfall 3: Sidebar State Persists Across Navigations
**What goes wrong:** Mobile menu stays open after clicking a link, blocking content after page transition.
**Why it happens:** Nanostores persist across View Transitions; onClick handler doesn't close menu.
**How to avoid:** Add `onClick={() => isSidebarOpen.set(false)}` to all navigation links. Or add View Transitions lifecycle hook to reset on navigation.
**Warning signs:** Users click link, page changes, but menu stays open.

### Pitfall 4: Non-Serializable Props to Hydrated Components
**What goes wrong:** Runtime error "Props must be serializable" when passing functions to React components.
**Why it happens:** Astro serializes props to JSON for islands; functions can't serialize.
**How to avoid:** Never pass functions as props to client:* components. Use nanostores for callbacks or event handlers.
**Warning signs:** TypeError about non-serializable props; component receives undefined for function props.

### Pitfall 5: No Current Location Indicator
**What goes wrong:** Users can't tell which page they're on in the navigation menu.
**Why it happens:** Navigation items don't receive current path context.
**How to avoid:** Pass `Astro.url.pathname` to Navigation component, compare with each item's slug, add `aria-current="page"` and visual styling.
**Warning signs:** All nav items look identical; poor accessibility scores; user confusion.

### Pitfall 6: Missing Mobile Menu Close on Overlay Click
**What goes wrong:** Users can't close mobile menu by tapping outside it (common mobile UX pattern).
**Why it happens:** Overlay div rendered without click handler.
**How to avoid:** Always render overlay with `onClick={() => isSidebarOpen.set(false)}` when sidebar is open.
**Warning signs:** Users can't close menu intuitively; have to use hamburger button.

### Pitfall 7: Incorrect Client Directive Causes Layout Shift
**What goes wrong:** Navigation appears late, causing visible layout jump.
**Why it happens:** Using `client:visible` or `client:idle` for above-the-fold navigation.
**How to avoid:** Use `client:load` for critical UI that's immediately visible. Reserve `client:visible` for below-fold content like roadmap.
**Warning signs:** Content "pops in" after page loads; poor Cumulative Layout Shift (CLS) score.

## Code Examples

Verified patterns from official sources:

### Complete Sidebar Navigation Component
```typescript
// Source: Astro official recipes + Tailwind patterns
// src/components/Navigation.tsx
import { useStore } from '@nanostores/react';
import { isSidebarOpen } from '../stores/navigation';

interface NavigationProps {
  modules: Map<string, Array<{
    title: string;
    slug: string;
    difficulty: string;
    estimatedTime: number;
  }>>;
  currentPath: string;
}

export function Navigation({ modules, currentPath }: NavigationProps) {
  const closeSidebar = () => isSidebarOpen.set(false);

  return (
    <nav aria-label="Course navigation" className="p-6">
      {Array.from(modules.entries()).map(([moduleId, lessons]) => (
        <div key={moduleId} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Module {moduleId}
          </h3>
          <ul className="space-y-1">
            {lessons.map((lesson) => {
              const isCurrent = currentPath.includes(lesson.slug);
              return (
                <li key={lesson.slug}>
                  <a
                    href={`/course/${lesson.slug}`}
                    onClick={closeSidebar}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`
                      block px-3 py-2 rounded-md text-sm
                      transition-colors duration-150
                      ${isCurrent
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    {lesson.title}
                    <span className="text-xs text-gray-400 ml-2">
                      {lesson.estimatedTime}m
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
```

### Responsive Mobile Menu Toggle
```typescript
// Source: React hamburger menu patterns with nanostores
// src/components/MobileMenuToggle.tsx
import { useStore } from '@nanostores/react';
import { isSidebarOpen } from '../stores/navigation';

export function MobileMenuToggle() {
  const $isOpen = useStore(isSidebarOpen);

  return (
    <button
      onClick={() => isSidebarOpen.set(!$isOpen)}
      aria-label={$isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={$isOpen}
      className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {$isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  );
}
```

### Interactive Course Roadmap
```typescript
// Source: Mermaid flowchart click events documentation
// src/components/CourseRoadmap.tsx
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface RoadmapProps {
  modules: Map<string, { title: string; slug: string; }[]>;
}

export function CourseRoadmap({ modules }: RoadmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    // Generate flowchart syntax from modules
    const nodes = Array.from(modules.values()).flat().map((lesson, idx) => {
      const nodeId = `N${idx}`;
      const nodeLabel = lesson.title.replace(/"/g, '&quot;');
      return { id: nodeId, label: nodeLabel, slug: lesson.slug };
    });

    const chart = `
flowchart TB
    ${nodes.map(n => `${n.id}["${n.label}"]`).join('\n    ')}

    ${nodes.slice(0, -1).map((n, i) => `${n.id} --> ${nodes[i + 1].id}`).join('\n    ')}

    ${nodes.map(n => `click ${n.id} "/course/${n.slug}"`).join('\n    ')}

    ${nodes.map((n, i) => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      return `style ${n.id} fill:${colors[i % colors.length]}`;
    }).join('\n    ')}
    `;

    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose', // Required for click events
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#e5e7eb',
            primaryBorderColor: '#60a5fa',
            lineColor: '#9ca3af',
            background: '#1f2937',
          },
        });

        const id = `roadmap-${Math.random().toString(36).substring(7)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Roadmap rendering error:', err);
      }
    };

    renderDiagram();
  }, [modules]);

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Course Roadmap</h2>
      <div
        ref={containerRef}
        className="roadmap-container flex justify-center"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
```

### BaseLayout with Responsive Sidebar
```astro
---
// Source: Tailwind sidebar patterns + Astro islands integration
// src/layouts/BaseLayout.astro
import { getNavigationTree } from '../utils/navigation';
import { Navigation } from '../components/Navigation';
import { MobileMenuToggle } from '../components/MobileMenuToggle';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
const modules = await getNavigationTree();
const currentPath = Astro.url.pathname;
---

<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
  <body>
    <div class="flex flex-col lg:flex-row min-h-screen">
      <!-- Mobile Overlay -->
      <div
        id="sidebar-overlay"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        style="display: none;"
      />

      <!-- Sidebar -->
      <aside
        id="sidebar"
        class="
          fixed inset-y-0 left-0 z-50 w-64
          transform -translate-x-full transition-transform duration-300
          lg:relative lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
          bg-gray-800 border-r border-gray-700 overflow-y-auto
        "
      >
        <Navigation
          modules={modules}
          currentPath={currentPath}
          client:load
        />
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <header class="sticky top-0 bg-gray-800 border-b border-gray-700 z-10">
          <div class="px-4 md:px-8 lg:px-12 py-4 flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-100">{title}</h1>
            <MobileMenuToggle client:load />
          </div>
        </header>

        <main class="flex-1 px-4 md:px-8 lg:px-12 py-8">
          <slot />
        </main>
      </div>
    </div>

    <script>
      import { isSidebarOpen } from '../stores/navigation';

      // Sync nanostores state with DOM for sidebar visibility
      isSidebarOpen.subscribe(isOpen => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar && overlay) {
          if (isOpen) {
            sidebar.classList.remove('-translate-x-full');
            overlay.style.display = 'block';
          } else {
            sidebar.classList.add('-translate-x-full');
            overlay.style.display = 'none';
          }
        }
      });

      // Close on overlay click
      document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
        isSidebarOpen.set(false);
      });
    </script>
  </body>
</html>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Timeline diagrams for roadmaps | Flowchart diagrams with click events | Mermaid 8.x+ | Timeline syntax simpler but lacks interactivity; flowcharts support callbacks |
| React Context for global state | Nanostores for island state | Astro 1.0+ islands | Context requires full tree hydration; nanostores work across islands |
| Manual navigation arrays | Content collection queries | Astro 2.0 collections | Collections provide type safety and single source of truth |
| JavaScript-based sidebar toggle | Tailwind + Alpine.js OR nanostores | Tailwind 3.0+ | Nanostores integrates better with React islands than Alpine in Astro |
| Hamburger menu libraries (react-burger-menu) | Custom with useState + nanostores | 2024+ | Libraries add 10-20KB; custom implementation <1KB with nanostores |

**Deprecated/outdated:**
- **react-burger-menu library:** Adds unnecessary bundle weight (20KB+) when nanostores + simple CSS achieves same result
- **Mermaid timeline diagrams for interactive roadmaps:** Timeline syntax doesn't support click events; use flowcharts instead
- **Astro.glob() for navigation:** Replaced by typed content collections; glob is now for non-content files only
- **Class-based React components:** React 19 encourages function components with hooks; classes still work but not idiomatic

## Open Questions

Things that couldn't be fully resolved:

1. **Roadmap scroll position on mobile**
   - What we know: Mermaid generates large SVGs; roadmap may require horizontal scroll on mobile
   - What's unclear: Best UX pattern - horizontal scroll, zoom controls, or simplified mobile view?
   - Recommendation: Test rendered roadmap on mobile; if width exceeds viewport, add pinch-to-zoom or switch to simplified list view for mobile using `client:media` directive

2. **Navigation depth for complex courses**
   - What we know: Current structure assumes flat module > lesson hierarchy
   - What's unclear: If course needs sub-sections (module > section > lesson), how deep should navigation nest?
   - Recommendation: Start with two levels (module > lesson); add third level only if content structure requires it (avoid premature complexity)

3. **View Transitions impact on state**
   - What we know: Astro View Transitions persist JavaScript state across navigations
   - What's unclear: Should mobile menu auto-close on navigation or preserve state?
   - Recommendation: Auto-close menu on navigation (better UX); add View Transitions listener to reset `isSidebarOpen` or use link onClick handlers

## Sources

### Primary (HIGH confidence)
- [Astro Starlight Sidebar Patterns](https://starlight.astro.build/guides/sidebar/) - Official sidebar configuration guide
- [Astro Framework Components](https://docs.astro.build/en/guides/framework-components/) - Client directives and hydration strategy
- [Astro Sharing State Between Islands](https://docs.astro.build/en/recipes/sharing-state-islands/) - Official nanostores integration guide
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) - Collection queries for navigation generation
- [Mermaid Flowchart Syntax](https://mermaid.js.org/syntax/flowchart.html) - Click events and interactive diagrams
- [Mermaid Timeline Syntax](https://mermaid.js.org/syntax/timeline.html) - Timeline diagram capabilities (no click support confirmed)

### Secondary (MEDIUM confidence)
- [NN/G Breadcrumb Guidelines](https://www.nngroup.com/articles/breadcrumbs/) - UX best practices for navigation
- [Mobile Navigation UX 2026](https://www.designstudiouiux.com/blog/mobile-navigation-ux/) - Current mobile menu patterns
- [W3C ARIA Navigation Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/navigation_role) - Accessibility requirements
- [Tailwind Sidebar Components](https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/sidebar-navigation) - Official responsive patterns
- [Nanostores GitHub](https://github.com/nanostores/nanostores) - Library documentation and examples

### Secondary (verified with official sources)
- [React Hamburger Menu State Management](https://dev.to/nicm42/closing-a-navigation-menu-in-react-8ad) - Close on navigation pattern
- [Sidebar Navigation Mistakes](https://www.sysbunny.com/blog/mobile-app-sidebars-pro-tips-mistakes-to-avoid-for-optimized-app-side-navigation/) - Common pitfalls
- [Astro Content Collections Guide 2026](https://inhaq.com/blog/getting-started-with-astro-content-collections/) - Navigation generation patterns

### Tertiary (LOW confidence - marked for validation)
- [SVG Interactive Roadmaps](https://flourish.studio/blog/interactive-svg-template/) - Alternative approach if Mermaid proves insufficient
- React burger menu libraries - mentioned but not recommended due to bundle size

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Nanostores officially recommended by Astro docs, Mermaid already in project
- Architecture: HIGH - All patterns verified with official Astro and Mermaid documentation
- Pitfalls: HIGH - Sourced from official limitations (Context in islands, Mermaid security, serialization)
- Roadmap interactivity: MEDIUM - Mermaid click events documented but may need fallback if insufficient on mobile

**Research date:** 2026-01-31
**Valid until:** 2026-03-02 (30 days - stable technologies, minimal API churn expected)
