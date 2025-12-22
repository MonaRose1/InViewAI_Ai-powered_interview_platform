import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, CheckCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const InterviewerNotes = () => {
    const { id } = useParams(); // Interview ID
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

    useEffect(() => {
        fetchInterviewAndNotes();
    }, [id]);

    // Auto-save effect
    useEffect(() => {
        if (!autoSaveEnabled || !notes) return;

        const timer = setTimeout(() => {
            handleSaveNotes(true); // Silent save
        }, 3000); // Save after 3 seconds of no typing

        return () => clearTimeout(timer);
    }, [notes, autoSaveEnabled]);

    const fetchInterviewAndNotes = async () => {
        try {
            const [interviewRes, notesRes] = await Promise.all([
                api.get(`/interviews/${id}`),
                api.get(`/interviews/${id}/notes`)
            ]);

            setInterview(interviewRes.data);
            setNotes(notesRes.data.content || '');
            setLastSaved(notesRes.data.updatedAt);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotes = async (silent = false) => {
        if (!silent) setSaving(true);

        try {
            const { data } = await api.post(`/interviews/${id}/notes`, { content: notes });
            setLastSaved(new Date());
            if (!silent) {
                // Show success message briefly
                setTimeout(() => setSaving(false), 1000);
            }
        } catch (error) {
            console.error('Failed to save notes:', error);
            if (!silent) {
                alert('Failed to save notes. Please try again.');
                setSaving(false);
            }
        }
    };

    const formatLastSaved = () => {
        if (!lastSaved) return 'Never';
        const date = new Date(lastSaved);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        return date.toLocaleTimeString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 text-secondary animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-slate-600 hover:text-secondary transition"
            >
                <ArrowLeft size={20} />
                Back
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <FileText size={28} className="text-secondary" />
                            Interview Notes
                        </h1>
                        {interview && (
                            <div className="text-slate-600 space-y-1">
                                <p><span className="font-semibold">Candidate:</span> {interview.candidate?.name}</p>
                                <p><span className="font-semibold">Position:</span> {interview.job?.title}</p>
                                <p><span className="font-semibold">Date:</span> {new Date(interview.scheduledTime).toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                {saving ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={14} className="text-green-500" />
                                        Saved {formatLastSaved()}
                                    </>
                                )}
                            </div>
                            <label className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                <input
                                    type="checkbox"
                                    checked={autoSaveEnabled}
                                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                                    className="rounded"
                                />
                                Auto-save
                            </label>
                        </div>

                        <button
                            onClick={() => handleSaveNotes(false)}
                            disabled={saving}
                            className="px-6 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} />
                            Save Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Notes Editor */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your interview notes here...

Tips:
- Document candidate's responses to key questions
- Note technical skills demonstrated
- Record behavioral observations
- List strengths and areas for improvement
- Include any red flags or concerns
- Add follow-up questions or next steps"
                    className="w-full h-[600px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none font-mono text-sm leading-relaxed"
                />

                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>{notes.length} characters • {notes.split(/\s+/).filter(w => w).length} words</span>
                    <span>Press Ctrl+S to save manually</span>
                </div>
            </motion.div>

            {/* Quick Templates */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-900 mb-2">Quick Templates</h3>
                <div className="grid md:grid-cols-2 gap-2">
                    <button
                        onClick={() => setNotes(notes + '\n\n## Technical Skills\n- ')}
                        className="text-left px-3 py-2 bg-white rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition"
                    >
                        + Add Technical Skills Section
                    </button>
                    <button
                        onClick={() => setNotes(notes + '\n\n## Communication\n- ')}
                        className="text-left px-3 py-2 bg-white rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition"
                    >
                        + Add Communication Section
                    </button>
                    <button
                        onClick={() => setNotes(notes + '\n\n## Strengths\n- ')}
                        className="text-left px-3 py-2 bg-white rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition"
                    >
                        + Add Strengths Section
                    </button>
                    <button
                        onClick={() => setNotes(notes + '\n\n## Areas for Improvement\n- ')}
                        className="text-left px-3 py-2 bg-white rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition"
                    >
                        + Add Improvements Section
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewerNotes;
