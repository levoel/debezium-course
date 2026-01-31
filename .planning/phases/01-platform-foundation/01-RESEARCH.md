# Phase 1: Platform Foundation - Research

**Researched:** 2026-01-31
**Domain:** Static site generation with Astro 5, syntax highlighting, diagrams, responsive design
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational static course website infrastructure. The research confirms that **Astro 5 with islands architecture** is the optimal framework for a content-heavy course website, delivering 5x faster Markdown builds than alternatives, zero JavaScript by default, and excellent MDX support. The phase focuses on four critical capabilities: (1) deploying to GitHub Pages or Vercel, (2) rendering code blocks with Shiki syntax highlighting, (3) rendering Mermaid diagrams, and (4) mobile-responsive layout with Tailwind CSS.

Based on existing comprehensive project-level research (STACK.md, ARCHITECTURE.md), this phase requires no additional technology exploration. All critical decisions are validated: Astro 5 (released Dec 2024), React 19 for interactive islands (stable Dec 2024), TypeScript 5.9, Tailwind CSS 4.x, Shiki for syntax highlighting (built into Astro), and Mermaid.js for diagrams. The standard Astro project structure with `src/content/`, `src/components/`, `src/layouts/`, and `src/pages/` provides clear organization. GitHub Pages deployment uses the official `withastro/action` GitHub Action for one-command deployment.

The main technical challenge is configuring Shiki for all required languages (Python, YAML, SQL, JSON) and integrating Mermaid diagrams in MDX content. Both have established patterns: Shiki configuration in `astro.config.mjs` under `markdown.shikiConfig`, and Mermaid integration via a React component wrapper with client-side hydration. Mobile responsiveness leverages Tailwind's mobile-first utilities with breakpoints at 640px (sm), 768px (md), 1024px (lg), 1280px (xl).

**Primary recommendation:** Use Astro 5's create command (`npm create astro@latest`), add React and Tailwind integrations via official `astro add` commands, configure Shiki in `astro.config.mjs`, create a Mermaid wrapper component with `client:visible` hydration directive, and deploy via GitHub Actions with `withastro/action@v3`.

## Standard Stack

The established libraries/tools for static course websites with interactive components.

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Astro** | 5.0+ | Static site generator | Ships zero JS by default (vs 87KB for Next.js/Docusaurus), 5x faster Markdown builds, 2x faster MDX builds, islands architecture for selective interactivity. Content Layer API provides type-safe content management. Used in production at Cloudflare, Google, Microsoft, OpenAI. |
| **TypeScript** | 5.9+ | Type safety | Essential for large content sites. Astro 5 includes built-in TypeScript support and type-safe environment variables (`astro:env`). Avoid 6.0 beta (final JS-based version, unstable). |
| **Vite** | 6.0+ | Build tool | Bundled with Astro 5. Fast HMR for development iteration. Environment API improves dev experience. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **React** | 19+ | Interactive components | Astro supports React islands for interactive elements (future phases: quizzes, code editors, progress trackers). Use sparingly via islands architecture. Stable since Dec 2024. |
| **Tailwind CSS** | 4.x | Utility-first CSS | Rapid UI development, mobile-first responsive design. Excellent documentation, widely used in 2026. Smaller bundle than Bootstrap. |
| **Shiki** | Built-in | Syntax highlighting | Built into Astro. TextMate-based (VS Code engine), renders at build time (ships zero JS to client). Supports all major languages including SQL, Java, YAML, JSON. |
| **Mermaid.js** | Latest | Diagrams as code | Markdown-based diagrams (flowcharts, sequence diagrams, entity relationships). Essential for visualizing CDC pipelines, data flows, Debezium architecture. Industry standard for documentation diagrams. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Astro | Docusaurus 3 | Docusaurus excellent for API documentation but ships 87KB JS baseline (vs 0KB for Astro), less flexible for custom learning experiences. Better for docs, worse for courses. |
| Astro | Next.js 15 | Next.js provides full-stack capabilities (SSR, API routes) but overkill for static course, 87KB+ JavaScript baseline, slower for pure static. Use if backend needed. |
| Shiki | Prism.js | Prism requires client-side JavaScript; Shiki renders at build time. Prism is lighter if runtime syntax highlighting needed. |
| Tailwind CSS | CSS Modules | CSS Modules better for component isolation; Tailwind faster for rapid prototyping and consistent design system. |

