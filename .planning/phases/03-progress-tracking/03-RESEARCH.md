# Phase 3: Progress Tracking - Research

**Researched:** 2026-01-31
**Domain:** Browser localStorage persistence with nanostores in Astro/React
**Confidence:** HIGH

## Summary

Progress tracking in Astro requires careful integration of client-side storage (localStorage) with the existing nanostores architecture and React islands. The standard approach uses **@nanostores/persistent**, an official nanostores extension that provides automatic localStorage synchronization with cross-tab support and SSR-safe defaults.

The technical domain involves three key concerns: (1) persistent state management using nanostores atoms, (2) SSR-safe hydration patterns to avoid window/localStorage being undefined on server, and (3) export/import functionality for data portability when users clear browser cache.

The project already uses nanostores 1.1.0 for navigation state, making @nanostores/persistent a natural fit. This library handles the complex edge cases (Safari private mode, quota exceeded errors, cross-tab sync) that would otherwise require custom error handling.

**Primary recommendation:** Use @nanostores/persistent with persistentMap for progress data, implement SSR-safe access via useEffect in React components, and provide JSON export/import using Blob download/FileReader upload patterns.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @nanostores/persistent | ^1.2.0 | localStorage persistence for nanostores | Official nanostores extension, 286 bytes, SSR-safe, cross-tab sync built-in |
| nanostores | ^1.1.0 | State management atoms | Already in project for navigation state (Phase 2) |
| @nanostores/react | ^1.0.0 | React integration for nanostores | Already in project, provides useStore hook |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | - | Built-in browser APIs (Blob, FileReader, URL.createObjectURL) sufficient for export/import |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @nanostores/persistent | Custom localStorage wrapper | More code, miss cross-tab sync, have to handle Safari/quota errors manually |
| persistentMap | React useState + useEffect | Doesn't share state across islands, requires duplication per component |
| Blob download | Library like file-saver | Adds dependency for 5 lines of code, unnecessary weight |

**Installation:**
```bash
npm install @nanostores/persistent
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── stores/
│   ├── navigation.ts       # Existing navigation stores
│   └── progress.ts         # NEW: Progress tracking stores
├── components/
│   ├── CourseRoadmap.tsx   # UPDATE: Add progress indicators
│   ├── Navigation.tsx      # UPDATE: Add completion checkmarks
│   └── ProgressExport.tsx  # NEW: Export/import UI component
└── utils/
    └── navigation.ts       # Existing navigation utilities
```

### Pattern 1: Persistent Progress Store
**What:** Create a persistentMap to store lesson completion state with automatic localStorage sync.

**When to use:** Primary pattern for all progress data that needs to persist across sessions.

**Example:**
```typescript
// Source: https://github.com/nanostores/persistent
import { persistentMap } from '@nanostores/persistent';

export interface ProgressData {
  completedLessons: Set<string>; // lesson slugs
  lastUpdated: number; // timestamp
}

// Store completed lessons with automatic localStorage persistence
// Uses 'progress:' prefix for all keys in localStorage
export const $progress = persistentMap<{
  completed: string[]; // Array of lesson slugs (Set not JSON-serializable)
  lastUpdated: number;
}>('progress:', {
  completed: [],
  lastUpdated: Date.now(),
}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Helper functions
export function markLessonComplete(slug: string): void {
  const current = $progress.get();
  if (!current.completed.includes(slug)) {
    $progress.set({
      completed: [...current.completed, slug],
      lastUpdated: Date.now(),
    });
  }
}

export function isLessonComplete(slug: string): boolean {
  return $progress.get().completed.includes(slug);
}

export function getCompletionPercentage(totalLessons: number): number {
  const completed = $progress.get().completed.length;
  return Math.round((completed / totalLessons) * 100);
}
```

### Pattern 2: SSR-Safe React Component Integration
**What:** Use useEffect to access localStorage stores in React islands, preventing hydration errors.

**When to use:** Every React component that needs to read/display progress data.

**Example:**
```typescript
// Source: https://docs.astro.build/en/guides/troubleshooting/ + https://github.com/withastro/astro/issues/4726
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { $progress, getCompletionPercentage } from '../stores/progress';

export function ProgressIndicator({ totalLessons }: { totalLessons: number }) {
  const progress = useStore($progress);
  const [percentage, setPercentage] = useState(0);

  // SSR-safe: Calculate percentage only on client after hydration
  useEffect(() => {
    setPercentage(getCompletionPercentage(totalLessons));
  }, [progress.completed, totalLessons]);

  return (
    <div className="progress-bar">
      <div className="bg-blue-500 h-2 rounded" style={{ width: `${percentage}%` }} />
      <span>{percentage}% Complete</span>
    </div>
  );
}
```

