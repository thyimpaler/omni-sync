import React from 'react';
import { GlassCard } from './GlassCard';
import { Clock, MessageSquare, Inbox, BarChart, Users, Shield } from 'lucide-react';

const features = [
    { icon: Clock, title: 'SLA Monitoring', desc: 'Real-time color-coded tracking to ensure every customer is answered within your target time.', color: 'text-green-400' },
    { icon: Inbox, title: 'Unified Inbox', desc: 'Combine WhatsApp Business and Instagram Direct into a single streamlined queue.', color: 'text-blue-400' },
    { icon: MessageSquare, title: 'Auto-Prioritization', desc: 'AI tagging automatically pushes VIPs or angry customers to the top of your queue.', color: 'text-purple-400' },
    { icon: BarChart, title: 'Analytics Dashboard', desc: 'Track team performance, average wait times, and customer satisfaction scores.', color: 'text-pink-400' },
    { icon: Users, title: 'Team Collaboration', desc: 'Assign tickets to specific agents and leave internal notes before replying.', color: 'text-yellow-400' },
    { icon: Shield, title: 'Compliance & Export', desc: 'Securely export conversation histories for auditing or CRM ingestion.', color: 'text-indigo-400' }
];

export const Features = () => {
    return (
        <section id="features" className="py-24 relative z-10">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold font-sora mb-4">Powerful Features for Modern Support</h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">Everything you need to deliver world-class customer service across platforms.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <GlassCard key={i} delay={i * 0.1}>
                            <div className={`w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-6 border border-white/5`}>
                                <f.icon className={`w-6 h-6 ${f.color}`} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{f.desc}</p>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
};
