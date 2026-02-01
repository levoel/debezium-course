import { test, expect } from '../fixtures/error-tracking';

test.describe('Navigation verification', () => {
  test('homepage loads without errors', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('all lesson links on homepage work', async ({ page }) => {
    await page.goto('/');

    // Get all internal course links from the lesson cards on homepage
    const links = await page.locator('a[href*="/course/"]').all();

    // Ensure we have links to test
    expect(links.length).toBeGreaterThan(0);

    const visited = new Set<string>();
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href || visited.has(href)) continue;
      visited.add(href);

      // Navigate and verify 200 response
      const response = await page.goto(href);
      expect(response?.status(), `Failed for ${href}`).toBe(200);
    }
  });

  test('module pages are accessible', async ({ page }) => {
    // Test first lesson in each module after v1.2 reorganization
    const modulePaths = [
      '/course/01-module-1/01-cdc-fundamentals',          // Module 1: Intro
      '/course/02-module-2/01-logical-decoding-deep-dive', // Module 2: PostgreSQL
      '/course/03-module-3/01-binlog-architecture',       // Module 3: MySQL (was 08)
      '/course/04-module-4/01-jmx-metrics-interpretation', // Module 4: Monitoring
      '/course/05-module-5/01-smt-overview',              // Module 5: Advanced
      '/course/06-module-6/01-advanced-python-consumer',  // Module 6: Data Engineering
      '/course/07-module-7/01-cloud-sql-setup',           // Module 7: Cloud-Native
      '/course/08-module-8/01-capstone-overview',         // Module 8: Capstone (was 07)
    ];

    for (const path of modulePaths) {
      const response = await page.goto(path);
      expect(response?.status(), `Failed for ${path}`).toBe(200);
    }
  });

  test('sidebar navigation contains all 8 modules', async ({ page }) => {
    // Go to any lesson page to see sidebar
    await page.goto('/course/01-module-1/01-cdc-fundamentals');

    // Check that all 8 module headers are present
    for (let i = 1; i <= 8; i++) {
      const moduleHeader = page.locator(`text=Module ${i.toString().padStart(2, '0')}`);
      await expect(moduleHeader.or(page.locator(`text=Модуль ${i.toString().padStart(2, '0')}`))).toBeVisible();
    }
  });
});
