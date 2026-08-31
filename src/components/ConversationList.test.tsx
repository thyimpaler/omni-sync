import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithWorkspace } from '../test/utils';
import { ConversationList } from './ConversationList';

const rowNames = () =>
    screen
        .getAllByRole('listitem')
        .map((li) => within(li).queryByRole('button')?.textContent ?? '')
        .filter(Boolean);

describe('ConversationList', () => {
    it('orders the queue by who has waited longest', () => {
        renderWithWorkspace(<ConversationList />);
        const names = rowNames();
        // 31:05 ahead of 22:18 ahead of 14:02; the resolved one sorts last.
        expect(names[0]).toContain('Tomas Berg');
        expect(names.at(-1)).toContain('James Wilson');
    });

    it('filters to breached conversations and shows how many', async () => {
        const user = userEvent.setup();
        renderWithWorkspace(<ConversationList />);

        // Row buttons also contain the word "Breached", so match the chip exactly.
        const breached = screen.getByRole('button', { name: 'Breached 2' });
        expect(breached).toHaveTextContent('2');

        await user.click(breached);
        expect(breached).toHaveAttribute('aria-pressed', 'true');

        const names = rowNames();
        expect(names).toHaveLength(2);
        expect(names.join(' ')).toContain('Amanda Smith');
        expect(names.join(' ')).toContain('Sarah Jenkins');
    });

    it('searches across name, subject and preview', async () => {
        const user = userEvent.setup();
        renderWithWorkspace(<ConversationList />);

        await user.type(screen.getByRole('searchbox', { name: /search conversations/i }), 'bulk');
        const names = rowNames();
        expect(names).toHaveLength(1);
        expect(names[0]).toContain('Elena Rodriguez');
    });

    it('says so when a filter matches nothing', async () => {
        const user = userEvent.setup();
        renderWithWorkspace(<ConversationList />);

        await user.type(screen.getByRole('searchbox', { name: /search conversations/i }), 'zzzzz');
        expect(screen.getByText(/nothing matches that filter/i)).toBeInTheDocument();
    });

    it('marks the open conversation for assistive technology', async () => {
        const user = userEvent.setup();
        renderWithWorkspace(<ConversationList />);

        const target = screen.getByRole('button', { name: /Michael Chen/ });
        await user.click(target);
        expect(target).toHaveAttribute('aria-current', 'true');
    });
});
