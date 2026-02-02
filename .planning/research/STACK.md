# Technology Stack: Interactive Glass Diagrams

**Project:** Debezium CDC Course Website v1.4
**Focus:** Tooltips for diagram nodes + diagram component primitives
**Existing Stack:** Astro 5.17.1, React 19.2.4, Tailwind CSS 4.1.18, nanostores
**Researched:** 2026-02-02
**Overall Confidence:** HIGH

## Executive Summary

For interactive glass diagrams with tooltips, **Radix UI Tooltip** is the recommended choice. It integrates cleanly with React 19, provides accessibility out-of-the-box, and has zero styling opinions that conflict with the existing liquid glass design system. For diagram components, **continue with custom React/SVG primitives** - the existing `DeploymentModes.tsx` pattern is optimal for this use case.

**Animation recommendation:** Use CSS transitions (already available via Tailwind) for tooltip fade/slide. Avoid adding Motion/Framer Motion - the complexity is unnecessary for tooltip animations, and CSS handles it with zero bundle impact.

**Total new dependencies:** 1 (`@radix-ui/react-tooltip`)

---

## Recommended Stack Additions

### Tooltip Library: @radix-ui/react-tooltip

| Property | Value |
|----------|-------|
| Package | `@radix-ui/react-tooltip` |
| Version | `^1.2.8` |
| Bundle size | ~8-10 KB gzipped (estimated) |
| React 19 | Supported (fixed in recent releases) |

**Why Radix UI Tooltip:**

1. **Unstyled primitives** - Provides behavior and accessibility, not opinionated CSS. Works perfectly with the existing liquid glass utilities (`.glass-panel`, `backdrop-blur-*`).

2. **Composable API** - Uses React compound components pattern (`Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Content`) that matches Astro's island architecture.

3. **Built-in accessibility** - Automatic ARIA attributes, keyboard navigation (Escape to dismiss), focus management. Zero custom accessibility code needed.

4. **Positioning handled** - Auto-flips, shifts, and adjusts for viewport collisions. No need to manually implement positioning logic.

