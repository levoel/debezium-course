# Phase 19: Module Directory Renaming - Research

**Researched:** 2026-02-01
**Domain:** Astro Content Collections, Git File Operations, Build Systems
**Confidence:** HIGH

## Summary

This phase involves renaming module directories in an Astro-based course site with content collections. The project uses a custom navigation system (not Starlight as initially stated) where navigation is automatically derived from directory structure and frontmatter data. The key challenge is coordinating directory renames with Git history preservation, cache invalidation, and navigation updates.

The project's navigation system (implemented in `src/utils/navigation.ts`) automatically discovers modules and lessons from the `src/content/course/` directory structure. Module IDs are extracted from the first path segment (e.g., "01-module-1" becomes the module identifier). The Navigation component groups lessons by these module IDs and displays them with collapsible sections.

Because navigation is derived from directory names, renaming directories will automatically update the navigation without code changes. However, care must be taken to ensure clean Git operations, cache invalidation, and build verification.

**Primary recommendation:** Execute renames using `git mv` in a single atomic commit, clear the `.astro` cache directory before and after, and verify build success with link validation before committing.

## Standard Stack

The established tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.17.1 | Static site generator | Project's build system with content collections |
| Git | 2.x | Version control | Preserves file history across renames |
| Node.js | 18+ | JavaScript runtime | Required by Astro build process |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| astro-link-validator | latest | Broken link detection | Post-rename build verification |
| GitHub Actions | N/A | CI/CD deployment | Automated deployment to GitHub Pages |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| git mv | Manual rename + git add | git mv preserves history better, is cleaner |
| Automatic navigation | Manual sidebar config | Auto-discovery keeps navigation in sync with structure |

**Installation:**
```bash
# No new dependencies required for basic renaming
# Optional: For link validation
npm install astro-link-validator --save-dev
```

## Architecture Patterns

### Current Project Structure
```
src/
├── content/
│   ├── course/
│   │   ├── 01-module-1/        # Foundations (unchanged)
│   │   ├── 02-module-2/        # PostgreSQL (unchanged)
│   │   ├── 03-module-3/        # → becomes 04-module-4
│   │   ├── 04-module-4/        # → becomes 05-module-5
│   │   ├── 05-module-5/        # → becomes 06-module-6
│   │   ├── 06-module-6/        # → becomes 07-module-7
│   │   ├── 07-module-7/        # → becomes 08-module-8
│   │   └── 08-module-8/        # → becomes 03-module-3 (MySQL moves up)
│   └── config.ts               # Collection schema (unchanged)
├── utils/
│   └── navigation.ts           # Auto-discovers modules from directory names
├── components/
│   └── Navigation.tsx          # Renders navigation from module data
└── layouts/
    └── BaseLayout.astro        # Calls getNavigationTree()
```

### Pattern 1: Atomic Directory Rename with Git
**What:** Rename multiple directories in a single commit using git mv
**When to use:** When preserving Git history is important
**Example:**
```bash
# Execute all renames in sequence
git mv src/content/course/07-module-7 src/content/course/07-module-7-temp
git mv src/content/course/06-module-6 src/content/course/06-module-6-temp
git mv src/content/course/05-module-5 src/content/course/05-module-5-temp
git mv src/content/course/04-module-4 src/content/course/04-module-4-temp
git mv src/content/course/03-module-3 src/content/course/03-module-3-temp
git mv src/content/course/08-module-8 src/content/course/03-module-3

# Now rename temp directories to final names
git mv src/content/course/03-module-3-temp src/content/course/04-module-4
git mv src/content/course/04-module-4-temp src/content/course/05-module-5
git mv src/content/course/05-module-5-temp src/content/course/06-module-6
git mv src/content/course/06-module-6-temp src/content/course/07-module-7
git mv src/content/course/07-module-7-temp src/content/course/08-module-8

# Commit in single atomic operation
git commit -m "refactor: renumber modules (MySQL becomes module 3)"
```

**Why two-stage:** Direct renames (03→04 while 04 exists) would conflict. Using temporary names avoids collisions.

### Pattern 2: Navigation Auto-Discovery
**What:** Navigation automatically derives from directory structure
**When to use:** Always - this is how the project works
**Example:**
```typescript
// Source: /src/utils/navigation.ts (lines 33-36)
function extractModuleId(entryId: string): string {
  const segments = entryId.split('/');
  return segments[0]; // First segment becomes module ID
}
```

**Key behavior:** Module headers display as "Модуль 01", "Модуль 02" etc., extracted from directory names like "01-module-1". Renaming "08-module-8" to "03-module-3" automatically changes display to "Модуль 03".

### Pattern 3: Cache Invalidation Protocol
**What:** Clear Astro's build cache before and after structural changes
**When to use:** Before any directory rename operations
**Example:**
```bash
# Before renames
rm -rf .astro/

# Perform renames
git mv src/content/course/08-module-8 src/content/course/03-module-3

# After renames, before testing
rm -rf .astro/
npm run build
```

