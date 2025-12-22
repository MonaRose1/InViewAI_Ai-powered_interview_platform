import React, { useState, useEffect } from 'react';
import { Search, Filter, PlayCircle, FileText, CheckCircle, Loader2, Calendar } from 'lucide-react';
import InterviewerService from '../../services/interviewerService';

const InterviewerHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await InterviewerService.getAssignedInterviews();
                // Filter only completed interviews
                setHistory(data.filter(i => i.status === 'completed'));
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item =>
        item.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Interview History</h1>
                    <p className="text-slate-500 mt-1 font-medium">Review past evaluations, scores, and recordings.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8 flex gap-4 items-center">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary h-5 w-5 transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search candidates, roles, or dates..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-secondary/20 outline-none transition font-medium text-slate-700"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 border border-slate-100 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
                    <Filter size={18} /> FILTER
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-secondary w-12 h-12" />
                    <p className="text-slate-400 font-bold animate-pulse">Loading past records...</p>
                </div>
            ) : filteredHistory.length > 0 ? (
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[11px] uppercase text-slate-500 font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Candidate</th>
                                    <th className="px-8 py-5">Position</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">AI Score</th>
                                    <th className="px-8 py-5">Final Score</th>
                                    <th className="px-8 py-5 text-right">Review</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredHistory.map(item => (
                                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-slate-800 group-hover:text-secondary transition-colors">{item.candidate?.name || 'Unknown'}</div>
                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{item.candidate?.email}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold text-slate-600">{item.job?.title || 'Unknown Role'}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.job?.department}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold text-slate-500">
                                                {new Date(item.scheduledTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl font-black text-[11px] border border-purple-100">
                                                {item.aiResult?.score || 'N/A'}/100
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-xl font-black text-[11px] border border-secondary/20 shadow-sm shadow-secondary/5">
                                                {item.score || 'PENDING'}{item.score ? '/100' : ''}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => alert("Recording playback not available in this demo.")}
                                                    className="p-2.5 text-slate-400 hover:text-secondary hover:bg-secondary/5 rounded-xl transition-all"
                                                    title="Watch Recording"
                                                >
                                                    <PlayCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => alert("Full PDF Report downloading...")}
                                                    className="p-2.5 text-slate-400 hover:text-secondary hover:bg-secondary/5 rounded-xl transition-all"
                                                    title="Full Report"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                        <Calendar size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">No history found</h2>
                    <p className="text-slate-400 font-medium">You haven't completed any interviews that match your search.</p>
                </div>
            )}
        </div>
    );
};

export default InterviewerHistory;
