import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <nav className="fixed w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/Asset 2.png" alt="InViewAI" className="h-10 w-auto" />
                    </Link>
                    <div className="flex items-center space-x-8">
                        {user ? (
                            <Link
                                to={`/${user.role}/profile`}
                                className="flex items-center gap-3 group hover:bg-slate-100/50 p-1 rounded-xl transition-all"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-semibold text-slate-800 group-hover:text-secondary transition-colors">{user.name}</div>
                                    <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold border-2 border-white shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name?.charAt(0) || <User className="w-5 h-5" />
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <div className="hidden md:flex items-center space-x-8">
                                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Log In</Link>
                                <Link to="/register" className="px-5 py-2.5 rounded-full bg-secondary text-white text-sm font-semibold hover:bg-[#1289b4] transition shadow-lg shadow-secondary/20">
                                    Get Started Free
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
