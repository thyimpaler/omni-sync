import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { GradientButton } from './GradientButton';
import { Link } from 'react-router-dom';

export const ROICalculator = () => {
    const [conversations, setConversations] = useState(100);
    const [responseTime, setResponseTime] = useState(30);
    const [breachedPct, setBreachedPct] = useState(25);
    const [calculated, setCalculated] = useState(false);

    const results = useMemo(() => {
        const avgOrderValue = 65;
        const abandonRate = 0.15;
        const lostSalesPerDay = Math.round(conversations * (breachedPct / 100) * abandonRate * avgOrderValue);
        const monthlyLoss = lostSalesPerDay * 30;
        const recoveryRate = 0.87;
        const monthlyRecovery = Math.round(monthlyLoss * recoveryRate);
        const subscriptionCost = 99;
        const roi = Math.round(monthlyRecovery / subscriptionCost);
        const newResponseTime = Math.max(2, Math.round(responseTime * 0.3));
        return { monthlyLoss, monthlyRecovery, roi, newResponseTime, subscriptionCost };
    }, [conversations, responseTime, breachedPct]);

    return (
        <section id="roi" className="py-24 relative z-10 bg-slate-900/50">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 font-medium text-sm mb-6">
                        <Calculator className="w-4 h-4" />
                        Provable Business Value
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold font-sora mb-4">Calculate Your ROI</h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">See exactly how much revenue you're losing to slow response times — and how much OmniSync can recover.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Input Side */}
                    <div className="glass-panel p-8 space-y-8">
                        <div>
                            <label className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                                <span>Daily customer conversations</span>
                                <span className="text-indigo-400 font-mono font-bold">{conversations}</span>
                            </label>
                            <input
                                type="range" min="10" max="1000" step="10"
                                value={conversations}
                                onChange={(e) => { setConversations(Number(e.target.value)); setCalculated(false); }}
                                className="w-full h-2 rounded-full bg-slate-700 appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1"><span>10</span><span>1,000</span></div>
                        </div>
                        <div>
                            <label className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                                <span>Average response time (minutes)</span>
                                <span className="text-indigo-400 font-mono font-bold">{responseTime}m</span>
                            </label>
                            <input
                                type="range" min="5" max="120" step="5"
                                value={responseTime}
                                onChange={(e) => { setResponseTime(Number(e.target.value)); setCalculated(false); }}
                                className="w-full h-2 rounded-full bg-slate-700 appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1"><span>5m</span><span>120m</span></div>
                        </div>
                        <div>
                            <label className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                                <span>Responses exceeding 30-min SLA</span>
                                <span className="text-indigo-400 font-mono font-bold">{breachedPct}%</span>
                            </label>
                            <input
                                type="range" min="0" max="80" step="5"
                                value={breachedPct}
                                onChange={(e) => { setBreachedPct(Number(e.target.value)); setCalculated(false); }}
                                className="w-full h-2 rounded-full bg-slate-700 appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1"><span>0%</span><span>80%</span></div>
                        </div>
                        <button
                            onClick={() => setCalculated(true)}
                            className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all"
                        >
                            Calculate ROI
                        </button>
                    </div>

                    {/* Results Side */}
                    <div className="space-y-6">
                        {calculated ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                <div className="glass-panel p-6 border-red-500/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div className="text-sm text-slate-400">Currently losing</div>
                                    </div>
                                    <div className="text-3xl font-bold font-mono text-red-400">${results.monthlyLoss.toLocaleString()}<span className="text-base font-normal text-slate-500">/month</span></div>
                                    <div className="text-sm text-slate-500 mt-1">in abandoned sales from slow responses</div>
                                </div>

                                <div className="glass-panel p-6 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div className="text-sm text-slate-400">With OmniSync, recover</div>
                                    </div>
                                    <div className="text-3xl font-bold font-mono text-green-400">${results.monthlyRecovery.toLocaleString()}<span className="text-base font-normal text-slate-500">/month</span></div>
                                    <div className="text-sm text-slate-500 mt-1">87% improvement in response-driven revenue</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass-panel p-5 text-center">
                                        <div className="text-3xl font-bold font-mono text-indigo-400">{results.roi}x</div>
                                        <div className="text-xs text-slate-400 mt-1">ROI on subscription</div>
                                    </div>
                                    <div className="glass-panel p-5 text-center">
                                        <div className="text-3xl font-bold font-mono text-blue-400">{results.newResponseTime}m</div>
                                        <div className="text-xs text-slate-400 mt-1">New avg response time</div>
                                    </div>
                                </div>

                                <div className="glass-panel p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-slate-400">Payback period</div>
                                        <div className="text-lg font-bold text-white">Under 2 weeks</div>
                                    </div>
                                    <Link to="/signup">
                                        <GradientButton icon={ArrowRight} className="px-6 py-3">
                                            Start Free Trial
                                        </GradientButton>
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="glass-panel p-12 text-center">
                                <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6">
                                    <Calculator className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Ready to see your numbers?</h3>
                                <p className="text-slate-400 text-sm">Adjust the sliders and hit Calculate to see your potential ROI with OmniSync.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
