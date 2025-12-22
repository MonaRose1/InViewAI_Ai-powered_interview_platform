import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, AlertCircle, CheckCircle2, X, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../services/api';

const InterviewerQuestionPage = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // UI States
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [formData, setFormData] = useState({
        text: '',
        type: 'text',
        options: ['', '', ''],
        category: 'Technical',
        difficulty: 'Medium'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const { data } = await api.get('/questions');
            setQuestions(data);
        } catch (err) {
            console.error("Failed to fetch questions", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;
        try {
            await api.delete(`/questions/${id}`);
            setQuestions(questions.filter(q => q._id !== id));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleEdit = (q) => {
        setEditingQuestion(q);
        setFormData({
            text: q.text,
            type: q.type,
            options: q.options || ['', '', ''],
            category: q.category || 'Technical',
            difficulty: q.difficulty || 'Medium'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingQuestion) {
                const { data } = await api.put(`/questions/${editingQuestion._id}`, formData);
                setQuestions(questions.map(q => q._id === data._id ? data : q));
            } else {
                const { data } = await api.post('/questions', formData);
                setQuestions([data, ...questions]);
            }
            setShowModal(false);
            resetForm();
        } catch (err) {
            console.error("Save failed", err);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ text: '', type: 'text', options: ['', '', ''], category: 'Technical', difficulty: 'Medium' });
        setEditingQuestion(null);
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || q.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Question Bank</h1>
                    <p className="text-slate-500 font-medium italic">Manage and curate your assessment library.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-secondary/20"
                >
                    <Plus size={20} /> ADD NEW QUESTION
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by keyword or category..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm focus:ring-2 focus:ring-secondary/10 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'text', 'mcq'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase transition-all ${filterType === type ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Questions Table/Grid */}
            {loading ? (
                <div className="bg-white rounded-4xl p-20 flex flex-col items-center justify-center border border-slate-50 shadow-sm text-center">
                    <Loader2 className="animate-spin text-secondary w-10 h-10 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Question Bank...</p>
                </div>
            ) : filteredQuestions.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredQuestions.map(q => (
                        <div key={q._id} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:border-secondary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${q.type === 'mcq' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {q.type}
                                        </span>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase">
                                            {q.category}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-600' : q.difficulty === 'Hard' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {q.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-secondary transition-colors">{q.text}</h3>
                                    {q.options && q.options.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {q.options.filter(o => o).map((opt, idx) => (
                                                <span key={idx} className="bg-slate-50 px-3 py-1 rounded-full text-xs font-semibold text-slate-500 border border-slate-100 italic">
                                                    "{opt}"
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 items-center justify-end">
                                    <button
                                        onClick={() => handleEdit(q)}
                                        className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(q._id)}
                                        className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-4xl p-20 text-center border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Search size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">No Questions Found</h3>
                    <p className="text-slate-400 font-medium">Try adjusting your filters or search term.</p>
                    <button onClick={resetForm} className="mt-6 font-black text-secondary text-xs uppercase tracking-widest hover:underline">Clear all filters</button>
                </div>
            )}

            {/* Management Modal */}
            {showModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white text-slate-900 w-full max-w-2xl rounded-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{editingQuestion ? 'Edit Question' : 'Create New Question'}</h2>
                                <p className="text-slate-500 text-sm font-medium">Fill in the details for your assessment item.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Question Content</label>
                                <textarea
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-secondary/5 focus:border-secondary outline-none transition-all resize-none min-h-[120px]"
                                    placeholder="Enter your question here..."
                                    required
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Response Type</label>
                                    <div className="flex bg-slate-50 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'text' })}
                                            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${formData.type === 'text' ? 'bg-white shadow-sm text-secondary' : 'text-slate-400'}`}
                                        >
                                            TEXT
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'mcq' })}
                                            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${formData.type === 'mcq' ? 'bg-white shadow-sm text-secondary' : 'text-slate-400'}`}
                                        >
                                            MCQ
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:border-secondary outline-none appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Technical</option>
                                        <option>Soft Skills</option>
                                        <option>Management</option>
                                        <option>Culture Fit</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Difficulty</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:border-secondary outline-none appearance-none"
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                            </div>

                            {formData.type === 'mcq' && (
                                <div className="space-y-4 animate-in slide-in-from-top-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 flex justify-between">
                                        Multiple Choice Options <span>Populate at least 2</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {formData.options.map((opt, i) => (
                                            <input
                                                key={i}
                                                placeholder={`Option ${i + 1}`}
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:border-secondary outline-none"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOpts = [...formData.options];
                                                    newOpts[i] = e.target.value;
                                                    setFormData({ ...formData, options: newOpts });
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-2 py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingQuestion ? 'SAVE CHANGES' : 'CREATE QUESTION')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewerQuestionPage;
