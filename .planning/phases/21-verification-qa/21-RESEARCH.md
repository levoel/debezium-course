# Phase 21: Verification and QA - Research

**Researched:** 2026-02-01
**Domain:** Static site verification, QA automation, deployment validation
**Confidence:** HIGH

## Summary

This phase focuses on comprehensive verification and quality assurance after the v1.2 reorganization (Phases 19-20). The research identifies that verification for static sites built with Astro requires a multi-layered approach: automated link checking during build, end-to-end testing for browser-side functionality (navigation, localStorage persistence), and post-deployment verification on GitHub Pages.

The standard stack uses Astro-specific link validators for build-time checks and Playwright for runtime verification. Playwright provides the most robust pattern for testing both navigation flows and browser console errors, with built-in fixture patterns that automatically detect JavaScript errors without manual test instrumentation.

For localStorage persistence testing (progress tracking after reorganization), the research confirms that testing requires both availability detection and cross-session validation, which is straightforward with Playwright's browser context API.

**Primary recommendation:** Use astro-link-validator for build-time link checking integrated into the build process, and Playwright with custom fixtures for end-to-end verification of navigation, progress persistence, and console error detection.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Playwright | Latest (1.48+) | E2E testing, console monitoring | Official Astro recommendation, supports all browsers, fixture-based error detection |
| astro-link-validator | github:rodgtr1/astro-link-validator | Build-time link validation | Astro-specific, 10x faster than sequential, zero-config |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @playwright/test | Latest | Test runner with fixtures | When you need automatic error detection across test suite |
| html-proofer | 5.x (Ruby) | Alternative link checker | If you prefer Ruby tooling or need external link caching |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| astro-link-validator | astro-broken-link-checker | More verbose output, slower, logs to file (good for CI auditing) |
| Playwright | Cypress | Less suitable for console error detection, heavier setup |
| Automated testing | Manual verification | Faster initial setup but not repeatable, error-prone |

**Installation:**
```bash
# Build-time link validation
npm install github:rodgtr1/astro-link-validator

# End-to-end testing
npm install -D @playwright/test
npx playwright install
```

## Architecture Patterns

### Recommended Test Structure
```
tests/
├── e2e/
│   ├── navigation.spec.ts    # Link verification
│   ├── progress.spec.ts      # localStorage persistence
│   └── console.spec.ts       # Error detection
├── fixtures/
│   └── error-tracking.ts     # Auto console monitoring
└── playwright.config.ts      # Base URL, browser config
```

### Pattern 1: Build-Time Link Validation
**What:** Integrate link checking directly into Astro build process
**When to use:** Always - catches broken links before deployment
**Example:**
```javascript
// Source: https://github.com/rodgtr1/astro-link-validator
import linkValidator from 'astro-link-validator';

export default defineConfig({
  integrations: [
    linkValidator({
      checkExternal: false,      // Skip external links for speed
      failOnBrokenLinks: true,   // Block deployment on errors
      verbose: false             // Clean output
    })
  ]
});
```

### Pattern 2: Automatic Console Error Detection
**What:** Custom Playwright fixture that fails tests on any console.error or uncaught exception
**When to use:** All E2E tests - zero-config error monitoring
**Example:**
```typescript
// Source: https://alisterscott.github.io/Automatede2eTesting/AutomaticallyCheckingForPlaywrightConsoleErrors.html
// Playwright official docs: https://playwright.dev/docs/test-fixtures
import { test as baseTest, expect } from '@playwright/test';

export const test = baseTest.extend({
  page: async ({ page }, use) => {
    const messages: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        messages.push(`Console error: ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      messages.push(`Uncaught exception: ${error.message}`);
    });

    await use(page);

    // Verify no errors after test completes
    expect(messages).toStrictEqual([]);
  }
});
```

### Pattern 3: localStorage Persistence Verification
**What:** Test that progress data survives page reloads and navigation
**When to use:** After any localStorage-related changes (like migration functions)
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
// Playwright context API
test('progress persists across navigation', async ({ page, context }) => {
  // Navigate to lesson
  await page.goto('/01-module-1/01-intro');

  // Mark complete
  await page.click('[data-testid="complete-button"]');

  // Verify localStorage updated
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('course-progress') || '{}')
  );
  expect(stored.completed).toContain('01-module-1/01-intro');

  // Navigate away and back
  await page.goto('/02-module-2/01-setup');
  await page.goto('/01-module-1/01-intro');

  // Verify still marked complete
  const checkbox = page.locator('[data-testid="complete-button"]');
  await expect(checkbox).toBeChecked();
});
```

