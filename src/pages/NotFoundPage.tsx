import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';
import { PageShell } from '../components/PageShell';

const SUGGESTIONS = [
    { to: '/#product', label: 'Product' },
    { to: '/#pricing', label: 'Pricing' },
    { to: '/example', label: 'Live demo inbox' },
    { to: '/contact', label: 'Contact us' },
];

export const NotFoundPage = () => (
    <PageShell
        eyebrow="404"
        title="This page is not in the queue."
        intro="The link is broken or the page moved. Nothing here is waiting on a reply — but these might be what you wanted."
        seoTitle="Page not found"
        seoDescription="The page you were looking for does not exist. Head back to the OmniSync home page."
    >
        <div className="panel p-8">
            <nav aria-label="Suggested pages" className="flex flex-wrap gap-3">
                {SUGGESTIONS.map((item) => (
                    <Link key={item.to} to={item.to} className="btn btn-secondary">
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/" className="btn btn-primary px-6 py-3">
                    Back to home
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to="/signup" className="btn btn-secondary px-6 py-3">
                    <Home className="h-5 w-5" aria-hidden="true" />
                    Start free trial
                </Link>
            </div>
        </div>
    </PageShell>
);
