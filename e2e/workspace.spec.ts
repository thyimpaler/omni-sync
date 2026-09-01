import { expect, test } from '@playwright/test';

test.describe('workspace', () => {
    test('signup leads into onboarding, and connecting a channel updates the step', async ({ page }) => {
        await page.goto('/signup');

        await page.getByLabel('Full name').fill('Jamie Rivera');
        await page.getByLabel('Work email').fill('jamie@northfield.example');
        await page.getByRole('textbox', { name: 'Password' }).fill('a good passphrase');
        await page.getByRole('button', { name: 'Create account' }).click();

        await expect(page).toHaveURL(/\/setup$/, { timeout: 10_000 });
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Connect your channels');
        await expect(page.getByText('1 of 2 connected')).toBeVisible();

        await page.getByRole('button', { name: 'Connect' }).click();
        await expect(page.getByText('2 of 2 connected')).toBeVisible();

        await page.getByRole('link', { name: 'Continue' }).click();
        await expect(page).toHaveURL(/\/example$/);
    });

    test('signup refuses an invalid email instead of navigating', async ({ page }) => {
        await page.goto('/signup');

        await page.getByLabel('Full name').fill('Jamie Rivera');
        await page.getByLabel('Work email').fill('not-an-email');
        await page.getByRole('textbox', { name: 'Password' }).fill('a good passphrase');
        await page.getByRole('button', { name: 'Create account' }).click();

        await expect(page.getByText('Enter a valid work email.')).toBeVisible();
        await expect(page).toHaveURL(/\/signup$/);
    });

    test('Take next claims the longest wait and opens it in the inbox', async ({ page }) => {
        await page.goto('/example/queue');

        // Tomas Berg has waited 31:05 and is unassigned — he is next.
        await expect(page.getByRole('rowheader', { name: /Tomas Berg/ })).toBeVisible();
        await page.getByRole('button', { name: 'Take next' }).click();

        await expect(page).toHaveURL(/\/example$/);
        const active = page.locator('[aria-current="true"]');
        await expect(active).toContainText('Tomas Berg');
        await expect(active).toContainText('Alex A.');
    });

    test('assigning in the queue moves the sidebar counts', async ({ page }) => {
        await page.goto('/example/queue');

        const unassignedBefore = await page
            .getByRole('listitem')
            .filter({ hasText: 'Unassigned' })
            .innerText();
        await page.getByRole('button', { name: 'Assign' }).first().click();
        const unassignedAfter = await page
            .getByRole('listitem')
            .filter({ hasText: 'Unassigned' })
            .innerText();

        expect(unassignedAfter).not.toBe(unassignedBefore);
    });

    test('a reply lands in the thread and stops the clock', async ({ page }) => {
        await page.goto('/example');

        await page.getByLabel(/^Reply to/).fill('Replacement dispatched today, no charge.');
        await page.getByRole('button', { name: 'Send', exact: true }).click();

        // The text lands in the thread and in the queue preview; assert the thread.
        await expect(
            page.getByRole('paragraph').filter({ hasText: 'Replacement dispatched today, no charge.' })
        ).toBeVisible();
        const active = page.locator('[aria-current="true"]');
        await expect(active).toContainText('00:00');
    });

    test('resolving a conversation offers to reopen it', async ({ page }) => {
        await page.goto('/example');

        await page.getByRole('button', { name: 'Resolve', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Reopen', exact: true })).toBeVisible();
    });

    test('a policy target can be edited and saved', async ({ page }) => {
        await page.goto('/example/settings');

        await page.getByRole('button', { name: 'Edit' }).first().click();
        const target = page.getByLabel('First response');
        await target.fill('3 min');

        await expect(page.getByText('Unsaved changes')).toBeVisible();
        await page.getByRole('button', { name: 'Save changes' }).click();

        await expect(page.getByText('Unsaved changes')).toBeHidden();
        await expect(page.getByText('3 min').first()).toBeVisible();
    });

    test('the reports range toggle changes the numbers', async ({ page }) => {
        await page.goto('/example/analytics');

        await expect(page.getByText('3m 41s')).toBeVisible();
        await page.getByRole('button', { name: '7 days' }).click();
        await expect(page.getByText('3m 12s')).toBeVisible();
        await expect(
            page.getByText('25–31 August · both channels · compared with the week before')
        ).toBeVisible();
    });

    test('exporting the queue downloads a CSV with the real rows', async ({ page }) => {
        await page.goto('/example/queue');

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Export CSV' }).click(),
        ]);

        expect(download.suggestedFilename()).toBe('omnisync-queue.csv');

        const stream = await download.createReadStream();
        const chunks: Buffer[] = [];
        for await (const chunk of stream) chunks.push(chunk as Buffer);
        const csv = Buffer.concat(chunks).toString('utf8');

        expect(csv).toContain('Customer,Channel,Subject,Policy,Waiting,Assignee');
        expect(csv).toContain('Amanda Smith');
        expect(csv).toContain('Unassigned');
    });
});
