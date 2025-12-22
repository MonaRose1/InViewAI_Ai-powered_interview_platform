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
        weeklyInterviews: 0,
        monthlyGrowth: 0
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

    return (
        <div className="space-y-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard
                    icon={<Video className="w-6 h-6 text-white" />}
                    color="bg-secondary"
                    label="Total Interviews"
                    value={stats.interviews}
                    sub={`${stats.weeklyInterviews} this week`}
                />
                <KPICard
                    icon={<Users className="w-6 h-6 text-white" />}
                    color="bg-purple-600"
                    label="Candidates"
                    value={stats.candidates}
                    sub={`${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}% vs last month`}
                />
                <KPICard
                    icon={<Briefcase className="w-6 h-6 text-white" />}
                    color="bg-amber-500"
                    label="Active Jobs"
                    value={stats.jobs}
                    sub="2 closing soon"
                />
                <KPICard
                    icon={<TrendingUp className="w-6 h-6 text-white" />}
                    color="bg-green-600"
                    label="Avg AI Score"
                    value={`${stats.avgScore}%`}
                    sub="Stable"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {[
                            { title: 'New match found for Senior React Dev', time: '2 mins ago', type: 'match' },
                            { title: 'Interview completed: Sarah Connor', time: '1 hour ago', type: 'interview' },
                            { title: 'New candidate registered: John Doe', time: '3 hours ago', type: 'user' },
                            { title: 'Job listing updated: Product Manager', time: '5 hours ago', type: 'job' },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors group">
                                <div className={`w-2 h-2 rounded-full ${activity.type === 'match' ? 'bg-secondary' :
                                    activity.type === 'interview' ? 'bg-amber-500' :
                                        activity.type === 'user' ? 'bg-purple-500' : 'bg-green-500'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700">{activity.title}</p>
                                    <p className="text-xs text-slate-400">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                        <BarChartIcon size={20} className="text-slate-400" />
                        Weekly Performance
                    </h2>
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                        {[45, 75, 55, 90, 65, 85, 70].map((val, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${val}%` }}
                                transition={{ delay: i * 0.1, duration: 0.8 }}
                                className="w-full bg-secondary/20 hover:bg-secondary/40 transition-colors rounded-t-md relative group"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                    {val}% Accuracy
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
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
