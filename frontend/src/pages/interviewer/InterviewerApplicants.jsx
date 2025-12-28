import React, { useState, useEffect } from 'react';
import { UserPlus, Briefcase, User, Clock, TrendingUp, Mail, Phone, Loader2, ChevronRight, Filter, Search, X, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import InterviewerService from '../../services/interviewerService';
import ScheduleInterviewModal from './components/ScheduleInterviewModal';

const InterviewerApplicants = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, shortlisted, rejected
    const [searchQuery, setSearchQuery] = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await InterviewerService.getPendingApplications();
            setApplications(data);
        } catch (err) {
            console.error("Failed to fetch applications", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredApps = applications.filter(app => {
        const matchesSearch = app.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'all') return matchesSearch;
        if (filter === 'pending') {
            return matchesSearch && (app.status === 'pending' || app.status === 'applied');
        }
        return matchesSearch && app.status === filter;
    });

    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending' || a.status === 'applied').length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
        rejected: applications.filter(a => a.status === 'rejected').length
    };

    const handleViewResume = (app) => {
        if (app.candidate?.resumeUrl) {
            window.open(app.candidate.resumeUrl, '_blank');
        } else {
            alert('Resume not available for this candidate');
        }
    };

    const handleScheduleInterview = (app) => {
        setSelectedApp(app);
        setShowScheduleModal(true);
    };

    const handleShortlist = async (appId) => {
        try {
            await InterviewerService.updateApplicationStatus(appId, 'shortlisted');

            // Update locally
            setApplications(prev => prev.map(app =>
                app._id === appId ? { ...app, status: 'shortlisted' } : app
            ));

            alert('Candidate shortlisted successfully!');
        } catch (err) {
            console.error('Failed to shortlist candidate', err);
            alert('Failed to shortlist candidate');
        }
    };

    const handleReject = async (appId) => {
        if (!confirm('Are you sure you want to reject this candidate?')) {
            return;
        }

        try {
            await InterviewerService.updateApplicationStatus(appId, 'rejected');

            // Update locally
            setApplications(prev => prev.map(app =>
                app._id === appId ? { ...app, status: 'rejected' } : app
            ));

            alert('Candidate rejected');
        } catch (err) {
            console.error('Failed to reject candidate', err);
            alert('Failed to reject candidate');
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-800">New Applicants</h1>
                <p className="text-slate-500 mt-1 font-medium">Review and manage incoming applications</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total</p>
                    <div className="text-4xl font-black text-slate-800">{stats.total}</div>
                    <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase">All Applications</div>
                </div>
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
                    <p className="text-amber-600 text-xs font-black uppercase tracking-widest mb-2">Pending</p>
                    <div className="text-4xl font-black text-amber-700">{stats.pending}</div>
                    <div className="mt-4 text-[10px] font-bold text-amber-500 uppercase">Awaiting Review</div>
                </div>
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100 shadow-sm">
                    <p className="text-green-600 text-xs font-black uppercase tracking-widest mb-2">Shortlisted</p>
                    <div className="text-4xl font-black text-green-700">{stats.shortlisted}</div>
                    <div className="mt-4 text-[10px] font-bold text-green-500 uppercase">Ready to Interview</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Rejected</p>
                    <div className="text-4xl font-black text-slate-700">{stats.rejected}</div>
                    <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase">Not a Fit</div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or job title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'pending', label: 'Pending' },
                            { id: 'shortlisted', label: 'Shortlisted' },
                            { id: 'rejected', label: 'Rejected' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === tab.id
                                    ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-secondary w-10 h-10 mb-4" />
                        <p className="text-slate-400 font-bold">Loading applications...</p>
                    </div>
                ) : filteredApps.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                        {filteredApps.map(app => (
                            <div key={app._id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                                <div className="flex items-start gap-6">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-secondary to-indigo-600 flex items-center justify-center text-2xl font-black text-white shrink-0 group-hover:scale-110 transition-transform">
                                        {app.candidate?.name?.charAt(0) || 'U'}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-secondary transition-colors">
                                                    {app.candidate?.name || 'Unknown Candidate'}
                                                </h3>
                                                <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
                                                    <Briefcase size={14} />
                                                    {app.job?.title || 'General Application'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex flex-wrap gap-4 mb-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Mail size={12} />
                                                {app.candidate?.email || 'No email'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Phone size={12} />
                                                {app.candidate?.phone || 'No phone'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                Applied {new Date(app.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-end gap-2 mt-4">
                                            {/* Status Badge always visible */}
                                            {app.status === 'shortlisted' && (
                                                <span className="px-3 py-1 bg-green-50 text-green-600 font-bold text-xs rounded-lg border border-green-200">
                                                    ✓ Shortlisted
                                                </span>
                                            )}
                                            {app.status === 'rejected' && (
                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 font-bold text-xs rounded-lg border border-slate-200">
                                                    ✕ Rejected
                                                </span>
                                            )}
                                            {app.status === 'interview_scheduled' && (
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg border border-blue-200">
                                                    Scheduled
                                                </span>
                                            )}
                                            {app.status === 'interviewed' && (
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-lg border border-indigo-200">
                                                    Interviewed
                                                </span>
                                            )}

                                            {/* Show Shortlist/Reject only if state is pending or applied */}
                                            {(app.status === 'pending' || app.status === 'applied') && (
                                                <>
                                                    <button
                                                        onClick={() => handleShortlist(app._id)}
                                                        className="px-3 py-1.5 bg-green-50 text-green-600 font-bold text-xs rounded-lg hover:bg-green-100 transition-all border border-green-200"
                                                    >
                                                        ✓ Shortlist
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(app._id)}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 transition-all border border-red-200"
                                                    >
                                                        ✕ Reject
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => handleViewResume(app)}
                                                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
                                            >
                                                View Resume
                                            </button>

                                            {/* Only show Schedule button for shortlisted or pending/applied */}
                                            {(app.status === 'shortlisted' || app.status === 'pending' || app.status === 'applied') && (
                                                <button
                                                    onClick={() => handleScheduleInterview(app)}
                                                    className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-xl hover:scale-105 transition-all shadow-lg shadow-secondary/20"
                                                >
                                                    Schedule Interview
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <UserPlus className="mx-auto text-slate-200 mb-4" size={56} />
                        <h3 className="text-slate-800 font-black text-xl mb-2">No Applications Found</h3>
                        <p className="text-slate-400 font-medium">
                            {searchQuery ? 'Try adjusting your search or filters' : 'New applications will appear here'}
                        </p>
                    </div>
                )}
            </div>

            {/* Schedule Interview Modal */}
            <ScheduleInterviewModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                selectedApp={selectedApp}
                onScheduleSuccess={fetchApplications}
            />
        </div>
    );
};

export default InterviewerApplicants;
