import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Briefcase, MapPin, Loader2, Trophy, Trash2, Edit2, PauseCircle, PlayCircle } from 'lucide-react';
import JobService from '../../services/jobService';
import RankingDashboard from '../../components/admin/RankingDashboard';

const AdminJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showRankingModal, setShowRankingModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editJobId, setEditJobId] = useState(null);
    const JOB_ROLES = {
        "Software Engineer": "clean code, system design, time complexity, scalability, corner cases",
        "Frontend Developer": "user experience, accessibility, responsive design, state management, component architecture",
        "Backend Developer": "API design, database optimization, system architecture, security, concurrency",
        "Data Scientist": "statistical validity, data cleaning, feature engineering, model selection, interpretability",
        "Full Stack Developer": "end-to-end understanding, API integration, database design, frontend UX",
        "QA Engineer": "test coverage, edge cases, automation frameworks, bug reporting, regression testing"
    };

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await JobService.getJobs();
            setJobs(data);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (e) => {
        const role = e.target.value;
        setFormData({
            ...formData,
            title: role,
            requirements: JOB_ROLES[role] || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const requirementsArray = formData.requirements.split(',').map(req => req.trim());
            const payload = { ...formData, department: 'Engineering', requirements: requirementsArray }; // Default department

            if (isEditing) {
                await JobService.updateJob(editJobId, payload);
                alert("Job updated successfully");
            } else {
                await JobService.createJob(payload);
                alert("Job created successfully");
            }

            setShowModal(false);
            setFormData({ title: '', description: '', requirements: '' });
            setIsEditing(false);
            setEditJobId(null);
            fetchJobs(); // Refresh list
        } catch (error) {
            console.error("Failed to save job", error);
            alert("Failed to save job");
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setEditJobId(null);
        setFormData({ title: '', description: '', requirements: '' });
        setShowModal(true);
    };

    const openEditModal = (job) => {
        setIsEditing(true);
        setEditJobId(job._id);
        setFormData({
            title: job.title,
            description: job.description,
            requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : job.requirements
        });
        setShowModal(true);
    };

    const handleToggleStatus = async (job) => {
        try {
            const newStatus = job.status === 'open' ? 'closed' : 'open';
            await JobService.updateJob(job._id, { status: newStatus });
            setJobs(jobs.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    const openRankings = (jobId) => {
        setSelectedJobId(jobId);
        setShowRankingModal(true);
    };

    const handleDeleteJob = async (id) => {
        if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
        try {
            await JobService.deleteJob(id);
            setJobs(jobs.filter(job => job._id !== id));
            alert("Job deleted successfully");
        } catch (error) {
            console.error("Failed to delete job", error);
            alert("Failed to delete job");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Job Management</h1>
                    <p className="text-textMuted mt-1">Create and manage job postings.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 font-medium"
                >
                    <Plus size={20} />
                    Create Job
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-secondary w-10 h-10" />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                            />
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Job Title</th>
                                <th className="px-6 py-4">Focus Areas</th>
                                <th className="px-6 py-4">Applicants</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date Posted</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {jobs.length > 0 ? jobs.map((job) => (
                                <tr key={job._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-textPrimary">{job.title}</div>
                                        <div className="text-xs text-textMuted truncate max-w-[200px]">{job.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {job.requirements && job.requirements.slice(0, 2).map((req, i) => (
                                                <span key={i} className="inline-flex px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200">
                                                    {req}
                                                </span>
                                            ))}
                                            {job.requirements && job.requirements.length > 2 && (
                                                <span className="text-[10px] text-slate-400">+{job.requirements.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-medium">
                                                {job.applicantsCount}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${job.status === 'open' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-600'}`}>
                                            {job.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-textMuted">
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openRankings(job._id)}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-secondary transition tooltip"
                                                title="View Rankings"
                                            >
                                                <Trophy size={18} />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(job)}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-400 hover:text-blue-600 transition tooltip"
                                                title="Edit Job"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(job)}
                                                className={`p-2 rounded-lg transition tooltip ${job.status === 'open' ? 'hover:bg-amber-50 text-amber-400 hover:text-amber-600' : 'hover:bg-green-50 text-green-400 hover:text-green-600'}`}
                                                title={job.status === 'open' ? 'Pause Job' : 'Resume Job'}
                                            >
                                                {job.status === 'open' ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteJob(job._id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition tooltip"
                                                title="Delete Job"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-textMuted">
                                        No jobs found. Create your first job posting!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Job Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-primary">{isEditing ? 'Edit Job' : 'Create New Job (Strict Role)'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-textPrimary mb-1">Select Job Role</label>
                                <select
                                    name="title"
                                    value={formData.title}
                                    onChange={handleRoleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none bg-white font-medium text-slate-700"
                                    required
                                >
                                    <option value="">-- Choose Role --</option>
                                    {Object.keys(JOB_ROLES).map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 mt-1">This will strictly enforce the AI evaluation criteria.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textPrimary mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none resize-none"
                                    placeholder="Brief description (e.g. Hiring for Q3 team...)"
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textPrimary mb-1">AI Focus Areas (Auto-filled)</label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none resize-none text-slate-600 text-sm"
                                    placeholder="Select a role to see focus areas..."
                                    readOnly
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-textMuted hover:bg-gray-100 rounded-lg transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-medium shadow-lg shadow-secondary/20"
                                >
                                    {isEditing ? 'Update Job' : 'Create Job'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ranking Dashboard Modal */}
            {showRankingModal && selectedJobId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                <Trophy size={20} className="text-yellow-500" /> Candidate Ranking Dashboard
                            </h3>
                            <button onClick={() => setShowRankingModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-slate-50">
                            <RankingDashboard jobId={selectedJobId} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJobsPage;