### Pattern 3: Export/Import with Blob Download
**What:** Export progress data as JSON file download, import via file input with FileReader.

**When to use:** Provide data portability when users clear browser cache or switch devices.

**Example:**
```typescript
// Source: https://gist.github.com/shufengh/e331c3d9a91d142dc0786ba6ddc95872
export function exportProgress(): void {
  const data = $progress.get();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `course-progress-${Date.now()}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export function importProgress(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        $progress.set({
          completed: data.completed || [],
          lastUpdated: Date.now(), // Update timestamp on import
        });
        resolve();
      } catch (error) {
        reject(new Error('Invalid progress file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
```

### Pattern 4: Visual Completion Indicators
**What:** Add checkmark icons and styling to completed lessons in roadmap and navigation.

**When to use:** Visual feedback for user progress tracking.

**Example:**
```typescript
// In CourseRoadmap.tsx
import { useStore } from '@nanostores/react';
import { $progress } from '../stores/progress';

function generateFlowchartSyntax(lessons: RoadmapLesson[], completed: string[]): string {
  const lines: string[] = ['flowchart TB'];

  lessons.forEach((lesson, index) => {
    const isComplete = completed.includes(lesson.slug);
    const icon = isComplete ? '✓ ' : '';
    const escapedTitle = (icon + lesson.title).replace(/"/g, '#quot;');
    lines.push(`    N${index}["${escapedTitle}"]`);
  });

  // Style completed nodes differently
  lessons.forEach((lesson, index) => {
    const color = completed.includes(lesson.slug) ? '#10b981' : '#3b82f6'; // green vs blue
    lines.push(`    style N${index} fill:${color},stroke:${color},color:#fff`);
  });

  return lines.join('\n');
}
```

### Anti-Patterns to Avoid
- **Direct localStorage access:** Don't use `localStorage.getItem/setItem` directly. Use @nanostores/persistent for automatic sync and SSR safety.
- **Top-level window access:** Don't access `window.localStorage` at module scope. Always use inside useEffect or nanostores (handles SSR internally).
- **useState for persistent data:** Don't use React useState for data that needs to persist across sessions. It won't survive page reloads.
- **Storing Sets/Maps in JSON:** Don't try to JSON.stringify Sets or Maps. Convert to arrays/objects first.
- **Ignoring quota errors:** Don't assume localStorage.setItem always succeeds. @nanostores/persistent handles this, but custom code needs try/catch.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage persistence | Custom getItem/setItem wrapper | @nanostores/persistent | Handles cross-tab sync, SSR safety, Safari private mode errors, quota exceeded |
| Cross-island state | Props drilling or context | nanostores atoms | Context doesn't work across Astro islands, atoms do |
| JSON export/download | Custom file writing library | Blob + URL.createObjectURL | Built-in browser APIs, zero dependencies |
| File upload/import | Custom file handling | FileReader API | Standard browser API, handles text/binary |
| Progress percentage | Custom calculation | (completed / total) * 100 | Formula is simple, no library needed |

**Key insight:** localStorage seems simple but has many edge cases (quota exceeded, Safari private mode, cross-tab sync, SSR undefined window). @nanostores/persistent solves all of these in 286 bytes.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch from localStorage Access
**What goes wrong:** Component renders different HTML on server vs client because it tries to access localStorage during render, causing "Hydration failed" errors in console.

**Why it happens:** Server-side rendering doesn't have `window` or `localStorage`. If you read from localStorage during component render (outside useEffect), the server generates one HTML structure and the client generates another.

**How to avoid:**
- Always access localStorage inside `useEffect` in React components
- Use `client:load` directive in Astro for components that need localStorage
- Let @nanostores/persistent handle SSR (it returns empty objects on server)

**Warning signs:** Console errors like "Hydration failed because the initial UI does not match what was rendered on the server" or "window is not defined".

### Pitfall 2: Safari Private Browsing Throws Errors
**What goes wrong:** In Safari private browsing mode, `localStorage.setItem()` throws a `QuotaExceededError` even for tiny amounts of data.

**Why it happens:** Safari treats localStorage and cookies the same in private mode. If cookies are blocked, localStorage throws errors.

**How to avoid:**
- Wrap localStorage access in try/catch blocks
- @nanostores/persistent handles this internally
- Provide fallback behavior (in-memory storage) when localStorage unavailable

**Warning signs:** App crashes in Safari private mode, "QuotaExceededError: The quota has been exceeded" in console.

### Pitfall 3: Storing Non-Serializable Data
**What goes wrong:** Trying to store Sets, Maps, or Dates directly in localStorage fails silently or produces wrong results.

**Why it happens:** JSON.stringify converts Sets to `{}`, Maps to `{}`, and Dates to strings. On parse, you get back plain objects/strings, not the original types.

**How to avoid:**
- Convert Sets to arrays: `Array.from(set)` before storing
- Convert Maps to objects or arrays of entries
- Store dates as timestamps (number) or ISO strings
- Convert back to proper types when reading

**Warning signs:** Progress data looks correct in localStorage but doesn't work in code, or `instanceof Set` returns false.

### Pitfall 4: Forgetting Cross-Tab Synchronization
**What goes wrong:** User opens course in two tabs, marks lesson complete in tab A, but tab B doesn't update until page refresh.

**Why it happens:** localStorage changes don't automatically trigger React re-renders. Without listening to `storage` events, tabs are out of sync.

**How to avoid:**
- Use @nanostores/persistent (has cross-tab sync built-in via `listen: true` by default)
- If custom implementation, listen to `window.addEventListener('storage', ...)`

**Warning signs:** Multiple tabs showing different progress states, users report "progress not saving" when they have multiple tabs open.

### Pitfall 5: Not Handling Export/Import Validation
**What goes wrong:** User uploads random JSON file (or corrupted export), app crashes or corrupts existing progress.

**Why it happens:** FileReader doesn't validate JSON structure, it just reads the file. Invalid data gets written to store.

**How to avoid:**
- Validate JSON structure before calling `$progress.set()`
- Check for required fields (`completed` array, `lastUpdated` number)
- Provide user-friendly error messages
- Consider versioning export format for future compatibility

**Warning signs:** App crashes when importing, progress resets unexpectedly, console errors about undefined properties.

### Pitfall 6: localStorage Quota Exceeded
**What goes wrong:** After storing lots of progress data, `setItem` starts failing silently or throwing errors.

**Why it happens:** localStorage has ~5-10MB limit per origin. Large courses with metadata can exceed this.

**How to avoid:**
- Store only essential data (lesson slugs, not full metadata)
- Monitor storage usage: `JSON.stringify(localStorage).length`
- Provide warning when approaching limit
- @nanostores/persistent catches quota errors, but won't fix the problem

**Warning signs:** Progress stops saving for some users, "QuotaExceededError" in console, app works on desktop but fails on mobile (smaller quotas).

## Code Examples

Verified patterns from official sources:

### Create Progress Store
```typescript
// src/stores/progress.ts
// Source: https://github.com/nanostores/persistent
import { persistentMap } from '@nanostores/persistent';

export const $progress = persistentMap<{
  completed: string[];
  lastUpdated: number;
}>('progress:', {
  completed: [],
  lastUpdated: Date.now(),
});

export function toggleLessonComplete(slug: string): void {
  const current = $progress.get();
  const completed = current.completed.includes(slug)
    ? current.completed.filter(s => s !== slug)
    : [...current.completed, slug];

  $progress.set({
    completed,
    lastUpdated: Date.now(),
  });
}
```

### SSR-Safe Component with Progress
```typescript
// src/components/ProgressIndicator.tsx
// Source: https://docs.astro.build/en/guides/troubleshooting/
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { $progress } from '../stores/progress';

export function ProgressIndicator({ totalLessons }: { totalLessons: number }) {
  const progress = useStore($progress);
  const [mounted, setMounted] = useState(false);

  // Ensure client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-2 bg-gray-700 rounded" />; // SSR placeholder
  }

  const percentage = Math.round((progress.completed.length / totalLessons) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-400">Course Progress</span>
        <span className="text-sm text-gray-400">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {progress.completed.length} of {totalLessons} lessons completed
      </p>
    </div>
  );
}
```

### Export/Import Component
```typescript
// src/components/ProgressExport.tsx
// Source: https://gist.github.com/shufengh/e331c3d9a91d142dc0786ba6ddc95872
import { useRef } from 'react';
import { $progress } from '../stores/progress';

export function ProgressExport() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = $progress.get();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `course-progress-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate structure
      if (!Array.isArray(data.completed)) {
        throw new Error('Invalid progress format');
      }

      $progress.set({
        completed: data.completed,
        lastUpdated: Date.now(),
      });

      alert('Progress imported successfully!');
    } catch (error) {
      alert('Failed to import progress. Please check the file format.');
      console.error('Import error:', error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export Progress
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Download your progress as a JSON file
        </p>
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="progress-import"
        />
        <label
          htmlFor="progress-import"
          className="cursor-pointer px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 inline-block"
        >
          Import Progress
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Restore progress from a JSON file
        </p>
      </div>
    </div>
  );
}
```

### Checkbox for Manual Completion
```typescript
// src/components/LessonCompleteButton.tsx
import { useStore } from '@nanostores/react';
import { $progress, toggleLessonComplete } from '../stores/progress';

export function LessonCompleteButton({ slug }: { slug: string }) {
  const progress = useStore($progress);
  const isComplete = progress.completed.includes(slug);

  return (
    <button
      onClick={() => toggleLessonComplete(slug)}
      className={`flex items-center gap-2 px-4 py-2 rounded ${
        isComplete
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-gray-600 hover:bg-gray-700'
      } text-white transition-colors`}
    >
      {isComplete ? '✓ Completed' : 'Mark as Complete'}
    </button>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual localStorage.setItem/getItem | @nanostores/persistent | Available since 2021, widely adopted by 2024 | Automatic cross-tab sync, SSR safety, less boilerplate |
| React Context for shared state | nanostores atoms | Recommended for Astro since 2022 | Works across island boundaries, Context doesn't |
| file-saver library for downloads | Blob + URL.createObjectURL | Native APIs mature ~2020 | Zero dependencies, smaller bundle |
| Custom storage events | Built-in to @nanostores/persistent | v1.0.0+ (2021) | Less code, automatic synchronization |
| useSyncExternalStore | Direct useStore from @nanostores/react | Available 2022+ | Simpler API, automatic subscriptions |

**Deprecated/outdated:**
- **localStorage wrappers without SSR checks:** Modern frameworks (Astro, Next.js, Remix) require SSR-safe patterns
- **Synchronous file downloads with data URIs:** Modern approach uses Blob URLs for better memory management
- **jQuery plugins for localStorage:** Modern React/framework patterns replaced these entirely

## Open Questions

Things that couldn't be fully resolved:

1. **Exact quota limits per browser**
   - What we know: Typically 5-10MB per origin, varies by browser
   - What's unclear: Exact limits for Safari iOS, Chrome Android in 2026
   - Recommendation: Store only slugs (strings), monitor with `JSON.stringify(localStorage).length`, warn at 4MB

2. **Best practice for completion criteria**
   - What we know: Manual checkbox is clear but not automatic
   - What's unclear: Should scrolling to bottom auto-complete? Time spent on page?
   - Recommendation: Start with manual checkbox (PLAT-03 requires it), defer auto-complete to future enhancement

3. **Migration strategy if storage format changes**
   - What we know: Can version the export format with `{ version: 1, data: {...} }`
   - What's unclear: How to handle backward compatibility in future phases
   - Recommendation: Keep simple for Phase 3 (no versioning yet), add if schema changes in Phase 4+

4. **Mermaid flowchart checkmark rendering**
   - What we know: Can prepend text like "✓ Lesson Title" to node labels
   - What's unclear: Does Mermaid support custom icons or only Unicode characters?
   - Recommendation: Use Unicode checkmark (✓) for now, verify rendering in implementation

## Sources

### Primary (HIGH confidence)
- @nanostores/persistent GitHub: https://github.com/nanostores/persistent - Complete API documentation, version 1.2.0
- MDN localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage - Browser compatibility, security, persistence behavior
- Astro Troubleshooting: https://docs.astro.build/en/guides/troubleshooting/ - SSR hydration patterns
- Astro Sharing State Recipe: https://docs.astro.build/en/recipes/sharing-state-islands/ - Official nanostores integration guide

### Secondary (MEDIUM confidence)
- localStorage export/import pattern: https://gist.github.com/shufengh/e331c3d9a91d142dc0786ba6ddc95872 - Verified pattern used in multiple projects
- React localStorage SSR patterns: Multiple sources (LogRocket, Josh Comeau, custom hook examples) agree on useEffect pattern
- Progress percentage formula: Standard formula verified across project management tools

### Tertiary (LOW confidence - marked for validation)
- Mermaid checkmark rendering: No official documentation found, needs testing in implementation phase
- Exact browser quota limits in 2026: Sources cite 5-10MB but don't provide current browser-specific data

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @nanostores/persistent is official library, well-documented, current version verified
- Architecture: HIGH - Patterns verified from official Astro docs, nanostores examples, and MDN
- Pitfalls: HIGH - Documented in GitHub issues, MDN security notes, and multiple developer blog posts

**Research date:** 2026-01-31
**Valid until:** 2026-03-02 (30 days - stable domain, nanostores API is mature)
