import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Alex Thompson",
        role: "Head of Support, TechCorp",
        content: "OmniSync completely transformed how we handle Instagram DMs. We went from losing track of conversations to resolving them inside of 5 minutes.",
        avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
        name: "Sarah Jenkins",
        role: "E-commerce Manager, Bloom",
        content: "The SLA tracking is a game-changer. My team knows exactly which WhatsApp messages to prioritize. Worth every penny.",
        avatar: "https://i.pravatar.cc/150?img=47"
    },
    {
        name: "Michael Chen",
        role: "Founder, RapidDrop",
        content: "We were using two different tools before. Unifying WhatsApp and Instagram saved us thousands of dollars and hours of headaches.",
        avatar: "https://i.pravatar.cc/150?img=33"
    },
    {
        name: "Elena Rodriguez",
        role: "CX Director, Nova",
        content: "The UI is gorgeous and intuitive. Barely needed to train my team on it. It just makes sense.",
        avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
        name: "James Wilson",
        role: "Lead Agent, ServeWell",
        content: "The fast-reply AI completely changed my workflow. I am handling 3x the ticket volume I used to.",
        avatar: "https://i.pravatar.cc/150?img=60"
    },
    {
        name: "Amanda Smith",
        role: "Sales Exec, RetailRUSH",
        content: "Customers don't want to wait. OmniSync makes sure they don't have to. The analytics dashboard is superb.",
        avatar: "https://i.pravatar.cc/150?img=20"
    }
];

export const Testimonials = () => {
    const tripleTestimonials = [...testimonials, ...testimonials, ...testimonials];

    return (
        <section className="py-24 overflow-hidden relative z-10">
            <div className="container mx-auto px-6 max-w-7xl mb-12 text-center">
                <h2 className="text-4xl md:text-5xl font-bold font-sora mb-4">Loved by Support Teams</h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">Join thousands of companies closing tickets instantly.</p>
            </div>

            <div className="relative w-full flex overflow-hidden">
                <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-slate-900 to-transparent z-10"></div>

                <div className="flex w-max animate-marquee pb-4 pt-4 hover:pause">
                    {tripleTestimonials.map((t, i) => (
                        <div key={i} className="glass-card p-6 w-[350px] mx-4 shrink-0 shadow-lg cursor-pointer">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} className="w-4 h-4 text-yellow-500 fill-current" />
                                ))}
                            </div>
                            <p className="text-slate-300 mb-6 italic">"{t.content}"</p>
                            <div className="flex items-center gap-4 mt-auto">
                                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-indigo-500/30" />
                                <div>
                                    <div className="font-semibold text-white">{t.name}</div>
                                    <div className="text-sm text-slate-400">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
        </section>
    );
};
