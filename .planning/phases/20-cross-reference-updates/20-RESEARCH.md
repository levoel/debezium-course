# Phase 20: Cross-Reference Updates - Research

**Researched:** 2026-02-01
**Domain:** Markdown/MDX Link Updates, Text Stream Processing, Browser Storage Migration
**Confidence:** HIGH

## Summary

This phase addresses updating 25 broken cross-references identified in Phase 19's verification report. The references use the old `/course/module-X/` URL format (where X is a single digit without module directory prefix) instead of the new `/course/XX-module-X/` format after directory renaming.

The core technical challenge is a bulk find-and-replace operation across 9 MDX files, with a specific mapping pattern where module numbers shifted. The standard approach uses `sed` (stream editor) for in-place text replacement with automatic backup creation. Additionally, progress tracking uses full lesson slugs in localStorage, so user progress for renamed modules will be lost unless a migration script is implemented.

Based on project investigation, there is NO separate roadmap component to update - the requirements mention "roadmap component" but this refers to inline progress indicators in lesson content (e.g., "Модуль 8 roadmap:" sections in MDX files) which don't use the old URL format and don't need updating.

**Primary recommendation:** Use `sed -i.bak` with a sequence of substitution commands to update all cross-references in a single pass, then verify with link validation before committing. Progress tracking migration is optional but recommended for preserving user experience.

## Standard Stack

The established tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sed | GNU 4.x+ | Stream text editor | Universal Unix tool for bulk text replacement, atomic in-place editing |
| git grep | 2.x | Pattern search in repo | Respects .gitignore, faster than regular grep on git repos |
| grep | GNU 3.x+ | Text pattern matching | Verify changes, identify affected files |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| astro-link-validator | latest | Broken link detection | Post-update verification of all internal links |
| markdown-link-check | 3.x | Standalone link validator | Alternative for CI/CD, works without Astro build |
| xargs | POSIX | Pipeline command execution | Safe multi-file sed operations with null-termination |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sed | Manual find-replace in editor | sed is atomic, creates backups, less error-prone for 25 replacements |
| astro-link-validator | markdown-link-check | astro-link-validator integrates with Astro build, catches asset links too |
| In-place localStorage migration | Reset all progress | Migration preserves user experience, reset is simpler but loses data |

**Installation:**
```bash
# sed and grep are built-in on macOS/Linux

# Optional: Link validation
npm install astro-link-validator --save-dev

# Or standalone markdown checker
npm install markdown-link-check --save-dev
```

## Architecture Patterns

### Current Cross-Reference Pattern

**Before (broken):**
```markdown
[Module 4 - Outbox Pattern](/course/module-4/03-outbox-pattern)
```

**After (correct):**
```markdown
[Module 5 - Outbox Pattern](/course/05-module-5/03-outbox-pattern)
```

**Key insight:** The old pattern used `/course/module-X/` where X is the module NUMBER. The new pattern uses `/course/0X-module-X/` where the directory prefix matches the module number.

### Mapping Pattern (Phase 19 Renames)

Phase 19 renamed directories with this mapping:

| Old Directory | New Directory | Old URL Pattern | New URL Pattern |
|---------------|---------------|-----------------|-----------------|
| 08-module-8 (MySQL) | 03-module-3 | `/course/module-8/` | `/course/03-module-3/` |
| 03-module-3 (Production Ops) | 04-module-4 | `/course/module-3/` | `/course/04-module-4/` |
| 04-module-4 (Advanced Patterns) | 05-module-5 | `/course/module-4/` | `/course/05-module-5/` |
| 05-module-5 (Data Engineering) | 06-module-6 | `/course/module-5/` | `/course/06-module-6/` |
| 06-module-6 (Cloud-Native) | 07-module-7 | `/course/module-6/` | `/course/07-module-7/` |
| 07-module-7 (Capstone) | 08-module-8 | `/course/module-7/` | `/course/08-module-8/` |

**CRITICAL ORDERING:** Module 8→3 must be processed FIRST, otherwise module-3 would incorrectly match the old module-3 references.

### Pattern 1: Safe Bulk Replacement with sed

