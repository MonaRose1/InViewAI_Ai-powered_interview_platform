import React from 'react';
import { BarChart, PieChart, Users, TrendingUp, Download, Calendar } from 'lucide-react';

const AdminAnalytics = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Analytics & Reports</h1>
                    <p className="text-slate-500">Insights into your recruitment performance.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 bg-white">
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 shadow-sm">
                        <Download size={16} /> Export Report
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <MetricCard label="Total Interviews" value="1,245" change="+12%" icon={<Users size={20} className="text-secondary" />} />
                <MetricCard label="Avg. AI Score" value="78%" change="+5%" icon={<TrendingUp size={20} className="text-green-600" />} />
                <MetricCard label="Hiring Rate" value="15%" change="-2%" icon={<PieChart size={20} className="text-purple-600" />} />
                <MetricCard label="Time to Hire" value="12 Days" change="-3 Days" icon={<Calendar size={20} className="text-orange-600" />} />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Chart Mockup 1 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart size={18} className="text-slate-500" /> Interview Volume
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2 border-b border-gray-100 pb-2 px-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-secondary/20 hover:bg-secondary/30 transition rounded-t-lg relative group" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                    {h} Interviews
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Chart Mockup 2 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <PieChart size={18} className="text-slate-500" /> Candidate Status
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full border-secondary border-r-purple-500 border-b-green-500 border-l-gray-200" style={{ borderWidth: '16px' }}></div>
                        <div className="absolute inset-0 flex flex-center flex-col text-center justify-center">
                            <span className="text-2xl font-bold text-slate-800">45%</span>
                            <span className="text-xs text-slate-500 font-medium uppercase">Conversion</span>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-slate-600"><div className="w-2 h-2 rounded-full bg-secondary"></div> Screening</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, change, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${change.includes('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>{change}</span>
        </div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
    </div>
);

export default AdminAnalytics;
