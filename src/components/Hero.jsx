import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageSquare, PlayCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GradientButton } from './GradientButton';

const mockChats = [
    {
        id: 1,
        name: 'Sarah Johnson',
        time: '2m',
        preview: 'I need help with my recent order...',
        sla: { time: '1m 24s', color: 'bg-green-400', shadow: 'shadow-[0_0_10px_rgba(74,222,128,0.8)]' },
        messages: [
            { sender: 'customer', text: "Sure, it's ORDER-192837. Thank you!" },
            { sender: 'agent', text: 'Hi Sarah, I can help you with that right away. Could you provide your order number?' }
        ]
    },
    {
        id: 2,
        name: 'Alex Rivera',
        time: '5m',
        preview: 'Is the blue variant back in stock?',
        sla: { time: '4m 10s', color: 'bg-yellow-400', shadow: 'shadow-[0_0_10px_rgba(250,204,21,0.8)]' },
        messages: [
            { sender: 'customer', text: 'Hey, I was wondering if the ocean blue variant of the jacket is back in stock yet?' },
            { sender: 'agent', text: 'Hi Alex! Checking our inventory now. One moment please.' }
        ]
    },
    {
        id: 3,
        name: 'VIP Client',
        time: '12m',
        preview: 'My dashboard is throwing an error.',
        sla: { time: '-02m 15s', color: 'bg-red-400', shadow: 'shadow-[0_0_10px_rgba(248,113,113,0.8)]' },
        messages: [
            { sender: 'customer', text: 'Every time I try to export my monthly report, the dashboard crashes.' },
            { sender: 'agent', text: 'I apologize for the inconvenience. I am escalating this to our engineering team immediately as a high priority ticket.' }
        ]
    }
];

export const Hero = () => {
    const [activeChat, setActiveChat] = useState(mockChats[0]);
    const [showDemo, setShowDemo] = useState(false);

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 font-medium text-sm mb-8 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        Supercharge your support team
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-sora leading-tight mb-6">
                        Never Let a <br className="hidden md:block" />Customer <span className="text-gradient">Wait. Ever.</span>
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        The unified social inbox that brings WhatsApp and Instagram DMs together. Prioritize urgent messages, track SLAs, and let AI assistance take the routine replies.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup" className="w-full sm:w-auto">
                            <GradientButton icon={ArrowRight} className="w-full text-lg py-4 px-8 border border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all">
                                Start 14-Day Free Trial
                            </GradientButton>
                        </Link>
                        <Link to="/example" className="w-full sm:w-auto">
                            <button
                                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-full text-lg backdrop-blur-sm"
                            >
                                <PlayCircle className="w-5 h-5 text-indigo-400" />
                                See Demo Page
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Floating Chat UI Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="mt-20 relative max-w-5xl mx-auto perspective-1000"
                >
                    <div className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden aspect-video transform rotateX-12 shadow-[0_20px_100px_rgba(79,70,229,0.2)]">
                        <div className="absolute top-0 w-full h-12 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>
                        </div>
                        <div className="pt-16 p-8 flex h-full">
                            <div className="w-1/3 border-r border-white/10 pr-6 hidden md:block">
                                {mockChats.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => setActiveChat(chat)}
                                        className={`w-full text-left p-4 rounded-xl mb-4 transition-all duration-300 ${chat.id === activeChat.id ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
                                    >
                                        <div className="flex justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${chat.id === 1 ? 'bg-blue-500' : chat.id === 2 ? 'bg-purple-500' : 'bg-red-500'}`}>
                                                    {chat.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-white">{chat.name}</span>
                                            </div>
                                            <span className="text-xs text-slate-400">{chat.time}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 truncate">{chat.preview}</p>
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 pl-0 md:pl-6 flex flex-col justify-end pb-8 relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeChat.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col gap-4 w-full"
                                    >
                                        {activeChat.messages.map((msg, idx) => (
                                            <div key={idx} className={`${msg.sender === 'agent' ? 'self-end bg-gradient-to-r from-blue-500 to-indigo-600 rounded-tr-sm' : 'self-start bg-slate-800 rounded-tl-sm border border-white/5'} p-4 rounded-2xl text-white max-w-[80%] shadow-lg`}>
                                                {msg.text}
                                            </div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    {/* Floating SLA Badge */}
                    <motion.div
                        key={activeChat.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, y: [-10, 10, -10] }}
                        transition={{ y: { repeat: Infinity, duration: 4 }, opacity: { duration: 0.3 }, scale: { duration: 0.3 } }}
                        className="absolute -top-6 -right-6 lg:-right-12 glass-panel py-3 px-6 flex items-center gap-3 transition-colors duration-300 hover:scale-105 cursor-default"
                    >
                        <div className={`w-3 h-3 rounded-full ${activeChat.sla.color} ${activeChat.sla.shadow} animate-pulse`}></div>
                        <span className="font-semibold text-sm">SLA: {activeChat.sla.time}</span>
                    </motion.div>
                </motion.div>
            </div>

            {/* Demo Video Modal */}
            <AnimatePresence>
                {showDemo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowDemo(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowDemo(false)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
                                <div className="w-24 h-24 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                                    <PlayCircle className="w-12 h-12 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold font-sora text-white">Product Demo</h3>
                                <p className="text-slate-400 text-center max-w-md">See how OmniSync unifies your WhatsApp and Instagram support into a single, blazing-fast inbox with real-time SLA tracking.</p>
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-4 text-sm text-slate-300">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span> 2 min walkthrough</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full"></span> Live inbox demo</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-400 rounded-full"></span> SLA engine</span>
                                    </div>
                                    <Link
                                        to="/signup"
                                        className="mt-4"
                                        onClick={() => setShowDemo(false)}
                                    >
                                        <GradientButton icon={ArrowRight} className="px-8 py-3">
                                            Try It Yourself — Free
                                        </GradientButton>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
