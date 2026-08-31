import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthShell } from '../components/AuthShell';
import { Field } from '../components/Field';
import type { ChangeEvent, FormEvent, SVGProps } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const GoogleIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
        <path fill="#EA4335" d="M12 10.2v3.9h5.5a4.7 4.7 0 0 1-2 3.1l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2H12z" />
        <path fill="#34A853" d="M6.6 14.3 5.9 15l-2.5 2A9 9 0 0 0 12 21c2.4 0 4.5-.8 6-2.2l-3.2-2.5c-.8.6-1.9.9-2.8.9-2.3 0-4.2-1.5-4.9-3.6z" />
        <path fill="#4A90E2" d="M3.4 7A9 9 0 0 0 3 12c0 1.8.4 3.5 1.2 5l3.4-2.7a5.4 5.4 0 0 1 0-3.5z" />
        <path fill="#FBBC05" d="M12 6.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 3.4 7l3.4 2.7C7.5 8 9.6 6.6 12 6.6z" />
    </svg>
);

export const LoginPage = () => {
    const [values, setValues] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState<Partial<Record<'email' | 'password', string>>>({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const update = (key: 'email' | 'password') => (e: ChangeEvent<HTMLInputElement>) => {
        setValues((v) => ({ ...v, [key]: e.target.value }));
        setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    };

    const handleLogin = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nextErrors: Partial<Record<'email' | 'password', string>> = {};
        if (!EMAIL_RE.test(values.email.trim())) nextErrors.email = 'Enter a valid email address.';
        if (values.password.length < 8) nextErrors.password = 'Passwords are at least 8 characters.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        toast('Accounts are not live yet — try the demo inbox instead.', { icon: '🚧' });
        setTimeout(() => navigate('/example'), 1600);
    };

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to your inbox."
            seoTitle="Log in"
            seoDescription="Sign in to your OmniSync workspace."
            footer={
                <>
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="font-medium text-accent-700 underline-offset-2 hover:underline">
                        Start for free
                    </Link>
                </>
            }
        >
            <form onSubmit={handleLogin} noValidate className="space-y-6">
                <Field
                    label="Email address"
                    type="email"
                    icon={Mail}
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    value={values.email}
                    onChange={update('email')}
                    error={errors.email}
                />

                <div>
                    <div className="relative">
                        <Field
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            icon={Lock}
                            autoComplete="current-password"
                            placeholder="••••••••"
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
                    <p className="mt-2 text-right">
                        <Link to="/forgot-password" className="text-[13px] text-accent-700 underline-offset-2 hover:underline">
                            Forgot password?
                        </Link>
                    </p>
                </div>

                <button type="submit" className="btn btn-primary w-full py-2.5">
                    Sign in
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </form>

            <div className="my-7 flex items-center gap-4 before:h-px before:flex-1 before:bg-neutral-300 after:h-px after:flex-1 after:bg-neutral-300">
                <span className="label">or</span>
            </div>

            <button
                type="button"
                onClick={() => toast('Single sign-on is coming with the hosted release.', { icon: '🔒' })}
                className="btn btn-secondary w-full py-2.5"
            >
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
            </button>
        </AuthShell>
    );
};
