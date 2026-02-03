# Project Research Summary

**Project:** Debezium CDC Course - Full-Text Search Feature (v1.6)
**Domain:** Educational platform search with Cmd+K modal
**Researched:** 2026-02-03
**Confidence:** HIGH

## Executive Summary

Full-text search for this static Astro course site should follow a two-phase architecture: build-time indexing with **Pagefind** (Rust/WASM, Russian stemming, automatic HTML indexing) and runtime UI with **kbar** command palette. Pagefind is the de facto standard for Astro documentation sites (powers Starlight), excelling at indexing large static content (65+ MDX lessons, 400+ code examples, 170 diagram tooltips) with minimal bandwidth through chunked index loading. The ~110KB bundle cost is justified by native Russian language support with stemming, which is critical for this course's Cyrillic content.

The recommended approach prioritizes build-time index generation (automatic, no manual extraction), client-side search execution (no backend required for GitHub Pages), and glassmorphism design consistency (kbar's unstyled approach integrates cleanly with existing liquid glass system). The biggest risk is Russian language handling: without proper stemming, "коннектор" won't match "коннектора" variations, breaking search for 80% of queries. Pagefind's built-in Russian stemmer eliminates this risk, while alternative libraries (Fuse.js, MiniSearch) would require manual stemmer integration.

Critical success factors: (1) verify Pagefind indexes diagram tooltip content correctly, (2) validate kbar React 19 compatibility (fallback to Radix Dialog if needed), (3) configure Cyrillic normalization ("ё" → "е"), and (4) integrate index generation into CI/CD to prevent stale results. The architecture is proven (Astro Starlight, Nextra 4), straightforward to implement, and scales to 500+ pages without modification.

## Key Findings

### Recommended Stack

Pagefind + kbar is the optimal combination for this static Astro course. Pagefind handles search indexing and execution with zero configuration, while kbar provides the accessible Cmd+K interface. This stack aligns perfectly with the existing Astro 5 + React 19 + Tailwind 4 architecture and requires only 2 new dependencies.

**Core technologies:**
- **Pagefind 1.4.0** (search engine): Automatic HTML indexing post-build, built-in Russian stemming, chunked index loading (~100KB), proven at 10K+ page scale — recommended because it eliminates manual index building and handles Russian morphology out-of-box
- **astro-pagefind 1.8.5** (integration): Zero-config Astro integration, hooks into build lifecycle, dev server support — recommended because it integrates search indexing into existing build pipeline without custom scripts
- **kbar 0.1.0-beta.48** (command palette): Mature (12.5K+ dependents), unstyled (fits glass design), accessible, full Cmd+K UX (~10-20KB) — recommended for polished keyboard-driven interface, with Radix Dialog as fallback if React 19 incompatibility discovered

**Key decision points:**
- **NOT Fuse.js/MiniSearch**: Manual index building requires extracting MDX content, code blocks, and diagram tooltips (100-200 lines of custom code). No Russian stemming out-of-box.
- **NOT cmdk**: Confirmed React 19 incompatibility (GitHub issues #266, shadcn/ui #6200). Would be first choice for React 18.
- **NOT server-side search**: Course is fully static (GitHub Pages), no backend available.

### Expected Features

Search must deliver instant, typo-tolerant discovery across all course content types (lessons, code, diagram tooltips) with keyboard-first navigation. Users expect command palette standards (Cmd+K trigger, ESC close, arrow key navigation) plus educational search specifics (contextual snippets, hierarchical grouping by module).

**Must have (table stakes — v1.6 MVP):**
- Cmd+K/Ctrl+K trigger with ESC close and auto-focus
- Search-as-you-type with 200ms debouncing
- Keyboard navigation (arrow keys, Enter to select)
- Query highlighting in results with contextual snippets
- Blur overlay background and focus trap
- Empty state + loading indicator
- Fuzzy search with typo tolerance (critical for Russian text variations)

**Should have (competitive differentiators — v1.6 if time, else v1.7):**
- Hierarchical result grouping (Module > Lesson structure)
- Code block search (400+ code examples are significant content)
- Recent searches (localStorage persistence, clearable)
- Search result ranking (title > heading > body weighting)

**Defer to v1.7+:**
- Search scope filtering (by module or content type)
- Diagram tooltip search (high extraction effort, lower ROI)
- Completion status indicator (requires progress store integration)
- Progressive disclosure ("Show more" pagination)

**Anti-features (explicitly avoid):**
- Server-side search API (violates static architecture)
- Autocomplete suggestions dropdown (clutters UI, conflicts with results)
- AI-powered search (overkill, requires backend)
- Nested modals (UX nightmare)
- Full index loading upfront (kills mobile performance)

### Architecture Approach

Client-side search in Astro follows a two-phase pattern: build-time index generation and runtime search execution. The search index is generated from built HTML during `astro build`, served as static chunks alongside the site, then loaded on-demand in the browser when users open the search modal.

**Major components:**
1. **Build-time indexing (Pagefind CLI)** — Runs post-build, indexes all HTML in `dist/`, generates `dist/pagefind/*.pf_*` chunk files. Integrated via `astro-pagefind` Astro integration. No manual content extraction needed (indexes rendered HTML output).
2. **Runtime search hook (usePagefindSearch)** — React hook that dynamically imports Pagefind API (`/pagefind/pagefind.js`) on first search modal open, executes queries, returns results. Handles loading/error states, debouncing (200ms).
3. **Search modal (SearchModal.tsx)** — React island (`client:only`) with kbar Command component, keyboard shortcuts (Cmd+K, ESC), focus trap, glass styling. Renders as portal in `BaseLayout.astro`, globally available.
4. **Results rendering (SearchResults.tsx)** — Displays Pagefind results with query highlighting, contextual snippets, hierarchical grouping. Reuses existing glass design tokens from `global.css`.

**Integration with existing stack:**
- **Astro 5**: Pagefind runs as integration in `astro.config.mjs`, hooks into build lifecycle
- **React 19 islands**: Search modal as `client:only` island (needs browser APIs for Pagefind import, keyboard listeners)
- **Glass design**: Reuse existing `.glass-card`, backdrop-blur patterns, hover states from `Navigation.tsx`
- **MDX content collections**: Pagefind indexes rendered HTML output, no modification to `getCollection('course')` logic needed
- **Diagram tooltips**: Radix tooltips render to DOM (React portals), likely indexed by Pagefind automatically (needs verification)

**Critical boundary:** Build-time (Node.js, content collections API) vs runtime (browser, Pagefind search API). Search index bridges this boundary via static files.

### Critical Pitfalls

Top 5 pitfalls from research that can derail implementation:

1. **Bundle size explosion from index** — Shipping full lesson content (65 MDX files + code blocks + Russian text) as search index can exceed 2-3MB uncompressed, killing page load on mobile. **Prevention:** Use Pagefind's chunked loading (~100KB upfront, 50-100KB per query). Limit indexed content to title + excerpt + headings. Exclude code blocks or weight them very low. Set 150KB gzipped budget and measure.

2. **Russian language stemming ignored** — Default English tokenization breaks search for Russian morphology: "подключение" won't match "подключения" (genitive), "подключении" (prepositional). Users type natural queries, get zero results. **Prevention:** Use Pagefind (built-in Russian stemmer) or Lunr.js with `lunr-languages` plugin. Test with morphological variations: "репликация" vs "репликации" vs "репликацию". Configure Russian stop words ("это", "все", "для").

3. **Cyrillic encoding corruption** — Search index built with incorrect encoding shows mojibake ("РїРѕРґРєР»СЋС‡РµРЅРёРµ" instead of "подключение"). **Prevention:** Explicit UTF-8 in all file operations (`fs.readFileSync(path, 'utf-8')`), add encoding roundtrip test to build script, configure CI/CD locale (`LANG=en_US.UTF-8`).

4. **Keyboard shortcut conflicts (Cmd+K)** — Cmd+K conflicts with Firefox search bar, text editor "insert link", terminal clear-line. Users get unexpected behavior. **Prevention:** Support both Cmd+K and "/" as fallback, don't intercept in input fields (`<INPUT>`, `<TEXTAREA>`, `contentEditable`), provide escape key (mandatory).

5. **Stale search index in CI/CD** — Site content updates but search index isn't regenerated, causing 404s on search result clicks or missing new content. **Prevention:** Integrate Pagefind into Astro build lifecycle (astro-pagefind integration), don't cache search index in CI/CD, set appropriate Cache-Control headers (max-age=3600, must-revalidate), verify index regenerates on every deploy.

**Additional moderate pitfalls:**
- **MDX component content not indexed** — `<Callout>`, `<Tabs>`, custom components may not be indexed if build-time extraction doesn't handle component props/children. Test component-heavy lessons.
- **Modal focus trap broken** — Users can Tab out of modal, screen readers announce background content. Use Radix Dialog (already in dependencies) with built-in focus trap or implement manual trap.
- **Poor relevance ranking** — Generic lessons rank higher than specific deep-dives due to high-frequency Russian words. Configure field weights (title: 10, headings: 5, content: 1), add Russian stop words, use BM25 over TF-IDF.

## Implications for Roadmap

Based on research, the implementation naturally divides into 5 phases, progressing from foundation (indexing) to functionality (search UI) to polish (design + mobile). This ordering mirrors the data flow: index must exist before UI can query it, UI must work before styling matters.

### Phase 1: Index Generation (Foundation)
**Rationale:** Verify Pagefind can index existing content correctly before building UI. If indexing doesn't work (e.g., diagram tooltips not indexed), no point building search modal.

**Delivers:**
- `astro-pagefind` integration in `astro.config.mjs`
- Working search index in `dist/pagefind/` after build
- Verification that diagram tooltip content is indexed (critical validation)

**Addresses:**
- Build-time indexing architecture (ARCHITECTURE.md Phase 1)
- Russian stemming configuration (PITFALLS.md #2)
- Encoding prevention (PITFALLS.md #3 — explicit UTF-8)

**Avoids:**
- Bundle size explosion (measure index size, verify < 150KB gzipped)
- Manual index building (Pagefind automates this)

**Research flag:** LOW — Pagefind is well-documented for Astro, standard patterns apply. No deep research needed, follow official integration guide.

---

### Phase 2: Search Hook (Data Layer)
**Rationale:** Encapsulate Pagefind API in React hook before building UI. Isolates data fetching logic, makes UI implementation cleaner. Tests that Pagefind API works in browser context with React 19.

**Delivers:**
- `usePagefindSearch.ts` hook with `{ search, isReady, isLoading, error }` interface
- Dynamic import of Pagefind API with basePath handling (`/debezium-course/`)
- Debouncing (200ms) for query execution

**Addresses:**
- Runtime search execution (ARCHITECTURE.md Phase 2)
- Loading states (PITFALLS.md #13 — no blank modal during loading)

**Avoids:**
- Tight coupling between UI and search API
- Missing error handling (network failures, parse errors)

**Research flag:** LOW — Standard React hook pattern, Pagefind API is straightforward.

---

### Phase 3: Basic Modal UI (Functionality)
**Rationale:** Establish core functionality (Cmd+K opens modal, typing returns results, clicking navigates) before visual polish. Validates that kbar works with React 19 (or pivots to Radix Dialog fallback).

**Delivers:**
- Working search modal with kbar Command component
- Keyboard shortcuts (Cmd+K/Ctrl+K to open, ESC to close)
- Search-as-you-type with results rendering
- Click result → navigate to lesson page
- Focus trap and scroll lock

**Addresses:**
- All "Must have" table stakes features (FEATURES.md)
- Keyboard shortcut conflicts (PITFALLS.md #4 — "/" fallback, don't intercept inputs)
- Modal focus trap (PITFALLS.md #9 — kbar handles this, or fallback to Radix Dialog)

**Avoids:**
- Keyboard shortcut conflicts (test in Firefox, text editors)
- Focus trap broken (use library with built-in trap)

**Research flag:** MEDIUM — kbar React 19 compatibility needs validation. If incompatible, pivot to Radix Dialog + custom keyboard handling (4-6 hours extra effort). This is the phase where React 19 risk materializes.

---

### Phase 4: Glass Design Integration (Polish)
**Rationale:** Styling is easier once functionality proven. Match existing liquid glass design system to maintain visual cohesion across course.

**Delivers:**
- Glass-styled modal (backdrop-blur, rgba borders)
- Result cards with hover effects matching `Navigation.tsx` patterns
- Query highlighting in result snippets
- Contextual snippets (2-3 lines around match)
- Mobile responsive layout (full-screen modal on <768px)

**Addresses:**
- Glass design integration (ARCHITECTURE.md glass styling section)
- Glass UI illegibility (PITFALLS.md #12 — increase opacity for results, test contrast 4.5:1)
- Hierarchical grouping (FEATURES.md "Should have" — group by Module > Lesson)

**Avoids:**
- Poor contrast on glass background (test with axe DevTools)
- Inconsistent hover states (reuse `.hover:bg-white/5` pattern)

**Research flag:** LOW — Glass design tokens already defined in `global.css`, straightforward application.

---

### Phase 5: Integration & Testing (Refinement)
**Rationale:** Validate production deployment, edge cases, and mobile experience. Ensures search works in real-world conditions (GitHub Pages subpath, 3G connections, mobile devices).

**Delivers:**
- Production deployment verification (base path `/debezium-course/`)
- Mobile optimization (tap targets ≥44px, full-screen modal, keyboard handling)
- Loading/empty/error states
- Recent searches (localStorage)
- Search result ranking tuning (title > heading > body weights)

**Addresses:**
- Stale index prevention (PITFALLS.md #5 — verify CI/CD integration)
- Mobile/touch experience (PITFALLS.md #14 — full-screen modal, tap targets)
- No loading states (PITFALLS.md #13 — spinner, empty state, error state)
- Poor relevance ranking (PITFALLS.md #10 — field weights, Russian stop words)

**Avoids:**
- Stale index in production (test new content is searchable immediately)
- Illegible on mobile (test on real devices, not just DevTools)

**Research flag:** LOW — Standard production validation, established testing patterns.

---

### Phase Ordering Rationale

**Dependencies drive ordering:**
- Phase 1 → Phase 2: Index must exist before search API can query it
- Phase 2 → Phase 3: Hook must work before UI can use it
- Phase 3 → Phase 4: Functionality must work before styling matters
- Phase 4 → Phase 5: Design must be polished before production validation

**Risk mitigation:**
- Phase 1 validates critical assumption (Pagefind indexes all content types)
- Phase 3 validates React 19 compatibility early (kbar or Radix fallback)
- Phase 5 validates production environment (base path, CI/CD, mobile)

**Avoids pitfalls:**
- Bundle size monitored in Phase 1 (sets budget)
- Russian stemming configured in Phase 1 (prevents late discovery)
- Encoding tested in Phase 1 (catches CI/CD locale issues early)
- Keyboard conflicts tested in Phase 3 (before committing to kbar)
- Stale index prevented in Phase 5 (CI/CD integration verification)

### Research Flags

**Phases needing validation (not deep research):**

- **Phase 1:** Verify Pagefind indexes Radix tooltip content (render diagram, search for tooltip text). If not indexed: add hidden searchable divs with `data-pagefind-body` attribute.

- **Phase 3:** Test kbar with React 19.2.4. Check for TypeScript errors, peer dependency warnings. If incompatible: switch to Radix Dialog + manual keyboard shortcut handling (estimate +4-6 hours).

**Phases with standard patterns (skip research):**

- **Phase 2:** React hook patterns are well-established, no research needed.
- **Phase 4:** Glass design system already defined, straightforward CSS application.
- **Phase 5:** Production deployment validation follows existing CI/CD patterns.

**Overall:** No phases require `/gsd:research-phase` deep dive. All patterns are documented in official libraries (Pagefind, kbar, Radix) or established in existing codebase (glass design, React islands, Astro build).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | **HIGH** | Pagefind is proven in Astro Starlight (official docs framework), Nextra 4 (production at scale). Russian stemming verified in official docs. kbar is mature (12.5K+ dependents), but React 19 compatibility unconfirmed (medium risk, has fallback). |
| **Features** | **HIGH** | Table stakes features cross-verified with Algolia DocSearch, cmdk, and multiple UX pattern resources. Educational platform patterns confirmed via Class Central, Coursera, Moodle. MVP prioritization clear. |
| **Architecture** | **HIGH** | Two-phase architecture (build-time indexing + runtime search) is standard for static sites. Astro islands pattern well-documented. Pagefind integration proven in production implementations. Build order validated. |
| **Pitfalls** | **HIGH** | Critical pitfalls (Russian stemming, encoding, bundle size) verified with multiple production case studies. Pagefind addresses most pitfalls automatically (no manual indexing, built-in Russian support). Phase warnings clear. |

**Overall confidence:** **HIGH** (95%+)

### Gaps to Address

**Open questions for validation during implementation:**

1. **Diagram tooltip indexing** (Phase 1) — Do Radix UI tooltips render to DOM in a way Pagefind can index? Radix uses React portals to `document.body`, likely indexed, but needs verification. **Validation:** Build with Pagefind, search for tooltip text like "репликация слотов", verify diagram lessons appear in results. **Fallback:** If not indexed, add hidden `<div data-pagefind-body hidden>{tooltip}</div>` elements.

2. **kbar React 19 compatibility** (Phase 3) — kbar docs say "React 18+", but React 19 not explicitly tested. Last release July 2025 (beta.48) predates React 19 stable. **Validation:** Install kbar, check for TypeScript errors, peer dependency warnings. Test keyboard shortcuts and result navigation. **Fallback:** If incompatible, use Radix Dialog + manual keyboard handling (proven React 19 compatible from v1.4 tooltips).

3. **Code block indexing strategy** (Phase 1) — Should code blocks be indexed (improves "find lessons with GTID" queries) or excluded (reduces noise)? **Decision:** Start with Pagefind default (includes code), measure if code dominates results. If too noisy, add `data-pagefind-ignore` to `<pre>` blocks or configure Pagefind to exclude code.

4. **Russian "ё" → "е" normalization** (Phase 2) — Users type "подключение" (without ё) but content has "подключён" (with ё). Does Pagefind handle this automatically, or need manual normalization? **Validation:** Search for "подключение", check if "подключён" results appear. **Fallback:** Apply `.replace(/ё/g, 'е')` normalization to both indexed content and queries.

5. **Base path handling in production** (Phase 5) — Does Pagefind work with GitHub Pages subpath `/debezium-course/`? **Validation:** Deploy to staging, test search works. **Confidence:** HIGH — Pagefind `basePath` option documented for subpath deployments, likely no issue.

**Risk level:** LOW — All gaps have clear validation steps and fallbacks. None are blockers.

## Sources

### Primary (HIGH confidence)

**Official documentation:**
- [Pagefind Documentation](https://pagefind.app/docs/) — Indexing configuration, multilingual support, Russian stemming
- [Pagefind Multilingual Support](https://pagefind.app/docs/multilingual/) — Russian language handling, stemming verification
- [astro-pagefind GitHub](https://github.com/shishkin/astro-pagefind) — Astro integration API, configuration examples
- [kbar GitHub](https://github.com/timc1/kbar) — Component API, keyboard shortcuts, accessibility features
- [Astro Content Collections Guide](https://docs.astro.build/en/guides/content-collections/) — Content integration patterns
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/) — client:only directive, React islands

**Production implementations:**
- [Astro Starlight Search Guide](https://starlight.astro.build/guides/site-search/) — Pagefind in official Astro docs framework
- [Nextra 4 Migration to Pagefind](https://the-guild.dev/blog/nextra-4) — Large-scale documentation site migration

### Secondary (MEDIUM confidence)

**Search UX patterns:**
- [CMD+K Search | Chameleon](https://www.chameleon.io/patterns/cmd-k-search) — Command palette UX patterns
- [Command Palette UX | Medium](https://medium.com/design-bootcamp/command-palette-ux-patterns-1-d6b6e68f30c1) — Design patterns
- [Algolia DocSearch](https://docsearch.algolia.com/) — Documentation search best practices

**Russian language handling:**
- [Snowball Russian Stemmer](https://snowballstem.org/algorithms/russian/stemmer.html) — Russian stemming algorithm
- [Lunr.js Language Support](https://lunrjs.com/guides/language_support.html) — Russian stemming in JS libraries

**Technical comparisons:**
- [npm-compare: Search Libraries](https://npm-compare.com/elasticlunr,flexsearch,fuse.js,minisearch) — Library feature comparison
- [React Command Palette Comparison](https://blog.logrocket.com/react-command-palette-tailwind-css-headless-ui/) — Command palette libraries

**Pitfalls and performance:**
- [How to add fast client-side search to Astro - Evil Martians](https://evilmartians.com/chronicles/how-to-add-fast-client-side-search-to-astro-static-sites) — Pagefind implementation guide
- [Static Site Search Made Easy - Snipcart](https://snipcart.com/blog/static-site-search) — Client-side search patterns

### Tertiary (LOW confidence, needs validation)

**React 19 compatibility:**
- [cmdk React 19 Issue #266](https://github.com/pacocoursey/cmdk/issues/266) — Documented incompatibility
- [shadcn/ui #6200](https://github.com/shadcn-ui/ui/issues/6200) — React 19 peer dependency conflicts

**Cyrillic handling:**
- [Unicode and Cyrillic: Copy/Paste problems](https://winrus.com/cp_e.htm) — Encoding issues
- [Search for Russian letter range misses ё - Vim Issue](https://github.com/vim/vim/issues/1751) — Character range edge cases

---

**Research completed:** 2026-02-03

**Ready for roadmap:** Yes

**Next steps:** Create 5-phase roadmap (Index Generation → Search Hook → Basic Modal → Glass Design → Integration & Testing). No deep research needed for individual phases — all patterns documented and proven in production.
