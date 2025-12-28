import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const TopHeader = () => {
    const { user } = useAuth();
    const { unreadCount } = useNotification();

    return (
        <header className="h-16 bg-slate-50 border-b border-gray-200 flex items-center justify-between px-8">
            {/* Left side empty or logo placeholder */}
            <div className="flex-1"></div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
                <Link to="/notifications" className="relative text-slate-600 hover:text-secondary transition">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-slate-50 flex items-center justify-center px-1">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Link>

                <Link
                    to={`/${user?.role}/profile`}
                    className="flex items-center gap-3 pl-6 border-l border-gray-200 group hover:bg-slate-100/50 p-1 -m-1 rounded-xl transition-all"
                >
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-secondary transition-colors">{user?.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold border-2 border-white shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0) || <User className="w-5 h-5" />
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default TopHeader;
