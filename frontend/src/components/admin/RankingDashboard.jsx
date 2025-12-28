import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Sliders, Trophy, ArrowUp, ArrowDown, User, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const RankingDashboard = ({ jobId }) => {
    const [candidates, setCandidates] = useState([]);
    const [config, setConfig] = useState({ aiWeight: 50, manualWeight: 50 });
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);

    useEffect(() => {
        fetchData();
    }, [jobId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rankRes, jobRes] = await Promise.all([
                api.get(`/ranking/${jobId}`),
                api.get(`/jobs/${jobId}`)
            ]);

            setCandidates(rankRes.data);
            if (jobRes.data.rankingConfig) {
                setConfig(jobRes.data.rankingConfig);
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch ranking metrics", error);
            setLoading(false);
        }
    };

    const handleWeightChange = async (type, value) => {
        const newConfig = { ...config };
        if (type === 'ai') {
            newConfig.aiWeight = parseInt(value);
            newConfig.manualWeight = 100 - newConfig.aiWeight; // Auto-balance
        } else {
            newConfig.manualWeight = parseInt(value);
            newConfig.aiWeight = 100 - newConfig.manualWeight;
        }
        setConfig(newConfig);
    };

    const applyWeights = async () => {
        try {
            setRecalculating(true);
            await api.post(`/ranking/${jobId}/config`, config);
            await fetchData(); // Refresh list
            setRecalculating(false);
        } catch (error) {
            console.error("Failed to update weights", error);
            setRecalculating(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Ranking Analysis...</div>;

    return (
        <div className="space-y-6">
            {/* Header / Config Panel */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Sliders size={20} className="text-secondary" />
                            Ranking Parameters
                        </h2>
                        <p className="text-sm text-slate-500">Adjust the influence of AI vs Human scoring</p>
                    </div>
                    {recalculating && <span className="text-xs text-secondary animate-pulse font-bold">Recalculating Scores...</span>}
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex-1">
                        <div className="flex justify-between text-sm font-bold mb-2">
                            <span className="flex items-center gap-2 text-purple-600"><Brain size={14} /> AI Analysis Impact</span>
                            <span>{config.aiWeight}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100"
                            value={config.aiWeight}
                            onChange={(e) => handleWeightChange('ai', e.target.value)}
                            onMouseUp={applyWeights}
                            onTouchEnd={applyWeights}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-sm font-bold mb-2">
                            <span className="flex items-center gap-2 text-indigo-600"><User size={14} /> Interviewer Score Impact</span>
                            <span>{config.manualWeight}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100"
                            value={config.manualWeight}
                            onChange={(e) => handleWeightChange('manual', e.target.value)}
                            onMouseUp={applyWeights}
                            onTouchEnd={applyWeights}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>
            </div>

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
