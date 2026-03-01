import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value, suffix = '', duration = 2 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const springValue = useSpring(0, {
        duration: duration * 1000,
        bounce: 0,
    });

    const displayValue = useTransform(springValue, (current) => {
        return Math.round(current).toLocaleString();
    });

    useEffect(() => {
        if (isInView) {
            springValue.set(value);
        }
    }, [isInView, value, springValue]);

    return (
        <span ref={ref}>
            <motion.span>{displayValue}</motion.span>{suffix}
        </span>
    );
};

export const Stats = () => {
    const stats = [
        { label: 'Messages Processed', value: 50, suffix: 'M+', desc: 'Across WhatsApp & Instagram' },
        { label: 'Ticket Resolution Time', value: 3, suffix: 'x', desc: 'Faster average handle time' },
        { label: 'Customer Satisfaction', value: 98, suffix: '%', desc: 'Average CSAT score' },
        { label: 'Active Teams', value: 1500, suffix: '+', desc: 'Using OmniSync daily' },
    ];

    return (
        <section className="py-20 border-y border-white/10 bg-slate-900/50 backdrop-blur-xl relative z-10">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-4xl md:text-5xl font-bold font-sora text-gradient mb-2">
                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
                            <div className="text-sm text-slate-400">{stat.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
