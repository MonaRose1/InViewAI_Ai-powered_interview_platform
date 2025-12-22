import React, { useState, useEffect } from 'react';
import { Upload, Download, FileText, Loader2, Plus, X, Save, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CandidateResume = () => {
    const { user, updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [editingSkill, setEditingSkill] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        if (user?.skills) {
            setSkills(user.skills);
        }
    }, [user]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.put('/profile/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(data);
            alert('Resume uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload resume. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadResume = () => {
        if (user?.resumeUrl) {
            window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.resumeUrl}`, '_blank');
        }
    };

    // Skill CRUD Operations
    const handleAddSkill = async () => {
        if (!newSkill.trim()) return;

        const updatedSkills = [...skills, newSkill.trim()];
        setSkills(updatedSkills);
        setNewSkill('');

        try {
            const { data } = await api.put('/profile/candidate', { skills: updatedSkills });
            updateUser(data);
        } catch (error) {
            console.error('Failed to add skill:', error);
            setSkills(skills); // Revert on error
            alert('Failed to add skill. Please try again.');
        }
    };

    const handleEditSkill = (index) => {
        setEditingSkill(index);
        setEditValue(skills[index]);
    };

    const handleSaveEdit = async () => {
        if (!editValue.trim()) return;

        const updatedSkills = [...skills];
        updatedSkills[editingSkill] = editValue.trim();
        setSkills(updatedSkills);
        setEditingSkill(null);
        setEditValue('');

        try {
            const { data } = await api.put('/profile/candidate', { skills: updatedSkills });
            updateUser(data);
        } catch (error) {
            console.error('Failed to update skill:', error);
            alert('Failed to update skill. Please try again.');
        }
    };

    const handleDeleteSkill = async (index) => {
        if (!confirm('Are you sure you want to delete this skill?')) return;

        const updatedSkills = skills.filter((_, i) => i !== index);
        setSkills(updatedSkills);

        try {
            const { data } = await api.put('/profile/candidate', { skills: updatedSkills });
            updateUser(data);
        } catch (error) {
            console.error('Failed to delete skill:', error);
            setSkills(skills); // Revert on error
            alert('Failed to delete skill. Please try again.');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Resume & Skills</h1>
            <p className="text-slate-600 mb-8">Upload your resume and manage your skills</p>

            {/* Resume Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText size={24} className="text-secondary" />
                    Resume Upload
                </h2>

                {user?.resumeUrl ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <FileText size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">{user.resumeFileName || 'Resume.pdf'}</p>
                                    <p className="text-sm text-slate-500">
                                        Uploaded {new Date(user.resumeUploadDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadResume}
                                className="px-4 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition flex items-center gap-2"
                            >
                                <Download size={18} />
                                Download
                            </button>
                        </div>

                        {/* Replace Resume */}
                        <label className="block">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                            <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-secondary transition">
                                <p className="text-sm text-slate-600">Click to replace resume</p>
                            </div>
                        </label>
                    </div>
                ) : (
                    <label className="block">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-secondary hover:bg-secondary/5 transition">
                            {uploading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-12 h-12 text-secondary animate-spin" />
                                    <p className="text-slate-600 font-medium">Uploading...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                                        <Upload size={32} className="text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-slate-800 mb-1">Upload Resume</p>
                                        <p className="text-sm text-slate-500">PDF only, max 5MB</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </label>
                )}
            </div>

            {/* Skills Management Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Skills</h2>

                {/* Add Skill Input */}
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        placeholder="Add a skill (e.g., React, Python, Communication)"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                    />
                    <button
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="px-6 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add
                    </button>
                </div>

                {/* Skills List */}
                <div className="space-y-2">
                    {skills.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <p>No skills added yet. Start by adding your first skill above.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {skills.map((skill, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition"
                                >
                                    {editingSkill === index ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                className="flex-1 px-3 py-1 border border-secondary rounded-lg focus:ring-2 focus:ring-secondary/20 outline-none"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSaveEdit}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                            >
                                                <Save size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingSkill(null);
                                                    setEditValue('');
                                                }}
                                                className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition"
                                            >
                                                <X size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 text-slate-700 font-medium">{skill}</span>
                                            <button
                                                onClick={() => handleEditSkill(index)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSkill(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Skills Count */}
                {skills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-slate-500">
                            Total Skills: <span className="font-bold text-secondary">{skills.length}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateResume;