5. **React 19 compatible** - Radix Primitives updated all packages to support React 19 (see [Releases](https://www.radix-ui.com/primitives/docs/overview/releases)).

**Usage pattern for glass diagrams:**

```tsx
import * as Tooltip from '@radix-ui/react-tooltip';

function DiagramNode({ label, explanation }: Props) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className="px-4 py-2 rounded-xl border backdrop-blur-md
                           bg-emerald-500/15 border-emerald-400/30 text-emerald-200
                           hover:bg-emerald-500/25 transition-colors cursor-pointer">
            {label}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="glass-panel px-4 py-3 max-w-xs text-sm text-gray-200
                      animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out
                      data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            sideOffset={8}
          >
            {explanation}
            <Tooltip.Arrow className="fill-white/10" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
```

**Sources:**
- [Radix UI Tooltip Documentation](https://www.radix-ui.com/primitives/docs/components/tooltip)
- [Radix UI Releases - React 19 Support](https://www.radix-ui.com/primitives/docs/overview/releases)

---

### Diagram Primitives: Custom React Components (No Library)

**Recommendation:** Continue the pattern established in `DeploymentModes.tsx`. Do NOT add React Flow, JointJS, or other diagram libraries.

**Why custom primitives over diagram libraries:**

| Factor | Custom SVG/JSX | React Flow / Library |
|--------|---------------|---------------------|
| Bundle size | 0 KB added | 50-200+ KB |
| Styling control | Full glass compatibility | Override library styles |
| Complexity | Simple for static diagrams | Overkill - designed for interactive editors |
| Learning curve | Standard React | Library-specific API |
| Mermaid replacement | Direct 1:1 mapping | Unnecessary abstraction |

**The 170 Mermaid diagrams are static flowcharts** - they display data flow, not interactive graph editing. Libraries like React Flow are designed for:
- Node dragging and repositioning
- Edge creation/deletion
- Zoom/pan controls
- Graph persistence

None of these features are needed. The existing `FlowNode`, `Arrow`, and `ModeCard` primitives from `DeploymentModes.tsx` already solve the problem elegantly.

**Primitive components to standardize:**

```tsx
// Existing patterns from DeploymentModes.tsx - formalize as library

// 1. FlowNode - clickable diagram nodes with glass styling
<FlowNode variant="database" onClick={showTooltip}>PostgreSQL</FlowNode>

// 2. Arrow - directional connectors
<Arrow direction="right" />
<Arrow direction="down" />

// 3. Container - groups of related nodes
<DiagramContainer title="Kafka Connect Cluster">
  {children}
</DiagramContainer>

// 4. Row/Column - layout primitives
<DiagramRow gap="md">{nodes}</DiagramRow>
<DiagramColumn gap="sm">{nodes}</DiagramColumn>
```

**Source:** Analysis of existing `/Users/levoely/debezium course/src/components/diagrams/DeploymentModes.tsx`

---

### Animation: CSS Transitions (Already Available)

**Recommendation:** Use Tailwind CSS transitions and keyframes. Do NOT add Motion/Framer Motion.

**Why CSS over Motion:**

| Aspect | CSS (Tailwind) | Motion Library |
|--------|---------------|----------------|
| Bundle impact | 0 KB | 12-27 KB (optimized) |
| Tooltip animations | Perfect fit | Overkill |
| Learning curve | Already known | New API |
| Performance | GPU-accelerated | Also GPU-accelerated |
| Complexity | Simple | Adds abstraction |

**Tooltip animation needs:**
- Fade in/out
- Slight scale transform
- Maybe slide from trigger direction

All achievable with Tailwind:

```css
/* Already in Tailwind 4 */
.animate-in { animation: enter 150ms ease-out; }
.animate-out { animation: exit 150ms ease-in; }
.fade-in-0 { --tw-enter-opacity: 0; }
.zoom-in-95 { --tw-enter-scale: 0.95; }
```

**When Motion WOULD be appropriate:**
- Complex orchestrated sequences
- Physics-based spring animations
- Gesture-driven animations (drag, swipe)
- Exit animations requiring AnimatePresence

The tooltip use case doesn't require any of these. CSS handles it perfectly with zero bundle cost.

**Sources:**
- [CSS vs JavaScript Animations - MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance)
- [Motion Bundle Size Optimization](https://motion.dev/docs/react-reduce-bundle-size)

---

## Alternatives Considered

### Tooltip Libraries

| Library | Why Not Chosen |
|---------|---------------|
| **Floating UI** (@floating-ui/react) | Lower-level than Radix. Requires more code to achieve same result. Good for building tooltip components from scratch, but Radix already did this. |
| **react-tooltip** | Styled by default, harder to make match glass design. Uses data attributes pattern that doesn't fit React component model as well. |
| **Tippy.js** (@tippyjs/react) | Heavier, more features than needed. Better for complex interactive popovers. |
| **Material UI Tooltip** | Would pull in MUI dependencies, conflicting styling system. |

**Radix wins because:** Unstyled + accessible + composable. Perfect for design systems.

### Diagram Libraries

| Library | Why Not Chosen |
|---------|---------------|
| **React Flow** | Interactive graph editor, not static diagram renderer. Massive overkill for displaying flowcharts. |
| **Syncfusion Diagram** | Commercial license, heavy bundle, designed for complex diagramming apps. |
| **JointJS** | Similar - interactive editors, not static display. Commercial for advanced features. |
| **Mermaid (keep existing)** | Doesn't support glass styling, limited interactivity, can't add tooltips to nodes. |

**Custom components win because:** 170 static diagrams need styling consistency, not editor functionality.

### Animation Libraries

| Library | Why Not Chosen |
|---------|---------------|
| **Motion** (framer-motion) | 12-27 KB for features we don't need. Tooltip fade/scale doesn't require physics or orchestration. |
| **React Spring** | Similar - physics-based animations unnecessary for tooltips. |
| **anime.js** | Not React-specific, requires refs and imperative code. |
| **GSAP** | Powerful but heavy, commercial license for some features. |

**CSS transitions win because:** Tooltip animations are simple enough that CSS handles them optimally.

---

## What NOT to Add

### 1. React Flow or Diagram Libraries

**DON'T:** `npm install reactflow @xyflow/react`

**Why:**
- 170 Mermaid diagrams are static flowcharts showing data flow
- No dragging, no edge creation, no zoom/pan needed
- Would require fighting library conventions to apply glass styling
- 50-200 KB bundle impact for unused features

**Instead:** Formalize existing `FlowNode`/`Arrow`/`ModeCard` primitives from `DeploymentModes.tsx`.

---

### 2. Motion / Framer Motion

**DON'T:** `npm install motion` or `npm install framer-motion`

**Why:**
- Tooltip animations are simple fade + scale
- CSS transitions handle this in 0 KB
- Motion's value is in complex orchestration we don't need
- Adds learning curve for team

**Instead:** Use Tailwind's animation utilities:
```html
<div class="transition-opacity duration-150 ease-out">
```

**Exception:** Consider Motion if FUTURE features need:
- Exit animations with AnimatePresence (complex conditional rendering)
- Physics-based springs
- Gesture-driven interactions

Current scope doesn't require this.

---

### 3. CSS-in-JS Libraries

**DON'T:** `npm install styled-components @emotion/react`

**Why:**
- Tailwind 4 already handles all styling needs
- CSS-in-JS would conflict with Tailwind's utility-first approach
- Runtime CSS generation adds complexity
- Existing glass design system uses CSS utilities

**Instead:** Continue using Tailwind utilities + CSS custom properties for glass effects.

---

### 4. State Management for Tooltips

**DON'T:** Add Redux, Zustand, or Jotai just for tooltip state.

**Why:**
- Radix handles tooltip state internally
- Each tooltip is self-contained (open/close)
- No cross-tooltip coordination needed
- nanostores already available if global state needed

**Instead:** Let Radix manage individual tooltip state. If coordination needed (e.g., "only one tooltip open at a time"), Radix's `<Tooltip.Provider>` handles this.

---

## Integration with Existing Stack

### With Tailwind CSS 4

Radix Tooltip is unstyled. Apply glass styles directly:

```tsx
<Tooltip.Content className="
  bg-white/10
  backdrop-blur-md
  border border-white/20
  rounded-xl
  shadow-lg shadow-black/30
  p-4
  text-gray-200 text-sm
">
```

Matches existing `.glass-panel` pattern from `global.css`.

### With Astro Islands

Radix works in client-side React islands:

```astro
---
// diagram.astro
import DiagramWithTooltips from '../components/diagrams/CDCFlow';
---

<DiagramWithTooltips client:load />
```

The `<Tooltip.Portal>` renders tooltips to document body, which works correctly in Astro's hybrid rendering.

### With nanostores

If diagram state needs persistence (e.g., "remember which nodes user explored"):

```tsx
import { useStore } from '@nanostores/react';
import { $viewedNodes } from '../stores/progress';

function DiagramNode({ id, label }) {
  const viewedNodes = useStore($viewedNodes);
  const isViewed = viewedNodes.includes(id);

  return (
    <Tooltip.Root onOpenChange={(open) => {
      if (open) markNodeViewed(id);
    }}>
      {/* ... */}
    </Tooltip.Root>
  );
}
```

This is optional - most diagrams won't need this.

---

## Installation

```bash
# Install tooltip library
npm install @radix-ui/react-tooltip

# That's it. No other dependencies needed.
```

**Updated package.json dependencies:**
```json
{
  "dependencies": {
    "@astrojs/mdx": "^4.3.13",
    "@astrojs/react": "^4.4.2",
    "@nanostores/persistent": "^1.3.0",
    "@nanostores/react": "^1.0.0",
    "@radix-ui/react-tooltip": "^1.2.8",  // NEW
    "@tailwindcss/vite": "^4.1.18",
    "@types/react": "^19.2.10",
    "@types/react-dom": "^19.2.3",
    "astro": "^5.17.1",
    "mermaid": "^11.12.2",
    "nanostores": "^1.1.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "tailwindcss": "^4.1.18"
  }
}
```

**Note:** `mermaid` can be removed after all 170 diagrams are converted, reducing bundle significantly.

---

## File Structure for Diagram Components

Recommended organization:

```
src/components/diagrams/
  primitives/
    FlowNode.tsx       # Clickable node with glass styling
    Arrow.tsx          # SVG arrow connectors
    DiagramContainer.tsx  # Wrapper with title/layout
    Tooltip.tsx        # Wrapper around Radix with glass styling
    index.ts           # Re-exports

  module-1/
    CDCFlowDiagram.tsx
    DebeziumArchitecture.tsx
    ...

  module-2/
    WALFlowDiagram.tsx
    ...

  DeploymentModes.tsx  # Existing - migrate to new structure
```

---

## Testing Checklist

Before deploying tooltip/diagram features:

- [ ] **Accessibility:** Tooltips dismiss on Escape key
- [ ] **Accessibility:** Tooltips accessible via keyboard focus (Tab to trigger)
- [ ] **Mobile:** Touch triggers work (click, not just hover)
- [ ] **Mobile:** Tooltips position correctly on small screens
- [ ] **Performance:** No visible jank on tooltip open/close
- [ ] **Styling:** Glass styling consistent with existing design system
- [ ] **React 19:** No console warnings about deprecated patterns

---

## Summary

| Category | Technology | Rationale |
|----------|------------|-----------|
| **Tooltips** | @radix-ui/react-tooltip ^1.2.8 | Unstyled, accessible, React 19 compatible |
| **Diagrams** | Custom React/SVG primitives | Static diagrams don't need editor libraries |
| **Animation** | CSS transitions (Tailwind) | Simple enough, zero bundle cost |
| **State** | Radix internal + nanostores if needed | No new state library required |

**New dependencies:** 1
**Bundle impact:** ~8-10 KB gzipped
**Confidence:** HIGH

---

## Sources

- [Radix UI Tooltip Documentation](https://www.radix-ui.com/primitives/docs/components/tooltip)
- [Radix UI Releases](https://www.radix-ui.com/primitives/docs/overview/releases)
- [Floating UI React Documentation](https://floating-ui.com/docs/react)
- [React Flow](https://reactflow.dev)
- [Motion Bundle Size Guide](https://motion.dev/docs/react-reduce-bundle-size)
- [CSS vs JavaScript Animation Performance - MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance)
- [Builder.io - React UI Libraries 2026](https://www.builder.io/blog/react-component-libraries-2026)