**Installation:**

```bash
# Create Astro project (includes TypeScript, Vite)
npm create astro@latest

# Add React integration
npx astro add react
# Installs: @astrojs/react, react@^19.0.0, react-dom@^19.0.0

# Add Tailwind CSS integration
npx astro add tailwind
# Installs: @astrojs/tailwind, tailwindcss

# Add MDX integration (for embedding components in content)
npx astro add mdx
# Installs: @astrojs/mdx

# Add Mermaid for diagrams
npm install mermaid
```

**Source confidence:** HIGH - All versions verified from official Astro 5 release blog (Dec 2024), React 19 release, official documentation. Shiki built into Astro (no separate installation).

## Architecture Patterns

### Recommended Project Structure

```
/
├── src/
│   ├── content/
│   │   ├── config.ts              # Content collections schema
│   │   └── course/                # Course content (MDX files)
│   │       ├── 01-intro/
│   │       │   └── index.mdx
│   │       └── 02-basics/
│   │           └── index.mdx
│   ├── components/
│   │   ├── Mermaid.tsx            # React island for diagrams
│   │   ├── CourseLayout.astro     # Course page layout
│   │   └── Navigation.astro       # Static navigation
│   ├── layouts/
│   │   └── BaseLayout.astro       # Global layout wrapper
│   ├── pages/
│   │   ├── index.astro            # Landing page
│   │   └── course/
│   │       └── [...slug].astro    # Dynamic course pages
│   └── styles/
│       └── global.css
├── public/
│   └── assets/
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions deployment
├── astro.config.mjs
├── tsconfig.json
└── tailwind.config.mjs
```

**Rationale:** Astro's conventional structure with content collections (`src/content/`) for type-safe course content, components separated by type (Astro static vs React interactive), and file-based routing in `src/pages/`. This structure supports future phases (navigation sidebar, progress tracking) without refactoring.

### Pattern 1: Astro Content Collections for Type-Safe Content

**What:** Define schema for course content to ensure frontmatter consistency and enable type-safe queries.

**When to use:** All course content files. Enables validation (ensure every lesson has title, description, order) and autocomplete in TypeScript.

**Example:**

```typescript
// src/content/config.ts
// Source: https://docs.astro.build/en/guides/content-collections/
import { defineCollection, z } from 'astro:content';

const courseCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedTime: z.number(), // minutes
    topics: z.array(z.string()),
    prerequisites: z.array(z.string()).optional(),
  }),
});

export const collections = {
  course: courseCollection,
};
```

**Benefits:** Type safety prevents runtime errors (missing frontmatter), validates schema at build time, provides IntelliSense for content queries.

### Pattern 2: Shiki Syntax Highlighting Configuration

**What:** Configure Shiki in Astro config to highlight Python, YAML, SQL, JSON code blocks.

**When to use:** Always configure during initial setup. Shiki renders at build time, no runtime cost.

**Example:**

```javascript
// astro.config.mjs
// Source: https://docs.astro.build/en/guides/markdown-content/#syntax-highlighting
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://yourusername.github.io',
  base: '/debezium-course', // If using repo-based GitHub Pages
  integrations: [
    react(),
    tailwind(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark', // VS Code theme
      langs: ['python', 'yaml', 'sql', 'json', 'javascript', 'typescript', 'java'],
      wrap: true, // Wrap long lines instead of horizontal scroll
    },
  },
});
```

**Benefits:** All languages configured upfront, consistent theme across course, wrapping prevents horizontal scroll on mobile.

### Pattern 3: Mermaid Diagram Integration with Islands

