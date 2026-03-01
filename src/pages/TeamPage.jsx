import React from 'react';
import { Mail, MoreVertical } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const TeamPage = () => {
    const team = [
        { id: 1, name: 'Alex Admin', role: 'Owner', email: 'alex@acmecorp.com', avatar: 'https://i.pravatar.cc/150?img=33' }
    ];

    return (
        <div className="flex-1 overflow-y-auto w-full p-8 pb-24">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-sora text-white mb-2">Team Members</h1>
                    <p className="text-slate-400">Manage access for your support team.</p>
                </div>
                <div className="grid gap-4">
                    {team.map(member => (
                        <GlassCard key={member.id} className="p-4 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full border border-white/10" />
                                <div>
                                    <h3 className="text-white font-medium">{member.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Mail className="w-3 h-3" /> {member.email}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-medium">{member.role}</span>
                                <button className="text-slate-500 hover:text-white"><MoreVertical className="w-5 h-5"/></button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
};
