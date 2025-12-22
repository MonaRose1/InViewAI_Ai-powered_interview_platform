import React, { useState } from 'react';
import { Cpu, Eye, MessageSquare, AlertTriangle, Save, RefreshCw } from 'lucide-react';

const AiConfigPanel = () => {
    const [config, setConfig] = useState({
        engagementWeight: 40,
        eyeContactWeight: 30,
        answerQualityWeight: 30,
        biasSensitivity: false
    });

    const handleSliderChange = (e) => {
        setConfig({ ...config, [e.target.name]: parseInt(e.target.value) });
    };

    const handleToggle = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">AI Configuration</h1>
            <p className="text-slate-500 mb-8">Fine-tune the AI analysis algorithms and scoring weights.</p>

            <div className="grid gap-8">
                {/* Scoring Weights */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <Cpu size={18} className="text-secondary" /> Scoring Weights Logic
                    </h2>

                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <MessageSquare size={16} /> Answer Quality
                                </label>
                                <span className="text-sm font-bold text-secondary">{config.answerQualityWeight}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                name="answerQualityWeight"
                                value={config.answerQualityWeight}
                                onChange={handleSliderChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-slate-700">Eye Contact Weight</label>
                                <span className="text-sm font-bold text-secondary">{config.eyeContactWeight}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                name="eyeContactWeight"
                                value={config.eyeContactWeight}
                                onChange={handleSliderChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-slate-700">Engagement Weight</label>
                                <span className="text-sm font-bold text-secondary">{config.engagementWeight}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                name="engagementWeight"
                                value={config.engagementWeight}
                                onChange={handleSliderChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                            />
                        </div>

                        <div className="bg-secondary/10 text-secondary p-4 rounded-lg text-sm flex items-start gap-2">
                            <div className="mt-0.5"><AlertTriangle size={14} /></div>
                            <p>Total weight must equal 100%. Current Total: <strong>{config.answerQualityWeight + config.eyeContactWeight + config.engagementWeight}%</strong></p>
                        </div>
                    </div>
                </div>

                {/* Bias Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-orange-500" /> Fairness & Bias
                    </h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-700">High Sensitivity Bias Detection</p>
                            <p className="text-xs text-slate-500">Enable stricter filtering for keywords and tone</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.biasSensitivity}
                                onChange={() => handleToggle('biasSensitivity')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="px-6 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition flex items-center gap-2 shadow-sm">
                        <Save size={18} /> Update Algorithm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiConfigPanel;
