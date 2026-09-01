import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mail } from 'lucide-react';
import { Field } from './Field';

describe('Field', () => {
    it('associates the label with the control, so clicking it focuses the input', async () => {
        const user = userEvent.setup();
        render(<Field label="Work email" />);

        const input = screen.getByLabelText('Work email');
        await user.click(screen.getByText('Work email'));
        expect(input).toHaveFocus();
    });

    it('marks a required field for sighted users without leaking the asterisk to screen readers', () => {
        render(<Field label="Work email" required />);

        // Role queries use the accessible-name algorithm, which excludes the
        // aria-hidden asterisk — so the name a screen reader announces is clean
        // even though the label's text content carries the marker.
        const input = screen.getByRole('textbox', { name: 'Work email' });
        expect(input).toBeRequired();
        expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    });

    it('wires an error to the control through aria-describedby and aria-invalid', () => {
        render(<Field label="Work email" error="That email address looks incomplete." />);

        const input = screen.getByLabelText('Work email');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAccessibleDescription('That email address looks incomplete.');
    });

    it('describes the control with the hint when there is no error', () => {
        render(<Field label="Password" hint="Use 8 or more characters." />);
        expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Use 8 or more characters.');
    });

    it('shows the error instead of the hint, so the two never compete', () => {
        render(<Field label="Password" hint="Use 8 or more characters." error="Too short." />);

        expect(screen.getByText('Too short.')).toBeInTheDocument();
        expect(screen.queryByText('Use 8 or more characters.')).not.toBeInTheDocument();
    });

    it('is not marked invalid when there is no error', () => {
        render(<Field label="Company" />);
        expect(screen.getByLabelText('Company')).not.toHaveAttribute('aria-invalid');
    });

    it('renders a textarea when asked, keeping the same label wiring', () => {
        render(<Field as="textarea" label="How can we help?" rows={3} />);

        const control = screen.getByLabelText('How can we help?');
        expect(control.tagName).toBe('TEXTAREA');
        expect(control).toHaveAttribute('rows', '3');
    });

    it('renders a select with its options', () => {
        render(
            <Field as="select" label="Plan" defaultValue="growth">
                <option value="team">Team</option>
                <option value="growth">Growth</option>
            </Field>
        );

        const control = screen.getByLabelText('Plan');
        expect(control.tagName).toBe('SELECT');
        expect(control).toHaveValue('growth');
    });

    it('hides a decorative icon from assistive technology', () => {
        const { container } = render(<Field label="Work email" icon={Mail} />);
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('gives each instance its own ids, so two fields never collide', () => {
        render(
            <>
                <Field label="First" />
                <Field label="Second" />
            </>
        );

        expect(screen.getByLabelText('First').id).not.toBe(screen.getByLabelText('Second').id);
    });
});
