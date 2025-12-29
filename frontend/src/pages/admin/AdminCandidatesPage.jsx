import React, { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, Mail, UserCheck } from 'lucide-react';
import api from '../../services/api';

const AdminCandidatesPage = () => {
    const [candidates, setCandidates] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const { data } = await api.get('/admin/users?role=candidate');
                // Filter out invalid users
                const validCandidates = data.filter(c => c.name && c.name !== 'Unknown');
                setCandidates(validCandidates);
            } catch (error) {
                console.error("Failed to fetch candidates", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, []);

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Candidates Management</h1>
                    <p className="text-slate-500 text-sm">Review and manage candidate profiles and applications.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 font-semibold">
                    <UserCheck size={18} /> Add Candidate
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-stale-200 rounded-lg text-slate-600 hover:bg-slate-50 transition font-medium text-sm">
                    <Filter size={18} /> Filter By Status
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Skills</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading candidates...</td></tr>
                        ) : filteredCandidates.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400">No candidates found.</td></tr>
                        ) : (
                            filteredCandidates.map((candidate, i) => (
                                <tr key={candidate._id || i} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs uppercase">
                                                {candidate.name?.charAt(0) || 'C'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{candidate.name}</div>
                                                <div className="text-xs text-slate-400">{candidate.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(candidate.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {candidate.skills && candidate.skills.length > 0 ? (
                                                candidate.skills.slice(0, 2).map((skill, idx) => (
                                                    <span key={idx} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">{skill}</span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No skills listed</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${candidate.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                            {candidate.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition">
                                                <Mail size={16} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition">
                                                <ExternalLink size={16} />
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
    );
};

export default AdminCandidatesPage;
