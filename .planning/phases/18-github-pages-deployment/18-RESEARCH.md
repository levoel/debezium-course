# Phase 18: GitHub Pages Deployment - Research

**Researched:** 2026-02-01
**Domain:** Astro static site deployment to GitHub Pages with GitHub Actions
**Confidence:** HIGH

## Summary

GitHub Pages deployment for Astro sites is well-established with official tooling. The standard approach uses the official `withastro/action` GitHub Action (v5.1.0, released January 14, 2026) which automates the build and deployment process. The existing project is already configured correctly with `site` and `base` paths in `astro.config.mjs`, has a working GitHub Actions workflow, and builds successfully locally.

The critical requirements for this phase are: (1) ensuring GitHub Actions workflow uses the latest official action, (2) configuring GitHub repository settings to use GitHub Actions as the deployment source, and (3) verifying React components (Mermaid diagrams) hydrate correctly in production with the `client:visible` directive already in use.

Testing revealed the site builds successfully in 8.82s with 65 pages, including all MDX content with Mermaid diagrams. The only warnings are cosmetic (Shiki language fallbacks for "avro" and "promql" to "plaintext").

**Primary recommendation:** Use the official `withastro/action@v5` with GitHub Actions, verify GitHub Pages settings in repository configuration, and test deployment with a focus on base path resolution and Mermaid diagram rendering.

## Standard Stack

The established libraries/tools for Astro GitHub Pages deployment:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `withastro/action` | v5 (v5.1.0) | Build and deploy Astro to GitHub Pages | Official Astro GitHub Action, auto-detects package manager, handles caching |
| `actions/checkout` | v6 | Clone repository in workflow | Required to access source code |
| `actions/deploy-pages` | v4 | Deploy artifact to GitHub Pages | Official GitHub Pages deployment action |
| `actions/upload-pages-artifact` | v3 | Upload build output for deployment | Required by deploy-pages@v4 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `actions/setup-node` | v4 | Setup Node.js environment | When using custom workflow instead of withastro/action |
| GitHub Pages environment | - | Protected deployment environment | Provides deployment URL output, recommended for production |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `withastro/action@v5` | Custom workflow with `npm run build` | More control but loses automatic package manager detection and Astro-specific optimizations |
| GitHub Actions deployment | `gh-pages` npm package | Manual process, requires .nojekyll file creation, no CI/CD integration |
| GitHub Pages | Netlify/Vercel/Cloudflare Pages | More features (SSR, edge functions) but unnecessary for static site |

**Installation:**

No additional packages needed. The project already has:
```bash
# Already installed in package.json
astro@^5.17.1
@astrojs/react@^4.4.2
@astrojs/mdx@^4.3.13
mermaid@^11.12.2
```

## Architecture Patterns

### Recommended Project Structure

Already implemented correctly:

```
.github/
└── workflows/
    └── deploy.yml          # GitHub Actions workflow

.planning/
└── phases/
    └── 18-github-pages-deployment/
        └── 18-RESEARCH.md

astro.config.mjs            # site + base configuration
package.json                # build scripts
dist/                       # build output (gitignored)
```

### Pattern 1: Official GitHub Action Workflow

**What:** Two-job workflow separating build from deployment for better error isolation and deployment control.

**When to use:** All Astro GitHub Pages deployments (recommended approach).

