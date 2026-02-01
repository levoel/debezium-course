# Phase 25 Verification Checklist

**Created:** 2026-02-01
**Last Verified:** ____________________

## Overview

This checklist documents manual verification workflows for Phase 25 success criteria that cannot be fully automated. Complete each section and check off items as verified.

Automated tests (Playwright, axe-core) catch approximately 57% of accessibility issues. The remaining 43% require manual verification, especially for:
1. Glass effect performance on mobile GPUs
2. Safari-specific rendering with hardcoded webkit values
3. Contrast on semi-transparent glass backgrounds

---

## 1. Mobile Performance Verification

### Workflow: Chrome DevTools Mobile Emulation

**Prerequisites:**
- Site running locally: `npm run preview`
- Chrome browser open to `http://localhost:4321/debezium-course/`

**Steps:**
1. Open Chrome DevTools (Cmd+Option+I / Ctrl+Shift+I)
2. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
3. Select device: "iPhone 12 Pro" (representative mobile GPU)
4. Open Performance tab → Settings (gear icon) → CPU: 4x slowdown
5. Open Performance monitor (Cmd+Shift+P → "Show Performance Monitor")
6. Ensure "Frames per second" and "GPU memory" metrics are visible

**Test Scenarios:**

| # | Scenario | Steps | Expected FPS | Pass/Fail |
|---|----------|-------|--------------|-----------|
| 1 | Homepage scroll through module accordions | Scroll up/down rapidly | >= 60fps | [ ] |
| 2 | Expand accordion item | Click "01. Введение в CDC" | >= 60fps | [ ] |
| 3 | Collapse accordion item | Click same accordion header | >= 60fps | [ ] |
| 4 | Navigate to lesson page | Click any lesson link | >= 60fps | [ ] |
| 5 | Scroll lesson content with glass sidebar | Scroll lesson content | >= 60fps | [ ] |
| 6 | Hover over glass cards | Move mouse across cards | >= 60fps | [ ] |

**Verification Notes:**
- FPS should stay green (>= 60) in Performance Monitor
- If yellow/red (<60fps) observed, document which interaction caused it
- Minor dips during initial page render are acceptable; sustained drops are not
- GPU memory should remain stable (no continuous increase)

### Checklist

- [ ] iPhone 12 Pro emulation configured
- [ ] CPU 4x throttling enabled during tests
- [ ] Performance Monitor shows sustained 60fps during scroll
- [ ] Performance Monitor shows sustained 60fps during accordion interactions
- [ ] No GPU memory warnings in Performance tab
- [ ] All 6 test scenarios pass (>= 60fps)

**Notes (if any issues found):**
```
[Record any performance issues or observations here]
```

---

## 2. Cross-Browser Verification

### 2.1 Chrome (macOS/Windows)

**Test URL:** `http://localhost:4321/debezium-course/`
**Browser version:** ________________

| # | Test | How to Verify | Expected | Status |
|---|------|---------------|----------|--------|
| 1 | Glass blur renders on homepage | Visual inspection of module accordion | Blur visible on glass cards | [ ] |
| 2 | Glass sidebar renders on lesson pages | Navigate to any lesson | Blur visible on left sidebar | [ ] |
| 3 | CSS variables work | Inspect .glass-panel → Computed → backdrop-filter | Shows blur(10px) from var() | [ ] |
| 4 | Hover effects work on glass cards | Hover over accordion items | Card lifts up (-2px translateY) | [ ] |
| 5 | No console errors | Open Console tab | No errors related to glass/CSS | [ ] |

### 2.2 Firefox (macOS/Windows)

**Test URL:** `http://localhost:4321/debezium-course/`
**Browser version:** ________________

