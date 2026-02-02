---
quick: 005
type: bugfix
files_modified:
  - src/pages/course/[...slug].astro
autonomous: true
estimated_context: 15%
---

<objective>
Fix lesson navigation buttons that incorrectly navigate to different modules instead of sequential lessons within the same module.

**Root cause:** The `sortedLessons` array sorts by `a.data.order - b.data.order`, but `order` is per-module (resets to 1, 2, 3... in each module). Lessons with the same order number from different modules get mixed, causing prev/next navigation to jump between modules.

**Fix:** Sort by `entry.id` which has format `01-module-1/01-cdc-fundamentals.mdx` - the module prefix and filename ordering ensures correct global sequence.
</objective>

<context>
@src/pages/course/[...slug].astro (line 33 - the buggy sort)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix lesson sorting logic</name>
  <files>src/pages/course/[...slug].astro</files>
  <action>
On line 33, change the sort from:
```javascript
const sortedLessons = allLessons.sort((a, b) => a.data.order - b.data.order);
```
To:
```javascript
const sortedLessons = allLessons.sort((a, b) => a.id.localeCompare(b.id));
```

This uses the collection entry `id` which has format like `01-module-1/01-cdc-fundamentals.mdx`. String comparison via `localeCompare` will:
1. First sort by module prefix (01, 02, 03...)
2. Then by lesson filename within each module (01-*, 02-*, 03-*...)

This ensures lessons stay sequential within their modules during navigation.
  </action>
  <verify>
1. `npm run build` completes without errors
2. Manual test: Navigate to any lesson, click prev/next buttons - should stay within same module until reaching module boundaries
  </verify>
  <done>
Lesson navigation prev/next buttons navigate to sequential lessons within the same module, only crossing to adjacent modules at module boundaries.
  </done>
</task>

</tasks>

<verification>
- Build succeeds: `npm run build`
- Dev server starts: `npm run dev`
- Navigation test: Go to middle lesson in Module 2, verify prev goes to earlier Module 2 lesson (not Module 1)
</verification>

<success_criteria>
- Single line change on line 33 of [...slug].astro
- Lesson navigation follows correct sequence: all Module 1 lessons, then all Module 2 lessons, etc.
- No regressions in other functionality
</success_criteria>

<output>
After completion, create `.planning/quick/005-fix-lesson-navigation-buttons/005-SUMMARY.md`
</output>
