# Feature Landscape: Cmd+K Search Modal

**Domain:** Educational course platform search
**Researched:** 2026-02-03
**Confidence:** HIGH

## Executive Summary

Cmd+K search modals have evolved from simple command palettes into sophisticated search interfaces. For educational platforms in 2026, users expect instant, typo-tolerant search with keyboard-first navigation. The key distinction is that educational search emphasizes **content discovery** (finding lessons, topics, code examples) while command palettes emphasize **action execution** (running commands).

This research identifies table stakes features that define baseline expectations, differentiators that elevate educational search, and anti-features to deliberately avoid.

---

## Table Stakes

Features users expect in ANY Cmd+K search modal. Missing these = product feels broken.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Cmd+K / Ctrl+K trigger** | Industry standard since GitHub, Linear, Notion adopted it | Low | Event listener, modal component | Mac: Cmd+K, Windows/Linux: Ctrl+K |
| **ESC to close** | Universal escape hatch for modals | Low | Modal state management | Also handle click-outside to dismiss |
| **Auto-focus search input** | User pressed Cmd+K to search, not to see empty modal | Low | Input ref + useEffect | Cursor must be in input when modal opens |
| **Keyboard navigation** | Arrow keys up/down through results, Enter to select | Medium | Focus management, result list state | Tab should NOT navigate results (accessibility issue) |
| **Blur overlay background** | Visual cue that main page is inactive | Low | CSS backdrop-filter or dark overlay | Use `backdrop-blur-sm` or `bg-black/50` |
| **Search as you type** | Results appear instantly while typing | Medium | Debounced search (200ms), result rendering | Don't wait for Enter/submit button |
| **Query highlighting in results** | Bold matching text in titles/snippets | Medium | String matching + HTML injection (sanitized) | Use `<mark>` or `<strong>` tags |
| **Empty state** | "No results found" when query yields nothing | Low | Conditional rendering | Suggest: "Try different keywords" |
| **Loading indicator** | Visual feedback that search is processing | Low | Loading state during async operations | Spinner or skeleton while debounce/search runs |

**MVP Recommendation:** All 9 features are table stakes. Cannot ship without them.

---

## Differentiators

Features that set EDUCATIONAL search apart from generic command palettes.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Contextual snippets with match preview** | Shows WHERE in lesson text the match appears | High | Full-text indexing, snippet extraction algorithm | Show 2-3 lines of context around match |
| **Hierarchical result grouping** | Group results by Module > Lesson > Content Type | Medium | Result post-processing, grouped UI rendering | e.g., "Module 2 > PostgreSQL > Replication Slots" |
| **Search scope filtering** | Filter by Module, or content type (lessons/code/diagrams) | Medium | Category metadata, filter UI state | E.g., "Search in Module 3 only" or "Code examples only" |
| **Fuzzy search with typo tolerance** | "debezum" finds "debezium", "gtid failvoer" finds "gtid failover" | High | Fuzzy match algorithm or search library (Fuse.js, FlexSearch) | Essential for Russian text with complex spelling |
| **Recent searches** | Show last 3-5 searches when modal opens (empty query) | Medium | localStorage persistence, search history state | Clear privacy concern - make clearable |
| **Code block search** | Search inside code examples, with syntax-aware highlighting | High | Code content extraction, language-specific indexing | Must index code snippets separately from prose |
| **Diagram tooltip search** | Search text inside interactive glass diagram tooltips | High | Tooltip content extraction during build | 170 diagrams with Russian tooltips - valuable content |
| **Progressive disclosure** | Show top 5 results, "Show 10 more..." button | Medium | Pagination state, lazy rendering | Prevents overwhelming user with 50 results |
| **Estimated read time in results** | Each result shows "25 min" lesson duration | Low | Metadata already exists in lesson frontmatter | Helps user decide what to click |
| **Completion status indicator** | Show checkmark if lesson already completed | Medium | Integration with existing progress tracking (localStorage) | Builds on existing `progressStore.isCompleted()` |
| **Search result ranking** | Prioritize: title match > section heading > body text | High | Scoring algorithm, weight-based ranking | Title match should rank higher than body mention |

