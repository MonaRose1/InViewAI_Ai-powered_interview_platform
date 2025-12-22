import React from 'react';
import { Search } from 'lucide-react';

const EmptyState = ({
    icon: Icon = Search,
    title = "No items found",
    description = "Try adjusting your filters or search criteria.",
    action = null
}) => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
                <Icon size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">{description}</p>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
