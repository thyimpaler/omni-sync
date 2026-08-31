import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'No items found', description = 'There is nothing here yet.' }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                <Inbox className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold font-sora text-white mb-2">{title}</h3>
            <p className="text-slate-400 max-w-sm">{description}</p>
        </div>
    );
};
