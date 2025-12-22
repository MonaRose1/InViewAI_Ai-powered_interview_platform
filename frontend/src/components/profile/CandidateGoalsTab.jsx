import React, { useState, useEffect } from 'react';
import { Target, Briefcase, DollarSign, Zap, X, Plus, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CandidateGoalsTab = ({ user }) => {
    const { updateUser } = useAuth();
    const [goals, setGoals] = useState({
        preferredRoles: user?.topJobRoles || [],
        workType: user?.workType || 'Remote',
        salaryExpectation: user?.salaryExpectation || '',
        primarySkills: user?.skills || []
    });

    const [newRole, setNewRole] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [showRoleInput, setShowRoleInput] = useState(false);
    const [showSkillInput, setShowSkillInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Sync with user prop ONLY if goals are empty or it's a first load
    useEffect(() => {
        if (user && goals.preferredRoles.length === 0 && goals.primarySkills.length === 0) {
            setGoals({
                preferredRoles: user.topJobRoles || [],
                workType: user.workType || 'Remote',
                salaryExpectation: user.salaryExpectation || '',
                primarySkills: user.skills || []
            });
        }
    }, [user]);

    const handleAddRole = () => {
        if (newRole.trim() && !goals.preferredRoles.includes(newRole.trim())) {
            setGoals(prev => ({
                ...prev,
                preferredRoles: [...prev.preferredRoles, newRole.trim()]
            }));
            setNewRole('');
            setShowRoleInput(false);
        }
    };

    const handleRemoveRole = (roleToRemove) => {
        setGoals(prev => ({
            ...prev,
            preferredRoles: prev.preferredRoles.filter(r => r !== roleToRemove)
        }));
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !goals.primarySkills.includes(newSkill.trim())) {
            setGoals(prev => ({
                ...prev,
                primarySkills: [...prev.primarySkills, newSkill.trim()]
            }));
            setNewSkill('');
            setShowSkillInput(false);
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setGoals(prev => ({
            ...prev,
            primarySkills: prev.primarySkills.filter(s => s !== skillToRemove)
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data } = await api.put('/profile/goals', {
                topJobRoles: goals.preferredRoles,
                workType: goals.workType,
                salaryExpectation: goals.salaryExpectation,
                skills: goals.primarySkills
            });
            updateUser(data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save goals:", error);
            alert("Failed to save preferences. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Target size={20} className="text-secondary" /> Career Goals & Interests
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Preferred Roles */}
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <Briefcase size={16} className="text-slate-400" /> Preferred Roles
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {goals.preferredRoles.map(role => (
                                    <span key={role} className="group px-3 py-1.5 bg-secondary/5 text-secondary text-xs font-bold rounded-lg border border-secondary/10 flex items-center gap-2">
                                        {role}
                                        <button onClick={() => handleRemoveRole(role)} className="hover:text-red-500 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {showRoleInput ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
                                        placeholder="e.g. Senior Developer"
                                        autoFocus
                                        className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary/20 outline-none w-full max-w-[200px]"
                                    />
                                    <button onClick={handleAddRole} className="p-1.5 bg-secondary text-white rounded-lg"><Plus size={14} /></button>
                                    <button onClick={() => setShowRoleInput(false)} className="p-1.5 text-slate-400"><X size={14} /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowRoleInput(true)}
                                    className="px-3 py-1.5 border border-dashed border-slate-300 text-slate-400 text-xs font-bold rounded-lg hover:border-secondary hover:text-secondary transition-colors inline-flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add Role
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <Zap size={16} className="text-slate-400" /> Core Skills
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {goals.primarySkills.map(skill => (
                                    <span key={skill} className="group px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-100 flex items-center gap-2">
                                        {skill}
                                        <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {showSkillInput ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                        placeholder="e.g. Docker"
                                        autoFocus
                                        className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary/20 outline-none w-full max-w-[200px]"
                                    />
                                    <button onClick={handleAddSkill} className="p-1.5 bg-secondary text-white rounded-lg"><Plus size={14} /></button>
                                    <button onClick={() => setShowSkillInput(false)} className="p-1.5 text-slate-400"><X size={14} /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowSkillInput(true)}
                                    className="px-3 py-1.5 border border-dashed border-slate-300 text-slate-400 text-xs font-bold rounded-lg hover:border-secondary hover:text-secondary transition-colors inline-flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add Skill
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Work Preferences */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Work Type</label>
                            <select
                                value={goals.workType}
                                onChange={(e) => setGoals({ ...goals, workType: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary/20 outline-none transition"
                            >
                                <option>Remote</option>
                                <option>Hybrid</option>
                                <option>Office-based</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
                                <span>Salary Expectation (Annual)</span>
                                <DollarSign size={14} className="text-slate-400" />
                            </label>
                            <input
                                type="text"
                                value={goals.salaryExpectation}
                                onChange={(e) => setGoals({ ...goals, salaryExpectation: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary/20 outline-none transition"
                                placeholder="e.g. 100k - 120k"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end items-center gap-4">
                    {success && (
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                            <CheckCircle size={16} /> Preferences saved!
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CandidateGoalsTab;