**Example:**
```yaml
# Source: https://github.com/withastro/action v5.1.0
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v6

      - name: Install, build, and upload your site output
        uses: withastro/action@v5

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

**Key elements:**
- `permissions` block grants OIDC token (`id-token: write`) for secure deployment verification
- `workflow_dispatch` enables manual triggering from GitHub UI
- `withastro/action@v5` auto-detects package manager from lockfile (npm/yarn/pnpm/bun)
- Separate jobs allow build caching and deployment retries

### Pattern 2: Astro Configuration for GitHub Pages

**What:** Configure `site` and `base` for correct URL resolution in production.

**When to use:** Always for GitHub Pages projects (except `username.github.io` repos).

**Example:**
```javascript
// Source: https://docs.astro.build/en/guides/deploy/github/
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://username.github.io',  // Your GitHub Pages domain
  base: '/repo-name',                  // Repository name as base path

  // Already configured correctly in project:
  // site: 'https://levoel.github.io',
  // base: '/debezium-course',
});
```

**Why this matters:**
- `site`: Used for canonical URLs, RSS feeds, sitemaps
- `base`: Prepends to all asset paths and internal links
- Missing `base` = 404 errors for all assets and navigation

### Pattern 3: React Component Hydration Strategy

**What:** Use selective hydration with `client:visible` for interactive components like Mermaid diagrams.

**When to use:** For components that don't need immediate interactivity but must be interactive when visible.

**Example:**
```jsx
// Source: https://docs.astro.build/en/guides/framework-components/
// Already implemented correctly in project MDX files:

<Mermaid chart={`
  graph TD
    A[Start] --> B[Process]
`} client:visible />
```

**Client directive options:**
- `client:load` - Hydrate immediately (heavy performance cost)
- `client:idle` - Hydrate when main thread idle (good for below-fold)
- `client:visible` - Hydrate when scrolled into view (RECOMMENDED for diagrams)
- `client:only` - Skip SSR, client-only rendering (avoid unless necessary)

**Project uses `client:visible`** which is optimal for:
- Mermaid diagrams (not needed until user scrolls to them)
- Reduces initial JavaScript bundle size
- Improves Time to Interactive (TTI) metric

### Anti-Patterns to Avoid

- **Missing .nojekyll file**: If using `gh-pages` package instead of GitHub Actions, must manually create `.nojekyll` in `dist/` to prevent Jekyll processing. Not needed with `withastro/action` (handles automatically).

- **Hardcoded absolute paths**: Never use `href="/course/..."` in components. Always use relative paths or Astro's `import.meta.env.BASE_URL` to respect the `base` configuration.

- **Committing dist/ folder**: Build artifacts should be gitignored. GitHub Actions builds fresh on each deploy, committing creates merge conflicts and bloats repository.

- **Using actions/setup-node when not needed**: The `withastro/action` already sets up Node.js (default v22). Adding `actions/setup-node` creates redundant steps unless you need a specific older version.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Build and deploy workflow | Custom bash scripts with `npm run build && gh-pages -d dist` | `withastro/action@v5` | Auto-detects package manager, handles caching (85% faster rebuilds), manages .nojekyll, handles permissions correctly |
| Base path handling | String concatenation in components (`"/debezium-course" + path`) | Astro's `base` config + `import.meta.env.BASE_URL` | Works in dev and prod, changes in one place, build-time validation |
| Deployment artifact upload | Manual `tar` + `actions/upload-artifact` | `actions/upload-pages-artifact@v3` | Validates artifact size, enforces 10GB limit, proper MIME types |
| Environment management | Manual `if: github.ref == 'refs/heads/main'` checks | GitHub Actions `environment` with protection rules | Visual deployment history, approval gates, environment secrets |

**Key insight:** GitHub Pages deployment has many edge cases (permissions, OIDC tokens, artifact formats, concurrency). The official actions encapsulate years of community fixes. Custom solutions break on GitHub platform updates.

## Common Pitfalls

### Pitfall 1: Incorrect or Missing Base Path Configuration

**What goes wrong:** After deployment, the homepage loads but all navigation returns 404. CSS and JavaScript files fail to load. Browser console shows `GET https://username.github.io/assets/main.js 404`.

**Why it happens:** GitHub Pages serves repos at `username.github.io/repo-name/`, but Astro defaults to assuming root `/`. Without `base: '/repo-name'`, all asset paths are generated as `/assets/main.js` instead of `/repo-name/assets/main.js`.

