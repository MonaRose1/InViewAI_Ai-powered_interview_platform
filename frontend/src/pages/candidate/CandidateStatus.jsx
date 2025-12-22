import React from 'react';
import { Check, Clock, Calendar, XCircle, ChevronRight } from 'lucide-react';

const CandidateStatus = () => {
    const steps = [
        { title: 'Application Submitted', date: 'Dec 10, 2025', status: 'completed', desc: 'Your application has been received.' },
        { title: 'Resume Screening', date: 'Dec 12, 2025', status: 'completed', desc: 'Our AI matched your profile.' },
        { title: 'AI Interview', date: 'Dec 15, 2025', status: 'completed', desc: 'Technical assessment completed.' },
        { title: 'Team Review', date: 'In Progress', status: 'current', desc: 'Hiring managers are reviewing your scores.' },
        { title: 'Final Decision', date: 'Pending', status: 'upcoming', desc: 'Expect an update within 48 hours.' },
    ];

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Application Status</h1>
            <p className="text-slate-500 mb-8">Senior Frontend Engineer - ID: #REQ-2025-098</p>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100"></div>

                <div className="space-y-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex gap-6">
                            {/* Icon */}
                            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 ${step.status === 'completed' ? 'bg-green-500 text-white' :
                                step.status === 'current' ? 'bg-secondary text-white ring-4 ring-secondary/10' :
                                    'bg-gray-100 text-gray-400'
                                }`}>
                                {step.status === 'completed' ? <Check size={20} /> :
                                    step.status === 'current' ? <Clock size={20} /> :
                                        <span className="text-sm font-bold">{index + 1}</span>}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 pt-1 ${step.status === 'upcoming' ? 'opacity-50' : ''}`}>
                                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-slate-800 text-lg">{step.title}</h3>
                                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{step.date}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm">{step.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CandidateStatus;
