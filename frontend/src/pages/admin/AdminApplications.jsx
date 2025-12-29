import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Download, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import api from '../../services/api';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchTerm) params.search = searchTerm;

            const { data } = await api.get('/admin/applications', { params });
            setApplications(data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchApplications();
    };

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            const { data } = await api.put(`/admin/applications/${applicationId}`, {
                status: newStatus
            });
            setApplications(applications.map(a => a._id === applicationId ? data : a));
            if (selectedApplication?._id === applicationId) {
                setSelectedApplication({ ...selectedApplication, status: newStatus });
            }
        } catch (error) {
            console.error('Failed to update application:', error);
            alert('Failed to update application status');
        }
    };

    const getStageColor = (status) => {
        switch (status) {
            case 'interview_scheduled': return 'bg-secondary/10 text-secondary border-secondary/20';
            case 'interviewed': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'applied': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
            case 'shortlisted': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'hired': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getStageLabel = (status) => {
        switch (status) {
            case 'interview_scheduled': return 'Interview Scheduled';
            case 'interviewed': return 'Interviewed';
            case 'applied': return 'Applied';
            case 'rejected': return 'Rejected';
            case 'shortlisted': return 'Shortlisted';
            case 'hired': return 'Hired';
            default: return status;
        }
    };

    const handleDeleteApplication = async (id) => {
        if (!window.confirm("Are you sure you want to delete this application?")) return;
        try {
            await api.delete(`/admin/applications/${id}`);
            setApplications(applications.filter(a => a._id !== id));
            if (selectedApplication?._id === id) setShowDetails(false);
            alert("Application deleted");
        } catch (error) {
            console.error("Failed to delete application", error);
            alert("Delete failed");
        }
    };

    const openDetails = (app) => {
        setSelectedApplication(app);
        setShowDetails(true);
    };

    // Filter out applications with missing candidate data
    const validApplications = applications.filter(app => app.candidate && app.candidate.name && app.candidate.name !== 'Unknown');

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Application Management</h1>
            <p className="text-slate-500 mb-8">Track and manage candidate applications.</p>

            {/* Status Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'applied', 'interview_scheduled', 'interviewed', 'shortlisted', 'hired', 'rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${statusFilter === status
                            ? 'bg-secondary text-white'
                            : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {status === 'all' ? 'All' : getStageLabel(status)}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search applications by candidate or job..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-medium"
                    >
                        <Filter size={18} /> Search
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-secondary animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {validApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-400">
                                            No applications found
                                        </td>
                                    </tr>
                                ) : (
                                    validApplications.map((app) => (
                                        <tr key={app._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs uppercase">
                                                        {app.candidate?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-800">{app.candidate?.name}</span>
                                                        <p className="text-xs text-slate-500">{app.candidate?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">{app.job?.title || 'N/A'}</td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {new Date(app.appliedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-secondary h-full rounded-full"
                                                            style={{ width: `${app.rankingScore || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {Math.round(app.rankingScore || 0)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer ${getStageColor(app.status)}`}
                                                >
                                                    <option value="applied">Applied</option>
                                                    <option value="interview_scheduled">Interview Scheduled</option>
                                                    <option value="interviewed">Interviewed</option>
                                                    <option value="shortlisted">Shortlisted</option>
                                                    <option value="hired">Hired</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openDetails(app)}
                                                        className="p-2 text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteApplication(app._id)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete Application"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Application Details Modal */}
            {showDetails && selectedApplication && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="bg-slate-50 px-8 py-6 border-b border-gray-100 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary font-black text-2xl uppercase shadow-inner">
                                    {selectedApplication.candidate?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                                        {selectedApplication.candidate?.name}
                                    </h2>
                                    <p className="text-slate-500 font-medium">{selectedApplication.candidate?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Applied Role</h4>
                                        <p className="text-slate-800 font-bold text-lg">{selectedApplication.job?.title || 'N/A'}</p>
                                        <p className="text-slate-500 text-sm mt-1">{selectedApplication.job?.department || 'General'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Application Status</h4>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight border ${getStageColor(selectedApplication.status)}`}>
                                            {getStageLabel(selectedApplication.status)}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Submission Date</h4>
                                        <div className="flex items-center gap-2 text-slate-600 font-bold">
                                            <Clock size={16} />
                                            {new Date(selectedApplication.appliedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Ranking Score</h4>
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="56" cy="56" r="50" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                                                <circle
                                                    cx="56" cy="56" r="50" stroke="#0ea5e9" strokeWidth="10"
                                                    fill="transparent" strokeDasharray="314"
                                                    strokeDashoffset={314 - (314 * (selectedApplication.rankingScore || 0) / 100)}
                                                    strokeLinecap="round" className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                            <span className="absolute text-3xl font-black text-slate-900">
                                                {Math.round(selectedApplication.rankingScore || 0)}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-500 text-center uppercase tracking-tighter">AI Accuracy Confidence</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="border-t border-slate-100 pt-8 flex gap-4">
                                <button
                                    onClick={() => alert("Resume view coming soon!")}
                                    className="flex-1 flex items-center justify-center gap-3 bg-secondary text-white font-bold py-3.5 rounded-2xl hover:opacity-90 shadow-lg shadow-secondary/20 transition-all active:scale-95"
                                >
                                    <Download size={20} /> Download CV
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedApplication._id, 'interview_scheduled')}
                                    className="flex-1 flex items-center justify-center gap-3 border-2 border-slate-100 text-slate-700 font-bold py-3.5 rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    <CheckCircle size={20} className="text-emerald-500" /> Schedule Interview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApplications;
