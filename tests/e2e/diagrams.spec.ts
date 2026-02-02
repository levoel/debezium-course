import { test, expect } from '../fixtures/error-tracking';

// Base path for the course (matches astro.config.mjs base setting)
const BASE = '/debezium-course';

/**
 * Sample lessons - one per module to verify diagram rendering
 * The error-tracking fixture automatically catches console errors and page errors
 */
const sampleLessons = [
  { module: 1, path: '/course/01-module-1/01-cdc-fundamentals', minDiagrams: 2 },
  { module: 2, path: '/course/02-module-2/01-logical-decoding-deep-dive', minDiagrams: 4 },
  { module: 3, path: '/course/03-module-3/01-binlog-architecture', minDiagrams: 4 },
  { module: 4, path: '/course/04-module-4/01-jmx-metrics-interpretation', minDiagrams: 4 },
  { module: 5, path: '/course/05-module-5/01-smt-overview', minDiagrams: 5 },
  { module: 6, path: '/course/06-module-6/01-advanced-python-consumer', minDiagrams: 2 },
  { module: 7, path: '/course/07-module-7/01-cloud-sql-setup', minDiagrams: 1 },
  { module: 8, path: '/course/08-module-8/01-capstone-overview', minDiagrams: 1 },
];

test.describe('Glass diagram rendering', () => {
  for (const lesson of sampleLessons) {
    test(`Module ${lesson.module} diagrams render without errors`, async ({ page }) => {
      await page.goto(`${BASE}${lesson.path}`);
      await page.waitForLoadState('networkidle');

      // DiagramContainer uses figure[role="figure"] as semantic element
      const diagrams = await page.locator('figure[role="figure"]').count();
      expect(diagrams).toBeGreaterThanOrEqual(lesson.minDiagrams);
    });
  }
});

test.describe('Mobile responsiveness', () => {
  test('diagrams fit iPhone 12 viewport (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/course/01-module-1/02-debezium-architecture`);
    await page.waitForLoadState('networkidle');

    // Check no horizontal scroll needed
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    // Verify diagrams are present
    const diagrams = await page.locator('figure[role="figure"]').count();
    expect(diagrams).toBeGreaterThan(0);
  });

  test('diagrams visible and not squashed on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/course/01-module-1/01-cdc-fundamentals`);
    await page.waitForLoadState('networkidle');

    const firstDiagram = page.locator('figure[role="figure"]').first();
    await expect(firstDiagram).toBeVisible();

    // Verify diagram has reasonable width (not squashed to tiny size)
    const box = await firstDiagram.boundingBox();
    expect(box?.width).toBeGreaterThan(200);
  });
});
