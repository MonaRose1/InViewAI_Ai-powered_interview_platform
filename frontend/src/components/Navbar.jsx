import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="fixed w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/Asset 2.png" alt="InViewAI" className="h-10 w-auto" />
                    </Link>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Log In</Link>
                        <Link to="/register" className="px-5 py-2.5 rounded-full bg-secondary text-white text-sm font-semibold hover:bg-[#1289b4] transition shadow-lg shadow-secondary/20">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