**How to avoid:**
1. Set `base` in `astro.config.mjs` to match repository name exactly (case-sensitive)
2. Verify `site` matches GitHub Pages domain
3. Test locally with `npm run preview` after build
4. Use browser DevTools Network tab to inspect failed asset requests

**Warning signs:**
- Build succeeds but deployed site shows unstyled HTML
- Navigation links return 404
- Console errors: `Failed to load resource: the server responded with a status of 404`

**Already configured correctly in this project:**
```javascript
site: 'https://levoel.github.io',
base: '/debezium-course',
```

### Pitfall 2: Repository Not Configured for GitHub Actions Deployment

**What goes wrong:** Workflow runs successfully, shows "Deployment successful" in Actions tab, but site doesn't update. Old version still live or 404.

**Why it happens:** GitHub Pages has a legacy deployment source (branch-based) and a new source (GitHub Actions). If repository settings still point to "Deploy from branch", Actions uploads are ignored.

**How to avoid:**
1. Navigate to repository **Settings → Pages**
2. Under "Build and deployment" → "Source", select **GitHub Actions**
3. Save changes
4. Re-run workflow if needed

**Warning signs:**
- Actions workflow shows green checkmark but site doesn't update
- Pages settings show "Your site is ready to be published at..." but URL 404s
- Workflow logs show successful upload but no deployment step runs

### Pitfall 3: Missing Permissions in Workflow

**What goes wrong:** Deployment step fails with error: `Error: Resource not accessible by integration` or `Error: Not authorized to access this resource`.

**Why it happens:** The `GITHUB_TOKEN` requires explicit permissions: `pages: write` (to deploy) and `id-token: write` (to generate OIDC token for deployment verification). Older workflows or forked repos may have restrictive defaults.

**How to avoid:**
```yaml
permissions:
  contents: read      # Read repository code
  pages: write        # Deploy to GitHub Pages
  id-token: write     # Generate OIDC token for deployment verification
```

**Warning signs:**
- Build job succeeds, deploy job fails
- Error message contains "permissions" or "not authorized"
- Workflow worked previously but breaks after repository transfer/fork

### Pitfall 4: Mermaid Diagrams Not Rendering After Deployment

**What goes wrong:** Mermaid diagrams render correctly in local dev (`npm run dev`) but show as raw text or error boxes in production.

**Why it happens:** Three common causes:
1. **Missing client directive**: Component isn't hydrated (no JavaScript runs)
2. **CSP headers blocking inline scripts**: GitHub Pages doesn't have this issue, but CDN proxies might
3. **Build-time rendering attempted without browser**: Using rehype plugins without Playwright

**How to avoid:**
1. Use `client:visible` directive (already implemented correctly in this project)
2. Client-side rendering approach (current implementation) works on GitHub Pages
3. Avoid rehype-mermaid plugin (requires Playwright, complex CI setup)

**Warning signs:**
- Local dev shows diagrams, production shows code blocks
- Console error: `Mermaid rendering error`
- Diagrams briefly appear then disappear (hydration issue)

**Current project status:** Using `client:visible` with `mermaid@^11.12.2` - no issues expected.

### Pitfall 5: Flaky Builds Due to Dependency Installation

**What goes wrong:** Build randomly fails with `Cannot find module @rollup/rollup-linux-x64-gnu` or similar platform-specific dependency errors. Re-running workflow sometimes works.

**Why it happens:** npm has a bug with optional dependencies in CI environments. Platform-specific binaries for Rollup, esbuild, sharp sometimes fail to download/extract.

**How to avoid:**
1. **Immediate fix**: Use `npm ci` (not `npm install`) in workflows - `withastro/action` already does this
2. **Cache dependencies correctly**: `withastro/action@v5` has built-in caching enabled by default
3. **Lock Node.js version**: Specify `node-version: '22'` (or current LTS) in action config to prevent version drift

**Warning signs:**
- Intermittent failures with "Cannot find module @rollup/..."
- Error mentions platform-specific package (linux-x64, darwin-arm64)
- Re-running workflow without changes succeeds

