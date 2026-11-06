import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const base = process.env.TEST_URL || 'http://127.0.0.1:4321';
const output = new URL('../test-results/', import.meta.url).pathname;
mkdirSync(output, { recursive: true });
const installedChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(installedChrome) ? { executablePath: installedChrome } : {}),
});

try {
  if (process.argv.includes('--reference')) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
    await page.goto('https://www.ooliver.cn/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(8000);
    await page.screenshot({ path: '/private/tmp/ooliver-reference.png', fullPage: true });
    writeFileSync('/private/tmp/ooliver-visible.txt', await page.locator('body').innerText());
    console.log('Reference screenshot saved to /private/tmp/ooliver-reference.png');
  } else {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
    await context.addInitScript(() => localStorage.setItem('garden-theme', 'light'));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const failedResponses = [];
    page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`); });
    for (const path of ['/', '/blog/', '/library/', '/about/']) {
      const response = await page.goto(base + path, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, path);
      assert.equal(await page.locator('h1').count(), 1, `${path} needs one h1`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${path} overflows at desktop`);
      await page.screenshot({ path: `${output}${path === '/' ? 'home' : path.split('/')[1]}-desktop.png`, fullPage: true });
    }

    await page.goto(base + '/', { waitUntil: 'networkidle' });
    const firstAlbum = await page.locator('[data-album-title]').innerText();
    await page.locator('[data-album-next]').click();
    assert.notEqual(await page.locator('[data-album-title]').innerText(), firstAlbum, 'album control should update');
    await page.locator('[data-layout-toggle]').click();
    assert.equal(await page.locator('body').evaluate(body => body.classList.contains('expanded-home')), true);
    await page.screenshot({ path: `${output}home-expanded.png`, fullPage: true });
    await page.locator('[data-layout-toggle]').click();
    assert.equal(await page.locator('body').evaluate(body => body.classList.contains('expanded-home')), false);
    await page.locator('[data-theme-toggle]').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.screenshot({ path: `${output}home-dark.png`, fullPage: true });
    await page.reload({ waitUntil: 'networkidle' });
    // Init scripts force light for consistent screenshots. Persistence is checked in a separate page below.
    await page.keyboard.press('ControlOrMeta+k');
    assert.equal(await page.locator('#search-dialog').evaluate(dialog => dialog.open), true);
    await page.locator('#search-input').fill('安静');
    assert.equal(await page.locator('[data-search-entry]:visible').count(), 1);
    await page.locator('#search-input').fill('does-not-exist-xyz');
    assert.equal(await page.locator('.search-empty').isVisible(), true);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#search-dialog').open);

    await page.goto(base + '/blog/', { waitUntil: 'networkidle' });
    await page.locator('[data-filter="日常随笔"]').click();
    assert.equal(await page.locator('[data-filter-item="posts"]:visible').count(), 2);
    await page.locator('[data-filter="all"]').click();
    assert.equal(await page.locator('[data-filter-item="posts"]:visible').count(), 5);
    await page.goto(base + '/blog/?category=' + encodeURIComponent('数字花园'), { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-filter-item="posts"]:visible').count(), 1);
    assert.equal(await page.locator('[data-filter="数字花园"]').getAttribute('aria-pressed'), 'true');

    await page.goto(base + '/library/?category=music', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-filter-item="library"]:visible').count(), 3);
    await page.locator('[data-filter="books"]').click();
    assert.equal(await page.locator('[data-filter-item="library"]:visible').count(), 3);
    await page.locator('[data-filter="all"]').click();
    assert.equal(await page.locator('[data-filter-item="library"]:visible').count(), 12);

    await page.goto(base + '/blog/build-a-small-blog/', { waitUntil: 'networkidle' });
    assert.ok(await page.locator('.article-body pre code').count() > 0);
    assert.ok(await page.locator('.toc a').count() > 0);
    assert.ok(await page.locator('.copy-code-button').count() > 0);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('.copy-code-button').first().click();
    await page.waitForFunction(() => document.querySelector('.copy-code-button').textContent === '已复制');
    await page.screenshot({ path: `${output}article-desktop.png`, fullPage: true });

    const internalLinks = await page.locator('a[href^="/"]').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href').split('#')[0]))]);
    for (const href of internalLinks) {
      const response = await context.request.get(base + href);
      assert.ok(response.status() < 400, `broken internal link ${href}`);
    }
    for (const path of ['/rss.xml', '/robots.txt', '/sitemap-index.xml']) {
      const response = await context.request.get(base + path);
      assert.equal(response.status(), 200, path);
    }

    for (const width of [390, 320, 768, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      for (const path of ['/', '/blog/', '/library/', '/about/', '/blog/build-a-small-blog/']) {
        await page.goto(base + path, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflow, false, `${path} overflows at ${width}px`);
        if (width === 390) await page.screenshot({ path: `${output}${path === '/' ? 'home' : path.split('/').filter(Boolean).join('-')}-mobile.png`, fullPage: true });
      }
    }
    const persistenceContext = await browser.newContext();
    const persistentPage = await persistenceContext.newPage();
    await persistentPage.goto(base + '/', { waitUntil: 'networkidle' });
    const initialTheme = await persistentPage.locator('html').getAttribute('data-theme');
    await persistentPage.locator('[data-theme-toggle]').click();
    await persistentPage.reload({ waitUntil: 'networkidle' });
    assert.notEqual(await persistentPage.locator('html').getAttribute('data-theme'), initialTheme, 'theme should persist');
    assert.deepEqual(errors, [], 'browser JavaScript errors');
    assert.deepEqual(failedResponses, [], 'failed site resources');
    console.log('PASS: routes, theme, search, category/tag filters, album controls, layout toggle, article code, internal links, feeds, and responsive layouts.');
    console.log(`Screenshots: ${output}`);
  }
} finally {
  await browser.close();
}