**MVP Recommendation:** Essential differentiators for educational search (pick 4-5):
1. **Contextual snippets** - Core value of educational search
2. **Fuzzy search** - Critical for Russian text and typos
3. **Hierarchical grouping** - 65+ lessons need structure
4. **Code block search** - Major content type in this course
5. **Recent searches** - Quick access to common queries

**Defer to v1.7+:**
- Search scope filtering (nice-to-have, not essential)
- Diagram tooltip search (high effort, lower ROI)
- Completion status indicator (requires state integration)

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in search modals.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Server-side search API** | Course is fully static (no backend), violates architecture constraint | Use client-side search index (JSON file loaded at runtime) |
| **Nested modals** | Opening search result in another modal = UX nightmare, confusing escape path | Navigate directly to lesson page, close search modal |
| **Full page reload on search** | Defeats purpose of instant search modal | Use SPA-style navigation or at minimum preserve scroll position |
| **Autocomplete suggestions dropdown** | Clutters UI, conflicts with result list, adds complexity | Show results directly as user types, no separate suggestions UI |
| **"Did you mean?" spelling correction** | English-focused feature, breaks on Russian text, condescending UX | Use fuzzy search instead - return "debezium" when searching "debezum" |
| **Global search state** | Storing search query in global state is overkill | Use local component state, only persist recent searches |
| **Real-time collaboration** | "See what others are searching" - privacy violation, out of scope | This is a solo learning experience, no social features |
| **AI-powered search** | LLM-based search requires backend, expensive, slow, overkill | Full-text search with fuzzy matching is sufficient |
| **Infinite scroll results** | Mobile-first pattern doesn't work well with keyboard navigation | Paginated "Show more" button or cap at 20 results |
| **Video content search** | Course has no video content | Only index text, code, and diagram tooltips |
| **Search analytics tracking** | No backend = no server-side analytics, privacy concern | Optionally: localStorage-only metrics for debugging |
| **Multi-language search** | Course is Russian-only (except code snippets) | Single-language search, no i18n complexity |
| **Search filters sidebar** | Takes up screen real estate, conflicts with keyboard-first UX | Inline filter chips or modal-embedded filter UI if needed |
| **Result thumbnails/images** | Course has no images/screenshots in content | Text-only results, no visual previews |
| **External content search** | Don't search GitHub, Stack Overflow, docs.debezium.io | Only search course content, stay focused |

**Critical architectural constraint:** No backend. Search must work 100% client-side with static JSON index.

---

## Feature Dependencies

### Dependency Graph

```
CORE INFRASTRUCTURE (Phase 1)
├─ Search index generation (build-time)
│  ├─ Extract lesson content (MDX frontmatter + body)
│  ├─ Extract code blocks (with language metadata)
│  └─ Generate searchable.json
├─ Modal component (Cmd+K trigger, ESC close)
├─ Search UI (input, results list, empty state)
└─ Basic full-text search (string matching)

ESSENTIAL FEATURES (Phase 2)
├─ Debounced search (200ms delay)
├─ Keyboard navigation (arrow keys, Enter)
├─ Query highlighting in results
├─ Contextual snippets (requires snippet extraction algorithm)
└─ Fuzzy search (requires Fuse.js or FlexSearch library)

POLISH FEATURES (Phase 3)
├─ Hierarchical result grouping (requires post-processing)
├─ Recent searches (requires localStorage integration)
├─ Code block search (requires separate code index)
├─ Estimated read time in results (trivial, just display metadata)
└─ Search result ranking (requires scoring algorithm)
```

### Integration with Existing Features

| Existing Feature | Integration Point | How Search Uses It |
|------------------|-------------------|-------------------|
| **Module/topic sidebar** | Navigation structure | Hierarchical grouping in search results |
| **Progress tracking (localStorage)** | `progressStore` | Optional: show completion status in results |
| **Interactive glass diagrams** | Tooltip content | Optional: search diagram tooltip text |
| **MDX lessons** | Frontmatter metadata | Extract title, slug, module, estimatedTime |
| **Code examples** | Code block AST | Extract code snippets for code-specific search |
| **Mobile responsive design** | Glass design system | Modal must work on 390x844 viewport |

