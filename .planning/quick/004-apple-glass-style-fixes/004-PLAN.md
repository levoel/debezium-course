---
phase: quick
plan: 004
type: execute
wave: 1
depends_on: []
files_modified:
  - src/styles/global.css
  - src/components/ProgressIndicator.tsx
  - src/components/ProgressExport.tsx
  - src/components/Navigation.tsx
  - src/pages/course/[...slug].astro
  - src/layouts/BaseLayout.astro
autonomous: true
---

<objective>
Fix UI styling to match Apple liquid glass aesthetic across progress bars, buttons, completion indicators, topic tags, and content centering.

Purpose: Unify visual design language with established glass system, replacing bright/saturated colors with muted pastels.
Output: Cohesive glass UI with softer colors and proper content centering.
</objective>

<execution_context>
@/Users/levoely/.claude/get-shit-done/workflows/execute-plan.md
@/Users/levoely/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/styles/global.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Glass progress bar and buttons</name>
  <files>
    src/styles/global.css
    src/components/ProgressIndicator.tsx
    src/components/ProgressExport.tsx
  </files>
  <action>
1. Add glass button utility class to global.css:
   ```css
   .glass-button {
     background: rgba(255, 255, 255, 0.08);
     -webkit-backdrop-filter: blur(8px);
     backdrop-filter: blur(var(--glass-blur-sm));
     border: 1px solid rgba(255, 255, 255, 0.15);
     border-radius: 10px;
     transition: background 0.2s ease, transform 0.15s ease;
   }
   .glass-button:hover {
     background: rgba(255, 255, 255, 0.12);
     transform: translateY(-1px);
   }
   .glass-button-blue {
     background: rgba(100, 150, 255, 0.15);
     border-color: rgba(100, 150, 255, 0.25);
   }
   .glass-button-blue:hover {
     background: rgba(100, 150, 255, 0.22);
   }
   .glass-button-red {
     background: rgba(255, 100, 100, 0.12);
     border-color: rgba(255, 100, 100, 0.2);
   }
   .glass-button-red:hover {
     background: rgba(255, 100, 100, 0.18);
   }
   ```

2. Update ProgressIndicator.tsx:
   - Progress bar track: change `bg-gray-700` to glass style with `bg-white/5 backdrop-blur-sm border border-white/10`
   - Progress bar fill: change `bg-blue-500` to muted `bg-blue-400/60` with subtle gradient
   - Keep text colors as-is (already muted grays)

3. Update ProgressExport.tsx buttons:
   - Export button: replace `bg-blue-600 hover:bg-blue-700` with `glass-button glass-button-blue text-blue-200`
   - Import button: replace `bg-gray-600 hover:bg-gray-500` with `glass-button text-gray-200`
   - Reset button: replace `bg-red-600 hover:bg-red-700` with `glass-button glass-button-red text-red-200`
   - Remove existing transition-colors (glass-button handles it)
  </action>
  <verify>
    npm run build && npm run preview
    Visual check: buttons appear glass-like with soft tints, progress bar has subtle glass effect
  </verify>
  <done>
    - Progress bar uses glass background with muted blue fill
    - All three buttons (Export/Import/Reset) use glass styling with soft color tints
    - No harsh saturated colors remain
  </done>
</task>

<task type="auto">
  <name>Task 2: Muted completion indicators and glass topic tags</name>
  <files>
    src/components/Navigation.tsx
    src/pages/course/[...slug].astro
  </files>
  <action>
1. Update Navigation.tsx - mute green completion text:
   - Line 121: change `text-green-400` to `text-emerald-300/70` (muted emerald)
   - Line 165: change `text-green-400` to `text-emerald-300/70` (checkmark icon)

2. Update [...slug].astro - glass topic tags:
   - Line 109: replace `bg-gray-700 rounded text-xs text-gray-200` with:
     `glass-panel px-2 py-1 text-xs text-gray-200`
   - But glass-panel has 16px border-radius which is too large for tags
   - Instead use inline glass: `bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-2 py-1 text-xs text-gray-300`
  </action>
  <verify>
    npm run build && npm run preview
    - Check sidebar: green "1/6" completion counts should be softer/muted
    - Check lesson page: topic tags should have subtle glass appearance
  </verify>
  <done>
    - Green completion indicators use muted emerald-300/70 instead of bright green-400
    - Topic tags have glass styling (blur, low opacity bg, soft border)
  </done>
</task>

<task type="auto">
  <name>Task 3: Center course content area</name>
  <files>src/layouts/BaseLayout.astro</files>
  <action>
Update BaseLayout.astro line 77-79:
- Current: `<main class="flex-1 px-4 md:px-8 lg:px-12 py-8"><div class="max-w-4xl">`
- The content is left-aligned within the main area
- Change to center the max-w-4xl container:
  `<main class="flex-1 px-4 md:px-8 lg:px-12 py-8"><div class="max-w-4xl mx-auto">`

This adds `mx-auto` to horizontally center the content container.
  </action>
  <verify>
    npm run build && npm run preview
    - Navigate to any lesson page
    - Content should be horizontally centered in the main area (right of sidebar)
  </verify>
  <done>
    - Course content area is horizontally centered within its container
    - Content no longer appears off-center/left-aligned
  </done>
</task>

</tasks>

<verification>
1. Run `npm run build` - no TypeScript or build errors
2. Run `npm run preview` and check:
   - Homepage sidebar: progress bar has glass styling
   - Homepage sidebar: buttons have glass styling with soft color tints
   - Sidebar navigation: green completion counts are muted (not bright)
   - Any lesson page: topic tags have glass appearance
   - Any lesson page: content is centered in the main area
3. Visual consistency: all modified elements match Apple liquid glass aesthetic
</verification>

<success_criteria>
- Progress bar: glass track with muted blue fill
- All buttons: glass styling with soft color tints (blue/gray/red)
- Completion indicators: muted emerald instead of bright green
- Topic tags: glass styling matching other UI elements
- Content: horizontally centered in main area
- No build errors or visual regressions
</success_criteria>

<output>
After completion, create `.planning/quick/004-apple-glass-style-fixes/004-SUMMARY.md`
</output>
