# Quick Task 002: Remove Course Roadmap

**Task:** Remove course roadmap (duplicates lesson navigation)

**Duration:** 1 min
**Completed:** 2026-02-01
**Commit:** 642fe5f

## Problem

The homepage had two ways to navigate lessons:
1. CourseRoadmap - interactive Mermaid diagram
2. Lesson cards grid - list with descriptions, difficulty badges, and time estimates

The roadmap duplicated information already available in the lesson cards.

## Solution

1. Removed CourseRoadmap import from `src/pages/index.astro`
2. Removed roadmapLessons preparation code
3. Removed CourseRoadmap component usage
4. Deleted `src/components/CourseRoadmap.tsx`

## Files Changed

- Modified: `src/pages/index.astro` (removed roadmap)
- Deleted: `src/components/CourseRoadmap.tsx`

## Verification

- `npm run build` passes
- Homepage shows lesson cards without duplicate roadmap
