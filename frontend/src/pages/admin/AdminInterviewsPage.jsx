import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle2, XCircle, Search, Filter, Eye, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import api from '../../services/api';

const AdminInterviewsPage = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInterviews();
    }, [statusFilter]);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;

            const { data } = await api.get('/admin/interviews', { params });
            setInterviews(data);
        } catch (error) {
            console.error('Failed to fetch interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (interviewId, newStatus) => {
        try {
            const { data } = await api.put(`/admin/interviews/${interviewId}`, {
                status: newStatus
            });
            setInterviews(interviews.map(i => i._id === interviewId ? data : i));
        } catch (error) {
            console.error('Failed to update interview:', error);
            alert('Failed to update interview status');
        }
    };

    const handleCancelInterview = async (interviewId) => {
        if (!confirm('Are you sure you want to cancel this interview?')) return;

        try {
            await api.delete(`/admin/interviews/${interviewId}`);
            setInterviews(interviews.filter(i => i._id !== interviewId));
            alert('Interview cancelled successfully');
        } catch (error) {
            console.error('Failed to cancel interview:', error);
            alert('Failed to cancel interview');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'scheduled':
                return <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1 w-fit"><Clock size={12} /> Scheduled</span>;
            case 'completed':
                return <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Completed</span>;
            case 'cancelled':
                return <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1 w-fit"><XCircle size={12} /> Cancelled</span>;
            case 'in_progress':
                return <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold border border-secondary/20 flex items-center gap-1 w-fit"><Clock size={12} /> In Progress</span>;
            default:
                return <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-bold border border-gray-100">{status}</span>;
        }
    };

    const filteredInterviews = interviews.filter(i =>
        (i.candidate?.name && i.candidate?.name !== 'Unknown') &&
        (!searchTerm ||
            i.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Interview Management</h1>
            <p className="text-slate-500 mb-8">Schedule and manage all interviews.</p>

            {/* Status Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'scheduled', 'in_progress', 'completed', 'cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${statusFilter === status
                            ? 'bg-secondary text-white'
                            : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by candidate or job title..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    />
                </div>
            </div>

            {/* Interviews List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-secondary animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredInterviews.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                            <p className="text-slate-400">No interviews found</p>
                        </div>
                    ) : (
                        filteredInterviews.map((interview) => (
                            <div
                                key={interview._id}
                                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                                                {interview.candidate?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">
                                                    {interview.candidate?.name || 'Unknown Candidate'}
                                                </h3>
                                                <p className="text-sm text-slate-500">{interview.candidate?.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1">Position</p>
                                                <p className="text-sm font-medium text-slate-700">
                                                    {interview.job?.title || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1">Interviewer</p>
                                                <p className="text-sm font-medium text-slate-700">
                                                    {interview.interviewer?.name || 'Not Assigned'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1">Scheduled</p>
                                                <p className="text-sm font-medium text-slate-700">
                                                    {interview.scheduledTime
                                                        ? new Date(interview.scheduledTime).toLocaleString()
                                                        : 'Not Scheduled'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1">Status</p>
                                                {getStatusBadge(interview.status)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <select
                                            value={interview.status}
                                            onChange={(e) => handleUpdateStatus(interview._id, e.target.value)}
                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                                        >
                                            <option value="scheduled">Scheduled</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        <button
                                            onClick={() => handleCancelInterview(interview._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Cancel Interview"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminInterviewsPage;
