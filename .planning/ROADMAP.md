# Roadmap: Debezium Course

## Milestones

- ✅ **v1.0 MVP** - Phases 1-27 (shipped 2026-02-01)
- ✅ **v1.1 MySQL/Aurora MySQL + Deployment** - Phases 28-31 (shipped 2026-02-01)
- ✅ **v1.2 Course Reorganization** - Phases 32-34 (shipped 2026-02-01)
- ✅ **v1.3 UX/Design Refresh** - Phases 35-36 (shipped 2026-02-02)
- ✅ **v1.4 Interactive Glass Diagrams** - Phases 37-37 (shipped 2026-02-03)
- ✅ **v1.5 Onboarding & Polish** - Phases 38-40 (shipped 2026-02-03)
- 🚧 **v1.6 Full-Text Search** - Phases 41-45 (in progress)

## Overview

Milestone v1.6 delivers instant full-text search across all course content through a Cmd+K modal overlay. Users can find lessons, code blocks, and diagram tooltips using Russian morphology-aware search with keyboard-first navigation. The implementation follows a two-phase architecture: build-time indexing with Pagefind (automatic HTML indexing, Russian stemming) and runtime search UI with kbar command palette integrated into the existing liquid glass design system.

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-27) - SHIPPED 2026-02-01</summary>

Complete CDC curriculum (Modules 1-7), interactive roadmap with progress tracking, Docker Compose lab environment (ARM64), syntax highlighting, Mermaid diagrams, mobile responsive design.

</details>

<details>
<summary>✅ v1.1 MySQL/Aurora MySQL + Deployment (Phases 28-31) - SHIPPED 2026-02-01</summary>

MySQL binlog deep-dive, Aurora MySQL specifics, MySQL connector production operations, multi-database capstone, GitHub Pages deployment with CI/CD.

</details>

<details>
<summary>✅ v1.2 Course Reorganization (Phases 32-34) - SHIPPED 2026-02-01</summary>

MySQL module moved to position 3, cross-reference updates, progress migration, Playwright E2E test suite.

</details>

<details>
<summary>✅ v1.3 UX/Design Refresh (Phases 35-36) - SHIPPED 2026-02-02</summary>

Liquid glass design system, descriptive module names, homepage accordion menu, glass-styled tables and callouts, accessibility fallbacks.

</details>

<details>
<summary>✅ v1.4 Interactive Glass Diagrams (Phases 37-37) - SHIPPED 2026-02-03</summary>

Diagram primitives library, sequence diagram components, 170 interactive glass diagrams, 2.6MB bundle reduction (Mermaid removed), keyboard accessibility, mobile responsiveness.

</details>

<details>
<summary>✅ v1.5 Onboarding & Polish (Phases 38-40) - SHIPPED 2026-02-03</summary>

Module 0 platform guide (4 onboarding lessons), GitHub repository link in header, module summary mini-lessons, glass styling for module summaries.

</details>

### 🚧 v1.6 Full-Text Search (In Progress)

**Milestone Goal:** Users can instantly find any content in the course through a Cmd+K search modal.

#### Phase 41: Index Generation

**Goal**: Build-time search index covers all course content with Russian morphology support

**Depends on**: Phase 40 (v1.5 shipped)

**Requirements**: SRCH-16, SRCH-17, SRCH-18

**Success Criteria** (what must be TRUE):
1. Pagefind generates search index in `dist/pagefind/` directory during build
2. Index includes all MDX lesson content (65+ lessons) with Russian stemming
3. Code blocks (Python, YAML, SQL, JSON) are indexed and searchable
4. Diagram tooltip content is indexed and returns results in search
5. Index size is under 150KB gzipped (measured and documented)

**Plans**: TBD

Plans:
- [ ] 41-01: TBD

#### Phase 42: Search Hook

**Goal**: React hook encapsulates Pagefind API for runtime search execution

**Depends on**: Phase 41

**Requirements**: SRCH-08, SRCH-09, SRCH-10, SRCH-11

**Success Criteria** (what must be TRUE):
1. `usePagefindSearch` hook successfully loads Pagefind API dynamically
2. Hook executes queries with 200ms debounce (no redundant API calls)
3. Search returns results with query highlighting in snippets
4. Fuzzy search tolerates typos (test with "дебезиум" → "debezium")
5. Russian morphology works (test "коннектор" matches "коннекторы", "коннектора")

**Plans**: TBD

Plans:
- [ ] 42-01: TBD

#### Phase 43: Basic Modal UI

**Goal**: Users can open search modal, type queries, and navigate to results via keyboard

**Depends on**: Phase 42

**Requirements**: SRCH-01, SRCH-02, SRCH-03, SRCH-05, SRCH-06, SRCH-07, SRCH-12, SRCH-15

**Success Criteria** (what must be TRUE):
1. Cmd+K and Ctrl+K open search modal from any page
2. "/" fallback trigger works (Firefox compatibility verified)
3. ESC closes modal and returns focus to previous element
4. Input auto-focuses when modal opens
5. Arrow keys (↑↓) navigate through results with visual highlight
6. Enter key navigates to selected result and closes modal
7. Empty state message appears when no results found
8. Loading indicator displays during search execution

**Plans**: TBD

Plans:
- [ ] 43-01: TBD

#### Phase 44: Glass Design Integration

**Goal**: Search modal matches existing liquid glass design system with mobile responsiveness

**Depends on**: Phase 43

**Requirements**: SRCH-04, SRCH-13, SRCH-14, SRCH-19, SRCH-20

**Success Criteria** (what must be TRUE):
1. Modal uses glass styling (backdrop-blur, rgba borders) matching existing design
2. Result cards display title + contextual snippet with query highlighting
3. Results are grouped hierarchically by module (collapsible sections)
4. Glass design maintains 4.5:1 contrast ratio (accessibility verified)
5. Modal is full-screen on mobile (<768px) with tap-friendly targets (≥44px)

**Plans**: TBD

Plans:
- [ ] 44-01: TBD

#### Phase 45: Integration & Testing

**Goal**: Search works in production with edge cases handled and Module 0 documentation updated

**Depends on**: Phase 44

**Requirements**: SRCH-21

**Success Criteria** (what must be TRUE):
1. Search works on GitHub Pages with base path `/debezium-course/`
2. Index regenerates automatically in CI/CD (no stale results)
3. Mobile experience verified on real devices (iOS Safari, Android Chrome)
4. Error states handled gracefully (network failures, parse errors)
5. Module 0 updated with search usage instructions (Cmd+K shortcut, search tips)

**Plans**: TBD

Plans:
- [ ] 45-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 41 → 42 → 43 → 44 → 45

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 41. Index Generation | v1.6 | 0/0 | Not started | - |
| 42. Search Hook | v1.6 | 0/0 | Not started | - |
| 43. Basic Modal UI | v1.6 | 0/0 | Not started | - |
| 44. Glass Design Integration | v1.6 | 0/0 | Not started | - |
| 45. Integration & Testing | v1.6 | 0/0 | Not started | - |

---
*Roadmap created: 2026-02-03 for milestone v1.6*