---

## Domain-Specific Insights

### Educational Search vs Command Palette

| Aspect | Command Palette (GitHub) | Educational Search (This Course) |
|--------|-------------------------|----------------------------------|
| **Primary action** | Execute command (create issue, switch branch) | Navigate to content (open lesson) |
| **Result type** | Commands, shortcuts, pages | Lessons, code examples, concepts |
| **Frequency** | Power users, multiple times per session | Learners, when stuck or reviewing |
| **Scope** | Global app commands | Course-specific content only |
| **Discoverability** | Lists available actions | Finds specific knowledge |

### Russian Text Considerations

| Challenge | Solution |
|-----------|----------|
| Cyrillic character complexity | Ensure search library supports Unicode properly |
| Spelling variations | Fuzzy search with edit distance 2 |
| Case sensitivity | Case-insensitive search (Cyrillic has uppercase/lowercase) |
| Transliteration queries | Don't support "debezium" → "дебезиум" (out of scope) |

### Performance Constraints

| Content Volume | Search Strategy |
|----------------|----------------|
| 65+ lessons | Full-text index feasible (~500KB JSON) |
| 400+ code examples | Separate code index or combined with lessons |
| 170 diagram tooltips | Optional - significant content extraction effort |
| Russian text (~60K words) | Client-side search feasible with debouncing |

**Estimated index size:** 300-500KB JSON (lessons + code blocks), acceptable for client-side search.

---

## UX Patterns from Research

### Modal Behavior (from Algolia DocSearch, cmdk library)

| Pattern | Implementation Detail |
|---------|----------------------|
| **Keyboard shortcut** | Cmd+K (Mac) / Ctrl+K (Windows/Linux) via `event.key === 'k' && (event.metaKey || event.ctrlKey)` |
| **Auto-focus** | `inputRef.current?.focus()` in `useEffect` on modal open |
| **Debounce timing** | 200ms optimal (300ms+ feels sluggish) |
| **Escape behavior** | Close modal on ESC, clear search on second ESC (optional) |
| **Click-outside** | Close modal when clicking backdrop overlay |
| **Scroll lock** | Disable body scroll when modal open (`overflow: hidden`) |

### Search Result Display (from DocSearch v4, educational platforms)

| Element | Best Practice |
|---------|--------------|
| **Result title** | Lesson title with **bold** query match |
| **Breadcrumb** | Module > Lesson hierarchy |
| **Snippet** | 2-3 lines of context, matching text highlighted |
| **Metadata** | Module name, estimated time, optional completion status |
| **Result limit** | Show 5-10 results initially, "Show more" button |
| **Empty state** | "No results for '{query}'. Try different keywords." |

### Accessibility Requirements (WCAG 2.1)

| Requirement | Implementation |
|-------------|---------------|
| **Keyboard navigation** | Arrow keys, Enter, ESC, Tab (to exit modal) |
| **Screen reader** | `aria-label` on search input, `role="dialog"` on modal |
| **Focus trap** | Keep focus inside modal until closed |
| **Focus management** | Return focus to trigger button when modal closes |

---

## MVP Feature Prioritization

### MUST HAVE (v1.6 MVP)

1. Cmd+K/Ctrl+K trigger with ESC to close
2. Auto-focus search input
3. Search as you type (debounced 200ms)
4. Keyboard navigation (arrow keys, Enter)
5. Blur overlay background
6. Query highlighting in results
7. Empty state + loading indicator
8. Contextual snippets (2-3 lines around match)
9. Fuzzy search with typo tolerance

**Rationale:** These 9 features define baseline Cmd+K modal + educational search value.

### SHOULD HAVE (v1.6 if time, else v1.7)

10. Hierarchical result grouping (Module > Lesson)
11. Code block search (separate from lesson text)
12. Recent searches (localStorage, clearable)
13. Search result ranking (title > heading > body)

