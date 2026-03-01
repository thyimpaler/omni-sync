import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { GradientButton } from './GradientButton';

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all">
                        <Zap className="text-white w-6 h-6" fill="currentColor" />
                    </div>
                    <span className="text-2xl font-bold font-sora text-white tracking-tight">OmniSync</span>
                </Link>
                <div className="hidden md:flex items-center gap-8 border border-white/10 rounded-full px-8 py-2 bg-white/5 backdrop-blur-sm">
                    <a href="#features" className="text-slate-300 hover:text-white transition-colors font-medium">Features</a>
                    <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors font-medium">How it Works</a>
                    <a href="#pricing" className="text-slate-300 hover:text-white transition-colors font-medium">Pricing</a>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Log In</Link>
                    <Link to="/signup">
                        <GradientButton>Start Free Trial</GradientButton>
                    </Link>
                </div>
                <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-full left-0 w-full bg-slate-900/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            <a href="#features" className="text-lg text-slate-300">Features</a>
                            <a href="#how-it-works" className="text-lg text-slate-300">How it Works</a>
                            <a href="#pricing" className="text-lg text-slate-300">Pricing</a>
                            <hr className="border-white/10" />
                            <Link to="/login" className="text-lg text-slate-300">Log In</Link>
                            <Link to="/signup" className="w-full">
                                <GradientButton className="w-full">Start Free Trial</GradientButton>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
