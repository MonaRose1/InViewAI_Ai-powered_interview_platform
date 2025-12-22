import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const Toast = () => {
    const { notification, removeNotification } = useNotification();

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                removeNotification();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification, removeNotification]);

    if (!notification) return null;

    return (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border border-opacity-20 animate-slide-in ${notification.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200'
                : 'bg-green-50 text-green-900 border-green-200'
            }`}>
            {notification.type === 'error' ? (
                <XCircle className="w-5 h-5 text-red-500" />
            ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <p className="text-sm font-medium pr-8">{notification.message}</p>
            <button
                onClick={removeNotification}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 transition"
            >
                <X size={14} className="opacity-50" />
            </button>
        </div>
    );
};

export default Toast;
