import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { GradientButton } from '../components/GradientButton';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        toast.success("App in progress! Redirecting to home...", { icon: '🚧' });
        setTimeout(() => navigate('/'), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden text-slate-200">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-blob" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-blob" style={{ animationDelay: '2s' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-bold font-sora bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 inline-block mb-2">OmniSync</Link>
                    <p className="text-slate-400">Welcome back! Sign in to your inbox.</p>
                </div>

                <div className="glass-panel p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-slate-300">Password</label>
                                <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <GradientButton className="w-full flex items-center justify-center gap-2" icon={ArrowRight}>
                            Sign In
                        </GradientButton>
                    </form>

                    <div className="mt-8 flex items-center gap-4 before:h-px before:flex-1 before:bg-slate-700 after:h-px after:flex-1 after:bg-slate-700">
                        <span className="text-sm text-slate-500">OR</span>
                    </div>

                    <button className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-3 rounded-xl transition-colors">
                        <Github className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <p className="mt-8 text-center text-sm text-slate-400">
                        Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Start for free</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