**What:** Create a React component to render Mermaid diagrams, hydrate only when visible (performance optimization).

**When to use:** Every architecture diagram, data flow visualization, CDC pipeline illustration.

**Example:**

```tsx
// src/components/Mermaid.tsx
// Source: https://mermaid.js.org/intro/n00b-gettingStarted.html
import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'dark',
        themeVariables: {
          fontSize: '16px', // Mobile-friendly size
        }
      });
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div ref={ref} className="mermaid my-6 overflow-x-auto">
      {chart}
    </div>
  );
}
```

**Usage in MDX:**

```mdx
// src/content/course/01-intro/index.mdx
---
title: "Introduction to CDC"
order: 1
difficulty: beginner
estimatedTime: 30
topics: ["CDC fundamentals", "Debezium architecture"]
---

import { Mermaid } from '@/components/Mermaid';

# Change Data Capture Overview

CDC captures database changes in real-time:

<Mermaid client:visible chart={`
graph LR
    A[Database] -->|Changes| B[Debezium]
    B -->|Events| C[Kafka]
    C -->|Stream| D[Consumers]
`} />
```

**Hydration directive:** `client:visible` loads JavaScript only when diagram scrolls into view (performance optimization). Alternative: `client:load` for above-fold diagrams.

### Pattern 4: Mobile-First Responsive Layout with Tailwind

**What:** Design layout starting with mobile (single column), progressively enhance for tablet/desktop.

**When to use:** All layouts. Mobile traffic significant for educational content.

**Example:**

```astro
---
// src/layouts/BaseLayout.astro
// Source: https://tailwindcss.com/docs/responsive-design
import '../styles/global.css';

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} - Debezium Course</title>
</head>
<body class="bg-gray-900 text-gray-100">
  <div class="min-h-screen flex flex-col">
    <!-- Header: always full-width -->
    <header class="bg-gray-800 border-b border-gray-700 px-4 py-4">
      <h1 class="text-xl md:text-2xl font-bold">Debezium Course</h1>
    </header>

    <!-- Main content: single column mobile, with sidebar on desktop -->
    <main class="flex-1 flex flex-col lg:flex-row">
      <!-- Future: Navigation sidebar (hidden on mobile, visible on lg+) -->
      <aside class="hidden lg:block lg:w-64 bg-gray-800 border-r border-gray-700">
        <!-- Placeholder for Phase 2 navigation -->
      </aside>

      <!-- Content area: full width mobile, constrained on desktop -->
      <div class="flex-1 px-4 py-6 md:px-8 max-w-4xl mx-auto w-full">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 border-t border-gray-700 px-4 py-4 text-center text-sm text-gray-400">
      © 2026 Debezium Course
    </footer>
  </div>
</body>
</html>
```

**Breakpoints:**
- Default (mobile): Single column, full-width content
- `md` (768px+): Larger padding, slightly bigger text
- `lg` (1024px+): Sidebar appears, content constrained to max-width

**Tailwind utilities:**
- `flex-col lg:flex-row`: Stack vertically on mobile, horizontally on desktop
- `hidden lg:block`: Hide element on mobile, show on desktop
- `px-4 md:px-8`: Progressive spacing increase
- `max-w-4xl mx-auto`: Constrain content width, center horizontally

### Pattern 5: GitHub Pages Deployment with GitHub Actions

**What:** Automated deployment to GitHub Pages using official Astro action.

**When to use:** Every push to main branch triggers deployment.

**Example:**

```yaml
# .github/workflows/deploy.yml
# Source: https://docs.astro.build/en/guides/deploy/github/
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build Astro site
        run: npm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Setup steps:**
1. Enable GitHub Pages in repository settings (Settings → Pages → Source: GitHub Actions)
2. Add workflow file to `.github/workflows/deploy.yml`
3. Push to main branch → automatic deployment

**Alternative: Vercel deployment (zero-config)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (first time: configure project)
vercel

# Production deployment
vercel --prod
```

