import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Download, ExternalLink, Loader2 } from 'lucide-react';
import api from '../../services/api';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

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
            case 'offered': return 'bg-green-50 text-green-700 border-green-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getStageLabel = (status) => {
        switch (status) {
            case 'interview_scheduled': return 'Interview Scheduled';
            case 'interviewed': return 'Interviewed';
            case 'applied': return 'Applied';
            case 'rejected': return 'Rejected';
            case 'offered': return 'Offered';
            default: return status;
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Application Management</h1>
            <p className="text-slate-500 mb-8">Track and manage candidate applications.</p>

            {/* Status Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'applied', 'interview_scheduled', 'interviewed', 'offered', 'rejected'].map(status => (
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
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {applications.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-400">
                                            No applications found
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app) => (
                                        <tr key={app._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs uppercase">
                                                        {app.candidate?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-800">{app.candidate?.name || 'Unknown'}</span>
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
                                                    <option value="offered">Offered</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="p-2 text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition">
                                                    <ExternalLink size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApplications;
