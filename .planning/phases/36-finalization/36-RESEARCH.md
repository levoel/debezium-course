# Phase 36: Finalization (Testing + Mermaid Removal) - Research

**Researched:** 2026-02-02
**Domain:** Migration verification, dependency removal, bundle optimization
**Confidence:** HIGH

## Summary

Phase 36 finalizes the v1.4 glass diagram migration by verifying all diagrams work correctly and removing the Mermaid dependency. Research confirms:

1. **168 glass diagram components** exist across 8 modules (close to the ~170 target)
2. **Mermaid is only used by test page** (`mermaid-test.astro`) - no course content uses it
3. **Existing Playwright + axe-core tests** provide a solid foundation
4. **Mermaid-related bundles total ~2.3MB** - significant savings available

**Primary recommendation:** Focus verification on "does it work?" not "does it look exactly right?" - use smoke tests for rendering and existing axe-core for accessibility. Remove Mermaid safely since no course content depends on it.

## Current State Analysis

### Diagram Component Count

| Module | Diagram Files | Exported Diagrams |
|--------|---------------|-------------------|
| Module 1 | 6 files | 10 diagrams |
| Module 2 | 7 files | 18 diagrams |
| Module 3 | 15 files | 49 diagrams |
| Module 4 | 7 files | 24 diagrams |
| Module 5 | 8 files | 21 diagrams |
| Module 6 | 7 files | 26 diagrams |
| Module 7 | 6 files | 14 diagrams |
| Module 8 | 5 files | 8 diagrams |
| **Total** | **61 files** | **170 diagrams** |

**Confidence:** HIGH - Verified via grep on export patterns

### Mermaid Usage Analysis

**Files still referencing Mermaid:**

| File | Usage | Action |
|------|-------|--------|
| `src/components/Mermaid.tsx` | Component wrapper | DELETE |
| `src/pages/mermaid-test.astro` | Test page only | DELETE |
| `package.json` | Dependency | REMOVE |

**Verified: Zero Mermaid code blocks in MDX content**
```
grep -r "```mermaid" src/content/ => No matches
grep -r "<Mermaid" src/content/ => No matches
```

**Confidence:** HIGH - Verified via codebase search

### Bundle Size Analysis

**Current State (with Mermaid):**
- Total dist/ size: 13MB
- Total JS bundles: 3.6MB
- Mermaid-specific bundles: ~2.3MB

**Mermaid-related bundles breakdown:**

| Bundle | Size | Purpose |
|--------|------|---------|
| `Mermaid.HqTFusa3.js` | 484KB | Core Mermaid library |
| `cytoscape.esm.DtBltrT8.js` | 436KB | Graph visualization |
| `treemap-KMMF4GRG.js` | 368KB | Treemap diagrams |
| `katex.DhXJpUyf.js` | 260KB | Math rendering |
| `architectureDiagram-*.js` | 148KB | Architecture diagrams |
| Other diagram types | ~600KB | Flow, sequence, gantt, etc. |
| **Total Mermaid** | **~2.3MB** | |

**Expected post-removal:**
- JS bundle size: ~1.3MB (down from 3.6MB)
- Bundle reduction: ~2.3MB (64% reduction in JS)

**Confidence:** HIGH - Verified via build output analysis

### Existing Test Infrastructure

**Playwright Tests:** `/tests/e2e/`

| Test File | Coverage | Status |
|-----------|----------|--------|
| `navigation.spec.ts` | Homepage, all 8 modules, sidebar | Working |
| `accessibility.spec.ts` | WCAG 2.1 AA, axe-core, glass components | Working |
| `progress.spec.ts` | localStorage migration | Working |

**Test Fixtures:**
- `error-tracking.ts` - Console error detection fixture

**Playwright Configuration:**
- Base URL: `http://localhost:4321/debezium-course/`
- Runs against production build (`npm run preview`)

**Confidence:** HIGH - Test infrastructure is mature and verified working

## Standard Stack

### Testing Tools (Already Installed)

| Tool | Version | Purpose |
|------|---------|---------|
| `@playwright/test` | ^1.58.1 | E2E browser testing |
| `@axe-core/playwright` | ^4.11.0 | Accessibility testing |

### No Additional Dependencies Needed

All required testing infrastructure is already in place from Phase 25 (UX/Design Refresh).

## Architecture Patterns

### Recommended Test Structure

```
tests/
  e2e/
    navigation.spec.ts        # Existing
    accessibility.spec.ts     # Existing - extend for diagrams
    progress.spec.ts          # Existing
    diagrams.spec.ts          # NEW - smoke tests
  fixtures/
    error-tracking.ts         # Existing
```

