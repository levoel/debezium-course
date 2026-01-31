# Quick Task 001: Fix Hamburger Navigation

**Task:** Fix hamburger menu showing both "Модуль 01" and "Module-1"

**Duration:** 2 min
**Completed:** 2026-02-01
**Commit:** 19f5ea8

## Problem

The navigation sidebar was showing two entries:
- "Модуль 01" (from `01-intro/` directory)
- "module-1" raw (from `module-1/` directory which didn't match the numeric prefix pattern)

## Root Cause

1. `01-intro/` was a sample lesson from Phase 1 that was never removed
2. Phase 5 created lessons in `module-1/` instead of `01-module-1/`
3. `formatModuleHeader()` in Navigation.tsx expected numeric prefix like `01-*` to show "Модуль 01"

## Solution

1. Removed obsolete `01-intro/` sample content (superseded by Module 1 lessons)
2. Renamed `module-1/` to `01-module-1/` to follow numeric prefix convention

## Files Changed

- Deleted: `src/content/course/01-intro/index.mdx`
- Renamed: `src/content/course/module-1/` → `src/content/course/01-module-1/`

## Verification

- `npm run build` passes
- Navigation shows single "Модуль 01" with 6 lessons
