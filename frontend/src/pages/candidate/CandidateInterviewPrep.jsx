import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Lightbulb, Target, CheckCircle, Clock, ArrowLeft, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const CandidateInterviewPrep = () => {
    const { id } = useParams(); // Interview ID
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('questions');
    const [practiceMode, setPracticeMode] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Common interview questions by category
    const commonQuestions = {
        behavioral: [
            "Tell me about yourself and your background.",
            "Why are you interested in this position?",
            "What are your greatest strengths and weaknesses?",
            "Describe a challenging situation you faced and how you handled it.",
            "Where do you see yourself in 5 years?",
            "Why should we hire you?",
            "Tell me about a time you worked in a team.",
            "How do you handle stress and pressure?",
        ],
        technical: [
            "Explain your experience with [relevant technology].",
            "Walk me through a recent project you worked on.",
            "How do you approach problem-solving?",
            "What's your development process like?",
            "How do you stay updated with industry trends?",
            "Describe your experience with version control.",
            "How do you ensure code quality?",
            "What testing methodologies are you familiar with?",
        ],
        situational: [
            "How would you handle a disagreement with a team member?",
            "What would you do if you missed a deadline?",
            "How do you prioritize multiple tasks?",
            "Describe how you would approach learning a new technology.",
            "What would you do if you discovered a critical bug before release?",
        ]
    };

    const interviewTips = [
        {
            icon: <Target size={20} />,
            title: "Research the Company",
            description: "Understand their mission, values, and recent news. Show genuine interest in their work."
        },
        {
            icon: <CheckCircle size={20} />,
            title: "Use the STAR Method",
            description: "Structure answers with Situation, Task, Action, Result for behavioral questions."
        },
        {
            icon: <Lightbulb size={20} />,
            title: "Prepare Questions",
            description: "Have 3-5 thoughtful questions ready to ask the interviewer about the role and company."
        },
        {
            icon: <Clock size={20} />,
            title: "Practice Time Management",
            description: "Keep answers concise (2-3 minutes). Practice with a timer to stay on track."
        },
    ];

    useEffect(() => {
        fetchInterviewDetails();
    }, [id]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const fetchInterviewDetails = async () => {
        try {
            const { data } = await api.get(`/interviews/${id}`);
            setInterview(data);
        } catch (error) {
            console.error('Failed to fetch interview:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startPractice = () => {
        setPracticeMode(true);
        setCurrentQuestionIndex(0);
        setTimer(0);
        setIsTimerRunning(true);
    };

    const nextQuestion = () => {
        const allQuestions = [
            ...commonQuestions.behavioral,
            ...commonQuestions.technical,
            ...commonQuestions.situational
        ];
        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setTimer(0);
        } else {
            setPracticeMode(false);
            setIsTimerRunning(false);
        }
    };

    const toggleTimer = () => {
        setIsTimerRunning(!isTimerRunning);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
            </div>
        );
    }

    if (practiceMode) {
        const allQuestions = [
            ...commonQuestions.behavioral,
            ...commonQuestions.technical,
            ...commonQuestions.situational
        ];
        const currentQuestion = allQuestions[currentQuestionIndex];

        return (
            <div className="min-h-screen bg-linear-to-br from-secondary/5 to-purple-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => setPracticeMode(false)}
                        className="mb-6 flex items-center gap-2 text-slate-600 hover:text-secondary transition"
                    >
                        <ArrowLeft size={20} />
                        Back to Preparation
                    </button>

                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">
                                    Question {currentQuestionIndex + 1} of {allQuestions.length}
                                </span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleTimer}
                                        className="flex items-center gap-2 text-sm font-medium text-secondary"
                                    >
                                        {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                                        {formatTime(timer)}
                                    </button>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-secondary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQuestionIndex + 1) / allQuestions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question */}
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="bg-secondary/10 rounded-xl p-6 mb-6">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                    {currentQuestion}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Take your time to think through your answer. Aim for 2-3 minutes.
                                </p>
                            </div>

                            {/* Answer Tips */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <Lightbulb size={16} />
                                    Tip
                                </h3>
                                <p className="text-sm text-blue-700">
                                    Use the STAR method: Describe the <strong>Situation</strong>, explain the <strong>Task</strong>,
                                    detail your <strong>Action</strong>, and share the <strong>Result</strong>.
                                </p>
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={nextQuestion}
                                className="flex-1 px-6 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition shadow-lg shadow-secondary/20"
                            >
                                {currentQuestionIndex < allQuestions.length - 1 ? 'Next Question' : 'Finish Practice'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-slate-600 hover:text-secondary transition"
            >
                <ArrowLeft size={20} />
                Back
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Interview Preparation</h1>
                        {interview && (
                            <p className="text-slate-600">
                                Preparing for: <span className="font-semibold">{interview.job?.title || 'Interview'}</span>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={startPractice}
                        className="px-6 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 flex items-center gap-2"
                    >
                        <Play size={18} />
                        Start Practice
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                {['questions', 'tips'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-4 font-medium transition relative ${activeTab === tab
                            ? 'text-secondary'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab === 'questions' ? 'Common Questions' : 'Interview Tips'}
                        {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'questions' && (
                <div className="space-y-6">
                    {Object.entries(commonQuestions).map(([category, questions]) => (
                        <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 capitalize flex items-center gap-2">
                                <BookOpen size={20} className="text-secondary" />
                                {category} Questions
                            </h2>
                            <ul className="space-y-3">
                                {questions.map((question, idx) => (
                                    <li key={idx} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition">
                                        <span className="shrink-0 w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <span className="text-slate-700">{question}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'tips' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {interviewTips.map((tip, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
                                    {tip.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 mb-2">{tip.title}</h3>
                                    <p className="text-sm text-slate-600">{tip.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidateInterviewPrep;
