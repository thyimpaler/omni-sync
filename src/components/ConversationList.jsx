import React, { useState } from 'react';
import { Search, Filter, Instagram, MessageCircle } from 'lucide-react';

export const ConversationList = ({ chats, activeChatId, setActiveChatId }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || chat.preview.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        
        if (activeTab === 'all') return true;
        if (activeTab === 'urgent') return chat.sla === 'red';
        if (activeTab === 'orders') return chat.preview.toLowerCase().includes('order') || chat.name === 'Michael Chen';
        if (activeTab === 'refunds') return chat.preview.toLowerCase().includes('return') || chat.preview.toLowerCase().includes('refund');
        return true;
    });

    return (
        <div className="w-[350px] bg-slate-900/90 backdrop-blur-md border-r border-white/5 h-full flex flex-col z-10 flex-shrink-0">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-2xl font-bold font-sora text-white mb-4">Inbox</h2>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-1">
                    {['all', 'urgent', 'orders', 'refunds'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : 'bg-slate-800 text-slate-400 hover:text-white border border-transparent'
                                }`}
                        >
                            {tab} {tab === 'urgent' && <span className="ml-1 w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {filteredChats.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => setActiveChatId(chat.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group relative ${chat.id === activeChatId
                                ? 'bg-indigo-500/10 border border-indigo-500/20'
                                : 'hover:bg-slate-800 border border-transparent'
                            }`}
                    >
                        {/* SLA Indicator Line */}
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-[80%] rounded-r-full transition-all duration-300 
              ${chat.id === activeChatId ? 'h-[80%]' : 'h-0'}
              ${chat.sla === 'red' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : chat.sla === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}
            `}></div>

                        <div className="flex justify-between items-start mb-1 px-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-200 truncate pr-2">{chat.name}</span>
                                {chat.platform === 'whatsapp' ? (
                                    <MessageCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                ) : (
                                    <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                                )}
                            </div>
                            <span className={`text-xs font-mono shrink-0 ${chat.unread > 0 ? 'text-indigo-400 font-medium' : 'text-slate-500'}`}>{chat.time}</span>
                        </div>

                        <div className="flex justify-between items-center px-2">
                            <p className={`text-sm truncate pr-4 ${chat.unread > 0 ? 'text-white' : 'text-slate-400'}`}>
                                {chat.preview}
                            </p>
                            {chat.unread > 0 && (
                                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-lg shadow-indigo-500/40">
                                    {chat.unread}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
        </div>
    );
};
