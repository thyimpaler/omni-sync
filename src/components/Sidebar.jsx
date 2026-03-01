import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Inbox, BarChart2, Settings, Users, LogOut, Home } from 'lucide-react';

export const Sidebar = () => {
    const navItems = [
        { icon: Inbox, label: 'Inbox', path: '/example', badge: 12 },
        { icon: BarChart2, label: 'Analytics', path: '/example/analytics' },
        { icon: Users, label: 'Team', path: '/example/team' },
        { icon: Settings, label: 'Settings', path: '/example/settings' },
    ];

    return (
        <div className="w-64 h-full bg-slate-900 border-r border-white/5 flex flex-col pt-6 pb-4 flex-shrink-0 z-20 shadow-xl relative">
            <Link to="/" className="px-6 mb-8 flex items-center gap-3 cursor-pointer group hover:bg-white/5 mx-2 py-2 rounded-xl transition-colors">
                <img src="/logo.png" alt="OmniSync Logo" className="h-8 w-auto invert" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                <span className="text-2xl font-bold font-sora bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 hidden">Omni</span>
                <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 mt-0.5 rounded font-bold border border-indigo-500/30 whitespace-nowrap">PRO v2.0</span>
            </Link>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        end={item.path === '/example'}
                        className={({ isActive }) =>
                            `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                            }`
                        }
                    >
                        <div className="flex items-center gap-3 font-medium">
                            <item.icon className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                            {item.label}
                        </div>
                        {item.badge && (
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                                {item.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="px-4 mt-auto space-y-4">
                <div className="glass-panel p-4 flex items-center gap-3">
                    <img src="https://i.pravatar.cc/100?img=33" alt="Admin" className="w-10 h-10 rounded-full border border-indigo-500/30" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-white">Alex Admin</p>
                        <p className="text-xs text-slate-400 truncate">Support Lead</p>
                    </div>
                </div>
                <Link to="/" className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium relative overflow-hidden group">
                    <Home className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Exit Demo
                </Link>
                <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium relative overflow-hidden group">
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};