**What:** Use `sed -i.bak` to edit files in-place while creating .bak backups
**When to use:** Bulk text replacement across multiple files in git repo
**Example:**
```bash
# Source: GNU sed manual + Phase 19 verification data

# Store file list in variable to avoid repeated grep
FILES=$(git grep -l "/course/module-" -- "*.mdx")

# Execute replacements in correct order (8→3 first!)
echo "$FILES" | xargs sed -i.bak \
  -e 's|/course/module-8/|/course/03-module-3/|g' \
  -e 's|/course/module-7/|/course/08-module-8/|g' \
  -e 's|/course/module-6/|/course/07-module-7/|g' \
  -e 's|/course/module-5/|/course/06-module-6/|g' \
  -e 's|/course/module-4/|/course/05-module-5/|g' \
  -e 's|/course/module-3/|/course/04-module-4/|g'

# Verify changes
git diff src/content/course/

# Remove backups if satisfied
find src/content/course -name "*.bak" -delete
```

**Why this works:**
- `-i.bak` creates backup files (e.g., `file.mdx.bak`) before modification
- `-e` chains multiple expressions in single pass
- `|` delimiter avoids escaping `/` in URLs
- `g` flag replaces all occurrences per line
- git diff shows exactly what changed

### Pattern 2: Progress Tracking Migration (Optional)

**What:** One-time localStorage key migration to preserve user progress
**When to use:** If preserving user completion status is important
**Example:**
```typescript
// Source: Zustand migration pattern + project's progress.ts structure

// Add to src/stores/progress.ts or create migration.ts

/**
 * One-time migration: Rename module slugs after Phase 19 reorganization
 * Converts old module-X slugs to new 0X-module-X format
 */
export function migrateModuleSlugs(): void {
  const MIGRATION_KEY = 'course-progress-v2-migrated';

  // Check if already migrated
  if (localStorage.getItem(MIGRATION_KEY) === 'true') {
    return;
  }

  const data = $progress.get();
  if (!data || !Array.isArray(data.completed)) {
    return;
  }

  // Mapping: old slug → new slug
  const slugMap: Record<string, string> = {
    // Module 8 → 3 (MySQL)
    '08-module-8/01-binlog-architecture': '03-module-3/01-binlog-architecture',
    '08-module-8/02-gtid-mode-fundamentals': '03-module-3/02-gtid-mode-fundamentals',
    // ... (15 MySQL lessons total)

    // Module 3 → 4 (Production Ops)
    '03-module-3/01-metrics-monitoring': '04-module-4/01-metrics-monitoring',
    // ... (7 lessons)

    // Module 4 → 5 (Advanced Patterns)
    '04-module-4/01-smt-basics': '05-module-5/01-smt-basics',
    // ... (8 lessons)

    // Modules 5→6, 6→7, 7→8 similarly
  };

  const migratedCompleted = data.completed.map(
    slug => slugMap[slug] || slug
  );

  $progress.set({
    completed: migratedCompleted,
    lastUpdated: Date.now(),
  });

  localStorage.setItem(MIGRATION_KEY, 'true');
  console.log(`[Migration] Updated ${migratedCompleted.length} progress entries`);
}

// Call once on app initialization (e.g., in BaseLayout.astro)
```