| # | Test | How to Verify | Expected | Status |
|---|------|---------------|----------|--------|
| 1 | Glass blur renders on homepage | Visual inspection of module accordion | Blur visible on glass cards | [ ] |
| 2 | Glass sidebar renders on lesson pages | Navigate to any lesson | Blur visible on left sidebar | [ ] |
| 3 | backdrop-filter applied | Inspect element → Computed | backdrop-filter: blur(...) | [ ] |
| 4 | Hover effects work on glass cards | Hover over accordion items | Card lifts up (-2px translateY) | [ ] |
| 5 | No console errors | Open Console tab | No errors related to glass/CSS | [ ] |

**Note:** `prefers-reduced-transparency` requires `about:config` flag in Firefox. This is expected behavior per Mozilla implementation status.

### 2.3 Safari (macOS)

**Test URL:** `http://localhost:4321/debezium-course/`
**Browser version:** ________________

| # | Test | How to Verify | Expected | Status |
|---|------|---------------|----------|--------|
| 1 | Glass blur renders on homepage | Visual inspection | Blur visible (hardcoded webkit values) | [ ] |
| 2 | Glass sidebar renders on lesson pages | Navigate to any lesson | Blur visible on left sidebar | [ ] |
| 3 | webkit prefix has hardcoded blur | Inspect .glass-panel → Computed | -webkit-backdrop-filter: blur(10px) | [ ] |
| 4 | NOT using CSS variable | Inspect same element | Should NOT show blur(var(...)) | [ ] |
| 5 | Mobile Safari viewport test | Enable Responsive Design Mode | Blur visible at mobile width | [ ] |
| 6 | Hover effects work on glass cards | Hover over accordion items | Card lifts up (-2px translateY) | [ ] |
| 7 | No console errors | Open Console tab | No webkit-related errors | [ ] |

**Critical Safari Check (Plan 25-01 Verification):**
1. Inspect any `.glass-panel` element
2. View Computed styles
3. Find `-webkit-backdrop-filter` property
4. **MUST show:** `blur(10px)` (hardcoded value)
5. **MUST NOT show:** `blur(var(--glass-blur-md))` (CSS variable - broken in Safari)

- [ ] Safari webkit hardcoded values verified (not CSS variables)

### Cross-Browser Summary

| Browser | Glass Effects | Hover Effects | No Errors | Pass |
|---------|--------------|---------------|-----------|------|
| Chrome | [ ] | [ ] | [ ] | [ ] |
| Firefox | [ ] | [ ] | [ ] | [ ] |
| Safari | [ ] | [ ] | [ ] | [ ] |

---

## 3. Contrast Verification (WCAG 4.5:1)

### Workflow: Chrome DevTools Contrast Checker

**Method A - DevTools Color Picker:**
1. Right-click on text element → Inspect
2. In Styles panel, find the `color` property
3. Click on the color swatch (colored square)
4. DevTools shows "Contrast ratio: X.XX"
5. Checkmark (check) = WCAG AA pass (>= 4.5:1)

**Method B - WebAIM Contrast Checker:**
1. Open https://webaim.org/resources/contrastchecker/
2. Use browser's color picker to sample foreground (text) color
3. Sample background color (screenshot and pick from glass over gradient)
4. Enter values and verify ratio >= 4.5:1

### Glass Component Contrast Tests

Test each component on the homepage and lesson pages:

| # | Component | Location | Text Color | Expected Ratio | Measured Ratio | Pass (4.5:1+) |
|---|-----------|----------|------------|----------------|----------------|---------------|
| 1 | Module accordion title | Homepage | rgba(255,255,255,0.95) | >= 4.5:1 | __:1 | [ ] |
| 2 | Module description text | Homepage (expanded) | rgba(255,255,255,0.7) | >= 4.5:1 | __:1 | [ ] |
| 3 | Lesson link text | Homepage (expanded accordion) | text-gray-200 | >= 4.5:1 | __:1 | [ ] |
| 4 | Sidebar module name | Lesson page sidebar | rgba(255,255,255,0.9) | >= 4.5:1 | __:1 | [ ] |
| 5 | Sidebar lesson link | Lesson page sidebar | text-gray-300 | >= 4.5:1 | __:1 | [ ] |
| 6 | Progress panel text | Homepage | rgba(255,255,255,0.9) | >= 4.5:1 | __:1 | [ ] |
| 7 | Table header text | Lesson (if has table) | rgba(255,255,255,0.95) | >= 4.5:1 | __:1 | [ ] |
| 8 | Table cell text | Lesson (if has table) | rgba(255,255,255,0.9) | >= 4.5:1 | __:1 | [ ] |