### Pattern 4: Navigation Link Verification
**What:** Crawl all internal links and verify they resolve to 200 status
**When to use:** After content reorganization or navigation changes
**Example:**
```typescript
// Source: Astro Testing Docs: https://docs.astro.build/en/guides/testing/
test('all navigation links work', async ({ page }) => {
  await page.goto('/');

  // Get all internal links
  const links = await page.locator('nav a[href^="/"]').all();

  for (const link of links) {
    const href = await link.getAttribute('href');
    if (!href) continue;

    const response = await page.goto(href);
    expect(response?.status()).toBe(200);
  }
});
```

### Pattern 5: GitHub Pages Deployment Verification
**What:** Test deployed site (not local build) to catch base path issues
**When to use:** After deployment, before marking release as complete
**Example:**
```typescript
// Source: https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll
// Playwright config for production testing
const config: PlaywrightTestConfig = {
  use: {
    baseURL: process.env.CI
      ? 'https://levoel.github.io/debezium-course'
      : 'http://localhost:4321'
  }
};

test('deployed site is accessible', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);

  // Verify no 404 errors for assets
  const failed = [];
  page.on('response', res => {
    if (res.status() === 404) {
      failed.push(res.url());
    }
  });

  await page.waitForLoadState('networkidle');
  expect(failed).toHaveLength(0);
});
```

### Anti-Patterns to Avoid
- **Testing local dev server instead of production build:** Dev mode uses different code paths than production. Always test against `astro build` + `astro preview` output.
- **Manual link clicking:** Brittle, slow, not repeatable. Use automated crawling with Playwright or build-time validators.
- **Ignoring external link failures:** External links break over time. Either validate them or explicitly exclude them with documentation.
- **Testing without clearing cache:** Astro's `.astro/` cache can mask issues. Clear it before verification runs.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Link validation | Custom script that parses HTML and checks hrefs | astro-link-validator or html-proofer | Edge cases: redirects, base paths, anchors, srcset, canonical URLs - validators handle all of these |
| Console error detection | Manual `console.log` checks or try/catch in tests | Playwright fixtures with `page.on('console')` and `page.on('pageerror')` | Fixtures run automatically, catch errors across all tests, no test code duplication |
| localStorage availability detection | `if (typeof localStorage !== 'undefined')` | MDN's `storageAvailable()` function | Handles quota exceeded errors, private browsing mode, disabled storage policies |
| Navigation crawling | Recursive click-and-wait scripts | Playwright's `page.locator()` + response status checks | Handles SPAs, waits for navigation, checks response codes, parallelizable |

**Key insight:** Static site verification seems simple (just check links), but production issues are subtle: base path configuration, cache invalidation, storage quotas, async navigation. Use battle-tested tools that handle edge cases.

## Common Pitfalls

### Pitfall 1: Base Path Mismatch Between Local and Deployed
**What goes wrong:** Site works locally at `/` but breaks on GitHub Pages at `/repo-name/` because links are hardcoded or base path is wrong.
**Why it happens:** Astro's `base` config only applies to production builds, not dev server. Local testing doesn't catch base path issues.
**How to avoid:**
- Test against `astro build` output using `astro preview`, not `astro dev`
- Run final verification against actual deployed URL on GitHub Pages
- Use Playwright with environment-based `baseURL` config (local vs production)
**Warning signs:** Links work locally but 404 on deployed site, CSS/JS files return 404 in browser console on production

### Pitfall 2: Cache-Related False Positives
**What goes wrong:** Tests pass locally but fail in CI, or vice versa, due to stale Astro build cache.
**Why it happens:** Astro caches built pages in `.astro/` directory. After reorganization (Phases 19-20), old paths may be cached.
**How to avoid:**
- Clear `.astro/` cache before running verification: `rm -rf .astro/`
- Add cache clearing to test scripts: `"test:e2e": "rm -rf .astro/ && astro build && playwright test"`
- Never commit `.astro/` to git (should be in .gitignore)
**Warning signs:** Tests fail inconsistently, rebuilding fixes issues, CI and local results differ

