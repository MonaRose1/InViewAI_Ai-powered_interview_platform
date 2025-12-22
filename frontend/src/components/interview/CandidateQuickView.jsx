import React from 'react';
import { X, FileText, CheckCircle, TrendingUp } from 'lucide-react';

const CandidateQuickView = ({ isOpen, onClose, candidate }) => {
    if (!isOpen) return null;

    const skills = candidate?.skills || ['React', 'Node.js', 'System Design', 'AWS'];
    const prevScores = candidate?.prevScores || [{ role: 'Screening', score: 88, date: '12/10/2025' }];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-xl font-bold text-slate-800">Candidate Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold text-2xl">
                            {candidate?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{candidate?.name || 'Candidate Name'}</h3>
                            <p className="text-slate-500">{candidate?.role || 'Software Engineer'}</p>
                        </div>
                    </div>

                    {/* Resume Snapshot */}
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <FileText size={18} className="text-secondary" /> Resume Snapshot
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 leading-relaxed">
                            <p><strong>Experience:</strong> 5 Years at Tech Corp.</p>
                            <p><strong>Education:</strong> BS Computer Science, Stanford.</p>
                            <p className="mt-2 text-slate-500 italic">"Passionate full-stack developer with a focus on scalable architecture..."</p>
                        </div>
                    </div>

                    {/* Key Skills */}
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500" /> Key Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {skills.map(skill => (
                                <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Previous Scores */}
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <TrendingUp size={18} className="text-purple-500" /> Previous Scores
                        </h4>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-gray-100">
                                    <th className="pb-2">Type</th>
                                    <th className="pb-2">Date</th>
                                    <th className="pb-2">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prevScores.map((score, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2 text-slate-800 font-medium">{score.role}</td>
                                        <td className="py-2 text-slate-500">{score.date}</td>
                                        <td className="py-2 text-secondary font-bold">{score.score}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition">
                        Close View
                    </button>
                    <button className="ml-3 px-4 py-2 bg-secondary text-white font-medium rounded-lg hover:bg-secondary/90 transition">
                        Download Resume
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CandidateQuickView;