Vercel auto-detects Astro projects, zero configuration needed. Provides preview deployments for PRs automatically.

### Anti-Patterns to Avoid

- **Client-side routing without static generation:** Don't use React Router alone; Astro pre-renders all routes at build time (SEO + performance).
- **Hydrating everything:** Don't use `client:load` on all components; most content should be static HTML. Use `client:visible` or `client:idle` for islands.
- **Ignoring mobile-first:** Don't design for desktop first; start with mobile, add complexity for larger screens.
- **Hardcoding base URL:** Don't hardcode GitHub Pages base path in links; use `Astro.site` and `base` config for portability.

## Don't Hand-Roll

Problems that look simple but have existing solutions.

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Syntax highlighting | Custom Prism/Highlight.js setup | Astro's built-in Shiki | Shiki integrated, works at build time (zero runtime JS), supports all languages, VS Code themes. Custom setup adds complexity. |
| Responsive breakpoints | Custom CSS media queries | Tailwind's responsive utilities | Tailwind's breakpoints are consistent, well-documented, mobile-first by design. Custom breakpoints lead to inconsistent spacing. |
| Diagram rendering | Canvas drawing, SVG manipulation | Mermaid.js with React wrapper | Mermaid handles complex layout algorithms (graph positioning, line routing). Custom implementation underestimates complexity (arrow positioning, label wrapping). |
| Static site deployment | Custom build scripts, manual FTP | GitHub Actions with official Astro action | Official action maintained by Astro team, handles caching, artifact upload, Pages configuration. Custom scripts break on GitHub API changes. |
| Content validation | Manual checks, linting scripts | Astro Content Collections with Zod schema | Content Collections validate at build time, provide TypeScript types, catch errors before deployment. Manual checks miss errors. |

**Key insight:** Astro ecosystem provides battle-tested solutions for all Phase 1 requirements. Custom implementations add maintenance burden and edge case bugs (Mermaid handles diagram complexity, Shiki handles language grammar edge cases, Tailwind handles browser quirks).

## Common Pitfalls

### Pitfall 1: Incorrect GitHub Pages Base Path

**What goes wrong:** Site deploys but all links broken (404s for CSS, JS, pages). Navigation works locally but fails in production.

**Why it happens:** GitHub Pages serves repo at `https://username.github.io/repo-name/` (with base path `/repo-name/`), but Astro defaults to root path `/`. Without configuring `base`, all generated links point to root.

**How to avoid:**

```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://yourusername.github.io',
  base: '/debezium-course', // Match repository name exactly
  // ...
});
```

Use `Astro.site` in components for absolute URLs, relative paths for internal navigation.

**Warning signs:** Site works on `localhost:4321` but broken on GitHub Pages, browser console shows 404s for assets.

**Source:** https://docs.astro.build/en/guides/deploy/github/ (official Astro deployment guide)

### Pitfall 2: Mermaid Hydration Timing Issues

**What goes wrong:** Mermaid diagrams don't render or render incorrectly (show raw syntax instead of diagram).

**Why it happens:** Mermaid initialization runs before DOM ready, or hydration directive wrong (`client:only` runs before SSR content available), or multiple calls to `mermaid.initialize()` conflict.

**How to avoid:**

1. Use `client:visible` (waits for element in viewport) or `client:idle` (waits for page interactive)
2. Call `mermaid.initialize()` once in `useEffect` with empty dependency array
3. Ensure Mermaid component receives `chart` as prop (not children) for proper updates

```tsx
// Correct pattern
export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({ startOnLoad: true, theme: 'dark' });
      mermaid.contentLoaded(); // Trigger render
    }
  }, [chart]); // Re-render if chart prop changes

  return <div ref={ref} className="mermaid">{chart}</div>;
}
```

**Warning signs:** Diagram shows ` ```mermaid ... ``` ` instead of rendered SVG, console errors about Mermaid not initialized.

