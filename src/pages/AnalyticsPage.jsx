import React from 'react';
import { BarChart3, Clock, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const AnalyticsPage = () => {
    const metrics = [
        { label: 'Total Messages', value: '45,231', change: '+12%', positive: true, icon: BarChart3 },
        { label: 'Avg Response Time', value: '2m 15s', change: '-45s', positive: true, icon: Clock },
        { label: 'Resolved Tickets', value: '12,045', change: '+18%', positive: true, icon: CheckCircle2 },
        { label: 'SLA Breaches', value: '24', change: '-4%', positive: true, icon: AlertCircle }
    ];

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <div className="p-8 max-w-7xl mx-auto pb-24">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-sora text-white mb-2">Analytics Overview</h1>
                    <p className="text-slate-400">Track your team's performance across all channels.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {metrics.map((metric, index) => (
                        <GlassCard key={index} className="p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 relative z-10">
                                    <metric.icon className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium relative z-10 ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
                                    {metric.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {metric.change}
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm font-medium mb-1 relative z-10">{metric.label}</p>
                            <p className="text-3xl font-bold text-white font-sora relative z-10">{metric.value}</p>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
};
