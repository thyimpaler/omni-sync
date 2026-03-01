import React, { useState } from 'react';
import { Send, Image as ImageIcon, Paperclip, Smile, MoreVertical, Phone, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const ChatWindow = ({ chats, setChats, activeChatId }) => {
    const [inputText, setInputText] = useState('');
    
    const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
    const messages = activeChat?.messages || [];

    const handleSend = () => {
        if (!inputText.trim()) return;
        const newMsg = {
            id: Date.now(),
            sender: 'agent',
            text: inputText,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        setChats(prevChats => prevChats.map(chat => {
            if (chat.id === activeChatId) {
                return { ...chat, messages: [...chat.messages, newMsg], unread: 0, preview: inputText };
            }
            return chat;
        }));
        
        setInputText('');
    };

    const handleResolve = () => {
        setChats(prevChats => prevChats.filter(chat => chat.id !== activeChatId));
    };

    if (!activeChat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-900 border-l border-white/5">
                <div className="text-center text-slate-500">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500/20" />
                    <p className="text-xl font-sora text-slate-400">All caught up!</p>
                    <p className="text-sm">Inbox Zero Achieved.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-900 relative z-0">
            {/* Background Orbs */}
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-blob" />
            <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-blob" style={{ animationDelay: '2s' }} />

            {/* Header */}
            <div className="h-20 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img src={`https://i.pravatar.cc/150?u=${activeChat.name}`} alt={activeChat.name} className="w-12 h-12 rounded-full border-2 border-slate-800 object-cover" />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-lg font-sora">{activeChat.name}</h3>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">{activeChat.platform === 'whatsapp' ? 'WhatsApp Business' : 'Instagram DMs'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            <span className="text-pink-400 font-medium">VIP Customer</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* SLA Badge */}
                    <div className={`glass-panel px-3 py-1.5 flex items-center gap-2 ${activeChat.sla === 'red' ? 'border-red-500/30 bg-red-500/10' : activeChat.sla === 'yellow' ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-green-500/30 bg-green-500/10'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${activeChat.sla === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : activeChat.sla === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <span className={`text-sm font-semibold font-mono ${activeChat.sla === 'red' ? 'text-red-400' : activeChat.sla === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`}>{activeChat.time}</span>
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2"></div>

                    <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Phone className="w-5 h-5" /></button>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><MoreVertical className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth relative z-10 flex flex-col pt-auto" style={{ scrollBehavior: 'smooth' }}>
                <div className="text-center my-4 mt-auto">
                    <span className="bg-slate-800/50 backdrop-blur-sm text-slate-400 text-xs px-3 py-1 rounded-full border border-white/5">
                        Chat started via {activeChat.platform} Today
                    </span>
                </div>

                {messages.map((msg) => {
                    if (msg.sender === 'system') {
                        return (
                            <div key={msg.id} className="flex justify-center my-6">
                                <div className="glass-panel py-2 px-4 flex items-center gap-2 border-yellow-500/30 bg-yellow-500/10">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xs font-medium text-yellow-400">{msg.text}</span>
                                </div>
                            </div>
                        )
                    }

                    const isAgent = msg.sender === 'agent';
                    return (
                        <div key={msg.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'} group`}>
                            {!isAgent && (
                                <img src={`https://i.pravatar.cc/150?u=${activeChat.name}`} alt="C" className="w-8 h-8 rounded-full mr-3 self-end border border-slate-700" />
                            )}

                            <div className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                        {msg.time}
                                    </span>
                                </div>

                                <div className={`p-4 shadow-xl ${isAgent
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-tr-sm'
                                        : 'bg-slate-800/80 backdrop-blur-md border border-white/5 text-slate-200 rounded-2xl rounded-tl-sm'
                                    }`}>
                                    {msg.type === 'image' ? (
                                        <div className="w-64 h-48 bg-slate-700 rounded-lg flex items-center justify-center relative overflow-hidden group/img">
                                            <ImageIcon className="w-8 h-8 text-slate-500" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                                                <span className="text-sm font-medium">View Full Size</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="leading-relaxed text-sm lg:text-base">{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 z-20">
                <div className="max-w-4xl mx-auto flex items-end gap-2 p-2 glass-panel border border-slate-700 bg-slate-800/50">
                    <div className="flex flex-col gap-2 pt-1 pb-1 px-1">
                        <button className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors"><Paperclip className="w-5 h-5" /></button>
                    </div>

                    <textarea
                        className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none outline-none py-3 px-2 max-h-32 focus:ring-0 custom-scrollbar text-sm"
                        rows="1"
                        placeholder="Type your reply (Internal notes start with /)..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    />

                    <div className="flex items-center gap-1 p-1">
                        <button className="p-2 text-slate-400 hover:text-yellow-400 rounded-lg transition-colors"><Smile className="w-5 h-5" /></button>
                        <button onClick={handleSend} className={`p-3 rounded-xl flex items-center justify-center transition-all ${inputText.trim() !== ''
                                ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:bg-indigo-600'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            }`}>
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto mt-3 flex justify-between items-center px-2">
                    <div className="flex gap-2">
                        <button onClick={() => setInputText('Quick Quote: Your custom bulk order of 50 units will come out to $1,250.00')} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-white/5 transition-colors flex items-center gap-1">
                            <span className="font-mono bg-slate-900 px-1 rounded text-[10px]">/qq</span> Quick Quotes
                        </button>
                        <button onClick={() => setInputText('Your refund request for order has been initiated. You will receive a confirmation email shortly.')} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-white/5 transition-colors flex items-center gap-1">
                            <span className="font-mono bg-slate-900 px-1 rounded text-[10px]">/r</span> Request Refund
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handleResolve} className="flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors">
                            <CheckCircle2 className="w-3 h-3" /> Mark Resolved
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