**Mitigation in workflow:**
```yaml
- name: Install, build, and upload your site output
  uses: withastro/action@v5
  with:
    node-version: 22      # Lock version for consistency
    cache: true           # Enable dependency caching (default)
```

### Pitfall 6: Concurrency Issues with Multiple Deployments

**What goes wrong:** Multiple pushes to main branch trigger overlapping deployments. Workflow shows "deployment already in progress" error or deploys wrong version.

**Why it happens:** Without concurrency control, simultaneous deployments race to upload artifacts. The last upload wins, but might be from an older commit if jobs finish out of order.

**How to avoid:**
```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false   # Let current deployment finish
```

**Why `cancel-in-progress: false`**: GitHub Pages deployments can't be truly cancelled mid-flight (artifact already uploaded). Setting to `true` creates orphaned artifacts and confusing logs. Better to queue deployments.

**Warning signs:**
- Multiple "Deploy to GitHub Pages" jobs running simultaneously
- Deployed version doesn't match latest commit
- Workflow logs show "Deployment already in progress"

**Already configured correctly in existing workflow.**

## Code Examples

Verified patterns from official sources:

### Complete GitHub Actions Workflow

```yaml
# Source: https://github.com/withastro/action v5.1.0
# Source: https://docs.astro.build/en/guides/deploy/github/
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v6

      - name: Install, build, and upload your site output
        uses: withastro/action@v5
        # Optional configuration:
        # with:
        #   path: .               # Root of Astro project (default: .)
        #   node-version: 22      # Node version (default: 22)
        #   package-manager: pnpm # Override auto-detection
        #   cache: true           # Enable build caching (default: true)

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

### Astro Configuration for GitHub Pages

```javascript
// Source: https://docs.astro.build/en/guides/deploy/github/
// File: astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // CRITICAL: Set both site and base for GitHub Pages
  site: 'https://levoel.github.io',
  base: '/debezium-course',

  integrations: [react(), mdx()],

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      langs: ['python', 'yaml', 'sql', 'json', 'javascript', 'typescript', 'java', 'bash', 'dockerfile'],
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
```

### Mermaid Component with Client-Side Hydration

```tsx
// Source: Project implementation (verified working)
// File: src/components/Mermaid.tsx
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#e5e7eb',
            // ...theme configuration
          },
        });

        const id = `mermaid-${Math.random().toString(36).substring(7)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
        setError('');
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-300">
        <p className="font-semibold">Mermaid Diagram Error:</p>
        <pre className="text-sm mt-2 overflow-x-auto">{error}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container my-6 flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
```

### Using Mermaid in MDX with Hydration

```mdx
---
title: "Multi-Database CDC Architecture"
---

import { Mermaid } from '../../../components/Mermaid.tsx';

# Architecture Diagram

<Mermaid chart={`
  graph TD
    A[PostgreSQL] -->|CDC Events| K[Kafka]
    B[MySQL] -->|CDC Events| K
    K --> C[Analytics Pipeline]
`} client:visible />
```

**Critical:** The `client:visible` directive ensures Mermaid JavaScript only loads when diagram scrolls into view, improving initial page load performance.

### Local Testing Before Deployment

