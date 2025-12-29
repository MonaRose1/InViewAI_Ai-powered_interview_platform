import React, { useState, useEffect } from 'react';
import { X, Trophy, Brain, User, Calendar, Clock, BarChart3, MessageSquare, Star } from 'lucide-react';
import api from '../../../services/api';

const InterviewDetailsModal = ({ isOpen, onClose, interviewId }) => {
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && interviewId) {
            fetchDetails();
        }
    }, [isOpen, interviewId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/scores/${interviewId}`);
            setInterview(data);
        } catch (err) {
            console.error('Failed to fetch interview details', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-linear-to-r from-slate-50 to-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <Trophy className="text-yellow-500" />
                            Interview Results
                        </h2>
                        <p className="text-slate-500 font-medium">Detailed performance breakdown</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="text-slate-400" />
                    </button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-slate-400 font-bold">Loading analysis...</p>
                        </div>
                    ) : interview ? (
                        <div className="space-y-8">
                            {/* Score Overview */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-6 rounded-3xl text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
                                    <div className="text-3xl font-black text-slate-800">{interview.finalScore || 0}</div>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-3xl text-center">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">AI Score</p>
                                    <div className="text-3xl font-black text-purple-600">{interview.ai?.overallConfidence || 0}</div>
                                </div>
                                <div className="bg-indigo-50 p-6 rounded-3xl text-center">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Manual Score</p>
                                    <div className="text-3xl font-black text-indigo-600">
                                        {interview.manual ? Math.round((interview.manual.technicalScore + interview.manual.communicationScore + interview.manual.problemSolvingScore) / 3) : 0}
                                    </div>
                                </div>
                            </div>

                            {/* Manual Breakdown */}
                            {interview.manual && (
                                <div className="space-y-4">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                                        <Star className="text-indigo-500" size={20} />
                                        Manual Evaluation
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                                            <span className="text-slate-600 font-bold">Technical Proficiency</span>
                                            <span className="font-black text-indigo-600">{interview.manual.technicalScore}/100</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                                            <span className="text-slate-600 font-bold">Communication Skills</span>
                                            <span className="font-black text-indigo-600">{interview.manual.communicationScore}/100</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                                            <span className="text-slate-600 font-bold">Problem Solving</span>
                                            <span className="font-black text-indigo-600">{interview.manual.problemSolvingScore}/100</span>
                                        </div>
                                    </div>
                                    {interview.manual.comments && (
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="flex items-center gap-2 mb-3 text-slate-400 font-black text-[10px] uppercase">
                                                <MessageSquare size={14} /> Interviewer Comments
                                            </div>
                                            <p className="text-slate-600 font-medium leading-relaxed italic">
                                                "{interview.manual.comments}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* AI Analysis */}
                            <div className="space-y-4">
                                <h3 className="font-black text-slate-800 flex items-center gap-2">
                                    <Brain className="text-purple-500" size={20} />
                                    AI Behavioral Insights
                                </h3>
                                <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                                <BarChart3 className="text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white/50 uppercase tracking-widest">Confidence Index</p>
                                                <p className="text-2xl font-black text-white">{interview.ai?.overallConfidence || 0}%</p>
                                            </div>
                                        </div>
                                        <p className="text-white/70 font-medium leading-relaxed">
                                            The AI has analyzed the candidate's body language, speech patterns, and stress levels throughout the session.
                                            {interview.ai?.overallStress > 60 ? " High levels of stress were detected at certain points." : " The candidate appeared relatively calm and composed."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-slate-400 font-bold">No results found for this session.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewDetailsModal;
