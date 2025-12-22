import React, { useState } from 'react';
import { Star, MessageSquare, Mic, Zap } from 'lucide-react';

const ManualEvaluationPanel = () => {
    const [scores, setScores] = useState({
        technical: 0,
        communication: 0,
        confidence: 0
    });
    const [notes, setNotes] = useState("");

    const handleScore = (category, value) => {
        setScores({ ...scores, [category]: value });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 font-bold text-slate-800">
                Interviewer Evaluation
            </div>

            <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                {/* Scoring Sliders */}
                <div className="space-y-4">
                    <ScoreSlider
                        label="Technical Skills"
                        icon={<Zap size={16} className="text-yellow-500" />}
                        value={scores.technical}
                        onChange={(v) => handleScore('technical', v)}
                    />
                    <ScoreSlider
                        label="Communication"
                        icon={<MessageSquare size={16} className="text-secondary" />}
                        value={scores.communication}
                        onChange={(v) => handleScore('communication', v)}
                    />
                    <ScoreSlider
                        label="Confidence"
                        icon={<Mic size={16} className="text-purple-500" />}
                        value={scores.confidence}
                        onChange={(v) => handleScore('confidence', v)}
                    />
                </div>

                {/* Markdown Notes */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Live Notes (Markdown Supported)
                    </label>
                    <textarea
                        className="w-full h-40 p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none bg-slate-50"
                        placeholder="- Strong introduction&#10;- Struggled with Question 2&#10;- Good cultural fit"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-slate-50">
                <button className="w-full py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition shadow-sm">
                    Submit Evaluation
                </button>
            </div>
        </div>
    );
};

const ScoreSlider = ({ label, icon, value, onChange }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                {icon} {label}
            </div>
            <span className="text-sm font-bold text-secondary">{value}/10</span>
        </div>
        <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
        </div>
    </div>
);

export default ManualEvaluationPanel;
