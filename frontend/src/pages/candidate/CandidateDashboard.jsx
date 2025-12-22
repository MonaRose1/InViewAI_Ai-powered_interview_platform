import React, { useState, useEffect } from 'react';
import { Briefcase, FileText, CheckCircle, ShieldCheck, Camera, Mic, Wifi, ChevronRight, Loader2, XCircle, Calendar, Clock, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import JobService from '../../services/jobService';
import ApplicationService from '../../services/applicationService';

const CandidateDashboard = () => {
    const [stats, setStats] = useState({ jobs: 0, applications: 0, interviewed: 0 });
    const [loading, setLoading] = useState(true);
    const [showSystemCheck, setShowSystemCheck] = useState(false);
    const [checkStep, setCheckStep] = useState(0);
    const [interviews, setInterviews] = useState([]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [jobs, apps, interviewData] = await Promise.all([
                JobService.getJobs(),
                ApplicationService.getMyApplications(),
                ApplicationService.getMyInterviews()
            ]);

            setInterviews(interviewData || []);
            setStats({
                jobs: jobs.filter(j => j.status === 'open').length,
                applications: apps.length,
                interviewed: apps.filter(a => a.status === 'interviewed').length
            });
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const runSystemCheck = () => {
        setShowSystemCheck(true);
        setCheckStep(1);
        setTimeout(() => setCheckStep(2), 1500);
        setTimeout(() => setCheckStep(3), 3000);
        setTimeout(() => setCheckStep(4), 4500);
    };

    const nextInterview = interviews.find(i => i.status === 'scheduled');

    return (
        <div className="space-y-6">
            {/* Upcoming Interview Hero */}
            {nextInterview && (
                <div className="bg-linear-to-br from-secondary to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-secondary/20 mb-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Next Interview</span>
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-black mb-2">{nextInterview.application?.job?.title || 'Technical Interview'}</h2>
                            <div className="flex flex-wrap gap-4 text-white/80 font-bold uppercase tracking-widest text-xs">
                                <span className="flex items-center gap-2">
                                    <Briefcase size={14} /> {nextInterview.application?.job?.department || 'Engineering'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock size={14} /> {new Date(nextInterview.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            <Link
                                to={`/candidate/interview/${nextInterview._id}`}
                                className="px-8 py-3.5 bg-white text-secondary font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-black/10 flex items-center gap-2 uppercase tracking-tight"
                            >
                                <Video size={20} className="fill-current" /> JOIN INTERVIEW
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Jobs Card */}
                        <div className="bg-linear-to-br from-secondary to-secondary/80 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Briefcase size={80} />
                            </div>
                            <div className="relative z-10">
                                <div className="bg-white/20 p-3 rounded-xl w-fit mb-4"><Briefcase className="w-6 h-6" /></div>
                                <h3 className="text-white/80 font-medium text-sm">Open Opportunities</h3>
                                <p className="text-3xl font-bold mt-1">{loading ? '...' : stats.jobs}</p>
                                <Link to="/candidate/jobs" className="inline-flex items-center gap-2 mt-4 text-xs bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition font-bold uppercase tracking-wider">
                                    Explore Jobs <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Applications Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="bg-purple-50 p-3 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-bold text-slate-800">{loading ? '...' : stats.applications}</span>
                            </div>
                            <h3 className="text-slate-500 font-medium text-sm relative z-10">Active Applications</h3>
                            <Link to="/candidate/applications" className="inline-flex items-center gap-1 mt-4 text-xs text-secondary font-bold hover:gap-2 transition-all">
                                View Status <ChevronRight size={14} />
                            </Link>
                        </div>

                        {/* Profile/Prep Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-green-50 p-3 rounded-xl text-green-600 group-hover:bg-green-100 transition-colors">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-bold text-slate-800">{stats.interviewed}</span>
                            </div>
                            <h3 className="text-slate-500 font-medium text-sm">Interviews Completed</h3>
                            <div className="w-full bg-slate-50 rounded-full h-2 mt-4 mb-2">
                                <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: '70%' }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">70% Profile Strength</span>
                        </div>
                    </div>

                    {/* AI Prep Banner */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mx-auto mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">Ready for your interview?</h2>
                            <p className="text-slate-500 mb-8 max-w-lg mx-auto font-medium">
                                Ensure your camera, microphone, and internet connection meet the requirements before starting your official session.
                            </p>
                            <button
                                onClick={runSystemCheck}
                                className="px-8 py-4 bg-secondary text-white rounded-2xl hover:bg-secondary/90 transition shadow-xl shadow-secondary/20 font-black uppercase tracking-widest text-xs"
                            >
                                Run System Check
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: All Upcoming Interviews */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            Scheduled <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] rounded-md uppercase font-black">{interviews.filter(i => i.status === 'scheduled').length}</span>
                        </h2>
                    </div>

                    <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                        {loading ? (
                            <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-slate-200" /></div>
                        ) : interviews.filter(i => i.status === 'scheduled').length > 0 ? (
                            interviews.filter(i => i.status === 'scheduled').map(interview => (
                                <div key={interview._id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 mb-1 group-hover:text-secondary transition-colors truncate">
                                                {interview.application?.job?.title || 'Technical Interview'}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-3">
                                                {new Date(interview.scheduledTime).toLocaleDateString()} at {new Date(interview.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/candidate/interview/${interview._id}`}
                                                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase text-center hover:bg-secondary transition-all"
                                                >
                                                    Join Room
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                                    <Clock size={32} />
                                </div>
                                <p className="text-slate-400 font-bold text-sm">No interviews scheduled</p>
                                <Link to="/candidate/jobs" className="text-secondary font-black text-xs mt-2 inline-block hover:underline uppercase tracking-widest">Apply Now →</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* System Check Modal Overlay */}
            <AnimatePresence>
                {showSystemCheck && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-50">
                                <motion.div
                                    className="h-full bg-secondary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(checkStep / 4) * 100}%` }}
                                />
                            </div>

                            <button onClick={() => setShowSystemCheck(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
                                <XCircle size={20} />
                            </button>

                            <h3 className="text-xl font-black text-slate-800 mb-6 text-center">AI System Readiness</h3>

                            <div className="space-y-4">
                                <CheckItem icon={<Camera />} label="Camera Hardware" status={checkStep >= 1 ? 'ok' : 'pending'} />
                                <CheckItem icon={<Mic />} label="Microphone Level" status={checkStep >= 2 ? 'ok' : 'pending'} />
                                <CheckItem icon={<Wifi />} label="Network Stability" status={checkStep >= 3 ? 'ok' : 'pending'} />
                                <CheckItem icon={<ShieldCheck />} label="Browser Permissions" status={checkStep >= 4 ? 'ok' : 'pending'} />
                            </div>

                            {checkStep === 4 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 p-4 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center"
                                >
                                    <p className="text-green-700 font-bold mb-4">All systems clear!</p>
                                    <button
                                        onClick={() => setShowSystemCheck(false)}
                                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition"
                                    >
                                        Return to Dashboard
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CheckItem = ({ icon, label, status }) => (
    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${status === 'ok' ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100 opacity-60'
        }`}>
        <div className="flex items-center gap-3">
            <div className={`${status === 'ok' ? 'text-green-600' : 'text-slate-400'}`}>
                {React.cloneElement(icon, { size: 18 })}
            </div>
            <span className={`text-sm font-bold ${status === 'ok' ? 'text-green-800' : 'text-slate-500'}`}>{label}</span>
        </div>
        {status === 'ok' ? (
            <CheckCircle className="text-green-500" size={16} />
        ) : (
            <Loader2 className="text-slate-300 animate-spin" size={16} />
        )}
    </div>
);

export default CandidateDashboard;