**Rationale:** Significant UX improvements but not critical for launch.

### COULD HAVE (v1.7+)

14. Search scope filtering (by Module or content type)
15. Diagram tooltip search (if extraction effort justified)
16. Completion status indicator (requires progress store integration)
17. Progressive disclosure ("Show 10 more" button)

**Rationale:** Nice-to-have polish features, defer to future iterations.

### WON'T HAVE

- Server-side search (architecture constraint)
- AI-powered search (overkill, requires backend)
- Nested modals (anti-pattern)
- Autocomplete suggestions (clutters UI)
- External content search (out of scope)

---

## Complexity Assessment

| Feature Category | Estimated Effort | Risk Level |
|-----------------|-----------------|------------|
| **Modal infrastructure** | 1-2 days | Low - standard React pattern |
| **Search index generation** | 2-3 days | Medium - MDX parsing, code extraction |
| **Basic full-text search** | 1 day | Low - string matching |
| **Fuzzy search library integration** | 1-2 days | Low - Fuse.js/FlexSearch well-documented |
| **Snippet extraction + highlighting** | 2-3 days | Medium - algorithm complexity |
| **Keyboard navigation** | 1-2 days | Medium - focus management |
| **Code block search** | 2-3 days | Medium - separate indexing pipeline |
| **Hierarchical grouping** | 1-2 days | Low - data transformation |
| **Recent searches** | 1 day | Low - localStorage CRUD |

**Total MVP estimate:** 10-15 days for MUST HAVE features.

---

## Technology Recommendations

### Search Library Options

| Library | Pros | Cons | Recommendation |
|---------|------|------|----------------|
| **Fuse.js** | Lightweight (10KB), fuzzy search built-in, simple API | Slower on large datasets (>10K items) | **RECOMMENDED** - perfect for 65 lessons |
| **FlexSearch** | Fastest client-side search, memory-efficient | More complex API, no built-in fuzzy | Alternative if performance issues |
| **Lunr.js** | Full-text search, stemming support | No fuzzy search, English-focused | Skip - Russian text needs fuzzy |
| **Minisearch** | Tiny (6KB), fuzzy + autocomplete | Less mature, smaller community | Skip - Fuse.js more proven |

**Decision:** Use **Fuse.js** for fuzzy search with typo tolerance. Russian text support confirmed.

### Modal Component Options

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Radix UI Dialog** | Already used in course (tooltips), accessible, unstyled | Slightly heavier bundle | **RECOMMENDED** - consistency |
| **Headless UI Dialog** | Lightweight, Tailwind-friendly | Not currently in project | Alternative if Radix unavailable |
| **Custom `<dialog>` element** | Native HTML, zero dependencies | Browser support issues, manual a11y | Skip - Radix is better |

**Decision:** Use **Radix UI Dialog** (already a dependency for tooltips).

### Keyboard Shortcut Handling

| Library | Pros | Cons | Recommendation |
|---------|------|------|----------------|
| **react-hotkeys-hook** | Simple API, 2KB, TypeScript support | Limited to React | **RECOMMENDED** - perfect for this use case |
| **tinykeys** | Framework-agnostic, 1KB | More manual setup | Alternative |
| **Manual event listener** | Zero dependencies | Reinventing wheel, edge cases | Skip - use library |

**Decision:** Use **react-hotkeys-hook** for Cmd+K binding.

---

## Sources

