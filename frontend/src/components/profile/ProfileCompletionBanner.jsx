import React, { useState } from 'react';
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateProfileCompletion, getCompletionColor, getCompletionBgColor, getCompletionMessage } from '../../utils/profileCompletion';

const ProfileCompletionBanner = ({ user, onNavigateToTab }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { percentage, missingFields, completedFields } = calculateProfileCompletion(user);

    if (percentage === 100) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <CheckCircle size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-green-800">Profile Complete!</h3>
                    <p className="text-sm text-green-600">Your profile is 100% complete. Great job!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-4">
                {/* Progress Circle */}
                <div className="relative w-16 h-16 shrink-0">
                    <svg className="transform -rotate-90 w-16 h-16">
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-gray-200"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - percentage / 100)}`}
                            className={getCompletionBgColor(percentage).replace('bg-', 'text-')}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-bold ${getCompletionColor(percentage)}`}>
                            {percentage}%
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Profile Completion</h3>
                            <p className="text-sm text-slate-500 mt-1">{getCompletionMessage(percentage)}</p>
                        </div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-slate-400 hover:text-slate-600 transition"
                        >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${getCompletionBgColor(percentage)}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-2 gap-4">
                            {/* Missing Fields */}
                            {missingFields.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <AlertCircle size={12} /> Missing Fields
                                    </h4>
                                    <ul className="space-y-1">
                                        {missingFields.map((field, idx) => (
                                            <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                {field}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Completed Fields */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <CheckCircle size={12} /> Completed
                                </h4>
                                <ul className="space-y-1">
                                    {completedFields.slice(0, 5).map((field, idx) => (
                                        <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                            {field}
                                        </li>
                                    ))}
                                    {completedFields.length > 5 && (
                                        <li className="text-xs text-slate-400 ml-3">
                                            +{completedFields.length - 5} more
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionBanner;
