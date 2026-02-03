# Quick Task 008: Module 0 Intro & About Page

**Completed:** 2026-02-03

## What Was Done

1. **Renamed Module 0** from "Как пользоваться" to "Введение в курс"
   - Updated `src/utils/moduleNames.ts`

2. **Renumbered existing lessons** (01→02, 02→03, 03→04, 04→05)
   - `02-course-navigation.mdx` (was 01, order: 2)
   - `03-progress-tracking.mdx` (was 02, order: 3)
   - `04-lab-environment.mdx` (was 03, order: 4)
   - `05-course-structure.mdx` (was 04, order: 5)

3. **Created new first lesson** `01-about-course.mdx` with:
   - AI generation disclaimer
   - Contact info (Telegram @levoely)
   - Donation links with icons:
     - Boosty (boosty.to/levoely)
     - Patreon (patreon.com/Levoely)
     - TON crypto wallet
   - Telegram channel link (@levoely_channel)

## Files Changed

- `src/utils/moduleNames.ts` - Module name updated
- `src/content/course/00-module-0/01-about-course.mdx` - New file
- `src/content/course/00-module-0/02-course-navigation.mdx` - Renamed, order updated
- `src/content/course/00-module-0/03-progress-tracking.mdx` - Renamed, order updated
- `src/content/course/00-module-0/04-lab-environment.mdx` - Renamed, order updated
- `src/content/course/00-module-0/05-course-structure.mdx` - Renamed, order updated
