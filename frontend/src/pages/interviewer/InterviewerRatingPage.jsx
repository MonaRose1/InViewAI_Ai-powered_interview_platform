import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const InterviewerRatingPage = () => {
    const { id } = useParams(); // Interview ID
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [ratings, setRatings] = useState({
        technicalRating: 0,
        communicationRating: 0,
        problemSolvingRating: 0,
    });

    const [feedback, setFeedback] = useState({
        strengths: '',
        improvements: '',
        comments: '',
        recommendation: 'maybe'
    });

    const handleRatingChange = (category, value) => {
        setRatings({ ...ratings, [category]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (ratings.technicalRating === 0 || ratings.communicationRating === 0 || ratings.problemSolvingRating === 0) {
            alert('Please provide all ratings before submitting');
            return;
        }

        if (!feedback.strengths || !feedback.improvements) {
            alert('Please fill in strengths and areas for improvement');
            return;
        }

        setLoading(true);
        try {
            // Calculate overall rating as average
            const overallRating = (
                ratings.technicalRating +
                ratings.communicationRating +
                ratings.problemSolvingRating
            ) / 3;

            const payload = {
                ...ratings,
                overallRating,
                ...feedback
            };

            await api.post(`/interviews/${id}/feedback`, payload);
            setSubmitted(true);

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/interviewer/interviews');
            }, 2000);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-green-50 to-emerald-50">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star size={40} className="text-white fill-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Feedback Submitted!</h2>
                    <p className="text-slate-600">Redirecting to interviews...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-slate-600 hover:text-secondary transition"
            >
                <ArrowLeft size={20} />
                Back
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Submit Interview Feedback</h1>
                <p className="text-slate-600 mb-8">Provide detailed feedback to help the candidate improve</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Ratings Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Ratings</h2>

                        {/* Technical Skills */}
                        <RatingInput
                            label="Technical Skills"
                            description="Coding ability, problem-solving, technical knowledge"
                            value={ratings.technicalRating}
                            onChange={(val) => handleRatingChange('technicalRating', val)}
                        />

                        {/* Communication */}
                        <RatingInput
                            label="Communication"
                            description="Clarity, articulation, listening skills"
                            value={ratings.communicationRating}
                            onChange={(val) => handleRatingChange('communicationRating', val)}
                        />

                        {/* Problem Solving */}
                        <RatingInput
                            label="Problem Solving"
                            description="Analytical thinking, approach to challenges"
                            value={ratings.problemSolvingRating}
                            onChange={(val) => handleRatingChange('problemSolvingRating', val)}
                        />
                    </div>

                    {/* Feedback Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Detailed Feedback</h2>

                        {/* Strengths */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Strengths <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={feedback.strengths}
                                onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })}
                                placeholder="What did the candidate do well? Highlight their key strengths..."
                                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none"
                                required
                            />
                        </div>

                        {/* Areas for Improvement */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Areas for Improvement <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={feedback.improvements}
                                onChange={(e) => setFeedback({ ...feedback, improvements: e.target.value })}
                                placeholder="What could the candidate improve? Be constructive and specific..."
                                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none"
                                required
                            />
                        </div>

                        {/* General Comments */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                General Comments (Optional)
                            </label>
                            <textarea
                                value={feedback.comments}
                                onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                                placeholder="Any additional observations or notes..."
                                className="w-full h-24 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none"
                            />
                        </div>

                        {/* Recommendation */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Recommendation <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFeedback({ ...feedback, recommendation: 'hire' })}
                                    className={`p-4 rounded-lg border-2 transition ${feedback.recommendation === 'hire'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-bold mb-1">✓ Hire</div>
                                    <div className="text-xs">Strong candidate</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFeedback({ ...feedback, recommendation: 'maybe' })}
                                    className={`p-4 rounded-lg border-2 transition ${feedback.recommendation === 'maybe'
                                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-bold mb-1">? Maybe</div>
                                    <div className="text-xs">Needs review</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFeedback({ ...feedback, recommendation: 'no-hire' })}
                                    className={`p-4 rounded-lg border-2 transition ${feedback.recommendation === 'no-hire'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-bold mb-1">✗ No Hire</div>
                                    <div className="text-xs">Not suitable</div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-4 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RatingInput = ({ label, description, value, onChange }) => {
    return (
        <div className="bg-slate-50 rounded-lg p-4">
            <div className="mb-3">
                <h3 className="font-semibold text-slate-800">{label}</h3>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="transition-transform hover:scale-110"
                    >
                        <Star
                            size={32}
                            className={
                                star <= value
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 hover:text-yellow-200'
                            }
                        />
                    </button>
                ))}
                <span className="ml-3 text-lg font-bold text-slate-700">
                    {value > 0 ? `${value}.0 / 5.0` : 'Not rated'}
                </span>
            </div>
        </div>
    );
};

export default InterviewerRatingPage;
