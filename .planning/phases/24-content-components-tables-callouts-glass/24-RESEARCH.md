# Phase 24: Content Components (Tables + Callouts with Glass) - Research

**Researched:** 2026-02-01
**Domain:** Content styling - MDX tables, callouts, code blocks with glassmorphism
**Confidence:** HIGH

## Summary

Phase 24 applies glass effects to content components (tables and callouts) while maintaining data readability and WCAG compliance. The research reveals that content components require **lighter glass effects** than navigation/card components due to information density.

**Key findings:**
- Tables need visible cell borders (1px solid) for data tracking, contrary to borderless glass aesthetic
- Glass blur must be reduced (8-10px max) to avoid overwhelming tabular data
- Code blocks should use solid backgrounds to preserve syntax highlighting readability
- Callout components benefit from type-specific colored glass tints with left border accents
- Existing Callout.tsx component uses solid backgrounds, not glass effects

**Primary recommendation:** Use light glass (8-10px blur, 0.05-0.1 opacity) for tables with clear cell separation. Keep code blocks with solid backgrounds. Enhance callouts with subtle glass tints while maintaining type-specific colored accents.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v4 (via @tailwindcss/vite) | Utility-first CSS | Already in project, handles prose styling |
| Astro MDX | ^4.3.13 | MDX processing | Core content rendering, renders markdown tables |
| Shiki | Built-in (Astro) | Syntax highlighting | Default Astro highlighter, server-side rendered |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tailwindcss/typography | Not installed | Prose plugin | Would provide default table styling (optional) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Shiki (current) | Prism | Shiki is server-side (no JS), Prism requires client-side CSS |
| Direct CSS | @tailwindcss/typography | Typography plugin provides defaults but adds dependency |

**Installation:**
```bash
# No new dependencies needed - using existing stack
# Optional: npm install @tailwindcss/typography
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── styles/
│   └── global.css          # Glass utilities + table/callout styles
├── components/
│   └── Callout.tsx         # Existing callout component to enhance
└── content/
    └── course/             # MDX files with tables/callouts
```

### Pattern 1: Light Glass for Tables

**What:** Tables use reduced glass effect (8-10px blur) with clear cell borders for data readability

**When to use:** All MDX-rendered tables in course content

**Example:**
```css
/* Source: Derived from Phase 22 glass utilities + Nielsen Norman Group best practices */
.prose table {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border-collapse: separate;
  border-spacing: 0;
}

.prose th {
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
}

.prose td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px 16px;
}

.prose td:last-child {
  border-right: none;
}

.prose tr:last-child td {
  border-bottom: none;
}
```

### Pattern 2: Type-Specific Glass Callouts

**What:** Callouts with colored glass tints + left border accent

**When to use:** Info, warning, tip, danger callouts in MDX content

**Example:**
```css
/* Source: Adapted from existing Callout.tsx + Phase 22 glass patterns */
.callout-glass {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  border-left-width: 4px;
  padding: 16px;
}

.callout-note {
  background: rgba(59, 130, 246, 0.1); /* Blue tint */
  border-left-color: rgb(59, 130, 246);
}

.callout-tip {
  background: rgba(34, 197, 94, 0.1); /* Green tint */
  border-left-color: rgb(34, 197, 94);
}

.callout-warning {
  background: rgba(251, 146, 60, 0.1); /* Orange tint */
  border-left-color: rgb(251, 146, 60);
}

.callout-danger {
  background: rgba(239, 68, 68, 0.1); /* Red tint */
  border-left-color: rgb(239, 68, 68);
}
```

### Pattern 3: Solid Background Code Blocks

**What:** Keep code blocks with solid backgrounds (no glass) to preserve syntax highlighting

**When to use:** All code blocks in MDX content

**Example:**
```css
/* Source: Shiki default + accessibility best practices */
.prose pre {
  background: rgba(30, 30, 40, 0.95); /* Near-solid background */
  backdrop-filter: none; /* NO glass effect */
  border-radius: 12px;
  padding: 16px;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.prose code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

/* Inline code keeps light glass for consistency */
.prose :not(pre) > code {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: none;
}
```

### Anti-Patterns to Avoid

- **Glass on code blocks:** Blur makes syntax highlighting illegible, defeats purpose of color-coded tokens
- **No cell borders in tables:** Data becomes difficult to track across rows without clear separation
- **Uniform callout styling:** Loses semantic meaning - type-specific colors are accessibility feature
- **Heavy blur on tables (>10px):** Overwhelming for dense data, causes cell content to visually bleed together

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MDX table rendering | Custom table component | Native MDX markdown tables + CSS | Markdown tables are standard, maintainable, no JS needed |
| Syntax highlighting | Custom token parser | Shiki (already configured) | Server-side rendering, no client JS, 100+ languages supported |
| Callout component | Starting from scratch | Enhance existing Callout.tsx | Component exists at src/components/Callout.tsx, just needs glass styling |
| Contrast checking | Manual visual testing | WebAIM Contrast Checker | Automated WCAG validation, 4.5:1 requirement enforced |

