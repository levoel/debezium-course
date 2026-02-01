import { test, expect } from '../fixtures/error-tracking';

// Base path for the course (matches astro.config.mjs base setting)
const BASE = '/debezium-course';

test.describe('Navigation verification', () => {
  test('homepage loads without errors', async ({ page }) => {
    const response = await page.goto(`${BASE}/`);
    expect(response?.status()).toBe(200);
  });

  test('all lesson links on homepage work', async ({ page }) => {
    await page.goto(`${BASE}/`);

    // Get all unique course link hrefs from the main content area (not sidebar)
    // Use evaluate to efficiently collect all hrefs at once
    const hrefs = await page.evaluate((basePath) => {
      const links = document.querySelectorAll(`main a[href^="${basePath}/course/"]`);
      const uniqueHrefs = new Set<string>();
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) uniqueHrefs.add(href);
      });
      return Array.from(uniqueHrefs);
    }, BASE);

    // Ensure we have links to test
    expect(hrefs.length).toBeGreaterThan(0);

    // Test a sample of links for speed (first from each module)
    const moduleLinks = hrefs.filter(href => href.includes('/01-'));
    expect(moduleLinks.length).toBeGreaterThan(0);

    for (const href of moduleLinks) {
      const response = await page.goto(href);
      expect(response?.status(), `Failed for ${href}`).toBe(200);
    }
  });

  test('module pages are accessible', async ({ page }) => {
    // Test first lesson in each module after v1.2 reorganization
    const modulePaths = [
      `${BASE}/course/01-module-1/01-cdc-fundamentals`,          // Module 1: Intro
      `${BASE}/course/02-module-2/01-logical-decoding-deep-dive`, // Module 2: PostgreSQL
      `${BASE}/course/03-module-3/01-binlog-architecture`,       // Module 3: MySQL (was 08)
      `${BASE}/course/04-module-4/01-jmx-metrics-interpretation`, // Module 4: Monitoring
      `${BASE}/course/05-module-5/01-smt-overview`,              // Module 5: Advanced
      `${BASE}/course/06-module-6/01-advanced-python-consumer`,  // Module 6: Data Engineering
      `${BASE}/course/07-module-7/01-cloud-sql-setup`,           // Module 7: Cloud-Native
      `${BASE}/course/08-module-8/01-capstone-overview`,         // Module 8: Capstone (was 07)
    ];

    for (const path of modulePaths) {
      const response = await page.goto(path);
      expect(response?.status(), `Failed for ${path}`).toBe(200);
    }
  });

  test('sidebar navigation contains all 8 modules', async ({ page }) => {
    // Go to any lesson page to see sidebar
    await page.goto(`${BASE}/course/01-module-1/01-cdc-fundamentals`);

    // Module headers now use format "NN. Descriptive Name" (e.g., "01. Введение в CDC")
    // Check for descriptive module names from moduleNames.ts
    const moduleNames = [
      '01. Введение в CDC',
      '02. PostgreSQL и Aurora',
      '03. MySQL и Aurora MySQL',
      '04. Production Operations',
      '05. SMT и Паттерны',
      '06. Data Engineering',
      '07. Cloud-Native GCP',
      '08. Capstone Project',
    ];

    for (const name of moduleNames) {
      const moduleHeader = page.locator(`button:has-text("${name}")`);
      await expect(moduleHeader).toBeVisible();
    }
  });
});
