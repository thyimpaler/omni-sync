import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Numbers } from '../components/Numbers';
import { WhatItDoes } from '../components/WhatItDoes';
import { CustomerQuote } from '../components/CustomerQuote';
import { Pricing } from '../components/Pricing';
import { Footer } from '../components/Footer';
import { useSeo } from '../lib/seo';

export const LandingPage = () => {
    useSeo();

    return (
        <div className="min-h-screen bg-ground text-ink">
            <Navbar />
            <main id="main">
                <Hero />
                <Numbers />
                <WhatItDoes />
                <CustomerQuote />
                <Pricing />
            </main>
            <Footer />
        </div>
    );
};