### Diagram Smoke Test Pattern

**Purpose:** Verify diagrams render without errors, not pixel-perfect comparison

```typescript
// Pattern: Visit page, verify no console errors, verify diagrams visible
test('lesson diagrams render without errors', async ({ page }) => {
  await page.goto(`${BASE}/course/01-module-1/01-cdc-fundamentals`);
  await page.waitForLoadState('networkidle');

  // Check for diagram containers
  const diagrams = await page.locator('[data-diagram]').count();
  expect(diagrams).toBeGreaterThan(0);

  // Error tracking fixture catches console errors automatically
});
```

**Why not visual regression:**
- 170 diagrams = massive baseline storage
- Glass effects vary by browser/GPU
- Smoke tests catch actual problems (crashes, missing imports)
- Visual QA is better done manually for this volume

### Accessibility Test Extension

```typescript
// Extend existing accessibility.spec.ts
test('diagram tooltips are keyboard accessible', async ({ page }) => {
  await page.goto(`${BASE}/course/01-module-1/01-cdc-fundamentals`);

  // Tab to first diagram node
  await page.keyboard.press('Tab');
  // ... navigate to interactive element
  await page.keyboard.press('Enter');

  // Verify tooltip appears
  await expect(page.locator('[role="tooltip"]')).toBeVisible();
});
```

### Mobile Responsiveness Pattern

```typescript
// Use Playwright's device emulation
test('diagrams render on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
  await page.goto(`${BASE}/course/01-module-1/01-cdc-fundamentals`);

  const diagram = page.locator('[data-diagram]').first();
  await expect(diagram).toBeVisible();
  // Verify diagram fits in viewport (no horizontal scroll)
});
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Visual regression | Custom screenshot comparison | Manual QA + smoke tests | 170 diagrams is too many for automated visual testing |
| Accessibility testing | Custom ARIA checks | axe-core (already installed) | Industry standard, maintained |
| Mobile testing | Custom viewport logic | Playwright device emulation | Built-in, reliable |
| Bundle analysis | Custom scripts | Astro build output + du | Already provides enough info |

## Common Pitfalls

### Pitfall 1: Over-Engineering Visual Tests
**What goes wrong:** Attempting pixel-perfect visual regression for 170 diagrams
**Why it happens:** Seems like thorough testing
**How to avoid:** Smoke tests (renders without error) + manual spot checks
**Warning signs:** Test suite taking > 5 minutes, flaky tests on CI

### Pitfall 2: Incomplete Mermaid Removal
**What goes wrong:** Removing package but leaving imports/components
**Why it happens:** Missing dead code
**How to avoid:**
1. Delete `Mermaid.tsx` component first
2. Delete `mermaid-test.astro` page
3. Run build to verify no import errors
4. Remove from package.json
5. Run `npm install` to clean node_modules
**Warning signs:** Build errors mentioning "mermaid"

### Pitfall 3: Bundle Size Verification Without Baseline
**What goes wrong:** Can't prove size reduction
**Why it happens:** Didn't capture baseline before changes
**How to avoid:** Record current bundle sizes BEFORE removing Mermaid
**Current baseline:** 3.6MB JS total, 2.3MB Mermaid-related

### Pitfall 4: Testing Glass Effects Across Browsers
**What goes wrong:** backdrop-filter renders differently
**Why it happens:** Browser implementation varies
**How to avoid:** Accept visual differences, test for functional correctness
**Warning signs:** Tests passing locally, failing on CI

## Verification Strategy

### What DOES Need Testing

1. **Smoke Tests (automated)**
   - Each module's first lesson loads without console errors
   - Diagrams are present in DOM
   - No JavaScript crashes

2. **Accessibility (automated, existing)**
   - Existing axe-core tests catch WCAG violations
   - Add keyboard navigation test for tooltips

3. **Mobile (automated)**
   - Viewport test at 390x844 (iPhone 12)
   - Diagrams visible, no horizontal overflow

4. **Bundle Size (manual)**
   - Compare du output before/after Mermaid removal
   - Target: ~2MB reduction

### What DOESN'T Need Testing

1. **Visual regression for all 170 diagrams** - Impractical
2. **Cross-browser pixel comparison** - Glass effects vary
3. **Animation timing** - Reduced motion already tested
4. **Every tooltip interaction** - Sample testing sufficient

## Mermaid Removal Procedure

### Step 1: Record Baseline
```bash
npm run build
du -sh dist/
find dist/_astro -name "*.js" | xargs du -ch | tail -1
```

### Step 2: Remove Files
```bash
rm src/components/Mermaid.tsx
rm src/pages/mermaid-test.astro
```

### Step 3: Verify Build Still Works
```bash
npm run build
# Should complete without errors
```

### Step 4: Remove Dependency
```json
// package.json - remove this line from dependencies:
"mermaid": "^11.12.2",
```

### Step 5: Clean Install
```bash
rm -rf node_modules package-lock.json
npm install
```

### Step 6: Final Build + Size Check
```bash
npm run build
du -sh dist/
find dist/_astro -name "*.js" | xargs du -ch | tail -1
# Compare with baseline
```

### Step 7: Run Tests
```bash
npm run test:e2e
```

## Code Examples

### Diagram Smoke Test (NEW)

```typescript
// tests/e2e/diagrams.spec.ts
import { test, expect } from '../fixtures/error-tracking';

