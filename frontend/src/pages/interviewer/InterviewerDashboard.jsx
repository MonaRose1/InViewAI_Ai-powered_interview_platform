import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, Briefcase, Loader2, ChevronRight, AlertCircle, BarChart, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import InterviewerService from '../../services/interviewerService';
import ScheduleInterviewModal from './components/ScheduleInterviewModal';

const InterviewerDashboard = () => {
    const [interviews, setInterviews] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [interviewsData, appsData] = await Promise.all([
                InterviewerService.getAssignedInterviews(),
                InterviewerService.getPendingApplications()
            ]);
            setInterviews(interviewsData);
            // Filter out unknown applicants AND only show unprocessed ones (applied/pending)
            const validApps = appsData.filter(app =>
                app.candidate &&
                app.candidate.name &&
                app.candidate.name !== 'Unknown' &&
                (app.status === 'applied' || app.status === 'pending')
            );
            setApplications(validApps);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleScheduleInterview = (app) => {
        setSelectedApp(app);
        setShowScheduleModal(true);
    };

    const handleViewProfile = (candidate) => {
        if (candidate?.resumeUrl) {
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const fullUrl = candidate.resumeUrl.startsWith('http')
                ? candidate.resumeUrl
                : `${baseUrl}${candidate.resumeUrl}`;
            window.open(fullUrl, '_blank');
        } else {
            alert('Resume not available for this candidate');
        }
    };

    const upcomingSessions = Array.isArray(interviews) ? interviews.filter(i => i.status === 'scheduled') : [];
    const completedSessions = Array.isArray(interviews) ? interviews.filter(i => i.status === 'completed') : [];
    const nextInterview = upcomingSessions[0];
    const recentApps = applications.slice(0, 5);

    return (
        <div className="space-y-8 pb-10">
            {/* Top Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-800">Interviewer Insights</h1>
                <p className="text-slate-500 mt-1 font-medium italic">Empowering your recruitment decisions with AI & data.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Upcoming</p>
                    <div className="text-4xl font-black text-slate-800">{upcomingSessions.length}</div>
                    <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Clock size={12} /> SYNCED WITH CALENDAR
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Completed</p>
                    <div className="text-4xl font-black text-slate-800">{completedSessions.length}</div>
                    <div className="mt-4 text-[10px] font-bold text-green-500 uppercase">Sessions analyzed</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Pending Apps</p>
                    <div className="text-4xl font-black text-slate-800">{applications.length}</div>
                    <div className="mt-4 text-[10px] font-bold text-amber-500 uppercase">Awaiting review</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">AI Accuracy</p>
                    <div className="text-4xl font-black text-slate-800">92%</div>
                    <div className="mt-4 text-[10px] font-bold text-secondary uppercase">Market Leading</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Next Interview Hero */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            Up Next <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        </h2>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-4xl p-20 flex flex-col items-center justify-center border border-slate-50 shadow-sm">
                            <Loader2 className="animate-spin text-secondary w-10 h-10 mb-4" />
                            <p className="text-slate-400 font-bold">Synchronizing your dashboard...</p>
                        </div>
                    ) : nextInterview ? (
                        <div className="bg-linear-to-br from-secondary to-indigo-700 rounded-4xl p-8 text-white relative overflow-hidden shadow-2xl shadow-secondary/20">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

                            <div className="relative flex flex-col md:flex-row justify-between gap-10">
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/20">
                                            {nextInterview.candidate?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black leading-tight text-white">{nextInterview.candidate?.name}</h3>
                                            <p className="text-white/60 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mt-1">
                                                <Briefcase size={14} /> {nextInterview.application?.job?.title}
                                            </p>
                                        </div>
                                    </div>


                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                            <div className="text-white/50 text-[10px] font-black uppercase mb-1">Schedule</div>
                                            <div className="font-bold text-sm">Today at {new Date(nextInterview.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                            <div className="text-white/50 text-[10px] font-black uppercase mb-1">Room ID</div>
                                            <div className="font-bold text-sm">{nextInterview._id.slice(-8).toUpperCase()}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <Link
                                            to={`/interviewer/interviews/${nextInterview._id}/live`}
                                            className="px-8 py-3.5 bg-white text-secondary font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                                        >
                                            <Video size={20} className="fill-current" /> START INTERVIEW
                                        </Link>
                                        <button
                                            onClick={() => handleViewProfile(nextInterview.candidate)}
                                            className="px-6 py-3.5 bg-black/20 text-white font-black rounded-2xl hover:bg-black/30 transition-all border border-white/10 backdrop-blur-sm"
                                        >
                                            VIEW PROFILE
                                        </button>
                                    </div>
                                </div>

                                <div className="hidden md:flex flex-col justify-end text-right border-l border-white/10 pl-10">
                                    <div className="mb-6">
                                        <div className="text-white/50 text-[10px] font-black uppercase mb-1">AI Recommendation</div>
                                        <div className="text-2xl font-black text-amber-300">Strong Match</div>
                                    </div>
                                    <div>
                                        <div className="text-white/50 text-[10px] font-black uppercase mb-1">Resume Keywords</div>
                                        <div className="flex flex-wrap gap-2 justify-end mt-2">
                                            {['React', 'Node.js', 'Scaling'].map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-bold border border-white/5">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-4xl p-16 text-center border-2 border-dashed border-slate-100 shadow-sm">
                            <Calendar className="mx-auto text-slate-200 mb-4" size={56} />
                            <h3 className="text-slate-800 font-black text-xl">No Pending Interviews</h3>
                            <p className="text-slate-400 font-medium">Sit back and relax! You've cleared your current agenda.</p>
                            <Link to="/interviewer/interviews" className="mt-6 inline-block px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                                Manage Interviews
                            </Link>
                        </div>
                    )}

                    {/* Secondary Priority Sessions */}
                    {upcomingSessions.length > 1 && (
                        <div className="pt-4 animate-in slide-in-from-bottom-5 duration-500">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Later Today</h3>
                            <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
                                {upcomingSessions.slice(1, 3).map((interview) => (
                                    <div key={interview._id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400">
                                                {interview.candidate?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{interview.candidate?.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{interview.application?.job?.title}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-700">{new Date(interview.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className="text-[10px] font-bold text-slate-300 uppercase">TIME</p>
                                            </div>
                                            <Link to={`/interviewer/interviews/${interview._id}/live`} className="p-2.5 bg-slate-50 text-slate-400 hover:text-secondary rounded-xl transition-all">
                                                <Video size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                                <Link to="/interviewer/interviews" className="block w-full py-3 bg-slate-50/50 text-center text-[10px] font-black text-slate-400 hover:text-secondary transition-all uppercase tracking-widest">
                                    View All Upcoming Sessions →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Recent Applicants */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800">New Applicants</h2>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-500 text-[10px] font-black rounded-md">{applications.length} TOTAL</span>
                    </div>

                    <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                        {loading ? (
                            <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-slate-200" /></div>
                        ) : recentApps.length > 0 ? (
                            recentApps.map(app => (
                                <div key={app._id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
                                            <User size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 mb-1 group-hover:text-secondary transition-colors">{app.candidate?.name}</h4>
                                            <p className="text-xs text-slate-500 font-medium truncate mb-3">{app.job?.title || 'General Application'}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-400 text-[9px] font-bold rounded-lg uppercase">Score: {app.rankingScore || '0'}</span>
                                                <button
                                                    onClick={() => handleScheduleInterview(app)}
                                                    className="text-secondary text-[10px] font-black uppercase hover:underline ml-auto"
                                                >
                                                    Schedule Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center">
                                <AlertCircle className="mx-auto text-slate-200 mb-2" size={32} />
                                <p className="text-slate-400 text-sm font-medium">No new applicants</p>
                            </div>
                        )}
                        <Link
                            to="/interviewer/applicants"
                            className="w-full py-4 text-xs font-black text-slate-400 hover:text-slate-800 transition-all uppercase tracking-widest border-t border-slate-50 p-4 block text-center"
                        >
                            Go to Talent Pipeline →
                        </Link>
                    </div>

                    {/* AI Tip / Productivity */}
                    <div className="bg-linear-to-br from-amber-400 to-orange-500 rounded-4xl p-6 text-white shadow-xl shadow-amber-200/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-1.5 bg-white/20 rounded-lg"><AlertCircle size={18} /></div>
                            <h4 className="font-black text-sm uppercase tracking-wider">Top Ranker Alert</h4>
                        </div>
                        <p className="text-xs font-bold leading-relaxed text-amber-50/80">
                            {applications.length > 0 && applications[0] ? (
                                <>
                                    <span className="text-white">{applications[0].candidate?.name || 'Top candidate'}</span> has the highest ranking score of <span className="text-white">{applications[0].rankingScore || 0}</span> for {applications[0].job?.title}. Consider reviewing their application today.
                                </>
                            ) : (
                                'Check the rankings page to see top candidates for all positions.'
                            )}
                        </p>
                        <Link
                            to="/interviewer/rankings"
                            className="mt-4 w-full py-2.5 bg-white text-orange-500 font-black rounded-xl text-[10px] uppercase shadow-lg shadow-black/5 hover:scale-105 transition-all block text-center"
                        >
                            View All Rankings
                        </Link>
                    </div>
                </div>
            </div>

            <ScheduleInterviewModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                selectedApp={selectedApp}
                onScheduleSuccess={fetchData}
            />
        </div>
    );
};

export default InterviewerDashboard;
