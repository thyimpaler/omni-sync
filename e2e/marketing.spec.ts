import { expect, test } from '@playwright/test';

test.describe('marketing site', () => {
    test('the landing page leads with the promise and the live queue', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/Every customer message in one queue/);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
            'Every customer message in one queue, with a clock on it.'
        );

        // The inbox preview is the proof, so it has to be on the page.
        await expect(page.getByText('Amanda Smith')).toBeVisible();
        await expect(page.getByText('04:12')).toBeVisible();
        await expect(
            page.getByText('The actual inbox. Solid block means the target has already been missed.')
        ).toBeVisible();
    });

    test('states plainly that nothing sends without an agent', async ({ page }) => {
        await page.goto('/');
        await expect(
            page.getByText('Nothing writes to a customer without an agent pressing send.')
        ).toBeVisible();
    });

    test('section links work from another page', async ({ page }) => {
        await page.goto('/privacy');
        await page.getByRole('link', { name: 'Pricing' }).first().click();

        await expect(page).toHaveURL(/\/#pricing$/);
        await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
    });

    test('per-route titles are set, not left on the shell default', async ({ page }) => {
        await page.goto('/careers');
        await expect(page).toHaveTitle('Careers | OmniSync');

        await page.goto('/terms');
        await expect(page).toHaveTitle('Terms of Service | OmniSync');
    });

    test('an unknown URL gets the 404, not a blank page', async ({ page }) => {
        await page.goto('/no-such-page');
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page is not in the queue.');
        await expect(page).toHaveTitle(/Page not found/);
    });

    test('the skip link is the first thing a keyboard reaches', async ({ page }) => {
        await page.goto('/');
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    });
});
