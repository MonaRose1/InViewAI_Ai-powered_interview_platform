import React, { useState, useEffect } from 'react';
import { Search, Plus, Send, CheckCircle2, ChevronRight, X, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

const InterviewerQuestionBank = ({ questions, setQuestions, socket, roomId, selectedQuestions, setSelectedQuestions }) => {
    const [bank, setBank] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewForm, setShowNewForm] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        type: 'text',
        options: ['', '', ''],
        category: 'Technical'
    });
    const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'selected'

    useEffect(() => {
        const fetchBank = async () => {
            try {
                const { data } = await api.get('/questions');
                setBank(data);
            } catch (err) {
                console.error("Failed to fetch question bank", err);
            }
        };
        fetchBank();
    }, []);

    const toggleSelect = (q) => {
        setSelectedQuestions(prev => {
            const current = Array.isArray(prev) ? prev : [];
            if (current.find(sq => sq._id === q._id)) {
                return current.filter(sq => sq._id !== q._id);
            } else {
                return [...current, q];
            }
        });
    };

    const handleCreateQuestion = async () => {
        if (!newQuestion.text) return;
        try {
            const { data } = await api.post('/questions', newQuestion);
            setBank(prev => [data, ...prev]);
            setSelectedQuestions(prev => [...(Array.isArray(prev) ? prev : []), data]);
            setShowNewForm(false);
            setNewQuestion({ text: '', type: 'text', options: ['', '', ''], category: 'Technical' });
        } catch (err) {
            console.error("Failed to create question", err);
        }
    };

    const sendToCandidate = () => {
        if (selectedQuestions.length < 3) {
            alert("Please select at least 3 questions.");
            return;
        }

        console.log(`Emitting send-questions to room ${roomId}`, selectedQuestions);
        socket.emit('send-questions', {
            roomId: roomId,
            questions: (selectedQuestions || []).map(q => ({
                questionId: q._id,
                text: q.text,
                type: q.type,
                options: q.options
            }))
        });

        alert("Questions sent to candidate!");
        if (setQuestions) setQuestions(selectedQuestions);
    };

    const filteredBank = bank.filter(q =>
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white text-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50">
                <button
                    onClick={() => setActiveTab('bank')}
                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all ${activeTab === 'bank' ? 'bg-white shadow-sm text-secondary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    QUESTION BANK ({bank.length})
                </button>
                <button
                    onClick={() => setActiveTab('selected')}
                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all ${activeTab === 'selected' ? 'bg-white shadow-sm text-secondary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    SELECTED ({selectedQuestions.length})
                </button>
            </div>

            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setShowNewForm(true)}
                    className="p-2 bg-secondary text-white rounded-xl hover:scale-105 transition-all shadow-lg shadow-secondary/10"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeTab === 'bank' ? (
                    filteredBank.map(q => (
                        <div
                            key={q._id}
                            onClick={() => toggleSelect(q)}
                            className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer group relative overflow-hidden ${(selectedQuestions || []).find(sq => sq._id === q._id) ? 'border-secondary bg-secondary/5 ring-4 ring-secondary/5' : 'border-slate-100 hover:border-secondary/30 bg-white hover:shadow-xl hover:shadow-slate-200/50'}`}
                        >
                            {(selectedQuestions || []).find(sq => sq._id === q._id) && (
                                <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                            )}
                            <div className="flex justify-between items-start gap-4 relative z-10">
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${q.type === 'mcq' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {q.type}
                                        </span>
                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500">
                                            {q.category}
                                        </span>
                                    </div>
                                    <p className="text-sm font-black text-slate-800 leading-snug tracking-tight">{q.text}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${(selectedQuestions || []).find(sq => sq._id === q._id) ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-slate-50 text-slate-200 group-hover:text-secondary group-hover:bg-secondary/5'}`}>
                                    {(selectedQuestions || []).find(sq => sq._id === q._id) ? (
                                        <CheckCircle2 size={18} />
                                    ) : (
                                        <Plus size={18} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    (selectedQuestions || []).length > 0 ? (
                        (selectedQuestions || []).map(q => (
                            <div key={q._id} className="p-4 rounded-2xl border border-secondary bg-secondary/5 flex justify-between items-center group">
                                <p className="text-sm font-bold text-slate-800">{q.text}</p>
                                <button onClick={() => toggleSelect(q)} className="p-1 text-slate-400 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-2 py-10">
                            <AlertCircle size={40} />
                            <p className="font-bold">No questions selected</p>
                        </div>
                    )
                )}
            </div>

            {/* Footer */}
            {(selectedQuestions || []).length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">{(selectedQuestions || []).length} questions selected</span>
                        {(selectedQuestions || []).length < 3 && (
                            <span className="text-[10px] font-black text-amber-500 uppercase">Min 3 required</span>
                        )}
                    </div>
                    <button
                        onClick={sendToCandidate}
                        disabled={selectedQuestions.length < 3}
                        className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${selectedQuestions.length >= 3 ? 'bg-secondary text-white shadow-xl shadow-secondary/20 hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        <Send size={18} /> SEND TO CANDIDATE
                    </button>
                </div>
            )}

            {/* New Question Modal */}
            {showNewForm && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
                    <div className="bg-white w-full rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">New Question</h3>
                            <button onClick={() => setShowNewForm(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <textarea
                            placeholder="Type your question here..."
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-secondary/20 outline-none resize-none"
                            rows="3"
                            value={newQuestion.text}
                            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setNewQuestion({ ...newQuestion, type: 'text' })}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${newQuestion.type === 'text' ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'}`}
                            >
                                TEXT BASED
                            </button>
                            <button
                                onClick={() => setNewQuestion({ ...newQuestion, type: 'mcq' })}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${newQuestion.type === 'mcq' ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'}`}
                            >
                                MCQ
                            </button>
                        </div>
                        {newQuestion.type === 'mcq' && (
                            <div className="space-y-2">
                                {newQuestion.options.map((opt, i) => (
                                    <input
                                        key={i}
                                        placeholder={`Option ${i + 1}`}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...newQuestion.options];
                                            newOpts[i] = e.target.value;
                                            setNewQuestion({ ...newQuestion, options: newOpts });
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                        <button
                            onClick={handleCreateQuestion}
                            className="w-full py-3 bg-slate-900 text-white font-black rounded-2xl text-xs hover:bg-slate-800 transition-all uppercase tracking-widest"
                        >
                            Create & Add
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewerQuestionBank;