### Pitfall 3: Progress Migration Not Triggered
**What goes wrong:** Progress data doesn't migrate because migration function is called before localStorage is available.
**Why it happens:** Migration function checks for `typeof window === 'undefined'` to prevent SSR errors. If called during SSR, it silently returns without migrating.
**How to avoid:**
- Ensure migration is called client-side only (in `useEffect` or Astro client:load)
- Test with pre-existing localStorage data (seed test data before running migration)
- Verify migration flag is set: `localStorage.getItem('course-progress-v1.2-migrated') === 'true'`
**Warning signs:** Users report lost progress, migration flag never appears in localStorage, tests pass but manual testing shows unmigrated slugs

### Pitfall 4: External Link Failures Breaking Build
**What goes wrong:** Build fails because an external link (documentation, blog post) returns 404 or is slow to respond.
**Why it happens:** Link validators check external URLs by default. External sites change or have rate limiting.
**How to avoid:**
- Disable external link checking in link validator: `checkExternal: false`
- If external checking is needed, use caching: html-proofer supports cached external links
- Whitelist known-flaky domains to skip: `exclude: ['https://example-flaky.com/*']`
**Warning signs:** Build times increase significantly, intermittent build failures, timeouts during link validation

### Pitfall 5: Testing Before Migration Runs
**What goes wrong:** E2E tests for progress tracking fail because they test pre-migration state.
**Why it happens:** Migration is one-time, triggered on first page load. Tests run against fresh browser context with no migration flag.
**How to avoid:**
- Seed localStorage with migration flag before tests: `localStorage.setItem('course-progress-v1.2-migrated', 'true')`
- Or test the migration itself: seed old slugs, trigger migration, verify new slugs
- Don't assume migration has run - explicitly set up test state
**Warning signs:** Tests fail on first run but pass on subsequent runs, flaky test results, migration logic works manually but not in tests

## Code Examples

Verified patterns from official sources:

### localStorage Availability Detection (Production-Ready)
```javascript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === "QuotaExceededError" &&
      // Acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

// Use in tests or application code
if (storageAvailable("localStorage")) {
  // localStorage is available and writable
} else {
  // Fallback: disable progress tracking or use in-memory storage
}
```

### Playwright Fixture for Automatic Error Detection
```typescript
// Source: https://playwright.dev/docs/test-fixtures
// https://www.browserstack.com/guide/fixtures-in-playwright
import { test as baseTest, expect, Page } from '@playwright/test';

type ErrorTrackingFixtures = {
  page: Page;
};

export const test = baseTest.extend<ErrorTrackingFixtures>({
  page: async ({ page }, use) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    // Track console.error calls
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Track uncaught exceptions
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Run the test
    await use(page);

    // Assert no errors occurred
    expect(consoleErrors, 'Console errors detected').toEqual([]);
    expect(pageErrors, 'Page errors detected').toEqual([]);
  }
});

export { expect };
```

### Link Validator Integration (Astro Config)
```javascript
// Source: https://github.com/rodgtr1/astro-link-validator
import { defineConfig } from 'astro/config';
import linkValidator from 'astro-link-validator';

export default defineConfig({
  site: 'https://levoel.github.io',
  base: '/debezium-course',
  integrations: [
    linkValidator({
      // Only check internal links (fast, reliable)
      checkExternal: false,

      // Fail build on broken links (prevent deploying broken site)
      failOnBrokenLinks: true,

      // Exclude admin or draft pages
      exclude: ['/admin/*', '/drafts/*'],

      // Minimal logging (show only errors)
      verbose: false
    })
  ]
});
```

