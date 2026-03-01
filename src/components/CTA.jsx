import React, { useState } from 'react';
import { ArrowRight, X, Send } from 'lucide-react';
import { GradientButton } from './GradientButton';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const CTA = () => {
    const [showContact, setShowContact] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setShowContact(false);
            setSubmitted(false);
            setFormData({ name: '', email: '', company: '', message: '' });
        }, 2500);
    };

    return (
        <section id="cta" className="py-24 relative overflow-hidden z-10">
            <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
            <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
                <div className="glass-panel p-12 md:p-20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
                    <h2 className="text-4xl md:text-6xl font-bold font-sora mb-6">Ready to delight your customers?</h2>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Join the next generation of customer support. Setup takes 5 minutes. First 14 days are on us.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup" className="w-full sm:w-auto">
                            <GradientButton icon={ArrowRight} className="text-lg py-4 px-8 w-full min-w-[200px]">
                                Start Free Trial
                            </GradientButton>
                        </Link>
                        <button
                            onClick={() => setShowContact(true)}
                            className="px-8 py-4 rounded-full font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors w-full sm:w-auto text-lg border border-white/5"
                        >
                            Talk to Sales
                        </button>
                    </div>
                </div>
            </div>

            {/* Contact Sales Modal */}
            <AnimatePresence>
                {showContact && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowContact(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowContact(false)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mb-6">
                                        <Send className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold font-sora text-white mb-2">Message Sent!</h3>
                                    <p className="text-slate-400">Our sales team will get back to you within 2 hours.</p>
                                </motion.div>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold font-sora text-white mb-2">Talk to Sales</h3>
                                    <p className="text-slate-400 mb-6">Tell us about your needs and we'll build a custom plan for your team.</p>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Your Name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Work Email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Company Name"
                                            value={formData.company}
                                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                        />
                                        <textarea
                                            rows="3"
                                            placeholder="Tell us about your needs..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                                        />
                                        <GradientButton className="w-full py-4 text-lg" icon={Send}>
                                            Send Message
                                        </GradientButton>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
