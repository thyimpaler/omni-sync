import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const LINKS = [
    { to: '/#product', label: 'Product' },
    { to: '/#pricing', label: 'Pricing' },
    { to: '/about', label: 'Docs' },
    { to: '/blog', label: 'Status' },
    { to: '/privacy', label: 'Privacy' },
    { to: '/terms', label: 'Terms' },
];

export const Footer = () => (
    <footer className="mx-auto flex max-w-[1240px] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <Link to="/" aria-label="OmniSync home">
            <Logo size={22} />
        </Link>

        <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-neutral-600">
                {LINKS.map((link) => (
                    <li key={link.label}>
                        <Link to={link.to} className="transition-colors hover:text-ink">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>

        <p className="text-[13px] text-neutral-500">&copy; {new Date().getFullYear()} OmniSync</p>
    </footer>
);
