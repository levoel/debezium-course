import { test, expect } from '../fixtures/error-tracking';

test.describe('Progress migration verification', () => {
  test('migration converts old module-8 slugs to module-3', async ({ page }) => {
    // Seed old progress data (pre-v1.2 format)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('course-progress-v1.2-migrated');
      const oldProgress = {
        completed: [
          '08-module-8/01-binlog-architecture',  // Old MySQL position
          '01-module-1/01-cdc-fundamentals',     // Should not change
        ],
        lastUpdated: Date.now()
      };
      localStorage.setItem('course-progress', JSON.stringify(oldProgress));
    });

    // Reload to trigger migration
    await page.reload();

    // Wait for migration flag
    await page.waitForFunction(() =>
      localStorage.getItem('course-progress-v1.2-migrated') === 'true',
      { timeout: 5000 }
    );

    // Verify slugs were updated
    const migratedProgress = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('course-progress') || '{}')
    );

    expect(migratedProgress.completed).toContain('03-module-3/01-binlog-architecture');
    expect(migratedProgress.completed).toContain('01-module-1/01-cdc-fundamentals');
    expect(migratedProgress.completed).not.toContain('08-module-8/01-binlog-architecture');
  });

  test('migration handles module chain correctly', async ({ page }) => {
    // Test the full chain: 08->03, 03->04, 04->05, etc.
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('course-progress-v1.2-migrated');
      const oldProgress = {
        completed: [
          '03-module-3/01-jmx-metrics-interpretation',   // Old Production Ops -> 04
          '04-module-4/01-smt-overview',                 // Old Advanced -> 05
          '07-module-7/01-capstone-overview',            // Old Capstone -> 08
        ],
        lastUpdated: Date.now()
      };
      localStorage.setItem('course-progress', JSON.stringify(oldProgress));
    });

    await page.reload();

    await page.waitForFunction(() =>
      localStorage.getItem('course-progress-v1.2-migrated') === 'true',
      { timeout: 5000 }
    );

    const migratedProgress = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('course-progress') || '{}')
    );

    expect(migratedProgress.completed).toContain('04-module-4/01-jmx-metrics-interpretation');
    expect(migratedProgress.completed).toContain('05-module-5/01-smt-overview');
    expect(migratedProgress.completed).toContain('08-module-8/01-capstone-overview');
  });

  test('migration flag prevents re-running', async ({ page }) => {
    await page.goto('/');

    // Set migration flag and some progress
    await page.evaluate(() => {
      localStorage.setItem('course-progress-v1.2-migrated', 'true');
      const progress = {
        completed: ['08-module-8/01-binlog-architecture'],  // "Old" slug
        lastUpdated: Date.now()
      };
      localStorage.setItem('course-progress', JSON.stringify(progress));
    });

    await page.reload();
    await page.waitForTimeout(1000);  // Give time for any migration to run

    // Should NOT have migrated (flag was set)
    const progress = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('course-progress') || '{}')
    );

    expect(progress.completed).toContain('08-module-8/01-binlog-architecture');
    expect(progress.completed).not.toContain('03-module-3/01-binlog-architecture');
  });

  test('empty progress sets migration flag without error', async ({ page }) => {
    await page.goto('/');

    // Clear all progress data
    await page.evaluate(() => {
      localStorage.removeItem('course-progress');
      localStorage.removeItem('course-progress-v1.2-migrated');
    });

    await page.reload();

    // Migration should complete (set flag) even with no data
    await page.waitForFunction(() =>
      localStorage.getItem('course-progress-v1.2-migrated') === 'true',
      { timeout: 5000 }
    );
  });
});
