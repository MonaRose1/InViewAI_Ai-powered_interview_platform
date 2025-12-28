import React, { useEffect } from 'react';
import { Bell, Check, Trash2, Clock, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationPage = () => {
    const {
        notifications,
        markAllAsRead,
        deleteNotification,
        markAsRead,
        fetchNotifications
    } = useNotification();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-orange-500" />;
            default: return <Info size={20} className="text-secondary" />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Notifications</h1>
                    <p className="text-slate-500">Stay updated with your interview process.</p>
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary bg-secondary/10 hover:bg-secondary/20 rounded-lg transition"
                    >
                        <Check size={16} /> Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                        <Bell size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification._id}
                            onClick={() => !notification.read && markAsRead(notification._id)}
                            className={`flex gap-4 p-4 rounded-xl border transition group cursor-pointer ${notification.read ? 'bg-white border-gray-100' : 'bg-secondary/10 border-secondary/20 shadow-sm'
                                }`}
                        >
                            <div className="mt-1 p-2 bg-white rounded-full shadow-sm h-fit">
                                {getIcon(notification.type)}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-semibold text-slate-800 ${!notification.read && 'text-secondary'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                        <Clock size={12} /> {formatTime(notification.createdAt)}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm mt-1">{notification.message}</p>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification._id);
                                }}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                title="Dismiss"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationPage;
