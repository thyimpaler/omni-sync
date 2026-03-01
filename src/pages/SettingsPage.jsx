import React from 'react';
import { Shield, Bell } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const SettingsPage = () => {
    return (
        <div className="flex-1 overflow-y-auto w-full p-8 pb-24">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-sora text-white mb-2">Workspace Settings</h1>
                    <p className="text-slate-400">Manage your workspace preferences and integrations.</p>
                </div>
                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-400"/> General Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Workspace Name</label>
                                <input type="text" defaultValue="Acme Corp Support" className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Support Email</label>
                                <input type="email" defaultValue="support@acmecorp.com" className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none" />
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