**Important Notes:**
- Glass backgrounds are semi-transparent over dynamic gradient
- Sample the ACTUAL rendered composite color, not just the CSS value
- Test in multiple scroll positions if background gradient shifts
- If any ratio < 4.5:1, document and flag for remediation

### Contrast Checklist

- [ ] All module accordion text meets 4.5:1 contrast
- [ ] All sidebar text meets 4.5:1 contrast
- [ ] All table text meets 4.5:1 contrast (if applicable)
- [ ] Progress panel text meets 4.5:1 contrast
- [ ] No text fails WCAG AA contrast requirements

**Issues Found (if any):**
```
[List any contrast failures with component name, measured ratio, and location]
```

---

## 4. Accessibility Media Query Verification

### 4.1 prefers-reduced-transparency

**Chrome DevTools Emulation:**
1. Open DevTools → Cmd+Shift+P → "Show Rendering"
2. Scroll to "Emulate CSS media feature prefers-reduced-transparency"
3. Set to "reduce"
4. Refresh page (or observe live changes)

**Expected Behavior (per global.css lines 94-115):**
- Glass opacity increases to 0.95 (nearly opaque)
- Backdrop blur is completely disabled
- All text remains readable with solid backgrounds

| # | Test | Expected Behavior | Status |
|---|------|-------------------|--------|
| 1 | Glass panels become opaque | Background opacity ~0.95 | [ ] |
| 2 | Backdrop blur disabled | Inspect shows backdrop-filter: none | [ ] |
| 3 | Sidebar becomes opaque | Background: rgba(20, 20, 30, 0.98) | [ ] |
| 4 | Tables lose glass effect | Inspect shows backdrop-filter: none | [ ] |
| 5 | All text remains readable | Contrast maintained or improved | [ ] |

### 4.2 prefers-reduced-motion

**Chrome DevTools Emulation:**
1. Open DevTools → Cmd+Shift+P → "Show Rendering"
2. Scroll to "Emulate CSS media feature prefers-reduced-motion"
3. Set to "reduce"
4. Refresh page

**Expected Behavior (per global.css lines 117-125):**
- Glass card hover animation disabled (no lift effect)
- All CSS transitions become instant

| # | Test | Expected Behavior | Status |
|---|------|-------------------|--------|
| 1 | Glass card hover: no animation | Hover doesn't animate, instant change | [ ] |
| 2 | Accordion expand: no animation | Instant expand/collapse | [ ] |
| 3 | Inspect transition property | Shows transition: none | [ ] |

### Media Query Checklist

- [ ] prefers-reduced-transparency: opacity increases, blur disabled
- [ ] prefers-reduced-transparency: all text readable
- [ ] prefers-reduced-motion: hover animations disabled
- [ ] prefers-reduced-motion: accordion animations disabled
- [ ] Both preferences can be enabled simultaneously

---

## 5. Lighthouse Accessibility Audit

### Workflow

1. Open Chrome DevTools → Lighthouse tab
2. Categories: Select ONLY "Accessibility" (deselect Performance, Best Practices, SEO)
3. Device: Select "Mobile"
4. Click "Analyze page load"

### Homepage Audit

**URL:** `http://localhost:4321/debezium-course/`

| Metric | Score | Pass (>= 90) |
|--------|-------|--------------|
| Accessibility Score | [ ] /100 | [ ] |

