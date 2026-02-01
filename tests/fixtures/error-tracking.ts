import { test as baseTest, expect, Page } from '@playwright/test';

type ErrorTrackingFixtures = {
  page: Page;
};

export const test = baseTest.extend<ErrorTrackingFixtures>({
  page: async ({ page }, use) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    await use(page);

    expect(consoleErrors, 'Console errors detected').toEqual([]);
    expect(pageErrors, 'Page errors detected').toEqual([]);
  }
});

export { expect };
