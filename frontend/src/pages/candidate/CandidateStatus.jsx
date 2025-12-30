import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Clock, Calendar, XCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const CandidateStatus = () => {
    const { id } = useParams();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplicationDetails = async () => {
            try {
                // Fetch specific application details
                // The endpoint might vary, but assuming there's an endpoint for a single app
                const { data } = await api.get(`/applications/my`);
                const specificApp = data.find(app => app._id === id);
                setApplication(specificApp);
            } catch (error) {
                console.error("Failed to fetch application status", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApplicationDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="animate-spin text-secondary w-12 h-12" />
                <p className="text-slate-400 font-bold">Fetching your status...</p>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-20 text-center">
                <XCircle size={60} className="mx-auto text-red-200 mb-6" />
                <h2 className="text-2xl font-black text-slate-800">Application Not Found</h2>
                <p className="text-slate-400 font-medium">We couldn't find the requested application details.</p>
            </div>
        );
    }

    // Dynamic steps based on application status
    const steps = [
        {
            title: 'Application Submitted',
            date: new Date(application.appliedAt).toLocaleDateString(),
            status: 'completed',
            desc: 'Your application has been successfully received by our system.'
        },
        {
            title: 'Resume Screening',
            date: ['interview_scheduled', 'interviewed', 'hired', 'shortlisted'].includes(application.status) ? 'Passed' : 'In Progress',
            status: ['interview_scheduled', 'interviewed', 'hired', 'shortlisted'].includes(application.status) ? 'completed' : 'current',
            desc: 'Our AI engine is matching your skills with the requirement.'
        },
        {
            title: 'AI Assessment',
            date: ['interviewed', 'hired'].includes(application.status) ? 'Completed' : application.status === 'interview_scheduled' ? 'Scheduled' : 'Pending',
            status: ['interviewed', 'hired'].includes(application.status) ? 'completed' : application.status === 'interview_scheduled' ? 'current' : 'upcoming',
            desc: 'Live interactive session to evaluate technical depth.'
        },
        {
            title: 'Final Review',
            date: application.status === 'hired' ? 'Approved' : application.status === 'rejected' ? 'Closed' : 'Pending',
            status: application.status === 'hired' || application.status === 'rejected' ? 'completed' : application.status === 'interviewed' ? 'current' : 'upcoming',
            desc: 'Hiring committee review and final alignment check.'
        },
    ];

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-black text-slate-800 mb-2">Application Tracking</h1>
            <p className="text-slate-500 mb-10 font-medium italic">
                {application.job?.title} — ID: #{application._id.slice(-8).toUpperCase()}
            </p>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>

                <div className="space-y-10">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex gap-8">
                            {/* Icon Container */}
                            <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl shrink-0 transition-all duration-500 ${step.status === 'completed' ? 'bg-green-500 text-white' :
                                    step.status === 'current' ? 'bg-secondary text-white ring-8 ring-secondary/10' :
                                        'bg-slate-100 text-slate-300'
                                }`}>
                                {step.status === 'completed' ? <Check size={20} strokeWidth={3} /> :
                                    step.status === 'current' ? <Clock size={20} className="animate-pulse" /> :
                                        <Calendar size={18} />}
                            </div>

                            {/* Content Card */}
                            <div className={`flex-1 pt-1 ${step.status === 'upcoming' ? 'opacity-40 grayscale' : ''}`}>
                                <div className={`p-6 rounded-3xl border transition-all duration-300 ${step.status === 'current' ? 'bg-white border-secondary shadow-xl shadow-secondary/10' : 'bg-slate-50 border-slate-100'
                                    }`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className={`font-black text-lg ${step.status === 'current' ? 'text-secondary' : 'text-slate-800'}`}>{step.title}</h3>
                                        <div className="flex items-center gap-2 group">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${step.status === 'completed' ? 'bg-green-50 text-green-600' :
                                                    step.status === 'current' ? 'bg-secondary/10 text-secondary' :
                                                        'bg-slate-100 text-slate-400'
                                                }`}>
                                                {step.date}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-16 p-8 bg-linear-to-br from-slate-900 to-slate-800 rounded-4xl text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-2">Need Help?</h4>
                    <p className="text-slate-400 text-sm mb-6">If you have any questions regarding your application progress, feel free to reach out to our support team.</p>
                    <button className="px-6 py-3 bg-white text-slate-900 font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-all">
                        Contact Support
                    </button>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
                    <Check size={200} />
                </div>
            </div>
        </div>
    );
};

export default CandidateStatus;
