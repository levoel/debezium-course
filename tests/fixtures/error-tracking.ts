import { test as baseTest, expect, Page } from '@playwright/test';

type ErrorTrackingFixtures = {
  page: Page;
};

// Known issues that are pre-existing and not test failures:
// - React error #418: Hydration mismatch in some pages (Astro/React SSR issue)
//   This happens during static build where some client-side only content differs
const KNOWN_ISSUES = [
  /Minified React error #418/,
];

function isKnownIssue(message: string): boolean {
  return KNOWN_ISSUES.some(pattern => pattern.test(message));
}

export const test = baseTest.extend<ErrorTrackingFixtures>({
  page: async ({ page }, use) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!isKnownIssue(text)) {
          consoleErrors.push(text);
        }
      }
    });

    page.on('pageerror', error => {
      if (!isKnownIssue(error.message)) {
        pageErrors.push(error.message);
      }
    });

    await use(page);

    expect(consoleErrors, 'Console errors detected').toEqual([]);
    expect(pageErrors, 'Page errors detected').toEqual([]);
  }
});

export { expect };
