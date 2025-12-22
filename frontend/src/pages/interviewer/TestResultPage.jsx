import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Star, CheckCircle } from 'lucide-react';

const TestResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [scores, setScores] = useState({
        technical: 70,
        communication: 70,
        problemSolving: 70,
        comments: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
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
            setLoading(false);
        }
    };

    const handleRangeChange = (field, value) => {
        setScores(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                    <CheckCircle className="text-green-500" /> Interview Complete
                </h1>
                <p className="text-textMuted mb-8">Please rate the candidate's performance. This will be combined with AI insights for the final score.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Technical Proficiency ({scores.technical})</label>
                        <input
                            type="range" min="0" max="100"
                            value={scores.technical}
                            onChange={(e) => handleRangeChange('technical', e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Poor</span><span>Excellent</span></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Communication Skills ({scores.communication})</label>
                        <input
                            type="range" min="0" max="100"
                            value={scores.communication}
                            onChange={(e) => handleRangeChange('communication', e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Poor</span><span>Excellent</span></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Problem Solving ({scores.problemSolving})</label>
                        <input
                            type="range" min="0" max="100"
                            value={scores.problemSolving}
                            onChange={(e) => handleRangeChange('problemSolving', e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Poor</span><span>Excellent</span></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comments & Observations</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                            rows="4"
                            placeholder="Specific strengths, weaknesses, or areas for improvement..."
                            value={scores.comments}
                            onChange={(e) => setScores(prev => ({ ...prev, comments: e.target.value }))}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-slate-800 transition disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Evaluation'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TestResultPage;
