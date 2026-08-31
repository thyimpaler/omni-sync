import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithWorkspace } from '../test/utils';
import { SettingsPage } from './SettingsPage';

describe('SettingsPage', () => {
    it('starts clean, so save and discard are unavailable', () => {
        renderWithWorkspace(<SettingsPage />);
        expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /discard/i })).toBeDisabled();
        expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
    });

    it('marks the form dirty once a target changes, then clean after saving', async () => {
        const user = userEvent.setup();
        renderWithWorkspace(<SettingsPage />);

        await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]!);
        const target = screen.getByLabelText(/first response/i);
        await user.clear(target);
        await user.type(target, '3 min');

        expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
        const save = screen.getByRole('button', { name: /save changes/i });
        expect(save).toBeEnabled();

        await user.click(save);
        expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
        expect(screen.getByText('3 min')).toBeInTheDocument();
    });

    it('puts the policies back as they were when changes are discarded', async () => {
        const user = userEvent.setup();
        renderWithWorkspace(<SettingsPage />);

        await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]!);
        const name = screen.getByLabelText(/policy name/i);
        await user.clear(name);
        await user.type(name, 'Renamed');

        await user.click(screen.getByRole('button', { name: /discard/i }));
        // The name also appears in the effect panel, so scope to the heading.
        expect(screen.getByRole('heading', { name: 'VIP customers' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Renamed' })).not.toBeInTheDocument();
    });

    it('adds a policy above the default one, which must stay last', async () => {
        const user = userEvent.setup();
        renderWithWorkspace(<SettingsPage />);

        await user.click(screen.getByRole('button', { name: /add a policy/i }));

        const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
        expect(headings).toContain('New policy');
        expect(headings.at(-1)).toBe('Everything else');
    });

    it('toggles an escalation action and reports its state', async () => {
        const user = userEvent.setup();
        renderWithWorkspace(<SettingsPage />);

        const holding = screen.getByRole('switch', { name: /holding message/i });
        expect(holding).toHaveAttribute('aria-checked', 'false');

        await user.click(holding);
        expect(holding).toHaveAttribute('aria-checked', 'true');
    });

    it('is honest that the other tabs are not part of the demo', async () => {
        const user = userEvent.setup();
        renderWithWorkspace(<SettingsPage />);

        await user.click(screen.getByRole('tab', { name: 'Business hours' }));
        expect(screen.getByText(/not part of this demo workspace/i)).toBeInTheDocument();
    });
});
