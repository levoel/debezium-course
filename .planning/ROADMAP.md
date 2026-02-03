# Roadmap: Debezium Course v1.5

## Current Milestone: v1.5 Onboarding & Polish

**Goal:** Improve onboarding for new users and enhance visual quality of content
**Phases:** 38-40
**Requirements:** 7

---

### Phase 38: Module 0 - Platform Guide

**Goal:** New users understand how to navigate the platform and get started

**Dependencies:** None

**Requirements:** ONB-01, ONB-02, ONB-03, ONB-04

**Success Criteria:**

1. User landing on the course for the first time can find Module 0 in the sidebar and homepage
2. User can read clear explanations of sidebar navigation and homepage accordion menu
3. User understands the progress tracking system (checkboxes, localStorage persistence)
4. User knows the recommended learning path through the course structure
5. User has a quick reference for Docker lab setup requirements before Module 1

**Details:**

Create a new Module 0 "How to Use This Platform" with 4 lessons:
- Lesson 1: Course Navigation (sidebar, homepage accordion, module structure)
- Lesson 2: Progress Tracking (checkboxes, localStorage, what happens if cleared)
- Lesson 3: Lab Environment Intro (Docker requirements, what to expect in Module 1)
- Lesson 4: Course Structure & Learning Path (8 modules overview, recommended path)

Module 0 should be visually distinct (onboarding vs content) and appear first in sidebar.

---

### Phase 39: GitHub Repository Link

**Goal:** Users can easily access the course source code repository

**Dependencies:** None (can run in parallel with Phase 38)

**Requirements:** ONB-05

**Success Criteria:**

1. User can see a GitHub link in the site header or footer
2. Link opens the correct repository in a new tab
3. Link is visible on all pages (lessons, homepage)
4. Link has appropriate icon and styling consistent with glass design

**Details:**

Add GitHub repository link to the site. Options:
- Header: GitHub icon next to title
- Footer: Full link with icon
- Both locations for visibility

Implementation considerations:
- Use existing glass styling for consistency
- Include GitHub SVG icon (Lucide or custom)
- Link should be accessible (aria-label)

---

### Phase 40: Module Summaries Extraction

**Goal:** Module summaries become standalone mini-lessons with enhanced glass styling

**Dependencies:** Phase 38 (Module 0 must exist first to maintain lesson numbering)

**Requirements:** STRUCT-01, STYLE-01

**Success Criteria:**

1. Each of the 8 modules has a dedicated "Module Summary" mini-lesson as the last item
2. Summary mini-lessons are navigable from sidebar and appear in progress tracking
3. Summary mini-lessons have distinctive glass styling (different from regular lessons)
4. Content from "Key Takeaways" sections is properly migrated to summary lessons
5. Summary lessons include links to next module for learning flow continuity

**Details:**

For each module (1-8):
1. Create new summary lesson file: `XX-module-X-summary.mdx`
2. Extract "Key Takeaways" content from module lessons
3. Add glass-styled card layout for summary content
4. Include "What's Next" section linking to next module
5. Update sidebar config to show summary as last lesson in each module

Glass styling for summaries:
- Use `glass-card` component with enhanced blur
- Bullet points with glass icons
- Optional: glassmorphism dividers between sections

---

## Progress

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 38 | Module 0 - Platform Guide | Complete | 1/1 |
| 39 | GitHub Repository Link | Complete | 1/1 |
| 40 | Module Summaries Extraction | Complete | 1/1 |

---

## Coverage

| Requirement | Phase | Description |
|-------------|-------|-------------|
| ONB-01 | 38 | Module 0 navigation explanation (sidebar, roadmap) |
| ONB-02 | 38 | Module 0 progress system explanation (localStorage, checkboxes) |
| ONB-03 | 38 | Module 0 Docker lab setup intro |
| ONB-04 | 38 | Module 0 course structure overview and learning path |
| ONB-05 | 39 | GitHub repository link in header/footer |
| STRUCT-01 | 40 | Extract module summaries to mini-lessons (8 modules) |
| STYLE-01 | 40 | Glass styling for module summary mini-lessons |

**Coverage:** 7/7 requirements mapped

---

*Roadmap created: 2026-02-03*
*Last updated: 2026-02-03*