**Source:** https://mermaid.js.org/intro/n00b-gettingStarted.html (official Mermaid docs), https://docs.astro.build/en/guides/framework-components/#hydrating-interactive-components (Astro hydration)

### Pitfall 3: Shiki Language Not Recognized

**What goes wrong:** Code block renders without syntax highlighting, shows plain text with generic monospace font.

**Why it happens:** Language identifier in markdown doesn't match Shiki's expected name (e.g., `postgres` vs `sql`, `yml` vs `yaml`), or language not included in `langs` array.

**How to avoid:**

1. Use exact Shiki language identifiers: `python`, `yaml` (not `yml`), `sql`, `json`, `javascript`, `typescript`, `java`
2. List all required languages in `astro.config.mjs` under `markdown.shikiConfig.langs`
3. Test with example code blocks for each language during setup

```javascript
// astro.config.mjs
markdown: {
  shikiConfig: {
    langs: [
      'python',      // Not 'py'
      'yaml',        // Not 'yml'
      'sql',         // Not 'postgres' or 'postgresql'
      'json',
      'javascript',
      'typescript',
      'java',
    ],
  },
}
```

In MDX, use triple backticks with language:

````markdown
```sql
SELECT * FROM users WHERE id = 1;
```
````

**Warning signs:** Code block lacks color highlighting, no line numbers, looks like plain text.

**Source:** https://shiki.style/languages (list of supported languages and identifiers)

### Pitfall 4: Mobile Viewport Not Configured

**What goes wrong:** Site looks zoomed out on mobile (tiny text), horizontal scrolling required, layout doesn't adapt to screen size.

**Why it happens:** Missing `viewport` meta tag causes mobile browsers to render at desktop width (980px default) and scale down.

**How to avoid:**

Always include in layout `<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

This tells mobile browsers to use device width (not desktop emulation) and disables pinch-to-zoom by default.

**Additional mobile considerations:**

- Use Tailwind's responsive utilities (`sm:`, `md:`, `lg:`, `xl:`) for breakpoints
- Test on actual devices or Chrome DevTools device mode
- Ensure tap targets are minimum 44x44px (accessibility guideline)
- Prevent horizontal scroll: `overflow-x-hidden` on body or container

**Warning signs:** Text too small to read on mobile, layout requires pinching to zoom, scrolling horizontally.

**Source:** https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag (MDN viewport documentation)

### Pitfall 5: Code Block Horizontal Overflow on Mobile

**What goes wrong:** Long code lines extend beyond screen width, require horizontal scrolling to read, disrupt reading flow.

**Why it happens:** Code blocks don't wrap by default (preserve formatting), mobile screens narrow (320-414px), long SQL queries or configuration exceed width.

**How to avoid:**

**Option 1: Enable wrapping in Shiki config (recommended for course content)**

```javascript
// astro.config.mjs
markdown: {
  shikiConfig: {
    wrap: true, // Wrap long lines
  },
}
```

**Option 2: Add horizontal scroll with max-width**

```css
/* global.css */
pre {
  overflow-x: auto;
  max-width: 100%;
}
```

**Option 3: Reduce font size on mobile**

```css
pre {
  font-size: 0.875rem; /* 14px on mobile */
}

@media (min-width: 768px) {
  pre {
    font-size: 1rem; /* 16px on desktop */
  }
}
```

**Warning signs:** Code blocks extend past screen edge, users complain about horizontal scrolling, mobile testing shows layout issues.

**Source:** https://docs.astro.build/en/guides/markdown-content/#markdown-config-options (Astro markdown config)

## Code Examples

Verified patterns from official sources.

### Basic MDX Course Page with All Features

```mdx
---
title: "PostgreSQL CDC with Debezium"
description: "Learn how to capture changes from PostgreSQL databases using Debezium connectors"
order: 2
difficulty: intermediate
estimatedTime: 45
topics: ["PostgreSQL", "CDC", "Debezium connectors"]
prerequisites: ["Basic SQL knowledge", "Docker basics"]
---

import { Mermaid } from '@/components/Mermaid';

