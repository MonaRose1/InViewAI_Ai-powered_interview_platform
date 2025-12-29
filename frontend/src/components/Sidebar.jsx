import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    FileText,
    Settings,
    LogOut,
    Video,
    BarChart,
    Download,
    Lock,
    Cpu,
    User,
    PlusCircle,
    TrendingUp,
    CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ role, className = "" }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = {
        admin: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
            { name: 'Jobs', path: '/admin/jobs', icon: <Briefcase size={20} /> },
            { name: 'Candidates', path: '/admin/candidates', icon: <Users size={20} /> },
            { name: 'Interviews', path: '/admin/interviews', icon: <Video size={20} /> },
            { name: 'Applications', path: '/admin/applications', icon: <FileText size={20} /> },
            { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
            { name: 'Analytics', path: '/admin/analytics', icon: <BarChart size={20} /> },
            { name: 'Audit Logs', path: '/admin/logs', icon: <FileText size={20} /> },
            { name: 'Exports', path: '/admin/exports', icon: <Download size={20} /> },

            { name: 'Profile', path: '/admin/profile', icon: <User size={20} /> },
        ],
        interviewer: [
            { name: 'Dashboard', path: '/interviewer/dashboard', icon: <LayoutDashboard size={20} /> },
            { name: 'Applicants', path: '/interviewer/applicants', icon: <Users size={20} /> },
            { name: 'Interviews', path: '/interviewer/interviews', icon: <Video size={20} /> },
            { name: 'Question Bank', path: '/interviewer/question-bank', icon: <FileText size={20} /> },
            { name: 'Rankings', path: '/interviewer/rankings', icon: <TrendingUp size={20} /> },
            { name: 'Hired Candidates', path: '/interviewer/hired', icon: <CheckCircle size={20} /> },
            { name: 'History', path: '/interviewer/history', icon: <FileText size={20} /> },
            { name: 'Profile', path: '/interviewer/profile', icon: <User size={20} /> },
        ],
        candidate: [
            { name: 'Dashboard', path: '/candidate/dashboard', icon: <LayoutDashboard size={20} /> },
            { name: 'Jobs', path: '/candidate/jobs', icon: <Briefcase size={20} /> },
            { name: 'Applications', path: '/candidate/applications', icon: <FileText size={20} /> },
            { name: 'My Resume', path: '/candidate/resume', icon: <FileText size={20} /> },
            { name: 'Profile', path: '/candidate/profile', icon: <User size={20} /> },
        ]
    };

    const currentNav = navItems[role] || [];

    return (
        <div className={`w-64 bg-white text-slate-800 h-screen fixed left-0 top-0 flex flex-col border-r border-gray-200 shadow-sm z-100 pointer-events-auto ${className}`}>
            <div className="p-6 border-b border-gray-200 flex flex-col items-center justify-center">
                <img src="/Asset 2.png" alt="InViewAI" className="h-10 w-auto object-contain" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                    {role === 'admin' ? 'Admin Panel' : role === 'interviewer' ? 'Interviewer Panel' : 'Candidate Panel'}
                </p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {currentNav.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-secondary/10 text-secondary shadow-sm font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
