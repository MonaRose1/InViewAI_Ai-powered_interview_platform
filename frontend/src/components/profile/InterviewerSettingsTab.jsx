import React, { useState } from 'react';
import { Award, Clock, Settings, ShieldCheck, Plus, X, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const InterviewerSettingsTab = ({ user }) => {
    const { updateUser } = useAuth();
    const [settings, setSettings] = useState({
        expertise: user?.expertise || ['React', 'System Design', 'Behavioral']
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [newExpertise, setNewExpertise] = useState('');
    const [showInput, setShowInput] = useState(false);

    const handleAddExpertise = () => {
        if (newExpertise.trim() && !settings.expertise.includes(newExpertise.trim())) {
            setSettings({ ...settings, expertise: [...settings.expertise, newExpertise.trim()] });
            setNewExpertise('');
            setShowInput(false);
        }
    };

    const handleRemoveExpertise = (item) => {
        setSettings({ ...settings, expertise: settings.expertise.filter(i => i !== item) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/profile/interviewer', settings);
            updateUser(data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save interviewer settings:", error);
            alert("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Award size={20} className="text-secondary" /> Interviewer Expertise & Logic
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Expertise */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-slate-400" /> Evaluation Areas
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {settings.expertise.map(area => (
                                <span key={area} className="group px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 flex items-center gap-2">
                                    {area}
                                    <button type="button" onClick={() => handleRemoveExpertise(area)} className="hover:text-red-500 transition-colors">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}

                            {showInput ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newExpertise}
                                        onChange={(e) => setNewExpertise(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
                                        className="text-xs px-2 py-1 border rounded outline-none"
                                        placeholder="Skill..."
                                        autoFocus
                                    />
                                    <button type="button" onClick={handleAddExpertise} className="text-secondary"><Plus size={16} /></button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowInput(true)}
                                    className="px-3 py-1.5 border border-dashed border-slate-300 text-slate-400 text-xs font-bold rounded-lg hover:border-secondary hover:text-secondary transition-colors"
                                >
                                    + Add Expertise
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-3 italic">* These areas will be prioritized when matching you with candidates.</p>
                    </div>


                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end items-center gap-4">
                    {success && (
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                            <CheckCircle size={16} /> Dashboard updated!
                        </span>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                        {loading ? 'Updating...' : 'Update Settings'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default InterviewerSettingsTab;
