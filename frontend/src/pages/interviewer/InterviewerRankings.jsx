import React, { useState, useEffect } from 'react';
import { Trophy, Briefcase, TrendingUp, Users, ChevronRight, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ScheduleInterviewModal from './components/ScheduleInterviewModal';

const InterviewerRankings = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [rankings, setRankings] = useState([]);
    const [loadingRankings, setLoadingRankings] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data);
        } catch (err) {
            console.error('Failed to fetch jobs', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRankings = async (jobId) => {
        try {
            setLoadingRankings(true);
            const { data } = await api.get(`/ranking/${jobId}`);
            setRankings(data);
            setSelectedJob(jobId);
        } catch (err) {
            console.error('Failed to fetch rankings', err);
        } finally {
            setLoadingRankings(false);
        }
    };

    const handleScheduleInterview = (app) => {
        setSelectedApp(app);
        setShowScheduleModal(true);
    };

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedJob && rankings.length >= 0) {
        const job = jobs.find(j => j._id === selectedJob);

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedJob(null)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                    >
                        ← Back to Jobs
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">{job?.title}</h1>
                        <p className="text-slate-500 font-medium">{job?.department} • {job?.location}</p>
                    </div>
                </div>

                {loadingRankings ? (
                    <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-secondary w-12 h-12 mb-4" />
                        <p className="text-slate-400 font-bold">Loading rankings...</p>
                    </div>
                ) : rankings.length > 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b border-slate-100">
                            <h2 className="font-black text-slate-800 flex items-center gap-2">
                                <Trophy size={20} className="text-yellow-500" />
                                Top Ranked Candidates
                            </h2>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {rankings.map((app, index) => (
                                <div key={app._id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shrink-0 ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                                index === 2 ? 'bg-orange-50 text-orange-700' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            #{index + 1}
                                        </div>

                                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-secondary to-indigo-600 flex items-center justify-center text-2xl font-black text-white shrink-0">
                                            {app.candidate?.name?.charAt(0) || 'C'}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 text-lg">{app.candidate?.name || 'Unknown'}</h3>
                                            <p className="text-sm text-slate-500 font-medium">{app.candidate?.email}</p>
                                        </div>

                                        <div className="text-center">
                                            <div className="text-3xl font-black text-slate-800">{app.rankingScore || 0}</div>
                                            <div className="text-xs text-slate-400 uppercase font-bold">Total Score</div>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-4">
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Breakdown</div>
                                            <div className="flex gap-4 text-sm">
                                                <div>
                                                    <span className="text-purple-600 font-bold">AI: {app.scoreBreakdown?.aiScore || 0}</span>
                                                </div>
                                                <div className="text-slate-300">|</div>
                                                <div>
                                                    <span className="text-indigo-600 font-bold">Manual: {app.scoreBreakdown?.manualScore || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Link
                                                to={`/interviewer/applicants`}
                                                className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-center text-xs"
                                            >
                                                View Profile
                                            </Link>
                                            <button
                                                onClick={() => handleScheduleInterview(app)}
                                                className="px-6 py-2 bg-secondary text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-secondary/20 text-xs"
                                            >
                                                Schedule
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100">
                        <Trophy className="mx-auto text-slate-200 mb-4" size={64} />
                        <h3 className="text-slate-800 font-black text-xl mb-2">No Ranked Candidates Yet</h3>
                        <p className="text-slate-400 font-medium">Candidates will appear here once they've been scored.</p>
                    </div>
                )}

                <ScheduleInterviewModal
                    isOpen={showScheduleModal}
                    onClose={() => setShowScheduleModal(false)}
                    selectedApp={selectedApp}
                    onScheduleSuccess={() => fetchRankings(selectedJob)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Candidate Rankings</h1>
                    <p className="text-slate-500 font-medium mt-1">View top-ranked candidates for each position</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-sm w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-secondary w-12 h-12 mb-4" />
                    <p className="text-slate-400 font-bold">Loading jobs...</p>
                </div>
            ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.map(job => (
                        <div
                            key={job._id}
                            onClick={() => fetchRankings(job._id)}
                            className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-secondary/10 rounded-2xl group-hover:bg-secondary group-hover:text-white transition-all">
                                    <Briefcase size={24} className="text-secondary group-hover:text-white" />
                                </div>
                                <ChevronRight size={20} className="text-slate-300 group-hover:text-secondary transition-all" />
                            </div>

                            <h3 className="font-black text-slate-800 text-lg mb-2 group-hover:text-secondary transition-all">
                                {job.title}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mb-4">
                                {job.department} • {job.location}
                            </p>

                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase">
                                <div className="flex items-center gap-1">
                                    <Users size={14} />
                                    {job.applicantsCount || 0} Applicants
                                </div>
                                <div className="flex items-center gap-1">
                                    <TrendingUp size={14} />
                                    View Rankings
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100">
                    <Briefcase className="mx-auto text-slate-200 mb-4" size={64} />
                    <h3 className="text-slate-800 font-black text-xl mb-2">No Jobs Found</h3>
                    <p className="text-slate-400 font-medium">Try adjusting your search terms.</p>
                </div>
            )}
        </div>
    );
};

export default InterviewerRankings;
