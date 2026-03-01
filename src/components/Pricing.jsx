import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, X, Send } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GradientButton } from './GradientButton';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const plans = [
    {
        name: 'Normal',
        price: '$29',
        desc: 'For small businesses processing moderate volume.',
        features: ['Up to 1,000 messages/mo', 'WhatsApp Integration', 'Basic SLA tracking', '7-day chat history', 'Email Support'],
        popular: false
    },
    {
        name: 'Corporate',
        price: '$99',
        desc: 'For growing teams resolving queries at scale.',
        features: ['Unlimited messages', 'WhatsApp & Instagram', 'Advanced SLA engine', 'Unlimited history', 'Advanced Analytics', 'Priority 24/7 Support'],
        popular: true
    },
    {
        name: 'Tailor Custom',
        price: 'Custom',
        desc: 'For enterprises needing custom integrations.',
        features: ['Custom APIs', 'Dedicated Account Manager', 'On-premise deployment', 'Custom SLAs & Reports', 'Volume Discounts'],
        popular: false
    }
];

const featureComparison = [
    { feature: 'Monthly Messages', normal: '1,000', corporate: 'Unlimited', custom: 'Unlimited' },
    { feature: 'Platforms', normal: 'WhatsApp', corporate: 'WA & IG', custom: 'All + Custom APIs' },
    { feature: 'SLA Tracking', normal: 'Basic (Fixed)', corporate: 'Advanced (Dynamic)', custom: 'Fully Customizable' },
    { feature: 'Chat History', normal: '7 Days', corporate: 'Unlimited', custom: 'Unlimited + Export' },
    { feature: 'Analytics', normal: 'Basic Dashboard', corporate: 'Advanced Reports', custom: 'Custom BI Export' },
    { feature: 'Support Level', normal: 'Email', corporate: 'Priority 24/7', custom: 'Dedicated Manager' }
];

export const Pricing = () => {
    const [showCompare, setShowCompare] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [contactData, setContactData] = useState({ name: '', email: '', company: '', needs: '' });
    const [contactSubmitted, setContactSubmitted] = useState(false);

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setContactSubmitted(true);
        setTimeout(() => {
            setShowContact(false);
            setContactSubmitted(false);
            setContactData({ name: '', email: '', company: '', needs: '' });
        }, 2500);
    };

    return (
        <section id="pricing" className="py-24 relative z-10">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold font-sora mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">Start with a 14-day free trial. No credit card required.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                    {plans.map((plan, i) => (
                        <GlassCard key={i} delay={i * 0.1} className={`relative flex flex-col ${plan.popular ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)] transform md:-translate-y-4' : ''}`}>
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                            <p className="text-slate-400 mb-6 h-12">{plan.desc}</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                {plan.price !== 'Custom' && <span className="text-slate-400">/mo</span>}
                            </div>
                            <ul className="mb-8 space-y-4 flex-1">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                        <span className="text-slate-300">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto">
                                {plan.price === 'Custom' ? (
                                    <button onClick={() => setShowContact(true)} className="block w-full">
                                        <GradientButton className="w-full min-w-full">
                                            Contact Sales
                                        </GradientButton>
                                    </button>
                                ) : (
                                    <Link to="/signup" className="block w-full">
                                        <GradientButton className="w-full min-w-full">
                                            Get Started
                                        </GradientButton>
                                    </Link>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Comparison Table Toggle */}
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => setShowCompare(!showCompare)}
                        className="w-full flex items-center justify-center gap-2 py-4 text-slate-300 hover:text-white transition-colors border-y border-white/5 bg-slate-900/50 hover:bg-slate-800/50"
                    >
                        <span className="font-medium text-lg">Compare All Features</span>
                        {showCompare ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    <AnimatePresence>
                        {showCompare && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="glass-panel mt-8 p-0 overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 bg-white/5">
                                                <th className="p-4 font-semibold text-white">Features</th>
                                                <th className="p-4 font-semibold text-slate-200">Normal</th>
                                                <th className="p-4 font-semibold text-indigo-300">Corporate</th>
                                                <th className="p-4 font-semibold text-purple-300">Custom</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {featureComparison.map((row, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-4 text-slate-300 font-medium">{row.feature}</td>
                                                    <td className="p-4 text-slate-400">{row.normal}</td>
                                                    <td className="p-4 text-indigo-400 font-medium">{row.corporate}</td>
                                                    <td className="p-4 text-purple-400">{row.custom}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Enterprise Contact Modal */}
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

                            {contactSubmitted ? (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mb-6">
                                        <Send className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold font-sora text-white mb-2">Request Received!</h3>
                                    <p className="text-slate-400">Our enterprise team will reach out within 24 hours.</p>
                                </motion.div>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold font-sora text-white mb-2">Enterprise Inquiry</h3>
                                    <p className="text-slate-400 mb-6">Tell us about your requirements and we'll build a custom plan.</p>
                                    <form onSubmit={handleContactSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder="Your Name" required value={contactData.name} onChange={(e) => setContactData({...contactData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                                            <input type="email" placeholder="Work Email" required value={contactData.email} onChange={(e) => setContactData({...contactData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                                        </div>
                                        <input type="text" placeholder="Company Name" value={contactData.company} onChange={(e) => setContactData({...contactData, company: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                                        <textarea rows="3" placeholder="Describe your needs (team size, integrations needed, etc.)..." value={contactData.needs} onChange={(e) => setContactData({...contactData, needs: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none" />
                                        <GradientButton className="w-full py-4 text-lg" icon={Send}>
                                            Submit Inquiry
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