**Why necessary:** Astro caches content collection metadata in `.astro/` directory. Stale cache references to old directory names cause "Cannot find module" errors.

### Anti-Patterns to Avoid
- **Incremental commits per directory:** Creates intermediate broken states. Use atomic commits instead.
- **Manual file moves via OS:** Git doesn't track renames properly. Always use `git mv`.
- **Renaming without cache clear:** Leads to cryptic build errors from stale cache references.
- **Skipping build verification:** Broken links or cache issues may not surface until production deployment.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Link validation | Custom broken link checker | astro-link-validator | Integrates with Astro build, handles internal/external/assets, concurrent checking |
| Navigation generation | Hardcoded sidebar config | Automatic discovery from directory structure | Already implemented in navigation.ts, stays in sync |
| Git rename history | cp + rm + git add | git mv | Git's rename detection works better with git mv |
| Cache management | Manual deletion of cache files | rm -rf .astro/ | Astro's official cache location, clean removal |

**Key insight:** Astro's content collection system provides automatic discovery and type safety. Don't fight it with manual configurations - work with the automatic directory-based structure it provides.

## Common Pitfalls

### Pitfall 1: Stale Content Collection Cache
**What goes wrong:** After renaming directories, dev server or build fails with "Cannot find module" errors referencing `.astro/content-assets.mjs`
**Why it happens:** Astro caches content collection metadata indexed by file paths. When directories are renamed, the cache still references old paths that no longer exist.
**How to avoid:** Delete the `.astro/` directory before starting renames and again before building/testing
**Warning signs:** Build errors mentioning `.astro/content-assets.mjs` or "Cannot find module" after file operations

