import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';

const SECTIONS = [
    { to: '/#product', label: 'Product' },
    { to: '/#pricing', label: 'Pricing' },
    { to: '/#customers', label: 'Customers' },
    { to: '/about', label: 'Docs' },
];

export const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!mobileMenuOpen) return;
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setMobileMenuOpen(false);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = overflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [mobileMenuOpen]);

    return (
        <>
            <a href="#main" className="skip-link">
                Skip to content
            </a>

            <header className="sticky top-0 z-50 border-b bg-ground/95 backdrop-blur-sm rule">
                <nav aria-label="Main" className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4">
                    <Link to="/" aria-label="OmniSync home">
                        <Logo />
                    </Link>

                    <ul className="hidden items-center gap-7 md:flex">
                        {SECTIONS.map((item) => (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className="font-heading text-[14px] font-medium uppercase tracking-[0.08em] text-neutral-700 transition-colors hover:text-ink"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="hidden items-center gap-4 md:flex">
                        <Link
                            to="/login"
                            className="font-heading text-[14px] font-medium uppercase tracking-[0.08em] text-neutral-700 transition-colors hover:text-ink"
                        >
                            Sign in
                        </Link>
                        <Link to="/signup" className="btn btn-primary">
                            Start free
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="p-1 text-ink md:hidden"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-menu"
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                    </button>
                </nav>

                {mobileMenuOpen && (
                    <div id="mobile-menu" className="border-t bg-ground md:hidden rule">
                        <ul className="flex flex-col gap-4 px-6 py-6" onClick={() => setMobileMenuOpen(false)}>
                            {SECTIONS.map((item) => (
                                <li key={item.to}>
                                    <Link to={item.to} className="font-heading text-lg uppercase tracking-[0.08em] text-ink">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link to="/login" className="font-heading text-lg uppercase tracking-[0.08em] text-ink">
                                    Sign in
                                </Link>
                            </li>
                            <li>
                                <Link to="/signup" className="btn btn-primary w-full">
                                    Start free
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </header>
        </>
    );
};
