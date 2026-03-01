import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Briefcase, ArrowRight } from 'lucide-react';
import { GradientButton } from '../components/GradientButton';

export const SignupPage = () => {
    const [formData, setFormData] = useState({
        fullName: '', email: '', password: '', company: '', plan: 'normal'
    });
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        toast.success("App in progress! Redirecting to home...", { icon: '🚧' });
        setTimeout(() => navigate('/'), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden text-slate-200">
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-blob" />

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-xl relative z-10 my-10">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-bold font-sora bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 inline-block mb-2">OmniSync</Link>
                    <p className="text-slate-400">Start your 14-day free trial. No credit card required.</p>
                </div>

                <div className="glass-panel p-8">
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input type="email" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input type="password" minLength={8} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Min 8 characters" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Select Plan</label>
                            <select className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                                <option value="normal">Normal ($29/mo)</option>
                                <option value="corporate">Corporate ($99/mo) - Most Popular</option>
                                <option value="custom">Tailor Custom</option>
                            </select>
                        </div>

                        <GradientButton className="w-full justify-center" icon={ArrowRight}>Create Account</GradientButton>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-400">
                        Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Log In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