const BASE = '/debezium-course';

// Sample one lesson per module
const sampleLessons = [
  { module: 1, path: '/course/01-module-1/01-cdc-fundamentals', diagrams: 2 },
  { module: 2, path: '/course/02-module-2/01-logical-decoding-deep-dive', diagrams: 4 },
  { module: 3, path: '/course/03-module-3/01-binlog-architecture', diagrams: 4 },
  { module: 4, path: '/course/04-module-4/01-jmx-metrics-interpretation', diagrams: 4 },
  { module: 5, path: '/course/05-module-5/01-smt-overview', diagrams: 5 },
  { module: 6, path: '/course/06-module-6/01-advanced-python-consumer', diagrams: 2 },
  { module: 7, path: '/course/07-module-7/01-cloud-sql-setup', diagrams: 1 },
  { module: 8, path: '/course/08-module-8/01-capstone-overview', diagrams: 1 },
];

test.describe('Glass diagram rendering', () => {
  for (const lesson of sampleLessons) {
    test(`Module ${lesson.module} diagrams render`, async ({ page }) => {
      await page.goto(`${BASE}${lesson.path}`);
      await page.waitForLoadState('networkidle');

      // DiagramContainer components have this class
      const containers = page.locator('.glass-panel').filter({ has: page.locator('svg, [data-diagram]') });
      const count = await containers.count();

      expect(count).toBeGreaterThanOrEqual(lesson.diagrams);
    });
  }
});

test.describe('Mobile responsiveness', () => {
  test('diagrams fit iPhone 12 viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/course/01-module-1/02-debezium-architecture`);

    // Check no horizontal scroll needed
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);
  });
});
```

### Keyboard Accessibility Test (Extend existing)

```typescript
// Add to tests/e2e/accessibility.spec.ts
test.describe('Diagram keyboard accessibility', () => {
  test('FlowNode tooltips accessible via keyboard', async ({ page }) => {
    await page.goto(`${BASE}/course/01-module-1/01-cdc-fundamentals`);
    await page.waitForLoadState('networkidle');

    // Find first interactive diagram node
    const firstNode = page.locator('[role="button"]').first();
    await firstNode.focus();
    await page.keyboard.press('Enter');

    // Tooltip should appear (Radix Popover)
    await expect(page.locator('[data-radix-popper-content-wrapper]')).toBeVisible();
  });
});
```

## Open Questions

### 1. DiagramContainer Data Attribute
**What we know:** Components use `.glass-panel` class
**What's unclear:** Whether a consistent `[data-diagram]` selector exists
**Recommendation:** Add if missing during test implementation, or use existing class pattern

### 2. Tooltip Trigger Mechanism
**What we know:** Uses Radix Popover, opens on click
**What's unclear:** Exact keyboard trigger path
**Recommendation:** Verify during test implementation - may need to tab to specific element

## Sources

### Primary (HIGH confidence)
- `/Users/levoely/debezium course/package.json` - Current dependencies
- `/Users/levoely/debezium course/tests/e2e/` - Existing test infrastructure
- `/Users/levoely/debezium course/src/components/diagrams/` - Component structure
- Build output analysis via `npm run build` + `du`

### Secondary (MEDIUM confidence)
- `.planning/ROADMAP.md` - Phase requirements and success criteria

## Metadata

**Confidence breakdown:**
- Diagram count: HIGH - Verified via code analysis
- Mermaid removal: HIGH - Verified only test page uses it
- Bundle size: HIGH - Verified via build output
- Test strategy: MEDIUM - Pattern recommendations, implementation may vary

**Research date:** 2026-02-02
**Valid until:** 2026-02-09 (testing approach unlikely to change)