**Key insight:** Content styling is CSS-only work. Existing MDX rendering pipeline handles tables/callouts. No new components needed, only CSS enhancements to global.css and potential updates to Callout.tsx styling.

## Common Pitfalls

### Pitfall 1: Excessive Blur on Data Tables

**What goes wrong:** Using 16px blur (standard for cards) on tables makes data hard to read, cell contents visually bleed together

**Why it happens:** Applying same glass intensity across all components without considering content density

**How to avoid:**
- Use lighter blur (8-10px) for tables
- Test with actual table content (3+ columns, 5+ rows)
- Verify cell borders are visible at 1px solid

**Warning signs:** Users squinting to read table data, difficulty tracking rows across columns

### Pitfall 2: Glass Effect on Code Blocks

**What goes wrong:** Applying backdrop-filter to code blocks makes syntax highlighting colors wash out, reduces contrast between tokens

**Why it happens:** Treating code blocks as "just another content container" without considering syntax highlighting needs

**How to avoid:**
- Keep code blocks with near-solid backgrounds (0.95 opacity minimum)
- NO backdrop-filter on `<pre>` elements
- Shiki themes rely on precise color contrast

**Warning signs:** Code difficult to parse visually, syntax colors look muted or indistinguishable

### Pitfall 3: Missing Cell Borders

**What goes wrong:** Borderless glass tables look modern but data is untrackable - users can't follow rows across columns

**Why it happens:** Prioritizing aesthetic over function, assuming minimal borders are "cleaner"

**How to avoid:**
- Always use 1px solid borders between cells
- Use rgba(255, 255, 255, 0.08) for subtle but visible separation
- Test with wide tables (4+ columns) to verify trackability

**Warning signs:** Users reporting difficulty reading comparison tables, asking "which row is this?"

### Pitfall 4: Uniform Callout Styling

**What goes wrong:** All callout types look identical except for icons, losing semantic color-coding

**Why it happens:** Applying single glass style without type-specific tints

**How to avoid:**
- Use type-specific background tints (blue for info, orange for warning, etc.)
- Colored left border accent reinforces type
- Icon + color + border provide triple redundancy for accessibility

**Warning signs:** Users missing warning callouts, treating all callouts as equal priority

### Pitfall 5: Contrast Failure on Table Text

**What goes wrong:** White text on light glass background over vibrant gradient fails WCAG 4.5:1 contrast

**Why it happens:** Not testing contrast with actual gradient background, only flat colors

**How to avoid:**
- Test contrast with WebAIM Contrast Checker on actual rendered tables
- Increase glass background opacity (0.1 → 0.15) if contrast fails
- Use slightly darker glass for tables: rgba(0, 0, 0, 0.15) instead of rgba(255, 255, 255, 0.05)

**Warning signs:** WebAIM reports contrast ratio < 4.5:1, text appears faint on gradient

## Code Examples

Verified patterns from official sources:

### MDX Tables - Global CSS Styling

```css
/* Source: Tailwind prose defaults + Phase 22 glass system */
.prose table {
  /* Light glass background */
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  /* Table container styling */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  width: 100%;
  margin-bottom: 1.5rem;
}

.prose thead {
  background: rgba(255, 255, 255, 0.1); /* Elevated opacity for headers */
}

.prose th {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.prose td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.9);
}

.prose td:last-child {
  border-right: none;
}

.prose tr:last-child td {
  border-bottom: none;
}

/* Hover state for data rows */
.prose tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}
```

### Callout Component Enhancement

```tsx
// Source: Existing src/components/Callout.tsx + glass enhancements
import React from 'react';

interface CalloutProps {
  type?: 'note' | 'tip' | 'warning' | 'danger';
  children: React.ReactNode;
}

const Callout: React.FC<CalloutProps> = ({ type = 'note', children }) => {
  const styles = {
    note: {
      bg: 'bg-blue-500/10 backdrop-blur-sm', // Glass tint
      border: 'border-l-4 border-blue-500',
      icon: 'ℹ️',
      title: 'Note',
    },
    tip: {
      bg: 'bg-green-500/10 backdrop-blur-sm',
      border: 'border-l-4 border-green-500',
      icon: '💡',
      title: 'Tip',
    },
    warning: {
      bg: 'bg-yellow-500/10 backdrop-blur-sm',
      border: 'border-l-4 border-yellow-500',
      icon: '⚠️',
      title: 'Warning',
    },
    danger: {
      bg: 'bg-red-500/10 backdrop-blur-sm',
      border: 'border-l-4 border-red-500',
      icon: '🚨',
      title: 'Danger',
    },
  };

  const style = styles[type];

  return (
    <div className={`my-6 p-4 rounded-xl ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold mb-2 text-gray-100">
            {style.title}
          </div>
          <div className="prose prose-sm prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callout;
