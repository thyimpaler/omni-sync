import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

/** Mirrors how the real callers use it: an inline arrow for onClose. */
const Harness = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                Talk to sales
            </button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Talk to sales"
                description="Tell us more"
            >
                <input aria-label="Your name" />
                <button type="button">Send</button>
            </Modal>
        </>
    );
};

describe('Modal', () => {
    it('is not in the document until opened', () => {
        render(<Harness />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('exposes its title and description to assistive technology', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(screen.getByRole('button', { name: 'Talk to sales' }));

        const dialog = await screen.findByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAccessibleName('Talk to sales');
        expect(dialog).toHaveAccessibleDescription('Tell us more');
    });

    it('closes on Escape even when focus has not landed inside', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(screen.getByRole('button', { name: 'Talk to sales' }));
        await screen.findByRole('dialog');

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes when the backdrop is clicked but not the panel', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(screen.getByRole('button', { name: 'Talk to sales' }));
        const dialog = await screen.findByRole('dialog');

        await user.click(dialog);
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        const backdrop = dialog.parentElement as HTMLElement;
        await user.click(backdrop);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('locks the page behind it while open and restores the scroll afterwards', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        expect(document.body.style.overflow).toBe('');

        await user.click(screen.getByRole('button', { name: 'Talk to sales' }));
        await screen.findByRole('dialog');
        expect(document.body.style.overflow).toBe('hidden');

        await user.keyboard('{Escape}');
        expect(document.body.style.overflow).toBe('');
    });

    it('keeps Tab inside the dialog', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(screen.getByRole('button', { name: 'Talk to sales' }));
        const dialog = await screen.findByRole('dialog');

        // Walk past the last control; focus should wrap rather than escape.
        await user.tab();
        await user.tab();
        await user.tab();
        await user.tab();
        expect(dialog.contains(document.activeElement)).toBe(true);
    });
});
