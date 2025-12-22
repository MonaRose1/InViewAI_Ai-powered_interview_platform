import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, TrendingUp, MessageSquare, Award, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const CandidateFeedback = () => {
    const { id } = useParams(); // Interview ID
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, [id]);

    const fetchFeedback = async () => {
        try {
            const { data } = await api.get(`/feedback/${id}`);
            setFeedback(data);
        } catch (error) {
            console.error('Failed to fetch feedback:', error);
            // If no feedback yet, show placeholder
            setFeedback(null);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                size={20}
                className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 text-secondary animate-spin" />
            </div>
        );
    }

    if (!feedback) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-secondary transition"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={32} className="text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No Feedback Yet</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Your interviewer hasn't provided feedback for this interview yet.
                        Check back later or contact support if you have questions.
                    </p>
                </div>
            </div>
        );
    }

    const overallRating = feedback.overallRating || 0;
    const technicalRating = feedback.technicalRating || 0;
    const communicationRating = feedback.communicationRating || 0;
    const problemSolvingRating = feedback.problemSolvingRating || 0;

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
            <div className="bg-linear-to-br from-secondary to-secondary/80 rounded-xl p-8 text-white mb-6 shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
                        <p className="text-white/80">
                            {feedback.job?.title || 'Position'} • {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="text-5xl font-bold mb-1">{overallRating.toFixed(1)}</div>
                        <div className="flex gap-1">
                            {renderStars(Math.round(overallRating))}
                        </div>
                        <p className="text-sm text-white/80 mt-1">Overall Rating</p>
                    </div>
                </div>
            </div>

            {/* Rating Breakdown */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
                <RatingCard
                    icon={<Award size={24} />}
                    title="Technical Skills"
                    rating={technicalRating}
                    color="bg-blue-500"
                />
                <RatingCard
                    icon={<MessageSquare size={24} />}
                    title="Communication"
                    rating={communicationRating}
                    color="bg-green-500"
                />
                <RatingCard
                    icon={<TrendingUp size={24} />}
                    title="Problem Solving"
                    rating={problemSolvingRating}
                    color="bg-purple-500"
                />
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-6">
                {/* Strengths */}
                {feedback.strengths && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                <TrendingUp size={18} />
                            </div>
                            Strengths
                        </h2>
                        <p className="text-slate-700 leading-relaxed">{feedback.strengths}</p>
                    </motion.div>
                )}

                {/* Areas for Improvement */}
                {feedback.improvements && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                                <Star size={18} />
                            </div>
                            Areas for Improvement
                        </h2>
                        <p className="text-slate-700 leading-relaxed">{feedback.improvements}</p>
                    </motion.div>
                )}

                {/* General Comments */}
                {feedback.comments && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <MessageSquare size={18} />
                            </div>
                            General Comments
                        </h2>
                        <p className="text-slate-700 leading-relaxed">{feedback.comments}</p>
                    </motion.div>
                )}

                {/* Recommendation */}
                {feedback.recommendation && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`rounded-xl p-6 ${feedback.recommendation === 'hire'
                            ? 'bg-green-50 border border-green-200'
                            : feedback.recommendation === 'maybe'
                                ? 'bg-yellow-50 border border-yellow-200'
                                : 'bg-red-50 border border-red-200'
                            }`}
                    >
                        <h2 className="text-lg font-bold mb-2">
                            Recommendation:{' '}
                            <span className="capitalize">{feedback.recommendation}</span>
                        </h2>
                        <p className="text-sm text-slate-600">
                            {feedback.recommendation === 'hire' &&
                                'The interviewer recommends moving forward with your application.'}
                            {feedback.recommendation === 'maybe' &&
                                'The interviewer suggests further evaluation before making a decision.'}
                            {feedback.recommendation === 'no-hire' &&
                                'The interviewer does not recommend proceeding at this time.'}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const RatingCard = ({ icon, title, rating, color }) => {
    const percentage = (rating / 5) * 100;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg ${color} text-white flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-800">{rating.toFixed(1)}</span>
                        <span className="text-sm text-slate-500">/ 5.0</span>
                    </div>
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default CandidateFeedback;