### Progress Migration Test
```typescript
// Source: Project code at /Users/levoely/debezium course/src/stores/progress.ts
// Testing pattern from https://plainenglish.io/blog/testing-local-storage-with-testing-library-580f74e8805b
import { test, expect } from '@playwright/test';

test('progress migration updates old module slugs', async ({ page }) => {
  // Seed old progress data (pre-v1.2 format)
  await page.goto('/');
  await page.evaluate(() => {
    const oldProgress = {
      completed: [
        '08-module-8/01-intro',  // Old MySQL position
        '03-module-3/02-config'  // Old Production Ops position
      ],
      lastUpdated: Date.now()
    };
    localStorage.setItem('course-progress', JSON.stringify(oldProgress));
    // Don't set migration flag - force migration to run
  });

  // Reload page to trigger migration
  await page.reload();

  // Wait for migration to complete
  await page.waitForFunction(() =>
    localStorage.getItem('course-progress-v1.2-migrated') === 'true'
  );

  // Verify slugs were updated
  const migratedProgress = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('course-progress') || '{}')
  );

  expect(migratedProgress.completed).toContain('03-module-3/01-intro');  // MySQL moved to 03
  expect(migratedProgress.completed).toContain('04-module-4/02-config'); // Prod Ops moved to 04
  expect(migratedProgress.completed).not.toContain('08-module-8/01-intro');
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual link testing | Build-time automated validation | 2023-2024 | Link validators became Astro integrations, run during build |
| Cypress for E2E | Playwright | 2024-2025 | Playwright officially recommended by Astro, better DX, faster |
| Custom console.log monitoring | Playwright fixtures with page.on('console') | 2024-2025 | Automatic error detection, no per-test setup needed |
| html-proofer (Ruby) | Language-native validators (astro-link-validator) | 2025-2026 | No Ruby dependency, faster, Astro-specific edge cases handled |

**Deprecated/outdated:**
- **Selenium for static site testing**: Replaced by Playwright/Cypress. Selenium has slower startup, more complex setup, less suitable for modern static sites.
- **Manual browser console checking**: Automated fixtures make manual checking obsolete and error-prone.
- **Testing only dev server**: Astro now recommends testing against production builds (`astro preview`) to catch build-specific issues.

## Open Questions

Things that couldn't be fully resolved:

1. **GitHub Pages deployment latency verification**
   - What we know: GitHub Pages can take up to 30 minutes for first deployment to propagate
   - What's unclear: Is there an API to check deployment status programmatically?
   - Recommendation: Use GitHub Actions deployment status API or wait-and-retry pattern with exponential backoff

2. **External link checking strategy**
   - What we know: External links break over time, but checking slows builds and causes flakiness
   - What's unclear: What's the optimal frequency for external link checks in CI?
   - Recommendation: Disable external checks in main build, run separate weekly scheduled job for external link validation

3. **localStorage quota limits in tests**
   - What we know: Private browsing has reduced quotas, can cause migration to fail
   - What's unclear: Should tests verify quota-exceeded handling?
   - Recommendation: Test happy path (normal quota) and document that progress tracking gracefully degrades in quota-exceeded scenarios

## Sources

### Primary (HIGH confidence)
- [Astro Testing Documentation](https://docs.astro.build/en/guides/testing/) - Official testing guide
- [Playwright ConsoleMessage API](https://playwright.dev/docs/api/class-consolemessage) - Console monitoring reference
- [Playwright Test Fixtures](https://playwright.dev/docs/test-fixtures) - Fixture patterns
- [MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) - localStorage testing
- [astro-link-validator GitHub](https://github.com/rodgtr1/astro-link-validator) - Installation and configuration

### Secondary (MEDIUM confidence)
- [Automatically Checking for Playwright Console Errors](https://alisterscott.github.io/Automatede2eTesting/AutomaticallyCheckingForPlaywrightConsoleErrors.html) - Fixture pattern examples
- [BrowserStack: Fixtures in Playwright 2026](https://www.browserstack.com/guide/fixtures-in-playwright) - Modern fixture patterns
- [GitHub: html-proofer](https://github.com/gjtorikian/html-proofer) - Alternative link checker
- [Testing Static Sites (VanessaSaurus)](https://vsoch.github.io/2020/urlchecker/) - Static site testing patterns

### Tertiary (LOW confidence)
- WebSearch results for static site navigation testing - General patterns, not tool-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Astro docs officially recommend Playwright, astro-link-validator is maintained and actively used
- Architecture: HIGH - Patterns verified from official Playwright docs and MDN, tested approaches
- Pitfalls: HIGH - Based on actual project context (base path, migration, cache) and common static site issues documented in search results

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable tooling, patterns unlikely to change rapidly)