# PostgreSQL CDC with Debezium

In this lesson, you'll learn how Debezium captures changes from PostgreSQL using logical decoding and replication slots.

## Architecture Overview

<Mermaid client:visible chart={`
graph LR
    A[PostgreSQL] -->|Logical Decoding| B[Replication Slot]
    B -->|WAL Events| C[Debezium Connector]
    C -->|CDC Events| D[Kafka Topic]
`} />

## Configuration Example

Configure the PostgreSQL connector:

```json
{
  "name": "postgres-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "localhost",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.dbname": "inventory",
    "topic.prefix": "dbserver1",
    "plugin.name": "pgoutput"
  }
}
```

## SQL Setup

Enable logical replication in PostgreSQL:

```sql
-- Set WAL level to logical
ALTER SYSTEM SET wal_level = 'logical';

-- Create publication for all tables
CREATE PUBLICATION dbz_publication FOR ALL TABLES;
```

## Python Consumer Example

Process CDC events with Python:

```python
from confluent_kafka import Consumer

consumer = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'cdc-consumer',
    'auto.offset.reset': 'earliest'
})

consumer.subscribe(['dbserver1.public.users'])

while True:
    msg = consumer.poll(1.0)
    if msg is None:
        continue

    print(f"Received: {msg.value().decode('utf-8')}")
```

## Key Takeaways

- PostgreSQL uses logical decoding for CDC
- Replication slots track consumer position
- Debezium publishes changes to Kafka topics
- Python consumers process events in real-time
```

**Source:** Composite example demonstrating Astro Content Collections frontmatter, Mermaid diagram with hydration, Shiki syntax highlighting for JSON/SQL/Python.

### Dynamic Course Page Route

```astro
---
// src/pages/course/[...slug].astro
// Source: https://docs.astro.build/en/guides/content-collections/#generating-routes-from-content
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