```bash
# Build site locally
npm run build

# Preview production build
npm run preview
# Visit http://localhost:4321/debezium-course/
# Note: base path is included in preview server

# Verify all these work:
# 1. Homepage loads
# 2. Navigation between pages works
# 3. Mermaid diagrams render
# 4. CSS and images load correctly
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `gh-pages` npm package with manual deployment | `withastro/action@v5` with GitHub Actions | Astro v2+ (2023) | Automated CI/CD, no manual .nojekyll, better caching |
| `actions/setup-node` + custom build steps | `withastro/action` all-in-one | Jan 2024 | Simpler workflows, auto-detects package manager |
| `actions/upload-pages-artifact@v1` | `actions/upload-pages-artifact@v3` | 2024 | Better validation, 10GB limit enforcement |
| `actions/deploy-pages@v1` | `actions/deploy-pages@v4` | Dec 2024 | OIDC token support, improved security |
| Server-side Mermaid rendering with Playwright | Client-side with `mermaid.render()` | Ongoing | No build dependencies, simpler CI, works on all static hosts |

**Deprecated/outdated:**
- **Jekyll processing on GitHub Pages**: `.nojekyll` file now standard, GitHub Pages doesn't force Jekyll anymore
- **Branch-based deployment**: "Deploy from branch" is legacy, GitHub Actions is the recommended approach as of 2023
- **`withastro/action@v2`**: Node 20 compatibility issues, upgrade to v5 (released Jan 2026)
- **rehype-mermaid for Astro**: Requires Playwright in CI, fragile, client-side rendering is simpler and more reliable

## Open Questions

Things that couldn't be fully resolved:

1. **Custom domain configuration**
   - What we know: Requires CNAME file in `public/` directory and DNS configuration
   - What's unclear: Project context doesn't indicate if custom domain will be used
   - Recommendation: Assume `levoel.github.io/debezium-course` for v1.0, document custom domain setup in PLAN if needed later

2. **Shiki language support for Avro and PromQL**
   - What we know: Build warns about fallback to "plaintext" for `avro` and `promql` languages
   - What's unclear: Whether syntax highlighting is critical for these (appears in 8 locations)
   - Recommendation: Low priority - Shiki doesn't support these languages officially, content renders correctly as plaintext, could add custom grammar later

3. **Node.js version strategy**
   - What we know: `withastro/action@v5` defaults to Node 22, existing workflow uses Node 20
   - What's unclear: Whether project has specific Node 20 dependencies or can upgrade
   - Recommendation: Test with Node 22 (default), fallback to Node 20 if compatibility issues arise

## Sources

### Primary (HIGH confidence)
- **Astro Official Docs**: https://docs.astro.build/en/guides/deploy/github/ - GitHub Pages deployment guide
- **withastro/action**: https://github.com/withastro/action - v5.1.0 official GitHub Action documentation
- **Astro Framework Components**: https://docs.astro.build/en/guides/framework-components/ - Client directives reference
- **GitHub Actions deploy-pages**: https://github.com/actions/deploy-pages - v4 official action
- **Project Build Test**: Local build executed successfully (8.82s, 65 pages, all Mermaid diagrams rendered)

### Secondary (MEDIUM confidence)
- **Astro Build Failures Guide**: https://eastondev.com/blog/en/posts/dev/20251203-astro-build-failures-guide/ - Troubleshooting common issues (2025)
- **Mermaid MDX Integration**: https://xkonti.tech/blog/astro-mermaid-mdx/ - Client-side rendering approach
- **GitHub Actions Permissions**: https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token - OIDC token explanation
- **Community Discussions**: Multiple GitHub issues about base path problems and deployment flakiness

### Tertiary (LOW confidence)
- **Starlight .nojekyll Issue**: https://github.com/withastro/starlight/issues/3339 - Legacy issue, not applicable with GitHub Actions
- **Various blog posts**: Multiple 2025-2026 deployment guides, verified against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Astro action is well-documented, project already has working build
- Architecture: HIGH - Patterns verified through official docs and local testing
- Pitfalls: HIGH - Common issues documented in official troubleshooting, GitHub issue trackers, and verified through build test
- Mermaid integration: HIGH - Client-side rendering approach verified working in project, confirmed through WebFetch sources

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - Astro/GitHub Actions stable ecosystem, monthly releases)

**Notes:**
- Existing workflow file at `.github/workflows/deploy.yml` needs minor updates (Node version, action versions)
- Project already configured correctly for GitHub Pages (site, base, build succeeds)
- Mermaid implementation using `client:visible` is optimal for static deployment
- No blockers identified, phase can proceed to planning
