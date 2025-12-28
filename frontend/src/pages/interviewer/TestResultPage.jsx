import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Star, CheckCircle, Loader2, MessageSquare, Target, User } from 'lucide-react';

const TestResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [scores, setScores] = useState({
        technical: 70,
        communication: 70,
        problemSolving: 70,
        comments: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const { data } = await api.get(`/interviews/${id}`);
                setInterview(data);
                if (data.manualScore) {
                    setScores({
                        technical: data.manualScore.technical || 70,
                        communication: data.manualScore.communication || 70,
                        problemSolving: data.manualScore.problemSolving || 70,
                        comments: data.manualScore.comments || ''
                    });
                }
            } catch (err) {
                console.error("Failed to fetch interview data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInterview();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/scores', {
                interviewId: id,
                technical: scores.technical,
                communication: scores.communication,
                problemSolving: scores.problemSolving,
                comments: scores.comments
            });
            alert('Score submitted successfully!');
            navigate('/interviewer/dashboard');
        } catch (error) {
            console.error(error);
            alert('Failed to submit score');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRangeChange = (field, value) => {
        setScores(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-secondary" size={40} />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-8">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100">
                <div className="flex justify-between items-start mb-10">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <CheckCircle className="text-green-500" size={32} /> Interview Assessment
                        </h1>
                        <p className="text-slate-500 font-medium italic">Final evaluation for {interview?.candidate?.name} • {interview?.job?.title}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* LEFT: AI Review Summary */}
                    <div className="space-y-8">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">AI Review & Candidate Answers</h2>

                        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {interview?.questions?.map((q, idx) => (
                                <div key={idx} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <span className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                                            <p className="text-sm font-bold text-slate-700 leading-snug">{q.text}</p>
                                        </div>
                                        {q.aiAnalysis && (
                                            <span className="px-2 py-1 bg-secondary text-white text-[9px] font-black rounded-lg uppercase whitespace-nowrap">
                                                {q.aiAnalysis.score}% AI Score
                                            </span>
                                        )}
                                    </div>

                                    <div className="bg-white rounded-2xl p-4 border border-slate-100">
                                        <p className="text-xs text-slate-500 italic mb-2 font-black uppercase tracking-widest flex items-center gap-1">
                                            <User size={10} /> Candidate Answer:
                                        </p>
                                        <p className="text-sm font-medium text-slate-700">{q.candidateAnswer || 'No answer provided.'}</p>
                                    </div>

                                    {q.aiAnalysis && (
                                        <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
                                            <p className="text-xs text-indigo-400 italic mb-2 font-black uppercase tracking-widest flex items-center gap-1">
                                                <Target size={10} /> AI Feedback:
                                            </p>
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{q.aiAnalysis.feedback}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Manual Rating Form */}
                    <div className="space-y-8 bg-slate-50/50 rounded-[32px] p-8 border border-white">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Interviewer's Final Decision</h2>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <RangeInput
                                    label="Technical Proficiency"
                                    value={scores.technical}
                                    onChange={(v) => handleRangeChange('technical', v)}
                                />
                                <RangeInput
                                    label="Communication Skills"
                                    value={scores.communication}
                                    onChange={(v) => handleRangeChange('communication', v)}
                                />
                                <RangeInput
                                    label="Problem Solving"
                                    value={scores.problemSolving}
                                    onChange={(v) => handleRangeChange('problemSolving', v)}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <MessageSquare size={12} /> Comments & Observations
                                </label>
                                <textarea
                                    className="w-full h-40 border-2 border-slate-100 rounded-[32px] p-6 text-sm font-medium focus:ring-4 focus:ring-secondary/5 focus:border-secondary transition-all outline-none bg-white resize-none shadow-sm"
                                    placeholder="Specific strengths, weaknesses, or areas for improvement..."
                                    value={scores.comments}
                                    onChange={(e) => setScores(prev => ({ ...prev, comments: e.target.value }))}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl flex items-center justify-center gap-3"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Complete & Submit Analysis'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RangeInput = ({ label, value, onChange }) => (
    <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center">
            <label className="text-sm font-black text-slate-700 uppercase tracking-tight">{label}</label>
            <span className="text-lg font-black text-secondary">{value}%</span>
        </div>
        <input
            type="range" min="0" max="100"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-secondary"
        />
        <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">
            <span>Entry</span>
            <span>Expert</span>
        </div>
    </div>
);

export default TestResultPage;