// Generate static paths for all course pages
export async function getStaticPaths() {
  const courseEntries = await getCollection('course');
  return courseEntries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<BaseLayout title={entry.data.title}>
  <article class="prose prose-invert max-w-none">
    <h1>{entry.data.title}</h1>
    <p class="text-gray-400">{entry.data.description}</p>

    <div class="flex gap-4 text-sm text-gray-500 mb-8">
      <span>Difficulty: {entry.data.difficulty}</span>
      <span>Time: {entry.data.estimatedTime} min</span>
    </div>

    <!-- Render MDX content -->
    <Content />
  </article>
</BaseLayout>
```

**Benefits:** File-based routing with type-safe content, automatic page generation for all course entries, frontmatter accessible via `entry.data`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prism.js client-side highlighting | Shiki build-time highlighting | Astro 3+ (2023) | Zero runtime JS for syntax highlighting, faster page loads, better mobile performance |
| Manual responsive CSS | Tailwind utility classes | Widespread adoption 2020-2024 | Faster development, consistent design system, smaller CSS bundle with Tailwind's purge |
| ZooKeeper for Kafka | KRaft mode (Kafka without ZooKeeper) | Kafka 3.x (2022+) | Simpler architecture, fewer operational dependencies, faster startup |
| GitHub Pages with Jekyll | GitHub Pages with any static generator | GitHub Actions support (2019+) | Framework flexibility, modern tooling (Astro, Next.js), custom build steps |

**Deprecated/outdated:**

- **Jekyll for GitHub Pages:** GitHub Pages now supports any static site generator via GitHub Actions (not limited to Jekyll). Use modern frameworks like Astro for better DX and performance.
- **Prism.js for syntax highlighting:** Shiki is superior for static sites (build-time rendering, no client JS). Use Prism only if runtime highlighting needed (dynamic code loading).
- **Bootstrap for responsive CSS:** Tailwind dominates in 2026 for utility-first design. Bootstrap still viable but heavier bundle, less flexible.

## Open Questions

Things that couldn't be fully resolved during research.

1. **Custom domain for GitHub Pages**
   - What we know: GitHub Pages supports custom domains via CNAME file in `public/` directory, DNS CNAME record pointing to `username.github.io`
   - What's unclear: HTTPS certificate provisioning time (GitHub docs say "can take up to 24 hours"), apex domain vs subdomain configuration differences
   - Recommendation: Start with default `username.github.io/repo-name` URL for Phase 1, add custom domain in Phase 6 (Enhancements) if needed. Document in deployment guide.

2. **Mermaid diagram complexity limits**
   - What we know: Mermaid handles flowcharts, sequence diagrams, ERD. Used successfully in Astro/Docusaurus projects.
   - What's unclear: Performance for very large diagrams (20+ nodes), mobile rendering quality for complex graphs, pan/zoom support
   - Recommendation: Test with realistic Debezium architecture diagrams (database → connector → Kafka → consumer) during Phase 1. If performance issues, fall back to static SVG or consider React Flow for complex interactive diagrams in later phases.

3. **Vercel vs GitHub Pages performance comparison**
   - What we know: Both support Astro, both free for public projects. Vercel has faster global CDN, preview deployments for PRs. GitHub Pages simpler setup (no account needed).
   - What's unclear: Actual latency differences for educational content (mostly text), cost if repo becomes private
   - Recommendation: Start with GitHub Pages (simpler, free forever for public repos). Migrate to Vercel in Phase 6 if CDN performance matters or PR previews desired.

## Sources

### Primary (HIGH confidence)

- **Astro Documentation** - https://docs.astro.build/
  - Content Collections: https://docs.astro.build/en/guides/content-collections/
  - Markdown/MDX: https://docs.astro.build/en/guides/markdown-content/
  - GitHub Pages deployment: https://docs.astro.build/en/guides/deploy/github/
- **Astro 5.0 Release Blog** - https://astro.build/blog/astro-5/ (verified release date Dec 2024, performance improvements, Content Layer API)
- **React 19 Release** - https://react.dev/blog/2024/12/05/react-19 (verified stable release Dec 2024)
- **Shiki Documentation** - https://shiki.style/ (syntax highlighting, language list, configuration)
- **Mermaid.js Documentation** - https://mermaid.js.org/ (diagram types, syntax, initialization)
- **Tailwind CSS Documentation** - https://tailwindcss.com/docs (responsive design, utility classes, configuration)
- **MDN - Viewport Meta Tag** - https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag (mobile viewport configuration)

### Secondary (MEDIUM confidence)

- **Project-level STACK.md** - Comprehensive research on Astro vs Docusaurus vs Next.js, verified with official sources
- **Project-level ARCHITECTURE.md** - Component architecture patterns, islands architecture explanation, responsive design strategy
- **Crystallize Blog - React Static Site Generators** - https://crystallize.com/blog/react-static-site-generators (Astro islands architecture comparison)

### Tertiary (LOW confidence)

- None for Phase 1 - all critical findings verified with official documentation

## Metadata

**Confidence breakdown:**

- **Standard stack:** HIGH - All libraries verified from official documentation, versions confirmed current (Astro 5 Dec 2024, React 19 Dec 2024), production usage validated (Cloudflare, Google, Microsoft, OpenAI use Astro)
- **Architecture:** HIGH - Patterns from official Astro documentation, Content Collections are core feature, GitHub Actions deployment officially supported
- **Pitfalls:** HIGH - Common issues documented in Astro deployment guide, Mermaid integration patterns verified in official docs, mobile viewport from MDN standards

**Research date:** 2026-01-31
**Valid until:** 2026-07-31 (6 months - Astro stable, React stable, framework fundamentals don't change rapidly)

**Dependencies on prior research:**
- STACK.md: Framework selection rationale (Astro over alternatives)
- ARCHITECTURE.md: Project structure patterns, responsive design strategy
- No new technology research needed - all decisions validated in existing research

**Ready for planning:** Yes - all Phase 1 technical decisions confirmed, no blocking unknowns