```

### Code Block Solid Background (CSS)

```css
/* Source: Shiki default styling + contrast preservation */
.prose pre {
  /* Near-solid background - NO glass effect */
  background: rgba(30, 30, 40, 0.95);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;

  /* Styling */
  border-radius: 12px;
  padding: 16px;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
}

.prose pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 0.9em;
  line-height: 1.7;
}

/* Inline code - light glass OK */
.prose :not(pre) > code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.95);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Borderless minimal tables | Clear 1px borders for data tracking | 2024-2025 | Accessibility-first trend, WCAG emphasis on readability over pure aesthetics |
| Glass effects on all content | Selective glass (no code blocks) | 2025-2026 | Performance + readability - code needs solid backgrounds for syntax highlighting |
| Uniform callouts | Type-specific colored tints | Always standard | Semantic meaning through color-coding required for accessibility |
| Heavy blur (16px+) on all | Light blur (8-10px) for content | 2025-2026 | Content readability prioritized over visual flair |

**Deprecated/outdated:**
- Borderless tables: Accessibility studies show cell borders critical for data tracking
- Glass on code blocks: Syntax highlighting requires high-contrast solid backgrounds
- @tailwindcss/typography v3: v4 uses CSS-only approach (tw-prose), but plugin still works

## Open Questions

Things that couldn't be fully resolved:

1. **@tailwindcss/typography Plugin**
   - What we know: Project doesn't currently use it (not in package.json)
   - What's unclear: Would it help or conflict with custom prose styles?
   - Recommendation: NOT needed - custom CSS in global.css is sufficient and more flexible

2. **Existing Table Usage Patterns**
   - What we know: MDX files contain markdown tables (found in module-8 architecture lesson)
   - What's unclear: Full inventory of table types across all lessons (comparison tables, data tables, configuration tables)
   - Recommendation: Start with universal table styles, refine based on actual content audit

3. **Mobile Table Responsiveness**
   - What we know: Glass blur should reduce to 8px on mobile (from Phase 22)
   - What's unclear: Whether wide tables need horizontal scroll or responsive stacking
   - Recommendation: Use overflow-x: auto on .prose table for horizontal scroll, test on actual mobile devices

4. **Callout Component Rendering**
   - What we know: Callout.tsx exists, uses Tailwind classes, needs glass enhancement
   - What's unclear: How it's imported in MDX (import statement in each file vs. global MDXProvider)
   - Recommendation: Check MDX files for import pattern, enhance component with backdrop-blur-sm Tailwind class

## Sources

### Primary (HIGH confidence)

- [Glassmorphism: Definition and Best Practices - Nielsen Norman Group](https://www.nngroup.com/articles/glassmorphism/) - Authoritative UI patterns
- [Glassmorphism Meets Accessibility - Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/) - WCAG compliance for glass effects
- [Syntax Highlighting - Astro Docs](https://docs.astro.build/en/guides/syntax-highlighting/) - Official Shiki configuration
- [Tailwind CSS Typography Plugin - LogRocket](https://blog.logrocket.com/how-to-use-the-tailwind-typography-plugin/) - Prose customization patterns
- Phase 22 glass foundation (src/styles/global.css) - Existing glass utilities
- Phase 22 FEATURES_liquid-glass.md research - Component-specific glass guidelines

### Secondary (MEDIUM confidence)

- [Glassmorphism with Website Accessibility - New Target](https://www.newtarget.com/web-insights-blog/glassmorphism/) - Readability balance
- [12 Glassmorphism UI Features - UX Pilot](https://uxpilot.ai/blogs/glassmorphism-ui) - Best practices
- [MDX Syntax Highlighting Guide](https://mdxjs.com/guides/syntax-highlighting/) - MDX code block rendering
- [Tailwind CSS Typography Plugin - GitHub](https://github.com/tailwindlabs/tailwindcss-typography) - Default prose styles

### Tertiary (LOW confidence)

- [10 Glassmorphism Examples For 2026 - Onyx8 Agency](https://onyx8agency.com/blog/glassmorphism-inspiring-examples/) - Visual inspiration
- [Glassmorphism What It Is 2026 - Inverness Design Studio](https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026) - Trend overview

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Astro MDX and Shiki are verified in astro.config.mjs, Phase 22 established glass utilities
- Architecture: HIGH - Prose class usage verified in [...slug].astro, existing Callout.tsx found, patterns align with Tailwind ecosystem
- Pitfalls: HIGH - Nielsen Norman Group + Axess Lab provide authoritative accessibility warnings, Phase 22 research documented common mistakes
- Code examples: MEDIUM - Derived from official Tailwind docs + Phase 22 patterns, not tested in production yet

**Research date:** 2026-02-01
**Valid until:** 30 days (stable domain - CSS patterns, WCAG standards don't change rapidly)
