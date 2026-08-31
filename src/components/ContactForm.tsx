import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Field } from './Field';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface ContactValues {
    name: string;
    email: string;
    company: string;
    message: string;
}

type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const validate = ({ name, email, message }: ContactValues, requireMessage: boolean): ContactErrors => {
    const errors: ContactErrors = {};
    if (!name.trim()) errors.name = 'Please tell us your name.';
    if (!email.trim()) errors.email = 'We need an email to reply to.';
    else if (!EMAIL_RE.test(email.trim())) errors.email = 'That email address looks incomplete.';
    if (requireMessage && !message.trim()) errors.message = 'A sentence or two is plenty.';
    return errors;
};

/**
 * Shared sales / enterprise enquiry form. There is no backend yet, so the
 * submission is acknowledged locally and the mailto fallback below the form is
 * the route that actually reaches a human.
 */
interface ContactFormProps {
    messageLabel?: string;
    messagePlaceholder?: string;
    submitLabel?: string;
    successTitle?: string;
    successMessage?: string;
    requireMessage?: boolean;
    onDone?: () => void;
}

export const ContactForm = ({
    messageLabel = 'How can we help?',
    messagePlaceholder = 'Team size, channels you support, anything you want covered on the call…',
    submitLabel = 'Send message',
    successTitle = 'Message sent',
    successMessage = "Our team will get back to you within one business day.",
    requireMessage = false,
    onDone,
}: ContactFormProps) => {
    const [values, setValues] = useState<ContactValues>({ name: '', email: '', company: '', message: '' });
    const [errors, setErrors] = useState<ContactErrors>({});
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const update =
        (key: keyof ContactValues) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setValues((v) => ({ ...v, [key]: e.target.value }));
            setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
        };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nextErrors = validate(values, requireMessage);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            const firstInvalid = e.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]');
            firstInvalid?.focus();
            return;
        }

        setStatus('submitting');
        window.setTimeout(() => {
            setStatus('success');
            if (onDone) window.setTimeout(onDone, 2200);
        }, 700);
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center"
                role="status"
                aria-live="polite"
            >
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center bg-accent-200">
                    <CheckCircle2 className="h-6 w-6 text-accent-800" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-[24px]">{successTitle}</h3>
                <p className="text-neutral-700">{successMessage}</p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <Field
                    label="Your name"
                    required
                    autoComplete="name"
                    value={values.name}
                    onChange={update('name')}
                    error={errors.name}
                    placeholder="Jamie Rivera"
                />
                <Field
                    label="Work email"
                    type="email"
                    required
                    autoComplete="email"
                    value={values.email}
                    onChange={update('email')}
                    error={errors.email}
                    placeholder="you@company.com"
                />
            </div>
            <Field
                label="Company"
                autoComplete="organization"
                value={values.company}
                onChange={update('company')}
                placeholder="Optional"
            />
            <Field
                as="textarea"
                rows={3}
                label={messageLabel}
                required={requireMessage}
                value={values.message}
                onChange={update('message')}
                error={errors.message}
                placeholder={messagePlaceholder}
            />

            <button type="submit" disabled={status === 'submitting'} className="btn btn-primary w-full py-3">
                {status === 'submitting' ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Sending…
                    </>
                ) : (
                    <>
                        {submitLabel}
                        <Send className="h-4 w-4" aria-hidden="true" />
                    </>
                )}
            </button>

            <p className="text-center text-[12px] text-neutral-600">
                Prefer email?{' '}
                <a href="mailto:sales@omnisync.app" className="text-accent-700 underline-offset-2 hover:underline">
                    sales@omnisync.app
                </a>
            </p>
        </form>
    );
};
