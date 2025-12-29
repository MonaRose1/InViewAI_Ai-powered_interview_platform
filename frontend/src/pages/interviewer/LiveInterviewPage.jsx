import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Video, PhoneOff, AlertCircle, MessageSquare, Play, MicOff, VideoOff, Clock, User, Briefcase, Calendar, Loader2, ChevronRight, TrendingUp, ShieldAlert, Send } from 'lucide-react';
import api from '../../services/api';
import useWebRTC from '../../hooks/useWebRTC';
import { useAuth } from '../../context/AuthContext';
import InterviewerQuestionBank from './components/InterviewerQuestionBank';

const LiveInterviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?._id || 'interviewer-temp';

    const {
        localVideoRef,
        remoteVideoRef,
        connectionStatus,
        toggleAudio,
        toggleVideo,
        isAudioEnabled,
        isVideoEnabled,
        socket,
        debugData
    } = useWebRTC(id, userId, true);


    const [aiData, setAiData] = useState({
        confidence: 85,
        stress: 20,
        stressText: 'Low',
        emotion: 'Neutral',
        flags: []
    });

    const [interviewDetails, setInterviewDetails] = useState(null);
    const [duration, setDuration] = useState(0);
    const [notes, setNotes] = useState('');
    const [sessionQuestions, setSessionQuestions] = useState([]);
    const [analyzingIds, setAnalyzingIds] = useState([]);
    const [showEvalModal, setShowEvalModal] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [evalData, setEvalData] = useState({
        technical: 70,
        communication: 70,
        problemSolving: 50,
        comments: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [forceShowBank, setForceShowBank] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Chat State
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [workspaceTab, setWorkspaceTab] = useState('questions'); // 'questions', 'chat'
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const chatEndRef = React.useRef(null);

    const workspaceTabRef = React.useRef(workspaceTab);
    useEffect(() => {
        workspaceTabRef.current = workspaceTab;
    }, [workspaceTab]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch interview details
    const fetchInterview = async () => {
        try {
            setLoadingData(true);
            const { data } = await api.get(`/interviews/${id}`);
            setInterviewDetails(data);
            if (data.notes) setNotes(data.notes);
            if (data.questions && data.questions.length > 0) {
                setSessionQuestions(data.questions);
            }
        } catch (err) {
            console.error("Failed to fetch interview data", err);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchInterview();
    }, [id]);

    // Duration timer
    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Load selected questions from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`selected_questions_${id}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setSelectedQuestions(parsed);
                }
            } catch (err) {
                console.error("Failed to parse saved questions", err);
            }
        }
    }, [id]);

    // Save selected questions to localStorage
    useEffect(() => {
        if (selectedQuestions.length > 0) {
            localStorage.setItem(`selected_questions_${id}`, JSON.stringify(selectedQuestions));
        } else {
            localStorage.removeItem(`selected_questions_${id}`);
        }
    }, [selectedQuestions, id]);

    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        if (!socket) return;

        const handleAnswers = (updatedQuestions) => {
            console.log("[SOCKET] answers-received event caught", updatedQuestions);
            // Only update if we actually got questions to avoid clearing the list
            if (updatedQuestions && Array.isArray(updatedQuestions) && updatedQuestions.length > 0) {
                setSessionQuestions(updatedQuestions);
                console.log("[UI] Session questions updated via socket");
            } else {
                console.warn("[SOCKET] answers-received payload was empty or invalid");
            }
        };

        const handleAiResult = (data) => {
            setAiData(prev => {
                const newFlags = data.face_detected ? prev.flags : [...prev.flags, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: 'Face focus lost' }];
                const trimmedFlags = newFlags.slice(-10);

                const stressVal = data.behavior_analysis?.stress_level;
                const stressScore = stressVal === "High" ? 85 : stressVal === "Medium" ? 50 : 20;

                return {
                    confidence: data.behavior_analysis?.professional_presence_score || data.confidence * 100 || prev.confidence,
                    stress: stressScore,
                    stressText: stressVal || "Low",
                    emotion: data.behavior_analysis?.dominant_emotion || data.emotion || "Neutral",
                    flags: trimmedFlags
                };
            });
        };

        const handleChat = (msg) => {
            setMessages(prev => [...prev, msg]);
            // Use ref to check current tab without re-triggering this effect
            if (workspaceTabRef.current !== 'chat') setHasNewMessage(true);
        };

        socket.on('answers-received', handleAnswers);
        socket.on('ai-result', handleAiResult);
        socket.on('receive-chat-message', handleChat);

        return () => {
            socket.off('answers-received', handleAnswers);
            socket.off('ai-result', handleAiResult);
            socket.off('receive-chat-message', handleChat);
        };
    }, [socket]); // Removed workspaceTab dependency to prevent re-attaching listeners

    const analyzeCandidateAnswer = async (qIndex) => {
        const question = sessionQuestions[qIndex];
        if (!question.candidateAnswer) return;

        setAnalyzingIds(prev => [...prev, question.questionId]);
        try {
            const { data } = await api.post(`/interviews/${id}/evaluate-question`, {
                question: question.text,
                answer: question.candidateAnswer,
                jobRole: interviewDetails?.job?.title || 'Software Engineer'
            });

            const updatedQuestions = [...sessionQuestions];
            updatedQuestions[qIndex].aiAnalysis = {
                score: data.score || 0,
                feedback: data.feedback || 'Analysis complete.',
                technicalAccuracy: data.technical_accuracy || 0
            };
            updatedQuestions[qIndex].status = 'analyzed';
            setSessionQuestions(updatedQuestions);

            await api.put(`/interviews/${id}/questions`, { questions: updatedQuestions });
        } catch (err) {
            console.error("Analysis failed", err);
        } finally {
            setAnalyzingIds(prev => prev.filter(id => id !== question.questionId));
        }
    };

    useEffect(() => {
        const autoSave = setInterval(async () => {
            if (notes.trim()) {
                try {
                    await api.put(`/interviews/${id}/notes`, { notes });
                } catch (err) {
                    console.error("Auto-save failed", err);
                }
            }
        }, 30000);

        return () => clearInterval(autoSave);
    }, [notes, id]);

    const handleSubmitEvaluation = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/scores', {
                interviewId: id,
                technical: evalData.technical,
                communication: evalData.communication,
                problemSolving: evalData.problemSolving,
                comments: evalData.comments
            });

            if (notes) {
                await api.put(`/interviews/${id}/notes`, { notes });
            }

            await api.post(`/interviews/${id}/end`);

            // Notify candidate via socket
            if (socket) {
                socket.emit('end-interview', { roomId: id });
            }

            window.location.href = `/interviewer/interviews/${id}/result`;
        } catch (err) {
            console.error("Failed to submit evaluation", err);
            alert("Error submitting evaluation. Ending session anyway.");
            window.location.href = `/interviewer/interviews/${id}/result`;
        } finally {
            setIsSubmitting(false);
        }
    };

    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);

    return (
        <div className="h-screen bg-neutral-950 text-white flex flex-col overflow-hidden font-sans selection:bg-secondary/30">
            {/* MEETING HEADER - Premium Glass Look */}
            <div className="h-16 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between shrink-0 z-50">
                <div className="flex items-center gap-6">
                    {/* Job Info */}
                    <div className="flex items-center gap-3 group cursor-default">
                        <div className="p-2.5 bg-secondary/10 rounded-xl border border-secondary/20 group-hover:bg-secondary/20 transition-all">
                            <Briefcase size={18} className="text-secondary" />
                        </div>
                        <div>
                            <h2 className="font-black text-sm tracking-tight text-white/90">
                                Interview Session
                            </h2>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                                {interviewDetails?.job?.title || interviewDetails?.application?.job?.title || 'null'}
                            </p>
                        </div>
                    </div>

                    {/* Participant Info */}
                    <div className="flex items-center gap-3 px-6 border-l border-white/10">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-white/10">
                            <User size={14} className="text-gray-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-white font-bold tracking-tight">
                                {interviewDetails?.candidate?.name || 'Candidate'}
                            </span>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                                Candidate Session
                            </span>
                        </div>
                    </div>

                    {/* Scheduled Time */}
                    <div className="hidden lg:flex items-center gap-2 px-6 border-l border-white/10">
                        <Calendar size={14} className="text-gray-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            Started {formatDateTime(interviewDetails?.scheduledTime)}
                        </span>
                    </div>
                </div>

                {/* Right Side: Duration & End Button */}
                <div className="flex items-center gap-4">
                    {/* Duration Timer - Vibrant Mono */}
                    <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        <span className="text-sm font-mono font-black text-green-400 tracking-wider">
                            {formatDuration(duration)}
                        </span>
                    </div>

                    {/* End Interview Button - High Contrast */}
                    <button
                        onClick={() => setShowEvalModal(true)}
                        className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
                    >
                        <PhoneOff size={14} />
                        End Session
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* LEFT: Video & AI Panel (Collapsible) */}
                <div className={`${leftPanelCollapsed ? 'w-0' : 'w-[400px]'} flex flex-col border-r border-white/5 transition-all duration-500 ease-in-out relative z-40 bg-neutral-900/50 backdrop-blur-md overflow-hidden shrink-0`}>

                    {/* Remote Video Area (Top) */}
                    <div className="h-[280px] relative bg-black flex items-center justify-center group">
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />

                        {connectionStatus !== 'connected' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90 z-10">
                                <div className="text-gray-500 flex flex-col items-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center justify-center animate-ping">
                                            <div className="h-8 w-8 rounded-full border border-white/20"></div>
                                        </div>
                                        <Loader2 className="animate-spin text-white/40 w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mt-6 text-white/30">Connecting Session...</p>
                                </div>
                            </div>
                        )}

                        {/* Video Overlays */}
                        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/90">
                                        Candidate: {interviewDetails?.candidate?.name || 'User'}
                                    </p>
                                </div>
                                <div className="px-2 py-1 bg-green-500/20 backdrop-blur-md rounded-lg border border-green-500/30">
                                    <p className="text-[10px] font-black uppercase text-green-400">720p HD</p>
                                </div>
                            </div>

                            {/* Local Video Overlay (PiP) */}
                            <div className="absolute bottom-4 right-4 w-32 h-24 bg-neutral-800 rounded-xl border-2 border-white/10 overflow-hidden shadow-2xl pointer-events-auto transform transition-transform hover:scale-105">
                                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[8px] font-black uppercase text-white/70">
                                    Interviewer (You)
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* AI & Controls (Bottom) */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-900">
                        {/* Video Controls Bar */}
                        <div className="p-4 bg-black/20 border-b border-white/5 flex gap-3 justify-center">
                            <button
                                onClick={toggleAudio}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isAudioEnabled ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white' : 'bg-red-500/20 border border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}
                            >
                                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                            <button
                                onClick={toggleVideo}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isVideoEnabled ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white' : 'bg-red-500/20 border border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}
                            >
                                {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                            </button>
                            <button
                                onClick={() => {
                                    setWorkspaceTab('chat');
                                    setHasNewMessage(false);
                                }}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${workspaceTab === 'chat' ? 'bg-secondary text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}`}
                            >
                                <MessageSquare size={20} />
                                {hasNewMessage && workspaceTab !== 'chat' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-neutral-900" />}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                            {/* AI Insights - Professional Gauges Area */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                                        Live AI Analytics
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                                            {interviewDetails ? 'API: Online' : 'API: Syncing...'}
                                        </span>
                                        <button
                                            onClick={fetchInterview}
                                            className="text-[10px] font-black text-white/40 hover:text-secondary uppercase transition-colors"
                                            title="Force re-sync with database"
                                        >
                                            Sync Session
                                        </button>
                                    </div>
                                </div>

                                {/* Sentiment Gauges */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/5 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-secondary/10 transition-all"></div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase mb-3">Confidence</p>
                                        <div className="flex items-end gap-1">
                                            <span className="text-2xl font-black text-white">{Math.round(aiData.confidence)}</span>
                                            <span className="text-[10px] font-bold text-gray-600 mb-1">%</span>
                                        </div>
                                        <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-secondary h-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--secondary-rgb),0.5)]" style={{ width: `${aiData.confidence}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
                                        <div className={`absolute top-0 right-0 w-20 h-20 ${aiData.stressText === 'High' ? 'bg-red-500/10' : aiData.stressText === 'Medium' ? 'bg-yellow-500/10' : 'bg-green-500/10'} rounded-full -mr-10 -mt-10 blur-xl transition-all`}></div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase mb-3">Stress Level</p>
                                        <div className="flex items-end gap-1">
                                            <span className={`text-2xl font-black ${aiData.stressText === 'High' ? 'text-red-400' : aiData.stressText === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {aiData.stressText || 'Low'}
                                            </span>
                                        </div>
                                        <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${aiData.stressText === 'High' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : aiData.stressText === 'Medium' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} style={{ width: `${aiData.stress}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Emotion Indicator */}
                                <div className="bg-linear-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-300 uppercase mb-1">Current Sentiment</p>
                                        <h4 className="text-lg font-black text-white">{aiData.emotion}</h4>
                                    </div>
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
                                        {aiData.emotion === 'Positive' || aiData.emotion === 'Happy' ? '😊' :
                                            aiData.emotion === 'Serious' || aiData.emotion === 'Neutral' ? '😐' : '🧐'}
                                    </div>
                                </div>

                                {/* Interviewer Notes Area */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Observation Notes</h3>
                                    <div className="relative group">
                                        <textarea
                                            className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-medium text-white/80 focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 outline-none transition-all resize-none leading-relaxed placeholder:text-gray-700 custom-scrollbar"
                                            placeholder="Record key observations, technical strengths, or concerns during the session..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-black uppercase text-gray-500">Auto-saving</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alert History (Flags) */}
                                {aiData.flags.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400/70 flex items-center gap-2">
                                            <ShieldAlert size={12} /> SESSION ANOMALIES
                                        </h3>
                                        <div className="space-y-2">
                                            {aiData.flags.slice(-3).map((flag, i) => (
                                                <div key={`flag-${i}`} className="bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-2.5 flex items-center justify-between group hover:bg-red-500/10 transition-colors">
                                                    <span className="text-[11px] font-bold text-red-200/80">{flag.text}</span>
                                                    <span className="text-[9px] font-black text-red-500 uppercase">{flag.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Main Workspace (Flexible) */}
                <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">

                    {/* Workspace Header */}
                    <div className="h-12 bg-white flex items-center justify-between px-8 border-b border-slate-200 z-10 shrink-0">
                        <div className="flex items-center gap-6">
                            <button
                                className={`text-[10px] font-black uppercase tracking-widest pb-3 transition-all relative ${workspaceTab === 'questions' ? 'text-secondary' : 'text-slate-400'}`}
                                onClick={() => setWorkspaceTab('questions')}
                            >
                                Question Session
                                {workspaceTab === 'questions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"></div>}
                            </button>
                            <button
                                className={`text-[10px] font-black uppercase tracking-widest pb-3 transition-all relative ${workspaceTab === 'chat' ? 'text-secondary' : 'text-slate-400'}`}
                                onClick={() => {
                                    setWorkspaceTab('chat');
                                    setHasNewMessage(false);
                                }}
                            >
                                Chat Box
                                {hasNewMessage && <span className="absolute top-0 -right-2 w-2 h-2 bg-red-500 rounded-full" />}
                                {workspaceTab === 'chat' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"></div>}
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-lg border border-green-100 uppercase">Synced</span>
                        </div>
                    </div>

                    {/* Content Switcher */}
                    <div className="flex-1 overflow-hidden relative">
                        {/* Question Session View */}
                        <div className={`absolute inset-0 ${workspaceTab === 'questions' ? 'block' : 'hidden'}`}>
                            {loadingData ? (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                    <Loader2 className="animate-spin text-secondary mb-4" size={32} />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Session...</p>
                                </div>
                            ) : sessionQuestions.length === 0 || forceShowBank ? (
                                <div className="h-full flex flex-col">
                                    {forceShowBank && (
                                        <div className="bg-white px-8 py-3 border-b border-slate-100 flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Adding questions to current session</span>
                                            <button
                                                onClick={() => setForceShowBank(false)}
                                                className="text-[10px] font-black text-secondary uppercase hover:underline"
                                            >
                                                Back to Monitoring
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex-1 overflow-hidden">
                                        <InterviewerQuestionBank
                                            questions={sessionQuestions}
                                            setQuestions={(qs) => {
                                                setSessionQuestions(prev => [...prev, ...qs]);
                                                setSelectedQuestions([]); // Clear selection when sent
                                                setForceShowBank(false);
                                                localStorage.removeItem(`selected_questions_${id}`);
                                            }}
                                            selectedQuestions={selectedQuestions}
                                            setSelectedQuestions={setSelectedQuestions}
                                            socket={socket}
                                            roomId={id}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full bg-slate-50">
                                    <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                        <div className="max-w-4xl mx-auto space-y-8">
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Assessment</h2>
                                                    <p className="text-sm text-slate-500 font-medium">Monitoring candidate's real-time progress</p>
                                                </div>
                                                <button
                                                    onClick={() => setForceShowBank(true)}
                                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:text-secondary hover:border-secondary/30 transition-all uppercase tracking-widest"
                                                >
                                                    Add More Questions
                                                </button>
                                            </div>

                                            {sessionQuestions.map((q, idx) => (
                                                <div key={q.questionId || q._id || idx} className="bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-6 group hover:border-secondary/20 transition-all">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary text-xs font-black italic">#{idx + 1}</span>
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Segment</span>
                                                            </div>
                                                            <h3 className="text-xl font-bold text-slate-800 leading-tight pr-10">{q.text}</h3>
                                                        </div>
                                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${q.status === 'analyzed' ? 'bg-green-100 text-green-700' :
                                                            q.status === 'submitted' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                                                                'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {q.status}
                                                        </span>
                                                    </div>

                                                    {/* Candidate's Response */}
                                                    {q.candidateAnswer ? (
                                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/80 relative">
                                                            <div className="absolute -top-2 left-6 px-2 bg-white border border-slate-100 rounded text-[8px] font-black text-slate-300 uppercase">Live Submission</div>
                                                            <p className="text-slate-700 font-medium leading-relaxed italic">"{q.candidateAnswer}"</p>
                                                        </div>
                                                    ) : (
                                                        <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                                            <Clock className="mx-auto text-slate-200 mb-2 animate-spin-slow" size={24} />
                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Awaiting candidate input...</p>
                                                        </div>
                                                    )}

                                                    {/* AI Action Area */}
                                                    {q.status === 'submitted' && (
                                                        <button
                                                            onClick={() => analyzeCandidateAnswer(idx)}
                                                            disabled={analyzingIds.includes(q.questionId)}
                                                            className="w-full py-4 bg-slate-900 border border-slate-800 text-white font-black rounded-2xl text-xs uppercase hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-xl"
                                                        >
                                                            {analyzingIds.includes(q.questionId) ? (
                                                                <><Loader2 className="animate-spin" size={16} /> GENERATING INSIGHTS...</>
                                                            ) : (
                                                                <><div className="p-1 bg-white/20 rounded-md"><TrendingUp size={12} /></div> Run AI Analysis</>
                                                            )}
                                                        </button>
                                                    )}

                                                    {/* Detailed AI Breakdown */}
                                                    {q.aiAnalysis && (
                                                        <div className="bg-linear-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl p-6 space-y-6 relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                                                            <div className="flex justify-between items-center relative z-10">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-white shadow-lg shadow-secondary/30">
                                                                        <AlertCircle size={16} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-[10px] font-black text-secondary uppercase tracking-widest">AI Assessment Score</div>
                                                                        <div className="text-xl font-black text-slate-800">{q.aiAnalysis.score}% Accuracy</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Feedback Strength</div>
                                                                    <div className="flex gap-1 justify-end">
                                                                        {[1, 2, 3, 4, 5].map(s => (
                                                                            <div key={s} className={`w-3 h-1 rounded-full ${s <= Math.ceil(q.aiAnalysis.score / 20) ? 'bg-secondary' : 'bg-slate-200'}`}></div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 space-y-3 shadow-inner">
                                                                <p className="text-sm text-slate-600 leading-relaxed font-semibold italic">"{q.aiAnalysis.feedback}"</p>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                                                                    <span>Knowledge Coverage</span>
                                                                    <span>{q.aiAnalysis.score}%</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                                                                    <div
                                                                        className="bg-linear-to-r from-indigo-500 to-secondary h-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--secondary-rgb),0.5)]"
                                                                        style={{ width: `${q.aiAnalysis.score}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Chat Box View */}
                        <div className={`absolute inset-0 ${workspaceTab === 'chat' ? 'block' : 'hidden'}`}>
                            <div className="h-full flex flex-col bg-white">
                                {/* Chat View */}
                                <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-200 space-y-4">
                                            <MessageSquare size={64} className="opacity-20" />
                                            <p className="text-sm font-black uppercase tracking-[0.2em]">Start a conversation</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, mIdx) => (
                                            <div key={msg.id || mIdx} className={`flex flex-col ${msg.sender.id === userId ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[70%] p-4 rounded-3xl text-sm font-medium shadow-md leading-relaxed ${msg.sender.id === userId ? 'bg-secondary text-white rounded-tr-none shadow-secondary/20' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                                    {msg.message}
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase mt-2 px-1 tracking-widest">
                                                    {msg.sender.id === userId ? 'You' : msg.sender.name} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!newMessage.trim() || !socket) return;
                                    socket.emit('send-chat-message', {
                                        roomId: id,
                                        message: newMessage,
                                        sender: { id: userId, name: user?.name || 'Interviewer', role: 'interviewer' }
                                    });
                                    setNewMessage('');
                                }} className="p-8 border-t border-slate-100 bg-slate-50/50">
                                    <div className="max-w-4xl mx-auto relative">
                                        <input
                                            type="text"
                                            placeholder="Type your message to the candidate..."
                                            className="w-full pl-6 pr-16 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all shadow-sm text-slate-800 placeholder-slate-400"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-secondary text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-secondary/20"
                                        >
                                            <Send size={18} fill="currentColor" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evaluation Modal - Professional Overlap */}
                {showEvalModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="bg-slate-50 p-6 border-b border-slate-100">
                                <h2 className="text-xl font-black text-slate-800">Interview Complete</h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">
                                    Please rate the candidate's performance. This will be combined with AI insights for the final score.
                                </p>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Technical Proficiency */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                                        <span>Technical Proficiency</span>
                                        <span className="text-secondary">({evalData.technical})</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100"
                                        value={evalData.technical}
                                        onChange={(e) => setEvalData({ ...evalData, technical: e.target.value })}
                                        className="w-full accent-secondary"
                                    />
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Poor</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>

                                {/* Communication Skills */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                                        <span>Communication Skills</span>
                                        <span className="text-secondary">({evalData.communication})</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100"
                                        value={evalData.communication}
                                        onChange={(e) => setEvalData({ ...evalData, communication: e.target.value })}
                                        className="w-full accent-secondary"
                                    />
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Poor</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>

                                {/* Problem Solving */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                                        <span>Problem Solving</span>
                                        <span className="text-secondary">({evalData.problemSolving})</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100"
                                        value={evalData.problemSolving}
                                        onChange={(e) => setEvalData({ ...evalData, problemSolving: e.target.value })}
                                        className="w-full accent-secondary"
                                    />
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Poor</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>

                                {/* Comments */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Comments & Observations</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Specific strengths, weaknesses, or areas for improvement..."
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all resize-none"
                                        value={evalData.comments}
                                        onChange={(e) => setEvalData({ ...evalData, comments: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 flex gap-3">
                                <button
                                    onClick={() => setShowEvalModal(false)}
                                    className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-100 rounded-2xl transition"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitEvaluation}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-secondary text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Evaluation'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveInterviewPage;
