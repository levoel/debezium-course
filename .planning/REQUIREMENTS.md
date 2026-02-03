# Requirements: Debezium Course

**Defined:** 2026-02-03
**Core Value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций

## v1.6 Requirements

Requirements for v1.6 Full-Text Search milestone.

### Search Modal

- [ ] **SRCH-01**: Cmd+K / Ctrl+K opens search modal from any page
- [ ] **SRCH-02**: ESC closes search modal
- [ ] **SRCH-03**: Input auto-focuses when modal opens
- [ ] **SRCH-04**: Blur overlay behind modal (glass design)
- [ ] **SRCH-05**: Keyboard navigation through results (↑↓ arrows)
- [ ] **SRCH-06**: Enter navigates to selected result
- [ ] **SRCH-07**: "/" fallback trigger (for Firefox compatibility)

### Search Behavior

- [ ] **SRCH-08**: Search-as-you-type with 200ms debounce
- [ ] **SRCH-09**: Query highlighting in result snippets
- [ ] **SRCH-10**: Fuzzy search (typo tolerance)
- [ ] **SRCH-11**: Russian morphology support (коннектор = коннекторы)
- [ ] **SRCH-12**: Empty state message when no results

### Search Results

- [ ] **SRCH-13**: Title + contextual snippet preview
- [ ] **SRCH-14**: Hierarchical grouping by module
- [ ] **SRCH-15**: Loading indicator during search

### Search Indexing

- [ ] **SRCH-16**: Index all MDX lesson content at build time
- [ ] **SRCH-17**: Index code blocks (Python, YAML, SQL, JSON)
- [ ] **SRCH-18**: Index diagram tooltip content

### Design Integration

- [ ] **SRCH-19**: Glass styling matching existing design system
- [ ] **SRCH-20**: Mobile responsive (full-screen on mobile)

### Documentation

- [ ] **SRCH-21**: Update Module 0 with search usage instructions (Cmd+K, tips)

## Future Requirements

Deferred to v1.7+ milestones.

### Search Enhancements

- **SRCH-F01**: Search scope filtering (by module, content type)
- **SRCH-F02**: Recent searches history
- **SRCH-F03**: Search analytics (popular queries)
- **SRCH-F04**: Deep-link to specific result (URL fragment)

### Platform

- **PLAT-10**: Dark/light theme toggle
- **PLAT-11**: Export/import progress
- **CONT-01**: MongoDB change streams module

## Out of Scope

Explicitly excluded from this milestone.

| Feature | Reason |
|---------|--------|
| Server-side search | Course is fully static, no backend |
| Algolia/external search | SaaS dependency, cost |
| Search analytics dashboard | Complexity, defer to v1.7 |
| Multi-language support | Course is Russian-only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SRCH-01 | Phase 43 | Pending |
| SRCH-02 | Phase 43 | Pending |
| SRCH-03 | Phase 43 | Pending |
| SRCH-04 | Phase 44 | Pending |
| SRCH-05 | Phase 43 | Pending |
| SRCH-06 | Phase 43 | Pending |
| SRCH-07 | Phase 43 | Pending |
| SRCH-08 | Phase 42 | Pending |
| SRCH-09 | Phase 42 | Pending |
| SRCH-10 | Phase 42 | Pending |
| SRCH-11 | Phase 42 | Pending |
| SRCH-12 | Phase 43 | Pending |
| SRCH-13 | Phase 44 | Pending |
| SRCH-14 | Phase 44 | Pending |
| SRCH-15 | Phase 43 | Pending |
| SRCH-16 | Phase 41 | Pending |
| SRCH-17 | Phase 41 | Pending |
| SRCH-18 | Phase 41 | Pending |
| SRCH-19 | Phase 44 | Pending |
| SRCH-20 | Phase 44 | Pending |
| SRCH-21 | Phase 45 | Pending |

**Coverage:**
- v1.6 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 — roadmap created, 100% coverage*
