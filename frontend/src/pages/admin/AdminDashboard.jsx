import React from 'react';
import { Briefcase, Users, Video, TrendingUp, BarChart as BarChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = React.useState({
        interviews: 0,
        candidates: 0,
        jobs: 0,
        avgScore: 0,
        monthlyGrowth: 0,
        weeklyVolume: [0, 0, 0, 0, 0, 0, 0],
        recentActivity: []
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatTime = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diff = Math.floor((now - past) / 1000 / 60); // minutes

        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff} mins ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
        return past.toLocaleDateString();
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6 relative pb-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard
                    icon={<Video className="w-6 h-6 text-white" />}
                    color="bg-secondary"
                    label="Total Interviews"
                    value={stats.interviews}
                    sub="All time"
                />
                <KPICard
                    icon={<Users className="w-6 h-6 text-white" />}
                    color="bg-purple-600"
                    label="Candidates"
                    value={stats.candidates}
                    sub={`${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}% growth`}
                />
                <KPICard
                    icon={<Briefcase className="w-6 h-6 text-white" />}
                    color="bg-amber-500"
                    label="Open Jobs"
                    value={stats.jobs}
                    sub="Active listings"
                />
                <KPICard
                    icon={<TrendingUp className="w-6 h-6 text-white" />}
                    color="bg-green-600"
                    label="Avg AI Score"
                    value={`${stats.avgScore}%`}
                    sub="Latest average"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                        Recent Activity
                    </h2>
                    <div className="space-y-1">
                        {stats.recentActivity.length === 0 ? (
                            <p className="text-slate-400 text-sm py-10 text-center">No recent activity</p>
                        ) : (
                            stats.recentActivity.map((activity, i) => (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={i}
                                    className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-default"
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full ${activity.type === 'interview' ? 'bg-secondary' :
                                        activity.type === 'user' ? 'bg-purple-500' : 'bg-green-500'
                                        }`}></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-700 group-hover:text-secondary transition-colors">{activity.title}</p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{formatTime(activity.time)}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                        <BarChartIcon size={20} className="text-slate-400" />
                        Weekly Performance
                    </h2>
                    <div className="h-48 flex items-end justify-between gap-3 px-2">
                        {stats.weeklyVolume.map((val, i) => {
                            const max = Math.max(...stats.weeklyVolume) || 1;
                            const height = (val / max) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ delay: i * 0.1, duration: 1 }}
                                        className="w-full bg-secondary/10 hover:bg-secondary transition-colors rounded-t-lg relative group"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 shadow-xl">
                                            {val} Interviews
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ icon, color, label, value, sub }) => {
    // Determine shadow color based on bg color
    const shadowColor = color.includes('secondary') ? 'shadow-secondary/20' :
        color.includes('purple') ? 'shadow-purple-500/20' :
            color.includes('amber') ? 'shadow-amber-500/20' : 'shadow-green-500/20';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg ${shadowColor} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{sub}</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{label}</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
    );
};

export default AdminDashboard;
