import { test, expect } from '@playwright/test';

test('desktop navigation and vector logo', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const cover = page.locator('.desktop-stage .hb-cover-logo');
  await expect(cover).toBeVisible();
  await expect.poll(() => cover.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  const history = page.locator('.chapter[data-index="1"] .chapter-tab');
  await history.click();
  await expect(history).toHaveAttribute('aria-expanded', 'true');
  await page.locator('.chapter[data-index="0"] .chapter-tab').click();
  await expect(cover).toBeVisible();
  expect(errors).toEqual([]);
});

test('financial dialogs', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('#button-finance').click();
  await expect(page.locator('#finance')).toBeVisible();
  for (const feature of ['activities', 'budget', 'risk', 'goals']) {
    await page.locator('#hb-' + feature + '-open').click();
    const dialog = page.locator('#hb-' + feature + '-dialog');
    await expect(dialog).toHaveJSProperty('open', true);
    await dialog.locator('.hb-activities-close').first().click();
    await expect(dialog).toHaveJSProperty('open', false);
  }
  expect(errors).toEqual([]);
});

test('mobile chapters', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#mobile-current-label')).toHaveText('Inicio');
  await page.locator('#mobile-next-button').click();
  await expect(page.locator('#mobile-current-label')).toHaveText('Historia');
  expect(errors).toEqual([]);
});

test('delivery and locations', async ({ page }) => {
  await page.goto('/');
  const delivery = page.locator('#delivery-trigger');
  await delivery.click();
  await expect(delivery).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#open-locations').click();
  await expect(page.locator('#locations-screen')).toBeVisible();
  await page.locator('#close-locations').click();
  await expect(page.locator('#locations-screen')).toBeHidden();
});


test.describe('horizontal motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('wheel navigation settles on a complete chapter', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.mouse.move(600, 400);
    await page.mouse.wheel(0, 180);
    const history = page.locator('.chapter[data-index="1"] .chapter-tab');
    await expect(history).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(async () => {
      const chapter = page.locator('.chapter[data-index="1"]');
      return chapter.evaluate(node => Math.round(new DOMMatrixReadOnly(getComputedStyle(node).transform).m41));
    }).toBe(await history.evaluate(node => Math.round(node.getBoundingClientRect().width)));
    expect(errors).toEqual([]);
  });

  test('keyboard navigation respects the first and last chapters', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('End');
    await expect(page.locator('.chapter[data-index="7"] .chapter-tab')).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Home');
    await expect(page.locator('.chapter[data-index="0"] .chapter-tab')).toHaveAttribute('aria-expanded', 'true');
  });
});
