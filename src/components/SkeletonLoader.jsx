import React from 'react';

export const SkeletonLoader = ({ count = 3 }) => {
    return (
        <div className="space-y-4 animate-pulse">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-800/50 rounded-xl border border-white/5"></div>
            ))}
        </div>
    );
};