**Why this pattern:**
- Version flag prevents re-running migration
- Preserves unmapped slugs (modules 1-2 didn't change)
- One-time operation, minimal performance impact
- User doesn't lose weeks of progress tracking

### Pattern 3: Link Validation with astro-link-validator

**What:** Automated broken link detection during Astro build
**When to use:** Post-update verification before deployment
**Example:**
```typescript
// Source: astro-link-validator documentation

// astro.config.mjs
import { defineConfig } from 'astro/config';
import linkValidator from 'astro-link-validator';

export default defineConfig({
  integrations: [
    linkValidator({
      // Fail build on broken internal links
      failOnBrokenInternalLinks: true,
      // Don't fail on external links (may be transient)
      failOnBrokenExternalLinks: false,
      // Check assets (images, etc.)
      checkAssets: true,
    }),
  ],
});
```

**Verification command:**
```bash
# Build with link validation
npm run build

# Expected output:
# ✓ All 65 pages built successfully
# ✓ Link validation: 0 broken internal links
```

### Anti-Patterns to Avoid

- **Processing replacements in wrong order:** Module-3 replacement before module-8 would incorrectly convert `/course/module-3/` references that should stay as module-3 (from old module-8 references). Always process module-8 → module-3 FIRST.
- **Using `-i` without backup suffix:** macOS sed requires explicit suffix (even empty `-i ''`), Linux allows `-i` alone. Use `-i.bak` for cross-platform safety and rollback capability.
- **Forgetting to verify after bulk edit:** Always `git diff` before committing. Silent sed failures (wrong regex) could break all links.
- **Manual editing instead of sed:** Error-prone for 25 replacements across 9 files. One typo breaks the site.
- **Assuming inline "roadmap" is a component:** The requirement mentions "roadmap component" but there's no React/Astro component - it's just inline text in MDX that doesn't need URL updates.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Link validation | Custom script scraping HTML for href attributes | astro-link-validator or markdown-link-check | Handles edge cases: fragments, assets, relative vs absolute, external timeout, caching |
| Text replacement across files | Node.js script with fs.readFileSync loop | sed with xargs pipeline | sed is atomic (crash-safe), creates backups, 100x faster on large files |
| localStorage migration | Manual reset instructions for users | Version-based migration function | Preserves user experience, one-time operation, standard pattern from Zustand |
| Regex pattern for URLs | Hand-written \[.*?\]\(/course/... | Use `|` delimiter in sed to avoid escaping slashes | Cleaner, less error-prone than escaping `\/course\/module-` |

**Key insight:** sed is a 50-year-old tool specifically designed for this use case. Modern Node.js alternatives add dependencies and complexity without benefits for straightforward text replacement.

## Common Pitfalls

### Pitfall 1: Incorrect Replacement Order Creates Circular Mapping
**What goes wrong:** Processing module-3→4 before module-8→3 causes old module-8 references to incorrectly become module-4
**Why it happens:** `/course/module-8/` → `/course/03-module-3/` contains "module-3" substring. If module-3→4 runs first, the "module-3" part would match.
**How to avoid:** Process replacements in reverse dependency order: Start with module-8 (becomes 3), then module-7 (becomes 8), etc.
**Warning signs:** After sed, grep for `/course/module-3/` shows unexpected files or counts

### Pitfall 2: macOS vs Linux sed Syntax Differences
**What goes wrong:** `sed -i` works on Linux, fails on macOS with "invalid command code" error
**Why it happens:** macOS ships BSD sed, which requires explicit backup suffix even for empty string: `-i ''`. GNU sed (Linux) allows `-i` alone.
**How to avoid:** Always use `-i.bak` with non-empty suffix for cross-platform compatibility. Delete .bak files after verification.
**Warning signs:** sed command works in CI/CD but fails locally (or vice versa)

**Source:** [GNU sed manual - In-place file editing](https://learnbyexample.github.io/learn_gnused/in-place-file-editing.html)

### Pitfall 3: Forgetting to Escape Special Regex Characters
**What goes wrong:** sed pattern `/course/module-3/` contains `/` characters which conflict with sed's default delimiter
**Why it happens:** sed syntax is `s/pattern/replacement/` where `/` separates components
**How to avoid:** Use alternate delimiter: `s|pattern|replacement|` or escape slashes: `s/\/course\/module-3\//...`
**Warning signs:** sed error "unterminated 's' command" or silent failures

**Source:** [sed 102: Replace In-Place - thoughtbot](https://thoughtbot.com/blog/sed-102-replace-in-place)

### Pitfall 4: Breaking Links by Forgetting Trailing Slashes
**What goes wrong:** Replacement changes `/course/module-4/03-outbox-pattern` to `/course/05-module-503-outbox-pattern`
**Why it happens:** Pattern `/course/module-4/` without checking what follows matches broader context than intended
**How to avoid:** Include trailing `/` in both pattern and replacement to ensure directory boundary matching
**Warning signs:** Post-replacement grep shows malformed URLs without slashes between segments

### Pitfall 5: Progress Tracking Migration Running Multiple Times
**What goes wrong:** Migration runs on every page load, repeatedly converting slugs and corrupting data
**Why it happens:** No version flag to track whether migration already executed
**How to avoid:** Store migration flag in localStorage (e.g., `course-progress-v2-migrated: 'true'`), check before running
**Warning signs:** Progress resets on page refresh, console logs show repeated migration execution

**Source:** [Zustand - Persisting store data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) migration pattern

## Code Examples

Verified patterns from project source and official documentation:

### Current Progress Tracking Implementation
```typescript
// Source: src/stores/progress.ts (lines 20-38)
export const $progress = persistentAtom<ProgressData>(
  'course-progress',
  DEFAULT_PROGRESS,
  {
    encode: JSON.stringify,
    decode: (str) => {
      try {
        const data = JSON.parse(str);
        if (data && Array.isArray(data.completed)) {
          return data as ProgressData;
        }
      } catch {
        // Invalid JSON, return default
      }
      return DEFAULT_PROGRESS;
    },
  }
);
```

**Impact:** `completed` array stores full lesson slugs like `"03-module-3/01-binlog-architecture"`. After Phase 19 rename, old slugs (`08-module-8/01-binlog-architecture`) won't match, causing progress loss.

### Complete sed Replacement Script
```bash
#!/bin/bash
# Source: GNU sed manual + Phase 19 verification mapping

set -e  # Exit on error

echo "==> Finding affected MDX files..."
FILES=$(git grep -l "/course/module-" -- "*.mdx" || true)

if [ -z "$FILES" ]; then
  echo "No files with /course/module-X/ pattern found"
  exit 0
fi

echo "==> Found $(echo "$FILES" | wc -l) files to update"
echo "$FILES"

echo ""
echo "==> Applying replacements (order matters!)..."

# CRITICAL: Process module-8 → module-3 FIRST
# Otherwise module-3 pattern would incorrectly match
echo "$FILES" | xargs sed -i.bak \
  -e 's|/course/module-8/|/course/03-module-3/|g' \
  -e 's|/course/module-7/|/course/08-module-8/|g' \
  -e 's|/course/module-6/|/course/07-module-7/|g' \
  -e 's|/course/module-5/|/course/06-module-6/|g' \
  -e 's|/course/module-4/|/course/05-module-5/|g' \
  -e 's|/course/module-3/|/course/04-module-4/|g'

echo "==> Verifying replacements..."
# Check no old patterns remain
REMAINING=$(git grep "/course/module-[0-9]/" -- "*.mdx" | wc -l || echo "0")
echo "Old pattern occurrences remaining: $REMAINING"

if [ "$REMAINING" -ne "0" ]; then
  echo "WARNING: Old patterns still found!"
  git grep "/course/module-" -- "*.mdx"
  exit 1
fi

echo ""
echo "==> Showing changes..."
git diff --stat src/content/course/

echo ""
echo "SUCCESS! Review changes with: git diff src/content/course/"
echo "Remove backups with: find src/content/course -name '*.bak' -delete"
```

### Inline Roadmap Pattern (No Update Needed)
```markdown
<!-- Source: src/content/course/03-module-3/12-incremental-snapshots.mdx (lines 1390-1393) -->

**Модуль 8 roadmap:**
- ✅ Lesson 1-9: MySQL binlog, GTID, Aurora parameter groups, snapshot modes
- ✅ **Lesson 12: Incremental snapshots** ← Вы здесь
- 🔜 Lesson 13: Production troubleshooting
```

**Note:** This is plain text, not a React/Astro component. It references "Модуль 8" in TEXT but doesn't use `/course/module-8/` URLs, so no update needed. The requirement "update roadmap component" is a misnomer - there's no component to update.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual find-replace in editor | sed with git grep pipeline | Standard practice since 1990s | Atomic operations, automatic backups, scriptable |
| Breaking user progress on refactors | localStorage migration with version flags | Popularized by Zustand 2020+ | User experience preservation, one-time migration |
| Manual link checking | Automated link validators (astro-link-validator, markdown-link-check) | Tools mature 2022+ | Catch broken links before deployment, CI/CD integration |
| Fragile regex in JavaScript | sed with alternate delimiters | Best practice established | Cleaner patterns, less escaping, fewer bugs |

**Deprecated/outdated:**
- **Manual find-replace across files:** Error-prone, no atomic rollback
- **Resetting user progress on URL changes:** Poor UX, migration is standard pattern now
- **Testing links manually:** Scales poorly, misses edge cases, automated tools are mature

## Open Questions

1. **Should progress migration be implemented in Phase 20?**
   - What we know: Progress tracking uses full slugs, renamed modules will lose user progress
   - What's unclear: Is this course in production with real users who completed lessons?
   - Recommendation: Implement migration if course is live and has users. Skip if pre-launch/demo. The requirement mentions it but doesn't specify "must" vs "should".

2. **Are there cross-references in other file types?**
   - What we know: Phase 19 verification found 25 references in 9 MDX files
   - What's unclear: Are there references in .astro layouts, components, or config files?
   - Recommendation: Grep entire src/ directory to verify: `git grep "/course/module-" src/`

3. **Should we add link validation to CI/CD?**
   - What we know: astro-link-validator can fail builds on broken internal links
   - What's unclear: Does the project already have CI/CD link validation?
   - Recommendation: Add to astro.config.mjs if not present, prevents future regressions

4. **Do external references exist (documentation, blog posts, bookmarks)?**
   - What we know: Internal content references are broken, navigation auto-updates
   - What's unclear: Are there external links pointing to old URLs?
   - Recommendation: Not in scope for Phase 20 (internal updates only), but note for documentation

## Sources

### Primary (HIGH confidence)
- Project source code analysis:
  - Phase 19 VERIFICATION.md - Identified 25 broken cross-references with exact file paths
  - Phase 19 RESEARCH.md - Module renaming mapping and navigation auto-discovery
  - src/stores/progress.ts - Progress tracking localStorage implementation
  - src/components/Navigation.tsx - No roadmap component found, navigation is auto-generated
  - src/content/course/03-module-3/12-incremental-snapshots.mdx - Inline roadmap pattern example
- [GNU sed manual](https://www.gnu.org/software/sed/manual/sed.html) - Official sed documentation
- [In-place file editing - CLI text processing with GNU sed](https://learnbyexample.github.io/learn_gnused/in-place-file-editing.html) - Authoritative guide on sed -i usage

### Secondary (MEDIUM confidence)
- [sed 102: Replace In-Place - thoughtbot](https://thoughtbot.com/blog/sed-102-replace-in-place) - Best practices for safe sed operations
- [How to Replace Text in Multiple Files with Sed](https://karandeepsingh.ca/posts/replace-text-multiple-files-sed-guide/) - Step-by-step guide for bulk replacements
- [Git grep replace string - remarkablemark](https://remarkablemark.org/blog/2020/07/12/git-grep-replace/) - Git grep + sed pipeline pattern
- [Zustand - Persisting store data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) - localStorage migration pattern with version flags
- [astro-link-validator GitHub](https://github.com/rodgtr1/astro-link-validator) - Astro integration for link validation
- [Add Broken Link Checking to Astro Framework](https://travis.media/blog/astro-broken-links-validator/) - Integration guide

### Tertiary (LOW confidence)
- [localstorage-migrator GitHub](https://github.com/ragnarstolsmark/localstorage-migrator) - Library for localStorage migrations (not needed, manual implementation simpler)
- [markdown-link-check npm](https://www.npmjs.com/package/markdown-link-check) - Alternative link checker (standalone, not Astro-integrated)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - sed/grep are standard Unix tools, project structure verified directly
- Architecture: HIGH - Analyzed Phase 19 verification report, actual MDX files, and progress tracking code
- Pitfalls: HIGH - Documented from sed manual, community best practices, and project-specific verification

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable domain, sed/grep unchanged for decades, Astro link validators mature)