**Cmd+K Modal Best Practices:**
- [CMD+K search | Chameleon](https://www.chameleon.io/patterns/cmd-k-search)
- [CMD+K Search Modal Tutorial | DEV Community](https://dev.to/rasreee/cmdk-search-modal-tutorial-part-1-3fko)
- [Modal UX Design for SaaS in 2026 | Userpilot](https://userpilot.com/blog/modal-ux-design/)

**Command Palette UX Patterns:**
- [Command Palette | UX Patterns by Alicja Suska | Medium](https://medium.com/design-bootcamp/command-palette-ux-patterns-1-d6b6e68f30c1)
- [Command Palette UI Design | Mobbin](https://mobbin.com/glossary/command-palette)
- [Command Palettes for the web | Rob Dodson](https://robdodson.me/posts/command-palettes/)
- [Designing a Command Palette | Destiner's notes](https://destiner.io/blog/post/designing-a-command-palette)

**Documentation Search (Algolia DocSearch):**
- [DocSearch: Search made for documentation | Algolia](https://docsearch.algolia.com/)
- [DocSearch reimagined: modern UI + conversational AI | Algolia Blog](https://www.algolia.com/blog/product/docsearch-reimagined)

**Search UX Best Practices:**
- [Master Search UX in 2026 | Design Monks](https://www.designmonks.co/blog/search-ux-best-practices)
- [6 Search UX Best Practices for 2026 | Design Studio UI/UX](https://www.designstudiouiux.com/blog/search-ux-best-practices/)

**Fuzzy Search & Typo Tolerance:**
- [Typo tolerance | Algolia Documentation](https://www.algolia.com/doc/guides/managing-results/optimize-search-results/typo-tolerance)
- [Fuzzy search: a comprehensive guide | Meilisearch Blog](https://www.meilisearch.com/blog/fuzzy-search)
- [What is fuzzy search? | Typesense](https://typesense.org/learn/fuzzy-search/)
- [Building docfind: Fast Client-Side Search | VS Code Blog](https://code.visualstudio.com/blogs/2026/01/15/docfind)

**Search Performance (Debounce/Throttle):**
- [How to debounce and throttle in React | Developer Way](https://www.developerway.com/posts/debouncing-in-react)
- [TanStack Pacer: Solving Debounce, Throttle, and Batching | Medium](https://shaxadd.medium.com/tanstack-pacer-solving-debounce-throttle-and-batching-the-right-way-94d699befc8a)
- [Debounce vs Throttle: Definitive Visual Guide | kettanaito.com](https://kettanaito.com/blog/debounce-vs-throttle)

**Modal Anti-Patterns:**
- [Removing Nested Modals From Digital Products | UX Planet](https://uxplanet.org/removing-nested-modals-from-digital-products-6762351cf6de)
- [Modal design pattern | UI Patterns](https://ui-patterns.com/patterns/modal-windows)

**Course Platform Search Examples:**
- [Course search | MoodleDocs](https://docs.moodle.org/dev/Course_search)
- [Search and filter on course catalog | Learn365 Help Center](https://helpcenter.zensai.com/hc/en-us/articles/4404416006801-Search-and-filter-on-the-course-catalog-page)

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|-----------|-----------|
| **Table stakes features** | HIGH | Cross-verified with Algolia DocSearch, cmdk, and multiple UX pattern resources |
| **Differentiators** | HIGH | Educational platform patterns confirmed via Class Central, Coursera, Moodle |
| **Anti-features** | MEDIUM | Based on UX anti-pattern research + architecture constraints (no backend) |
| **Technology choices** | HIGH | Fuse.js, Radix UI, react-hotkeys-hook verified in official docs |
| **Russian text support** | MEDIUM | Fuse.js supports Unicode, but typo tolerance effectiveness unverified for Cyrillic |
| **Performance estimates** | MEDIUM | 300-500KB index size is educated guess, needs validation with actual content extraction |

**Overall confidence:** HIGH for feature categories, MEDIUM for implementation specifics.

---

## Open Questions for Implementation Phase

1. **Russian text fuzzy search:** Fuse.js edit distance threshold needs testing with Cyrillic queries.
2. **Code block indexing:** Should code be indexed with syntax tokens or as plain text?
3. **Diagram tooltip extraction:** Is there a build-time hook to extract tooltip content from React components?
4. **Mobile keyboard:** Should search modal work on mobile, or desktop-only?
5. **Result ranking weights:** What scoring weights for title (3x?) vs body (1x) vs code (2x)?

These questions should be answered during implementation, not research.

---

*Last updated: 2026-02-03*
*Research mode: Features dimension (Cmd+K search modal)*
*Downstream consumer: Requirements definition phase*
