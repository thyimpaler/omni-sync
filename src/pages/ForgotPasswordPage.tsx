import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { AuthShell } from '../components/AuthShell';
import { Field } from '../components/Field';
import type { FormEvent } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!EMAIL_RE.test(email.trim())) {
            setError('Enter the email you signed up with.');
            return;
        }
        setError(undefined);
        setSent(true);
    };

    return (
        <AuthShell
            title="Reset your password"
            subtitle="Enter your email and we will send a reset link."
            seoTitle="Reset password"
            seoDescription="Request a password reset link for your OmniSync account."
        >
            {sent ? (
                <div className="text-center" role="status" aria-live="polite">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-accent-200">
                        <Mail className="h-6 w-6 text-accent-800" aria-hidden="true" />
                    </div>
                    <h2 className="mb-2 text-[22px]">Check your email</h2>
                    <p className="mb-6 text-neutral-700">
                        If an account exists for <span className="text-ink">{email}</span>, a reset link is on its way.
                        It expires in 30 minutes.
                    </p>
                    <Link to="/login" className="inline-flex items-center gap-2 font-medium text-accent-700 hover:underline">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to log in
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <Field
                        label="Email address"
                        type="email"
                        icon={Mail}
                        autoComplete="email"
                        placeholder="you@company.com"
                        required
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError(undefined);
                        }}
                        error={error}
                    />
                    <button type="submit" className="btn btn-primary w-full py-2.5">
                        Send reset link
                    </button>
                    <p className="text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-[14px] text-neutral-600 transition-colors hover:text-ink">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to log in
                        </Link>
                    </p>
                </form>
            )}
        </AuthShell>
    );
};
