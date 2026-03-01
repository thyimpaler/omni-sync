import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { GradientButton } from '../components/GradientButton';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden text-slate-200">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-blob" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-bold font-sora bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 inline-block mb-2">OmniSync</Link>
                    <h2 className="text-2xl font-semibold mb-2 mt-4 text-white">Reset Password</h2>
                    <p className="text-slate-400">Enter your email and we'll send a reset link.</p>
                </div>

                <div className="glass-panel p-8">
                    {sent ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                                <Mail className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 text-white">Check your email</h3>
                            <p className="text-slate-400 mb-6">We've sent password reset instructions to {email}</p>
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Back to Log In
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                            <GradientButton className="w-full justify-center">Send Reset Link</GradientButton>
                            <div className="text-center mt-6">
                                <Link to="/login" className="text-slate-400 hover:text-white text-sm inline-flex items-center gap-2 transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Back to Log In
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
