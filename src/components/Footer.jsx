import React from 'react';
import { Heart, Twitter, Github, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="relative z-10 bg-slate-950 pt-20 pb-10 border-t border-white/10">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <span className="text-2xl font-bold font-sora bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">OmniSync</span>
                        <p className="text-slate-400 mt-2 text-sm">The unified support inbox that guarantees no customer is left behind.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                            <li><a href="#roi" className="hover:text-white transition-colors">ROI Calculator</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-6 mb-8">
                    <a href="https://twitter.com/omnisync" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-white/5"><Twitter className="w-5 h-5" /></a>
                    <a href="https://github.com/omnisync" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"><Github className="w-5 h-5" /></a>
                    <a href="https://linkedin.com/company/omnisync" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-white/5"><Linkedin className="w-5 h-5" /></a>
                    <a href="https://instagram.com/omnisync" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors p-2 rounded-full hover:bg-white/5"><Instagram className="w-5 h-5" /></a>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>&copy; 2026 OmniSync Inc. All rights reserved.</p>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse-slow" />
                        <span>by</span>
                        <a href="https://twitter.com/ThyImpaler" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold tracking-wide">
                            @ThyImpaler
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
