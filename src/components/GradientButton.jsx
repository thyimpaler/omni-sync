import React from 'react';
import { motion } from 'framer-motion';

export const GradientButton = ({ children, onClick, className = '', icon: Icon }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative px-6 py-3 rounded-full font-semibold text-white group overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-center justify-center gap-2">
        {children}
        {Icon && <Icon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
      </div>
    </motion.button>
  );
};
