import React from 'react';
import { BarChart, PieChart, Users, TrendingUp, Download, Calendar, ArrowUpRight, ArrowDownRight, Filter, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminAnalytics = () => {
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
        </div>
    );

    const hiringRate = stats.statusDistribution.hired || 0;
    const interviewCount = stats.interviews || 0;

    return (
        <div className="p-1 max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Insights</h1>
                    <p className="text-slate-500 font-medium">Real-time performance metrics and recruitment trends.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-white hover:shadow-md transition-all duration-300 bg-slate-50/50 font-semibold text-sm">
                        <Filter size={16} /> Filters
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-secondary to-indigo-600 text-white rounded-xl hover:opacity-90 shadow-lg shadow-secondary/20 transition-all duration-300 font-bold text-sm">
                        <Download size={16} /> Export Data
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    label="Total Interviews"
                    value={interviewCount.toLocaleString()}
                    change="+12.5%"
                    trend="up"
                    icon={<Users size={22} />}
                    color="from-blue-500 to-indigo-600"
                />
                <MetricCard
                    label="Avg. AI Score"
                    value={`${stats.avgScore}%`}
                    change="+4.3%"
                    trend="up"
                    icon={<TrendingUp size={22} />}
                    color="from-emerald-500 to-teal-600"
                />
                <MetricCard
                    label="Application Rate"
                    value={`${stats.applications}`}
                    change="Total"
                    trend="up"
                    icon={<PieChartIcon size={22} />}
                    color="from-purple-500 to-pink-600"
                />
                <MetricCard
                    label="Time to Hire"
                    value="11.5 Days"
                    change="-3 Days"
                    trend="up"
                    icon={<Calendar size={22} />}
                    color="from-orange-500 to-amber-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart - Interview Volume */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                                    <BarChart size={20} />
                                </div>
                                Interview Volume
                            </h3>
                            <p className="text-sm text-slate-400 mt-1 ml-11">Weekly breakdown of scheduled sessions</p>
                        </div>
                    </div>

                    <div className="h-72 flex items-end justify-between gap-4 border-b border-slate-100 pb-4 px-2 relative">
                        {/* Grid Lines */}
                        {[0, 25, 50, 75, 100].map((line) => (
                            <div key={line} className="absolute w-full border-t border-slate-50 pointer-events-none" style={{ bottom: `${line}%` }}></div>
                        ))}

                        {stats.weeklyVolume.map((h_val, i) => {
                            const max = Math.max(...stats.weeklyVolume) || 1;
                            const h_percent = (h_val / max) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full justify-end relative z-10">
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: `${h_percent || 5}%`, opacity: 1 }}
                                        transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                                        className="w-full bg-linear-to-t from-secondary/80 to-secondary hover:from-indigo-600 hover:to-secondary transition-all duration-300 rounded-t-xl relative group-hover/bar:shadow-lg group-hover/bar:shadow-secondary/30"
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none scale-90 group-hover/bar:scale-100 shadow-xl z-20">
                                            {h_val} Sessions
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-4 px-2 uppercase tracking-tighter">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <PieChart size={20} />
                        </div>
                        Candidate Status
                    </h3>

                    <div className="relative h-64 flex items-center justify-center">
                        <svg className="w-48 h-48 transform -rotate-90 drop-shadow-md">
                            <circle
                                cx="96"
                                cy="96"
                                r="80"
                                stroke="currentColor"
                                strokeWidth="18"
                                fill="transparent"
                                className="text-slate-100"
                            />
                            <motion.circle
                                initial={{ strokeDashoffset: 502 }}
                                animate={{ strokeDashoffset: 502 - (502 * (hiringRate / 100)) }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                cx="96"
                                cy="96"
                                r="80"
                                stroke="currentColor"
                                strokeWidth="20"
                                strokeDasharray="502"
                                fill="transparent"
                                strokeLinecap="round"
                                className="text-secondary"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center text-center">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-4xl font-black text-slate-800"
                            >
                                {hiringRate}%
                            </motion.span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Success</span>
                        </div>
                    </div>

                    <div className="mt-10 space-y-4">
                        <StatusIndicator label="Hired" count={stats.statusDistribution.counts.hired} color="bg-secondary" percent={`${stats.statusDistribution.hired}%`} animateDelay={1.4} />
                        <StatusIndicator label="Shortlisted" count={stats.statusDistribution.counts.shortlisted} color="bg-indigo-400" percent={`${stats.statusDistribution.shortlisted || 0}%`} animateDelay={1.5} />
                        <StatusIndicator label="Active" count={stats.statusDistribution.counts.interviewing} color="bg-amber-400" percent={`${stats.statusDistribution.interviewing}%`} animateDelay={1.6} />
                        <StatusIndicator label="Rejected" count={stats.statusDistribution.counts.rejected} color="bg-rose-400" percent={`${stats.statusDistribution.rejected}%`} animateDelay={1.8} />
                        <StatusIndicator label="New/Pending" count={stats.statusDistribution.counts.pending} color="bg-slate-300" percent={`${stats.statusDistribution.pending}%`} animateDelay={2.0} />
                    </div>
                </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-linear-to-br from-slate-900 to-indigo-950 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Activity size={240} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="max-w-md">
                        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-sm border border-white/10 text-secondary">AI Optimization Insight</span>
                        <h2 className="text-3xl font-bold mb-4">Real-time processing active.</h2>
                        <p className="text-slate-300 text-lg leading-relaxed">System is currently monitoring {stats.applications} total applications across {stats.jobs} open positions. Automation is saving roughly {stats.interviews * 2} minutes of screening time.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center min-w-[140px]">
                            <p className="text-slate-400 text-xs font-bold uppercase mb-2">Total Load</p>
                            <p className="text-4xl font-black text-secondary">{stats.applications}</p>
                            <p className="text-[10px] text-emerald-400 font-bold mt-2">Applications</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center min-w-[140px]">
                            <p className="text-slate-400 text-xs font-bold uppercase mb-2">AI Success</p>
                            <p className="text-4xl font-black text-white">{stats.avgScore}%</p>
                            <p className="text-[10px] text-secondary font-bold mt-2">Avg Accuracy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, change, icon, color, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
    >
        <div className="flex justify-between items-start mb-6">
            <div className={`p-3.5 bg-linear-to-br ${color} rounded-2xl text-white shadow-lg`}>
                {icon}
            </div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
            </div>
        </div>
        <div className="space-y-1">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
            <div className="text-sm font-semibold text-slate-400">{label}</div>
        </div>
    </motion.div>
);

const StatusIndicator = ({ label, count, color, percent, animateDelay }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${color} group-hover:scale-125 transition-transform`}></div>
            <span className="text-sm font-bold text-slate-600">{label}</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs font-black text-slate-400 tracking-widest">{count}</span>
            <div className="w-24 h-2 bg-slate-50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: percent }}
                    transition={{ delay: animateDelay, duration: 1, ease: "easeOut" }}
                    className={`h-full ${color}`}
                ></motion.div>
            </div>
            <span className="text-xs font-black text-slate-800 w-8">{percent}</span>
        </div>
    </div>
);

export default AdminAnalytics;
