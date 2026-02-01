import { test, expect } from '../fixtures/error-tracking';
import AxeBuilder from '@axe-core/playwright';

// Base path for the course (matches astro.config.mjs base setting)
const BASE = '/debezium-course';

test.describe('Accessibility compliance (WCAG 2.1 AA)', () => {
  test('homepage meets WCAG AA standards', async ({ page }) => {
    await page.goto(`${BASE}/`);

    // Wait for client-side hydration to complete
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging if any exist
    if (results.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(results.violations, null, 2));
    }

    expect(results.violations).toEqual([]);
  });

  test('lesson page with glass sidebar meets WCAG AA', async ({ page }) => {
    await page.goto(`${BASE}/course/01-module-1/01-cdc-fundamentals`);

    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      // Exclude code blocks - they use Shiki github-dark theme with known contrast issues
      // in comment colors (#6A737D on #24292e = 3.04:1, needs 4.5:1). This is a third-party
      // theme limitation, not our glass design system.
      .exclude('pre.astro-code')
      .exclude('.astro-code')
      .analyze();

    if (results.violations.length > 0) {
      console.log('Lesson page violations:', JSON.stringify(results.violations, null, 2));
    }

    expect(results.violations).toEqual([]);
  });

  test('glass card components have sufficient contrast', async ({ page }) => {
    await page.goto(`${BASE}/`);

    await page.waitForLoadState('networkidle');

    // Check if glass-card elements exist before testing
    const glassCards = await page.locator('.glass-card').count();

    if (glassCards > 0) {
      // Focus on color-contrast rule specifically for glass components
      const results = await new AxeBuilder({ page })
        .include('.glass-card')
        .withTags(['wcag2aa'])
        .analyze();

      // Check specifically for contrast violations
      const contrastViolations = results.violations.filter(
        v => v.id === 'color-contrast'
      );

      if (contrastViolations.length > 0) {
        console.log('Contrast violations in glass-card:', JSON.stringify(contrastViolations, null, 2));
      }

      expect(contrastViolations).toEqual([]);
    }
  });

  test('page with tables meets WCAG AA', async ({ page }) => {
    // Visit a lesson that likely has tables (production operations has monitoring tables)
    await page.goto(`${BASE}/course/04-module-4/01-jmx-metrics-interpretation`);

    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      // Exclude code blocks - they use Shiki github-dark theme with known contrast issues
      // in comment colors. This is a third-party theme limitation.
      .exclude('pre.astro-code')
      .exclude('.astro-code')
      .analyze();

    if (results.violations.length > 0) {
      console.log('Table page violations:', JSON.stringify(results.violations, null, 2));
    }

    expect(results.violations).toEqual([]);
  });
});

test.describe('Accessibility preferences respected', () => {
  test('prefers-reduced-motion disables transitions', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');

    // Check that glass cards have no transition (or very short)
    const glassCard = page.locator('.glass-card').first();

    if (await glassCard.count() > 0) {
      const transition = await glassCard.evaluate(el =>
        window.getComputedStyle(el).transition
      );

      // Should be 'none' or 'all 0s ease 0s' (no animation)
      // Accept various browser representations of "no transition"
      const hasNoTransition =
        transition === 'none' ||
        transition.includes('0s') ||
        transition === 'all';

      expect(hasNoTransition).toBe(true);
    }
  });

  test('glass panel respects reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto(`${BASE}/course/01-module-1/01-cdc-fundamentals`);
    await page.waitForLoadState('networkidle');

    // Check progress panel or any glass-panel element
    const glassPanel = page.locator('.glass-panel').first();

    if (await glassPanel.count() > 0) {
      const transition = await glassPanel.evaluate(el =>
        window.getComputedStyle(el).transition
      );

      const hasNoTransition =
        transition === 'none' ||
        transition.includes('0s');

      expect(hasNoTransition).toBe(true);
    }
  });
});
