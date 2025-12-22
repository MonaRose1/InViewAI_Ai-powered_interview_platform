import React, { useState } from 'react';
import { X, Calendar, Clock, Mail, Phone, Loader2 } from 'lucide-react';
import InterviewerService from '../../../services/interviewerService';

const ScheduleInterviewModal = ({ isOpen, onClose, selectedApp, onScheduleSuccess }) => {
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !selectedApp) return null;

    const confirmSchedule = async () => {
        if (!scheduleDate || !scheduleTime) {
            alert('Please select both date and time');
            return;
        }

        try {
            setIsSubmitting(true);
            await InterviewerService.scheduleInterview(
                selectedApp._id,
                `${scheduleDate}T${scheduleTime}`
            );

            alert(`Interview scheduled for ${selectedApp.candidate?.name} on ${scheduleDate} at ${scheduleTime}`);
            setScheduleDate('');
            setScheduleTime('');
            onScheduleSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to schedule interview', err);
            alert('Failed to schedule interview');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
                <div className="bg-secondary p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white">Schedule Interview</h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-white/80 text-sm mt-2">
                        {selectedApp.candidate?.name} • {selectedApp.job?.title || 'General Application'}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Picker */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            <Calendar size={16} className="inline mr-2" />
                            Interview Date
                        </label>
                        <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                        />
                    </div>

                    {/* Time Picker */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            <Clock size={16} className="inline mr-2" />
                            Interview Time
                        </label>
                        <input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                        />
                    </div>

                    {/* Candidate Info */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Mail size={14} />
                            {selectedApp.candidate?.email || 'No email'}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Phone size={14} />
                            {selectedApp.candidate?.phone || 'No phone'}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmSchedule}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleInterviewModal;
