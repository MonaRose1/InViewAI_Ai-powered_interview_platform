import React, { useState, useEffect } from 'react';
import { UserPlus, Briefcase, User, Mail, Phone, Loader2, Search, Calendar, CheckCircle } from 'lucide-react';
import InterviewerService from '../../services/interviewerService';

const HiredCandidates = () => {
    const [hiredCandidates, setHiredCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchHiredCandidates();
    }, []);

    const fetchHiredCandidates = async () => {
        try {
            setLoading(true);
            const data = await InterviewerService.getPendingApplications();
            const hired = data.filter(app => app.status === 'hired');
            setHiredCandidates(hired);
        } catch (err) {
            console.error("Failed to fetch hired candidates", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCandidates = hiredCandidates.filter(candidate => {
        return candidate.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-800">Hired Candidates</h1>
                <p className="text-slate-500 mt-1 font-medium italic">Wall of Fame: Your successful placements</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-green-600 text-xs font-black uppercase tracking-widest mb-1">Total Hites</p>
                        <div className="text-4xl font-black text-green-700">{hiredCandidates.length}</div>
                    </div>
                    <div className="p-4 bg-white/50 rounded-2xl">
                        <CheckCircle className="text-green-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="relative max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or job title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                    />
                </div>
            </div>

            {/* Candidates List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-secondary w-10 h-10 mb-4" />
                        <p className="text-slate-400 font-bold">Loading your team...</p>
                    </div>
                ) : filteredCandidates.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                        {filteredCandidates.map(app => (
                            <div key={app._id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg shadow-green-200">
                                        {app.candidate?.name?.charAt(0) || 'H'}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">
                                                    {app.candidate?.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
                                                    <Briefcase size={14} />
                                                    {app.job?.title}
                                                </p>
                                            </div>
                                            <div className="px-3 py-1 bg-green-50 text-green-600 font-black text-[10px] uppercase rounded-lg border border-green-100">
                                                Active Employee
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Mail size={12} className="text-slate-400" />
                                                {app.candidate?.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={12} className="text-slate-400" />
                                                {app.candidate?.phone || 'No phone'}
                                            </div>
                                            <div className="flex items-center gap-2 text-indigo-500 font-bold">
                                                <Calendar size={12} />
                                                Hired on {new Date(app.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <CheckCircle className="mx-auto text-slate-200 mb-4" size={56} />
                        <h3 className="text-slate-800 font-black text-xl mb-2">No Hired Candidates Yet</h3>
                        <p className="text-slate-400 font-medium">Your success stories will appear here once you hire top talent.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HiredCandidates;
