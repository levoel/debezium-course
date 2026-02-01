---
phase: 20-cross-reference-updates
plan: 01
subsystem: content-structure
tags: [astro, cross-references, progress-migration, url-updates]

# Dependency graph
requires:
  - phase: 19-module-renaming
    provides: New module directory structure (0X-module-X format)
provides:
  - Valid internal cross-reference links across all course content
  - User progress preservation after module reorganization
  - Zero broken internal links in site build
affects: [user-experience, content-navigation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - sed bulk text replacement with ordered substitutions
    - localStorage migration with version flags
    - Client-side initialization in Astro layouts

key-files:
  created:
    - .planning/phases/20-cross-reference-updates/20-01-SUMMARY.md
  modified:
    - src/content/course/07-module-7/04-dataflow-bigquery.mdx
    - src/content/course/07-module-7/06-cloud-monitoring.mdx
    - src/content/course/08-module-8/01-capstone-overview.mdx
    - src/content/course/08-module-8/02-architecture-deliverables.mdx
    - src/content/course/08-module-8/03-self-assessment.mdx
    - src/content/course/08-module-8/04-multi-database-architecture.mdx
    - src/content/course/08-module-8/05-multi-database-configuration.mdx
    - src/stores/progress.ts
    - src/layouts/BaseLayout.astro

key-decisions:
  - "sed replacement order matters: module-8 first to prevent circular mapping"
  - "Progress migration uses prefix matching (not full slug map) for maintainability"
  - "Migration flag (course-progress-v1.2-migrated) prevents re-running on every page load"
  - "Client-side script in BaseLayout.astro runs migration on all pages"

patterns-established:
  - "Ordered sed substitutions for complex URL remapping"
  - "localStorage version-based migration pattern"
  - "One-time initialization in shared Astro layout"

# Metrics
duration: 3min
completed: 2026-02-01
---

# Phase 20 Plan 01: Cross-Reference Updates Summary

**Fixed 21 broken internal cross-references and implemented progress tracking migration to preserve user completion status after v1.2 module reorganization**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-01T17:05:27Z
- **Completed:** 2026-02-01T17:08:19Z
- **Tasks:** 3
- **Files modified:** 9 (7 MDX + 1 progress.ts + 1 BaseLayout.astro)

## Accomplishments

- Updated 21 cross-reference links from `/course/module-X/` to `/course/0X-module-X/` format
- Added progress migration function to preserve user lesson completion status
- Wired migration into BaseLayout.astro for automatic execution on page load
- Site builds successfully with 65 pages and zero errors
- All internal links now resolve to valid pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Update cross-references in MDX files** - `a7ad694` (fix)
2. **Task 2: Add progress migration function** - `588c98a` (feat)
3. **Task 3: Wire migration into app initialization** - `937516b` (chore)

## Files Created/Modified

**Modified MDX files (7):**
- `src/content/course/07-module-7/04-dataflow-bigquery.mdx` - Fixed module-4, module-5 references
- `src/content/course/07-module-7/06-cloud-monitoring.mdx` - Fixed module-3 reference (no trailing slash)
- `src/content/course/08-module-8/01-capstone-overview.mdx` - Fixed 6 references (modules 3-6)
- `src/content/course/08-module-8/02-architecture-deliverables.mdx` - Fixed module-4 reference
- `src/content/course/08-module-8/03-self-assessment.mdx` - Fixed 2 references (modules 3-4)
- `src/content/course/08-module-8/04-multi-database-architecture.mdx` - Fixed 6 references (modules 3-6)
- `src/content/course/08-module-8/05-multi-database-configuration.mdx` - Fixed 3 references (modules 3-5)

**Progress tracking:**
- `src/stores/progress.ts` - Added `migrateModuleSlugs()` function (47 lines)
- `src/layouts/BaseLayout.astro` - Added migration call in client-side script

## Decisions Made

**1. sed replacement order prevents circular mapping**
- Module-8 → Module-3 processed FIRST
- Then modules 7→8, 6→7, 5→6, 4→5, 3→4 in sequence
- Prevents "module-3" substring in new module-8 path from incorrectly matching old module-3 pattern

**2. Prefix-based slug mapping**
- Use `slug.startsWith(oldPrefix + '/')` instead of full slug map
- Automatically handles all 15 MySQL lessons without listing each individually
- More maintainable if lessons are added/removed in future

**3. Version flag prevents repeated migration**
- `localStorage.setItem('course-progress-v1.2-migrated', 'true')`
- Checked at start of migration function, skips if already run
- Prevents data corruption from repeated conversions

**4. BaseLayout.astro as initialization point**
- Shared layout used by all course pages
- Client-side script already exists for navigation
- Migration runs once per page load but exits early after first execution

## Deviations from Plan

**Auto-fixed Issues:**

**[Rule 3 - Blocking] Fixed module-3 reference without trailing slash**
- **Found during:** Task 1 verification
- **Issue:** One reference used `/course/module-3)` (closing paren, no trailing slash), not caught by initial sed pattern `/course/module-3/`
- **Fix:** Applied targeted sed command `s|/course/module-3)|/course/04-module-4)|g`
- **Files modified:** `src/content/course/07-module-7/06-cloud-monitoring.mdx`
- **Commit:** a7ad694 (included in Task 1 commit)
- **Impact:** Without this fix, link would remain broken and point to non-existent page

## Issues Encountered

**Discrepancy in reference count:**
- Plan mentioned "25 broken cross-references"
- Actual count: 21 references updated
- **Reason:** Plan count included 4 references to modules 1-2 which didn't change in Phase 19
- **Resolution:** Correctly left module-1 and module-2 references unchanged (no update needed)

## Technical Details

### Cross-Reference Mapping

| Old URL Pattern | New URL Pattern | References Updated |
|-----------------|-----------------|-------------------|
| `/course/module-8/` | `/course/03-module-3/` | 0 (MySQL lessons don't reference themselves) |
| `/course/module-7/` | `/course/08-module-8/` | 0 (Capstone is final module) |
| `/course/module-6/` | `/course/07-module-7/` | 1 |
| `/course/module-5/` | `/course/06-module-6/` | 3 |
| `/course/module-4/` | `/course/05-module-5/` | 11 |
| `/course/module-3/` | `/course/04-module-4/` | 6 |

**Total:** 21 cross-references updated

### Progress Migration Logic

```typescript
// Slug prefix mapping (old → new)
const prefixMap: Record<string, string> = {
  '08-module-8': '03-module-3',  // MySQL → position 3
  '03-module-3': '04-module-4',  // Production Ops → position 4
  '04-module-4': '05-module-5',  // Advanced Patterns → position 5
  '05-module-5': '06-module-6',  // Data Engineering → position 6
  '06-module-6': '07-module-7',  // Cloud-Native → position 7
  '07-module-7': '08-module-8',  // Capstone → position 8
};

// Example transformation:
// Old: "08-module-8/01-binlog-architecture"
// New: "03-module-3/01-binlog-architecture"
```

**Key features:**
- SSR-safe with `typeof window === 'undefined'` check
- No-op for new users (no progress to migrate)
- Preserves modules 1-2 slugs (unchanged in Phase 19)
- One-time execution per user session

## Verification Results

All success criteria met:

- ✓ All 21 cross-references updated to new `/course/0X-module-X/` format
- ✓ No old `/course/module-X/` patterns remain for modules 3-8: `git grep "/course/module-[3-8]/" -- "*.mdx"` returns 0 results
- ✓ Progress migration function added and exported from progress.ts
- ✓ Migration called during app initialization (BaseLayout.astro)
- ✓ Site builds with zero errors: 65 pages generated successfully
- ✓ TypeScript compiles without errors in progress.ts

## Next Phase Readiness

- All internal course cross-references now valid and resolve correctly
- User progress preserved across module reorganization
- No broken links in production build
- Ready for Phase 21 (content updates) or deployment
- No blockers for future development

**Note:** External references (documentation, blog posts, bookmarks) pointing to old URLs are out of scope for this phase. Recommend implementing URL redirects if external links are in use.

---
*Phase: 20-cross-reference-updates*
*Completed: 2026-02-01*
