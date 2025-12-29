import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, FileText, Calendar, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import ApplicationService from '../../services/applicationService';

const CandidateApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const data = await ApplicationService.getMyApplications();
            setApplications(data);
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'interview_scheduled': return 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse';
            case 'interviewed': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'offered': return 'bg-green-50 text-green-700 border-green-100 font-black';
            case 'hired': return 'bg-green-500 text-white border-green-600 font-black shadow-lg shadow-green-100';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Track Applications</h1>
                    <p className="text-slate-500 mt-1 font-medium">Keep an eye on your journey with InViewAI.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-secondary w-12 h-12" />
                    <p className="text-slate-400 font-bold animate-pulse">Syncing application status...</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[11px] uppercase text-slate-500 font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Position</th>
                                    <th className="px-8 py-5">Applied Date</th>
                                    <th className="px-8 py-5">Stage</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {applications.length > 0 ? applications.map((app) => (
                                    <tr key={app._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-slate-800 group-hover:text-secondary transition-colors underline decoration-transparent group-hover:decoration-secondary">
                                                {app.job?.title}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-slate-500">
                                            {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider ${getStatusStyles(app.status)}`}>
                                                {app.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {app.status === 'interview_scheduled' && (
                                                    <Link
                                                        to={`/candidate/interview/${app._id}`}
                                                        className="px-4 py-2 bg-secondary text-white text-[11px] font-black rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 flex items-center gap-2"
                                                    >
                                                        JOIN NOW <ChevronRight size={14} />
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => setSelectedApp(app)}
                                                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                                                <FileText size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold">You haven't applied to any jobs yet.</p>
                                            <Link to="/candidate/jobs" className="text-secondary font-black text-sm mt-2 inline-block hover:underline">Browse open roles →</Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Quick View Sidebar Drawer */}
                    <AnimatePresence>
                        {selectedApp && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedApp(null)}
                                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50"
                                />
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 p-8 overflow-y-auto"
                                >
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-black text-slate-800">Application Insight</h3>
                                        <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                            <XCircle size={24} className="text-slate-400" />
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Position</div>
                                            <h4 className="text-lg font-bold text-slate-800">{selectedApp.job?.title}</h4>
                                        </div>

                                        <div>
                                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Timeline</h5>
                                            <div className="space-y-6">
                                                <TimelineItem
                                                    icon={<CheckCircle className="text-green-500" />}
                                                    title="Application Submitted"
                                                    date={new Date(selectedApp.appliedAt).toLocaleDateString()}
                                                    active
                                                />
                                                <TimelineItem
                                                    icon={<Clock className={selectedApp.status !== 'applied' ? 'text-green-500' : 'text-amber-500'} />}
                                                    title="Review Process"
                                                    date={selectedApp.status !== 'applied' ? 'Completed' : 'In Progress'}
                                                    active={selectedApp.status !== 'applied'}
                                                />
                                                <TimelineItem
                                                    icon={<Calendar className={selectedApp.status === 'interview_scheduled' ? 'text-secondary' : 'text-slate-300'} />}
                                                    title="Interview Stage"
                                                    date={selectedApp.status === 'interview_scheduled' ? 'Scheduled' : 'Pending'}
                                                    active={selectedApp.status.includes('interview')}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-slate-50">
                                            <Link
                                                to={`/candidate/applications/${selectedApp._id}/status`}
                                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                                            >
                                                FULL TRACKING PAGE <ChevronRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

const TimelineItem = ({ icon, title, date, active }) => (
    <div className={`flex gap-4 items-start ${!active && 'opacity-40'}`}>
        <div className="mt-1">{React.cloneElement(icon, { size: 18 })}</div>
        <div>
            <div className="text-sm font-bold text-slate-800">{title}</div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{date}</div>
        </div>
    </div>
);

export default CandidateApplicationsPage;