**Source:** [GitHub Issue #13464](https://github.com/withastro/astro/issues/13464)

### Pitfall 2: Git Rename Detection Failure
**What goes wrong:** Git treats renames as delete+add, losing file history and creating massive diffs
**Why it happens:** When content changes are mixed with renames, or when using OS-level moves instead of `git mv`, Git's similarity detection fails
**How to avoid:** Use `git mv` exclusively, keep renames in separate commits from content changes, avoid editing files in the same commit as renames
**Warning signs:** `git status` shows deleted and new files instead of renamed files; `git log --follow` doesn't track history across the rename

**Source:** [Git Move Files: Practical Renames](https://thelinuxcode.com/git-move-files-practical-renames-refactors-and-history-preservation-in-2026/)

### Pitfall 3: Directory Name Collision During Sequential Renames
**What goes wrong:** Attempting to rename 03→04 while 04 still exists causes filesystem collision
**Why it happens:** Sequential renames of a numbered series create temporary conflicts when intermediate numbers overlap
**How to avoid:** Use two-stage renaming: first move all affected directories to temporary names (e.g., 03-temp, 04-temp), then rename to final destinations
**Warning signs:** "Directory already exists" or "Cannot rename" errors during git mv operations

### Pitfall 4: Broken Internal Navigation Links
**What goes wrong:** After successful rename and build, navigation links return 404 errors
**Why it happens:** This is actually NOT expected to happen in this project because navigation uses auto-generated slugs from entry.id, which are based on the current directory structure. However, external bookmarks or cached URLs would break.
**How to avoid:** Run link validation after build; verify dev server navigation manually; check that getCollection() returns correctly structured data
**Warning signs:** Navigation renders but links lead to 404; console errors about missing routes

### Pitfall 5: Case-Sensitivity Issues on macOS/Windows
**What goes wrong:** Renaming from "Module-3" to "module-3" appears to work locally but fails in CI/CD
**Why it happens:** macOS and Windows use case-insensitive filesystems, but Git and Linux (CI/CD) are case-sensitive
**How to avoid:** For case-only changes, use two-step rename: `git mv module-3 temp-dir && git mv temp-dir Module-3`
**Warning signs:** Local build succeeds but GitHub Actions deployment fails; git status shows no changes after case-only rename

## Code Examples

Verified patterns from the project source:

### Module ID Extraction (Current Implementation)
```typescript
// Source: src/utils/navigation.ts (lines 33-36)
function extractModuleId(entryId: string): string {
  const segments = entryId.split('/');
  return segments[0]; // "01-module-1/01-lesson.mdx" → "01-module-1"
}
```

### Navigation Tree Building
```typescript
// Source: src/utils/navigation.ts (lines 47-88)
export async function getNavigationTree(): Promise<NavigationTree> {
  const allEntries = await getCollection('course');
  const publishedEntries = allEntries.filter(entry => {
    const data = entry.data as { draft?: boolean };
    return data.draft !== true;
  });

  const sortedEntries = publishedEntries.sort((a, b) => a.data.order - b.data.order);
  const tree: NavigationTree = new Map();

  for (const entry of sortedEntries) {
    const moduleId = extractModuleId(entry.id);
    // Group lessons by module
    if (!tree.has(moduleId)) {
      tree.set(moduleId, []);
    }
    tree.get(moduleId)!.push({
      title: entry.data.title,
      slug: entry.id.replace(/\/index\.mdx?$/, '').replace(/\.mdx?$/, ''),
      order: entry.data.order,
      difficulty: entry.data.difficulty,
      estimatedTime: entry.data.estimatedTime,
    });
  }

  return tree;
}
```

**Impact of renaming:** When "08-module-8" becomes "03-module-3", `extractModuleId()` automatically returns "03-module-3" as the module ID. The Navigation component then displays "Модуль 03" without code changes.

### Module Header Display
```typescript
// Source: src/components/Navigation.tsx (lines 39-45)
function formatModuleHeader(moduleId: string): string {
  const match = moduleId.match(/^(\d+)/);
  if (match) {
    return `Модуль ${match[1].padStart(2, '0')}`;
  }
  return moduleId;
}
```

**Example:** "03-module-3" → "Модуль 03", "08-module-8" → "Модуль 08"

### Content Collection Configuration
```typescript
// Source: src/content/config.ts
import { defineCollection, z } from 'astro:content';

const courseCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedTime: z.number(),
    topics: z.array(z.string()),
    prerequisites: z.array(z.string()).optional(),
  }),
});

export const collections = {
  course: courseCollection,
};
```

**No changes required:** Schema doesn't reference directory names, only validates frontmatter structure.

### Lesson Frontmatter Example
```yaml
---
title: "GTID Mode Fundamentals"
description: "Understanding MySQL GTID mode"
order: 82
difficulty: "intermediate"
estimatedTime: 20
topics: ["MySQL", "GTID", "Replication"]
---
```

**Update required:** After renaming module 8 to module 3, adjust `order` field values to maintain lesson sequence. Module 3 lessons should have orders in the 30s range, not 80s.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded sidebar configuration | Auto-discovered from directory structure | Project inception | Navigation automatically reflects directory renames |
| `src/content/config.ts` location | `src/content.config.ts` (Astro 5.0) | Dec 2024 | This project still uses old location; consider migration |
| `type: 'content'` loader | `loader: glob()` pattern | Astro 5.0 | This project uses legacy API; works but not latest |
| Manual link checking | astro-link-validator integration | Community tools | Automated broken link detection during build |

**Deprecated/outdated:**
- **Manual sidebar configs**: Astro community moved toward auto-discovery patterns for maintainability
- **Starlight mention in requirements**: This project doesn't use Starlight; it's a custom Astro implementation

## Open Questions

1. **Lesson order field values**
   - What we know: Frontmatter has `order` field used for sorting (e.g., lesson in module 8 has order: 82)
   - What's unclear: Should order values be renumbered to match new module positions (80s → 30s)?
   - Recommendation: Keep existing order values if they work correctly for sorting, or batch-update if visual consistency matters

2. **Progress tracking impact**
   - What we know: Project has progress tracking using lesson slugs stored in localStorage (via progress.ts store)
   - What's unclear: Do stored slugs include directory paths that would break after rename?
   - Recommendation: Test progress tracking after rename; verify that completed lesson markers still work

3. **External bookmarks and shared links**
   - What we know: Renaming changes URLs from `/course/08-module-8/...` to `/course/03-module-3/...`
   - What's unclear: Are there external links, bookmarks, or documentation pointing to old URLs?
   - Recommendation: Consider this acceptable breakage for pre-release content, or implement 301 redirects if needed

## Sources

### Primary (HIGH confidence)
- Project source code analysis:
  - `/src/utils/navigation.ts` - Navigation auto-discovery implementation
  - `/src/components/Navigation.tsx` - Module header formatting and rendering
  - `/src/content/config.ts` - Content collection schema
  - `/src/pages/course/[...slug].astro` - Dynamic routing
- [Astro Content Collections Documentation](https://docs.astro.build/en/guides/content-collections/) - Official Astro docs on content collection organization

### Secondary (MEDIUM confidence)
- [Astro Content Collections: The Complete Guide (2026)](https://inhaq.com/blog/getting-started-with-astro-content-collections/) - Confirmed auto-discovery patterns
- [Content collection cache error when renaming - GitHub Issue #13464](https://github.com/withastro/astro/issues/13464) - Cache invalidation pitfall documented
- [Git Move Files in 2026](https://thelinuxcode.com/git-move-files-in-2026-reliable-renames-clean-history-and-real-world-workflows/) - Git rename best practices

### Tertiary (LOW confidence)
- [Astro Link Validator](https://travis.media/blog/astro-broken-links-validator/) - Community tool for link validation
- [Common mistakes renaming directories](https://core.fiu.edu/blog/2024/be-careful-moving-or-renaming-folders-on-your-website.html) - General web development pitfalls

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified from package.json and project files
- Architecture: HIGH - Directly analyzed source code implementation
- Pitfalls: HIGH - Combination of official issue reports and project-specific analysis

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable domain, but Astro ecosystem moves quickly)
