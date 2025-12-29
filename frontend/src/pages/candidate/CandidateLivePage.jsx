import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Video, PhoneOff, Clock, MicOff, VideoOff, Play } from 'lucide-react';
import api from '../../services/api';
import useWebRTC from '../../hooks/useWebRTC';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, Send, Loader2, FileText, MessageSquare } from 'lucide-react';

const CandidateLivePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();

    const [actualRoomId, setActualRoomId] = useState(null);
    const [interviewData, setInterviewData] = useState(null);
    const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'code'

    // Use actual user ID and Name
    const userId = user?._id || 'candidate-temp';
    const userName = user?.name || 'Candidate';

    // Use the shared WebRTC hook
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
    } = useWebRTC(id, userId, false);


    const [timeLeft, setTimeLeft] = useState(1800);
    const canvasRef = useRef(null);
    const isPageMounted = useRef(true);

    const [questions, setQuestions] = useState([]); // Questions from interviewer
    const [answers, setAnswers] = useState({}); // { questionId: answer }
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(true);

    // Chat State
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        const handleQuestions = (receivedQuestions) => {
            console.log("Received questions from interviewer:", receivedQuestions);
            setQuestions(prev => [...prev, ...receivedQuestions]);
            const newAnswers = {};
            receivedQuestions.forEach(q => {
                newAnswers[q.questionId] = '';
            });
            setAnswers(prev => ({ ...prev, ...newAnswers }));
            setIsSubmitted(false);
            setActiveTab('questions');
        };

        const handleEnd = () => {
            alert("The interview session has been ended by the interviewer.");
            navigate('/candidate/dashboard');
        };

        const handleChat = (msg) => {
            setMessages(prev => [...prev, msg]);
            if (activeTab !== 'chat') setHasNewMessage(true);
        };

        socket.on('receive-questions', handleQuestions);
        socket.on('interview-ended', handleEnd);
        socket.on('receive-chat-message', handleChat);

        return () => {
            socket.off('receive-questions', handleQuestions);
            socket.off('interview-ended', handleEnd);
            socket.off('receive-chat-message', handleChat);
        };
    }, [socket, navigate, activeTab]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('send-chat-message', {
            roomId: id,
            message: newMessage,
            sender: {
                id: userId,
                name: userName,
                role: 'candidate'
            }
        });
        setNewMessage('');
    };

    const handleAnswerChange = (qId, val) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const submitFinalAnswers = () => {
        console.log("[SUBMIT] Starting submission process...");
        const unanswered = questions.filter(q => !answers[q.questionId]);
        if (unanswered.length > 0) {
            if (!window.confirm(`You have ${unanswered.length} unanswered questions. Submit anyway?`)) {
                console.log("[SUBMIT] User cancelled submission due to unanswered questions.");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const formattedAnswers = Object.keys(answers).map(id => ({
                questionId: id,
                answer: answers[id]
            }));

            console.log("[SUBMIT] Emitting answers:", formattedAnswers);
            if (!socket) {
                console.error("[SUBMIT] Socket not available!");
                alert("Connection lost. Please refresh the page.");
                setIsSubmitting(false);
                return;
            }

            socket.emit('submit-answers', {
                roomId: id,
                answers: formattedAnswers
            });

            console.log("[SUBMIT] Answers emitted to room:", id);
            setIsSubmitted(true);
        } catch (err) {
            console.error("[SUBMIT] Error during submission:", err);
            alert("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchInterview = async () => {
        try {
            setLoadingQuestions(true);
            const { data } = await api.get(`/interviews/${id}`);
            setInterviewData(data);

            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
                const initialAnswers = {};
                data.questions.forEach(q => {
                    initialAnswers[q.questionId] = q.candidateAnswer || '';
                });
                setAnswers(initialAnswers);
                const allAnswered = data.questions.every(q => q.status === 'submitted' || q.status === 'analyzed');
                if (allAnswered && data.questions.length > 0) {
                    setIsSubmitted(true);
                }
            }

            if (data.scheduledTime) {
                const start = new Date(data.scheduledTime).getTime();
                const now = Date.now();
                const elapsed = Math.floor((now - start) / 1000);
                const duration = 1800; // 30 minutes
                setTimeLeft(Math.max(0, duration - elapsed));
            }
        } catch (err) {
            console.error("Failed to sync interview data", err);
        } finally {
            setLoadingQuestions(false);
        }
    };

    useEffect(() => {
        fetchInterview();
    }, [id]);

    useEffect(() => {
        // Timer
        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    // AI Frame Capture & Analysis (Relay via Signaling Server)
    useEffect(() => {
        if (!socket || !id) return;

        console.log("[AI-RELAY] Starting interval-based frame capture");
        const captureInterval = setInterval(() => {
            if (localVideoRef.current && canvasRef.current && socket.connected) {
                try {
                    const context = canvasRef.current.getContext('2d');
                    context.drawImage(localVideoRef.current, 0, 0, 640, 480);
                    const frameData = canvasRef.current.toDataURL('image/jpeg', 0.4);

                    // Send to main backend for proxying to AI service
                    socket.emit('analyze-frame', {
                        roomId: id,
                        image_data: frameData
                    });
                } catch (err) {
                    console.error("[AI-RELAY] Capture error:", err);
                }
            }
        }, 3000); // 3 seconds interval for stability

        return () => {
            console.log("[AI-RELAY] Stopping frame capture");
            clearInterval(captureInterval);
        };
    }, [id, socket]);

    // Removed old captureAndSendFrame function as it's now internal to the effect

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleLeave = () => {
        navigate('/candidate/dashboard');
    };

    return (
        <div className="h-screen bg-neutral-900 text-white flex overflow-hidden">
            {/* Hidden Canvas for Capture */}
            <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>

            {/* LEFT: Video Panel (35%) */}
            <div className="w-[35%] flex flex-col border-r border-gray-800 relative bg-black">
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-linear-to-b from-black/80 to-transparent">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs">AI</div>
                        <div>
                            <h1 className="font-bold text-sm">{interviewData?.job?.title || 'Technical Round'}</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{interviewData?.job?.company || 'Assessment Session'}</p>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase ${interviewData ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                    {interviewData ? 'API: Online' : 'API: Syncing...'}
                                </span>
                                <button
                                    onClick={fetchInterview}
                                    className="text-[8px] bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded-full text-indigo-300 font-bold uppercase transition-colors"
                                    title="Manually sync with server"
                                >
                                    Sync Status
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700">
                        <Clock size={14} className="text-secondary" />
                        <span className="font-mono text-xs">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                {/* Main Remote Video */}
                <div className="flex-1 relative flex items-center justify-center">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

                    {connectionStatus !== 'connected' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                            <p className="text-sm text-gray-400">Waiting for interviewer...</p>
                        </div>
                    )}

                    {/* Local Video (PiP) */}
                    <div className="absolute bottom-20 right-4 w-32 h-24 bg-gray-800 rounded-lg border border-white/20 overflow-hidden shadow-lg z-20">
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    </div>
                </div>

                {/* Controls */}
                <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4">
                    <button onClick={toggleAudio} className={`p-3 rounded-full transition border border-gray-700 ${isAudioEnabled ? 'bg-gray-800 hover:bg-gray-700' : 'bg-red-500 hover:bg-red-600'}`}>
                        {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>
                    <button onClick={toggleVideo} className={`p-3 rounded-full transition border border-gray-700 ${isVideoEnabled ? 'bg-gray-800 hover:bg-gray-700' : 'bg-red-500 hover:bg-red-600'}`}>
                        {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('chat');
                            setHasNewMessage(false);
                        }}
                        className={`p-3 rounded-full transition border border-gray-700 relative ${activeTab === 'chat' ? 'bg-secondary text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        <MessageSquare size={20} />
                        {hasNewMessage && activeTab !== 'chat' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-neutral-900" />}
                    </button>
                    <button onClick={handleLeave} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold flex items-center gap-2 transition ml-4 text-sm">
                        <PhoneOff size={18} /> Leave
                    </button>
                </div>
            </div>

            {/* RIGHT: Main Panel (65%) */}
            <div className="w-[65%] flex flex-col bg-slate-50 text-slate-900">
                {/* Tabs */}
                <div className="h-12 bg-white flex items-center px-8 border-b border-slate-200 gap-8">
                    <button
                        onClick={() => {
                            console.log('[TAB] Switching to questions');
                            setActiveTab('questions');
                        }}
                        className={`h-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all relative cursor-pointer ${activeTab === 'questions' ? 'text-secondary' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <FileText size={14} /> Questions
                        {activeTab === 'questions' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => {
                            console.log('[TAB] Switching to chat');
                            setActiveTab('chat');
                            setHasNewMessage(false);
                        }}
                        className={`h-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all relative cursor-pointer ${activeTab === 'chat' ? 'text-secondary' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <MessageSquare size={14} /> Chat Box
                        {hasNewMessage && <span className="absolute top-3 -right-2 w-2 h-2 bg-red-500 rounded-full" />}
                        {activeTab === 'chat' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-t-full" />}
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {/* Questions View */}
                    <div className={`absolute inset-0 ${activeTab === 'questions' ? 'block' : 'hidden'}`}>
                        {loadingQuestions ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <Loader2 className="animate-spin text-secondary mb-4" size={32} />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Questions...</p>
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center animate-pulse">
                                    <Loader2 className="text-slate-300 animate-spin" size={32} />
                                </div>
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Awaiting Questions</h2>
                                <p className="max-w-xs text-slate-400 font-medium">Please wait while the interviewer prepares your assessment questions.</p>
                            </div>
                        ) : isSubmitted ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
                                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-500 shadow-xl shadow-green-100">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Assessment Submitted!</h2>
                                    <p className="text-slate-500 font-medium">Thank you. The interviewer is now reviewing your responses with AI assistance.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="px-6 py-2 bg-slate-200 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                        Wait for further instructions
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="h-16 bg-white flex items-center justify-between px-8 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-white font-black text-sm">Q</span>
                                        <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Real-time Assessment</h2>
                                    </div>
                                    <button
                                        onClick={submitFinalAnswers}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase hover:scale-105 transition-all shadow-lg shadow-black/10 flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <><Send size={14} /> Submit Final</>}
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                    {questions.map((q, idx) => (
                                        <div key={q.questionId || idx} className="space-y-6">
                                            <div className="flex gap-4">
                                                <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-black text-xs shrink-0">{idx + 1}</span>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.type}</span>
                                                    <p className="text-lg font-bold text-slate-800 leading-tight">{q.text}</p>
                                                </div>
                                            </div>

                                            <div className="ml-12">
                                                {q.type === 'mcq' ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {q.options.map((opt, oIdx) => (
                                                            <label
                                                                key={oIdx}
                                                                className={`relative flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer group ${answers[q.questionId] === opt ? 'border-secondary bg-secondary/5 ring-4 ring-secondary/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`q-${q.questionId}`}
                                                                    className="hidden"
                                                                    onChange={() => handleAnswerChange(q.questionId, opt)}
                                                                />
                                                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${answers[q.questionId] === opt ? 'border-secondary bg-secondary' : 'border-slate-300'}`}>
                                                                    {answers[q.questionId] === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                                                                </div>
                                                                <span className={`text-sm font-bold ${answers[q.questionId] === opt ? 'text-secondary' : 'text-slate-600'}`}>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <textarea
                                                        className="w-full p-6 bg-white border-2 border-slate-100 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-secondary/5 focus:border-secondary transition-all outline-none min-h-[160px] shadow-sm resize-none"
                                                        placeholder="Type your answer here..."
                                                        value={answers[q.questionId] || ''}
                                                        onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Chat Box View */}
                    <div className={`absolute inset-0 ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
                        <div className="h-full flex flex-col bg-white">
                            {/* Chat View */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
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

                            <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-100 bg-slate-50/50">
                                <div className="max-w-4xl mx-auto relative">
                                    <input
                                        type="text"
                                        placeholder="Type your message to the interviewer..."
                                        className="w-full pl-6 pr-16 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-secondary/5 focus:border-secondary outline-none transition-all shadow-sm"
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
        </div>
    );
};

export default CandidateLivePage;
