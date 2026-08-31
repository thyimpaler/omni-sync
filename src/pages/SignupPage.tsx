import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Briefcase, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthShell } from '../components/AuthShell';
import { Field } from '../components/Field';
import type { ChangeEvent, FormEvent } from 'react';

type SignupField = 'fullName' | 'company' | 'email' | 'password' | 'plan';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PLANS = [
    { value: 'team', label: 'Team — £29 per agent, per month' },
    { value: 'growth', label: 'Growth — £49 per agent, per month' },
];

export const SignupPage = () => {
    const [values, setValues] = useState({ fullName: '', company: '', email: '', password: '', plan: 'team' });
    const [errors, setErrors] = useState<Partial<Record<SignupField, string>>>({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const update =
        (key: SignupField) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setValues((v) => ({ ...v, [key]: e.target.value }));
            setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
        };

    const handleSignup = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nextErrors: Partial<Record<SignupField, string>> = {};
        if (!values.fullName.trim()) nextErrors.fullName = 'We need a name for your account.';
        if (!EMAIL_RE.test(values.email.trim())) nextErrors.email = 'Enter a valid work email.';
        if (values.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        toast('Signups are not live yet — opening the setup flow instead.', { icon: '🚧' });
        setTimeout(() => navigate('/setup'), 1600);
    };

    return (
        <AuthShell
            title="Start your 14-day trial"
            subtitle="No credit card required. Cancel any time."
            seoTitle="Sign up"
            seoDescription="Create an OmniSync workspace and connect WhatsApp and Instagram in minutes. 14-day trial, no card."
            width="max-w-xl"
            footer={
                <>
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-accent-700 underline-offset-2 hover:underline">
                        Log in
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSignup} noValidate className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                        label="Full name"
                        icon={User}
                        autoComplete="name"
                        placeholder="Jamie Rivera"
                        required
                        value={values.fullName}
                        onChange={update('fullName')}
                        error={errors.fullName}
                    />
                    <Field
                        label="Company"
                        icon={Briefcase}
                        autoComplete="organization"
                        placeholder="Acme Ltd"
                        value={values.company}
                        onChange={update('company')}
                    />
                </div>

                <Field
                    label="Work email"
                    type="email"
                    icon={Mail}
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    value={values.email}
                    onChange={update('email')}
                    error={errors.email}
                />

                <div className="relative">
                    <Field
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        icon={Lock}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        hint="Use 8 or more characters — a passphrase beats a clever password."
                        required
                        className="pr-12"
                        value={values.password}
                        onChange={update('password')}
                        error={errors.password}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-[2.9rem] -translate-y-1/2 p-1 text-neutral-500 transition-colors hover:text-ink"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                    </button>
                </div>

                <Field as="select" label="Plan" value={values.plan} onChange={update('plan')}>
                    {PLANS.map((plan) => (
                        <option key={plan.value} value={plan.value}>
                            {plan.label}
                        </option>
                    ))}
                </Field>

                <button type="submit" className="btn btn-primary w-full py-2.5">
                    Create account
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <p className="text-center text-[12px] leading-relaxed text-neutral-600">
                    By creating an account you agree to our{' '}
                    <Link to="/terms" className="text-accent-700 underline-offset-2 hover:underline">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-accent-700 underline-offset-2 hover:underline">
                        Privacy Policy
                    </Link>
                    .
                </p>
            </form>
        </AuthShell>
    );
};
