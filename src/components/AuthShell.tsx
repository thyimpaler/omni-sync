import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';
import { useSeo } from '../lib/seo';
import type { ReactNode } from 'react';

interface AuthShellProps {
    title: string;
    subtitle?: string;
    seoTitle?: string;
    seoDescription?: string;
    width?: string;
    children: ReactNode;
    footer?: ReactNode;
}

/** Shared frame for log in / sign up / password reset. */
export const AuthShell = ({
    title,
    subtitle,
    seoTitle,
    seoDescription,
    width = 'max-w-md',
    children,
    footer,
}: AuthShellProps) => {
    useSeo({ title: seoTitle ?? title, description: seoDescription });

    return (
        <div className="flex min-h-screen flex-col bg-ground text-ink">
            <div className="border-b rule">
                <div className="mx-auto max-w-[1240px] px-6 py-4">
                    <Link to="/" aria-label="OmniSync home">
                        <Logo />
                    </Link>
                </div>
            </div>

            <main id="main" className={`mx-auto w-full px-6 py-14 ${width}`}>
                <h1 className="text-[32px]">{title}</h1>
                {subtitle && <p className="mt-2 text-neutral-700">{subtitle}</p>}

                <div className="panel mt-8 p-8">{children}</div>

                {footer && <div className="mt-6 text-center text-[14px] text-neutral-700">{footer}</div>}

                <p className="mt-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-[14px] text-neutral-600 hover:text-ink">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Back to site
                    </Link>
                </p>
            </main>
        </div>
    );
};
