import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, User, Briefcase, Loader2, CheckCircle, AlertCircle, PlusCircle } from 'lucide-react';
import InterviewerService from '../../services/interviewerService';

const InterviewerSchedule = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scheduling, setScheduling] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [scheduleTime, setScheduleTime] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const data = await InterviewerService.getPendingApplications();
            setApplications(data);
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleSubmit = async () => {
        if (!scheduleTime) return alert("Please select a date and time");

        try {
            setScheduling(true);
            await InterviewerService.scheduleInterview(selectedApp._id, scheduleTime);
            setShowModal(false);
            setScheduleTime('');
            // Refresh list
            fetchApplications();
            alert("Interview scheduled successfully!");
        } catch (error) {
            console.error("Schedule failed", error);
            alert("Failed to schedule interview");
        } finally {
            setScheduling(false);
        }
    };

    const filteredApplications = applications.filter(app =>
        app.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Schedule Meetings</h1>
                    <p className="text-slate-500 mt-1 font-medium">Coordinate with new applicants to set up interview sessions.</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary h-5 w-5 transition-colors" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search applicants by name or job role..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-secondary/5 focus:border-secondary shadow-sm transition-all font-medium text-slate-700"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-secondary w-12 h-12" />
                    <p className="text-slate-400 font-bold animate-pulse">Scanning pool...</p>
                </div>
            ) : filteredApplications.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredApplications.map((app) => (
                        <div key={app._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 hover:border-secondary/20 hover:shadow-xl hover:shadow-secondary/5 transition-all group flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                                        {app.candidate?.name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-secondary transition-colors underline decoration-transparent group-hover:decoration-secondary decoration-2 underline-offset-4">
                                            {app.candidate?.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium">{app.candidate?.email}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black px-3 py-1 bg-slate-50 text-slate-500 rounded-full uppercase tracking-widest border border-slate-100">
                                    {app.job?.department}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-6 text-sm text-slate-600 font-medium">
                                <Briefcase size={16} className="text-slate-400" />
                                <span>Applying for: <span className="text-slate-800 font-bold">{app.job?.title}</span></span>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => {
                                        setSelectedApp(app);
                                        setShowModal(true);
                                    }}
                                    className="px-6 py-2.5 bg-secondary text-white text-sm font-black rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 flex items-center gap-2"
                                >
                                    <PlusCircle size={18} />
                                    SCHEDULE NOW
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">No pending applications</h2>
                    <p className="text-slate-400 font-medium">All current applicants have been processed or scheduled.</p>
                </div>
            )}

            {/* Scheduling Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-slate-800 mb-2">Set Interview Time</h2>
                            <p className="text-slate-500 font-medium mb-8">Scheduling <span className="text-secondary font-bold">{selectedApp?.candidate?.name}</span> for <span className="text-slate-800 font-bold">{selectedApp?.job?.title}</span></p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <Calendar size={16} className="text-secondary" /> Select Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-secondary/5 focus:border-secondary transition-all font-bold text-slate-700"
                                        value={scheduleTime}
                                        onChange={(e) => setScheduleTime(e.target.value)}
                                    />
                                </div>

                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                                    <AlertCircle className="text-amber-500 shrink-0" size={20} />
                                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                        An email invitation will be sent to the candidate immediately after confirmation.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 px-6 border border-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleScheduleSubmit}
                                    disabled={scheduling}
                                    className="flex-1 py-4 px-6 bg-secondary text-white font-black rounded-2xl hover:bg-secondary/90 transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                >
                                    {scheduling ? <Loader2 size={18} className="animate-spin" /> : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewerSchedule;
