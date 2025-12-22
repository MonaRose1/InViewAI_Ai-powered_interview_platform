import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, Search, Filter, CheckCircle, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import InterviewerService from '../../services/interviewerService';

const InterviewerInterviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, scheduled, completed, cancelled
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const data = await InterviewerService.getAssignedInterviews();
                setInterviews(data);
            } catch (err) {
                console.error("Failed to fetch interviews", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    const filteredInterviews = Array.isArray(interviews) ? interviews.filter(interview => {
        const matchesFilter = filter === 'all' || interview.status === filter;
        const matchesSearch =
            interview.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            interview.application?.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    }) : [];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'completed': return 'bg-green-50 text-green-600 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Interview Management</h1>
                    <p className="text-slate-500 font-medium">Manage and review all your scheduled sessions.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-sm w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs & Filters */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex gap-1">
                    {['all', 'scheduled', 'completed', 'cancelled'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === tab
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {filteredInterviews.length} SESSION{filteredInterviews.length !== 1 ? 'S' : ''}
                </div>
            </div>

            {/* Interview List */}
            {loading ? (
                <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center border border-slate-100">
                    <Loader2 className="animate-spin text-secondary w-12 h-12 mb-4" />
                    <p className="text-slate-400 font-bold">Fetching sessions...</p>
                </div>
            ) : filteredInterviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredInterviews.map((interview) => (
                        <div key={interview._id} className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xl group-hover:bg-secondary group-hover:text-white transition-all">
                                        {interview.candidate?.name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-black text-slate-800 text-lg">{interview.candidate?.name || 'Unknown Candidate'}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getStatusStyle(interview.status)}`}>
                                                {interview.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <Briefcase size={14} /> {interview.application?.job?.title || 'Unknown Role'}
                                            </span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                            <span className="flex items-center gap-1.5">
                                                <User size={14} /> ID: {interview._id.slice(-6).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 md:gap-12">
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-800">
                                                {interview.scheduledTime ? new Date(interview.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DATE</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-800">
                                                {interview.scheduledTime ? new Date(interview.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIME</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {interview.status === 'scheduled' && (
                                            <Link
                                                to={`/interviewer/interviews/${interview._id}/live`}
                                                className="p-3 bg-secondary text-white rounded-2xl hover:scale-105 transition-all shadow-lg shadow-secondary/20"
                                            >
                                                <Video size={20} />
                                            </Link>
                                        )}
                                        <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100">
                    <Calendar className="mx-auto text-slate-200 mb-4" size={64} />
                    <h3 className="text-slate-800 font-bold text-xl">No matching sessions</h3>
                    <p className="text-slate-400 font-medium">Try adjusting your filters or search terms.</p>
                </div>
            )}
        </div>
    );
};

const Briefcase = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

export default InterviewerInterviews;
