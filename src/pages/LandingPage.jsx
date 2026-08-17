import React, { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { Pricing } from '../components/Pricing';
import { ROICalculator } from '../components/ROICalculator';
import { CTA } from '../components/CTA';
import { Footer } from '../components/Footer';

export const LandingPage = () => {
    useEffect(() => {
        document.title = 'OmniSync | The Only Inbox That Guarantees No Customer Left Behind';
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-jakarta selection:bg-indigo-500/30 selection:text-white">
            {/* Global Background Blobs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-blob pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] animate-blob pointer-events-none z-0" style={{ animationDelay: '2s' }}></div>
            <div className="fixed top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[120px] animate-blob pointer-events-none z-0" style={{ animationDelay: '4s' }}></div>

            <Navbar />
            <Hero />
            <Features />
            <HowItWorks />
            <Pricing />
            <ROICalculator />
            <CTA />
            <Footer />
        </div>
    );
};