**Violations Found:**

| # | Issue | Elements Affected | Impact | Fix Required |
|---|-------|-------------------|--------|--------------|
| 1 | (example: Missing alt text) | (element selector) | (critical/serious/moderate/minor) | [ ] |
| 2 | | | | [ ] |
| 3 | | | | [ ] |

Mark [ ] None if no violations found.

### Lesson Page Audit

**URL:** `http://localhost:4321/debezium-course/course/01-cdc-foundations/01-cdc-fundamentals/`

| Metric | Score | Pass (>= 90) |
|--------|-------|--------------|
| Accessibility Score | [ ] /100 | [ ] |

**Violations Found:**

| # | Issue | Elements Affected | Impact | Fix Required |
|---|-------|-------------------|--------|--------------|
| 1 | | | | [ ] |
| 2 | | | | [ ] |

Mark [ ] None if no violations found.

### Lighthouse Checklist

- [ ] Homepage accessibility score >= 90/100
- [ ] Lesson page accessibility score >= 90/100
- [ ] All critical/serious violations documented
- [ ] No color contrast violations reported

---

## 6. Glass Classes Reference

For verification reference, these are the glass utility classes defined in `src/styles/global.css`:

| Class | Desktop Blur | Mobile Blur | Opacity | Use Case |
|-------|--------------|-------------|---------|----------|
| `.glass-panel` | 10px | 8px | 0.1 | Standard panels |
| `.glass-panel-elevated` | 16px | 10px | 0.15 | Elevated panels |
| `.glass-sidebar` | 10px | 8px | 0.25 (black) | Navigation sidebar |
| `.glass-card` | 16px | 10px | 0.1 | Interactive cards with hover |
| `.prose table` | 8px | 8px | 0.05 | Content tables |

**Safari-specific:** All classes have hardcoded `-webkit-backdrop-filter` values (not CSS variables) per Plan 25-01 fix.

---

## Summary

### Phase 25 Success Criteria Status

| # | Criterion | Section | Status |
|---|-----------|---------|--------|
| 1 | All glass effects use responsive blur reduction (8px mobile vs 10-16px desktop) | 1 | [ ] Verified |
| 2 | Performance testing maintains 60fps with no GPU overload | 1 | [ ] Verified |
| 3 | prefers-reduced-transparency increases opacity to 95% and disables blur | 4.1 | [ ] Verified |
| 4 | prefers-reduced-motion disables all glass animations | 4.2 | [ ] Verified |
| 5 | Accessibility audit shows zero WCAG 4.5:1 contrast violations | 5 | [ ] Verified |
| 6 | Manual contrast testing confirms all text readable | 3 | [ ] Verified |
| 7 | Cross-browser testing (Chrome, Firefox, Safari) confirms correct rendering | 2 | [ ] Verified |

### Overall Summary

| Category | Tests Passed | Tests Failed | Notes |
|----------|--------------|--------------|-------|
| Mobile Performance | /6 | | |
| Cross-Browser Chrome | /5 | | |
| Cross-Browser Firefox | /5 | | |
| Cross-Browser Safari | /7 | | |
| Contrast (WCAG 4.5:1) | /8 | | |
| Media Queries | /8 | | |
| Lighthouse Audits | /2 | | |
| **TOTAL** | /41 | | |

### Sign-off

**Verified by:** ____________________
**Date:** ____________________

**Phase 25 Status:**
- [ ] COMPLETE - All criteria verified, ready for release
- [ ] INCOMPLETE - Issues found (see notes below)

**Issues requiring remediation:**
```
[List any blocking issues that must be fixed before phase completion]
```

---

*This checklist is reusable for future glass design changes. Re-run after any modifications to `src/styles/global.css` or glass-related components.*

*Reference: .planning/phases/25-polish-mobile-accessibility-verification/25-RESEARCH.md*
