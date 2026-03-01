import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plug, MessageSquare, Zap, BarChart3, CheckCircle2 } from 'lucide-react';

const steps = [
    {
        icon: Plug,
        title: 'Connect your channels',
        description: 'Link your WhatsApp Business and Instagram accounts in just three clicks. No coding or complex configuration required.',
        detailed: ['One-click Meta authentication', 'Supports multiple numbers', 'Import existing chat history']
    },
    {
        icon: MessageSquare,
        title: 'Unified Inbox routing',
        description: 'All DMs flow into a single, collaborative workspace. Tag, assign, and prioritize messages automatically.',
        detailed: ['Smart routing to available agents', 'Auto-tagging based on keywords', 'Internal notes and @mentions']
    },
    {
        icon: Zap,
        title: 'Apply SLAs & Automation',
        description: 'Set custom response time targets. AI drafts replies to common questions so agents can work faster.',
        detailed: ['Dynamic visual timers', 'Escalation rules for VIPs', 'AI suggested responses']
    },
    {
        icon: BarChart3,
        title: 'Measure & Improve',
        description: 'Track team performance, average wait times, and customer satisfaction scores in real-time.',
        detailed: ['Live dashboard metrics', 'CSV/Excel exports', 'Detailed CSAT breakdowns']
    }
];

export const HowItWorks = () => {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section id="how-it-works" className="py-24 relative z-10 bg-slate-900/50">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 font-medium text-sm mb-6">
                        Setup in Minutes
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold font-sora mb-4">Go live by lunchtime.</h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">Skip the endless onboarding. OmniSync gets out of your way and lets you work.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start max-w-6xl mx-auto">

                    <div className="w-full lg:w-1/2 space-y-4">
                        {steps.map((step, index) => {
                            const isActive = activeStep === index;
                            return (
                                <motion.button
                                    key={index}
                                    onClick={() => setActiveStep(index)}
                                    className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border ${isActive
                                            ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]'
                                            : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                            <step.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-semibold mb-2 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                Step {index + 1}: {step.title}
                                            </h3>
                                            <p className={`text-sm ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                                                {step.description}
                                            </p>
                                            <AnimatePresence>
                                                {isActive && (
                                                    <motion.ul
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-4 space-y-2"
                                                    >
                                                        {step.detailed.map((item, i) => (
                                                            <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </motion.ul>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.button>
                            )
                        })}
                    </div>

                    <div className="w-full lg:w-1/2 lg:sticky top-32">
                        <div className="aspect-square md:aspect-[4/3] rounded-3xl border border-white/10 glass-panel bg-slate-900/60 p-4 relative overflow-hidden flex items-center justify-center">

                            <AnimatePresence mode="wait">
                                {activeStep === 0 && (
                                    <motion.div key="step0" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
                                        <div className="flex items-center justify-center gap-6 mb-8">
                                            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center animate-pulse"><MessageSquare className="w-10 h-10 text-green-400" /></div>
                                            <div className="w-12 h-1 bg-gradient-to-r from-green-500/50 to-pink-500/50"></div>
                                            <div className="w-20 h-20 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}><Zap className="w-10 h-10 text-pink-400" /></div>
                                        </div>
                                        <div className="px-6 py-3 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-medium inline-block shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                                            <Plug className="w-5 h-5 inline mr-2" />
                                            Syncing 14,249 historical messages...
                                        </div>
                                    </motion.div>
                                )}
                                {activeStep === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full h-full flex flex-col gap-3 p-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-full bg-slate-800 rounded-lg p-3 flex items-center gap-3 border border-white/5">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className={`h-3 rounded w-1/3 ${i === 2 ? 'bg-indigo-500/50' : 'bg-slate-700'}`}></div>
                                                    <div className="h-2 bg-slate-700 w-3/4 rounded"></div>
                                                </div>
                                                <div className={`px-2 py-1 rounded text-[10px] font-bold ${i === 1 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{i === 1 ? 'Urgent' : 'Resolved'}</div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                                {activeStep === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center w-full max-w-xs">
                                        <div className="w-48 h-48 mx-auto rounded-full border-[8px] border-slate-800 flex items-center justify-center relative shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                                            <div className="absolute inset-0 rounded-full border-[8px] border-red-500 border-t-transparent animate-spin" style={{ animationDuration: '3s' }}></div>
                                            <div className="text-center">
                                                <div className="text-4xl font-mono font-bold text-red-400 mb-1">-05:22</div>
                                                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">SLA Breached</div>
                                            </div>
                                        </div>
                                        <div className="mt-8 bg-slate-800 p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-slate-400 mb-2">Automated Rules Executed</div>
                                            <div className="flex items-center gap-2 text-sm text-white bg-slate-700/50 p-2 rounded">
                                                <Zap className="w-4 h-4 text-yellow-500" /> Assigned to Senior Agent
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {activeStep === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full h-full p-6 flex flex-col justify-end">
                                        <div className="flex items-end justify-between h-48 gap-4 border-b border-l border-slate-700 pb-2 pl-2">
                                            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    className="w-full bg-gradient-to-t from-indigo-600 to-blue-400 rounded-t-sm"
                                                ></motion.div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-4 text-xs text-slate-500 font-mono">
                                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
