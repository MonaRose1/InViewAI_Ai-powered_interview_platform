import React, { useState, useEffect } from 'react';
import { Search, Briefcase, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import JobService from '../../services/jobService';
import ApplicationService from '../../services/applicationService';

const CandidateJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        const filtered = jobs.filter(job =>
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredJobs(filtered);
    }, [searchTerm, jobs]);

    const fetchJobs = async () => {
        try {
            const data = await JobService.getJobs();
            const openJobs = data.filter(job => job.status === 'open');
            setJobs(openJobs);
            setFilteredJobs(openJobs);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [applyData, setApplyData] = useState({
        coverLetter: '',
        startDate: ''
    });

    const handleApplyClick = (job) => {
        setSelectedJob(job);
        setShowModal(true);
    };

    const handleApplySubmit = async () => {
        try {
            setApplying(selectedJob._id);
            await ApplicationService.applyForJob(selectedJob._id, applyData);
            alert("Application submitted successfully! Redirecting to tracking...");
            window.location.href = '/candidate/applications';
        } catch (error) {
            console.error("Apply failed", error);
            alert(error.response?.data?.message || "Failed to apply");
        } finally {
            setApplying(null);
            setShowModal(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-slate-800 mb-2">Finalize Application</h2>
                            <p className="text-slate-500 font-medium mb-6">Applying for <span className="text-secondary font-bold">{selectedJob?.title}</span></p>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Why are you interested?</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/5 outline-none transition h-32 text-sm"
                                        placeholder="Briefly describe why you are a great fit..."
                                        value={applyData.coverLetter}
                                        onChange={(e) => setApplyData({ ...applyData, coverLetter: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Possible Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-secondary/5 outline-none transition text-sm"
                                        value={applyData.startDate}
                                        onChange={(e) => setApplyData({ ...applyData, startDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 px-6 border border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-50 transition"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleApplySubmit}
                                    disabled={applying}
                                    className="flex-1 py-3 px-6 bg-secondary text-white font-black rounded-xl hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                                >
                                    {applying ? <Loader2 size={18} className="animate-spin" /> : 'CONFIRM & APPLY'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Browse Opportunities</h1>
                    <p className="text-slate-500 mt-1 font-medium">Find your next career move with AI-powered hiring.</p>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary h-5 w-5 transition-colors" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by job title or keywords..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-secondary/5 focus:border-secondary shadow-sm transition-all font-medium text-slate-700"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-secondary w-12 h-12" />
                    <p className="text-slate-400 font-bold animate-pulse">Scanning opportunities...</p>
                </div>
            ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredJobs.map((job) => (
                        <div key={job._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 hover:border-secondary/20 hover:shadow-xl hover:shadow-secondary/5 transition-all group flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                                    <Briefcase size={28} />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-secondary transition-colors line-clamp-1">{job.title}</h3>
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">{job.description}</p>

                            <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                                {job.requirements.slice(0, 3).map((req, i) => (
                                    <span key={i} className="text-[11px] font-bold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100">
                                        {req}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400">
                                    POSTED {new Date(job.createdAt).toLocaleDateString().toUpperCase()}
                                </span>
                                <button
                                    onClick={() => handleApplyClick(job)}
                                    disabled={applying === job._id}
                                    className="px-6 py-2.5 bg-secondary text-white text-sm font-black rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {applying === job._id ? <Loader2 size={16} className="animate-spin" /> : 'APPLY NOW'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                        <Search size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">No matching roles found</h2>
                    <p className="text-slate-400 font-medium">Try adjusting your search terms or view all jobs.</p>
                </div>
            )}
        </div>
    );
};

export default CandidateJobsPage;
