import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Sliders, Trophy, ArrowUp, ArrowDown, User, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const RankingDashboard = ({ jobId }) => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [jobId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const rankRes = await api.get(`/ranking/${jobId}`);
            // Filter out unknown candidates
            const validCandidates = rankRes.data.filter(c => c.candidate && c.candidate.name && c.candidate.name !== 'Unknown');
            setCandidates(validCandidates);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch ranking metrics", error);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Ranking Analysis...</div>;

    return (
        <div className="space-y-6">

            {/* Leaderboard */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-500" /> Top Candidates
                    </h3>
                    <span className="text-xs text-gray-400">Updates dynamically based on weights</span>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-3 font-medium">Rank</th>
                            <th className="px-6 py-3 font-medium">Candidate</th>
                            <th className="px-6 py-3 font-medium">Total Score</th>
                            <th className="px-6 py-3 font-medium">Breakdown (AI / Man)</th>
                            <th className="px-6 py-3 font-medium text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {candidates.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-400">No scored candidates yet.</td></tr>
                        ) : (
                            candidates.map((app, index) => (
                                <motion.tr
                                    key={app._id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                                index === 2 ? 'bg-orange-50 text-orange-700' : 'text-slate-500'
                                            }`}>
                                            #{index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                                                {app.candidate?.name?.[0] || 'C'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{app.candidate?.name || 'Unknown Candidate'}</div>
                                                <div className="text-xs text-slate-500">Applied 2 days ago</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg text-slate-800">{app.rankingScore || 0}</span>
                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-linear-to-r from-secondary to-purple-600"
                                                    style={{ width: `${app.rankingScore}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <span className="text-purple-600 font-bold">{app.scoreBreakdown?.aiScore || 0}</span>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <span className="text-indigo-600 font-bold">{app.scoreBreakdown?.manualScore || 0}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${app.rankingScore >= 80 ? 'bg-green-50 text-green-700' :
                                            app.rankingScore >= 60 ? 'bg-yellow-50 text-yellow-700' :
                                                'bg-red-50 text-red-700'
                                            }`}>
                                            {app.rankingScore >= 80 ? 'Top Tier' : app.rankingScore >= 60 ? 'Qualified' : 'Review'}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RankingDashboard;
