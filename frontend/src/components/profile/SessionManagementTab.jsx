import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, MapPin, Clock, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const SessionManagementTab = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const { data } = await api.get('/profile/sessions');
            setSessions(data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (deviceString) => {
        const lower = deviceString?.toLowerCase() || '';
        if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
            return <Smartphone size={20} />;
        }
        if (lower.includes('tablet') || lower.includes('ipad')) {
            return <Tablet size={20} />;
        }
        return <Monitor size={20} />;
    };

    const formatLastActive = (date) => {
        if (!date) return 'Unknown';
        const now = new Date();
        const lastActive = new Date(date);
        const diffMs = now - lastActive;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const handleLogoutSession = async (sessionToken) => {
        if (!confirm('Are you sure you want to logout from this device?')) return;

        setActionLoading(sessionToken);
        try {
            await api.post('/profile/sessions/logout', { sessionToken });
            setSessions(sessions.filter(s => s.token !== sessionToken));
        } catch (error) {
            console.error('Failed to logout session:', error);
            alert('Failed to logout from this device. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogoutAllOthers = async () => {
        if (!confirm('Are you sure you want to logout from all other devices?')) return;

        setActionLoading('all');
        try {
            await api.post('/profile/sessions/logout-all');
            await fetchSessions(); // Refresh to show only current session
        } catch (error) {
            console.error('Failed to logout all sessions:', error);
            alert('Failed to logout from other devices. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-2">Active Sessions</h2>
                        <p className="text-sm text-slate-500">
                            Manage your active sessions across different devices and browsers.
                        </p>
                    </div>
                    {sessions.length > 1 && (
                        <button
                            onClick={handleLogoutAllOthers}
                            disabled={actionLoading === 'all'}
                            className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition disabled:opacity-50 flex items-center gap-2 text-sm"
                        >
                            {actionLoading === 'all' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <LogOut size={16} />
                            )}
                            Logout All Others
                        </button>
                    )}
                </div>

                {/* Sessions List */}
                <div className="space-y-3">
                    {sessions.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <AlertTriangle size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No active sessions found</p>
                        </div>
                    ) : (
                        sessions.map((session, idx) => {
                            const isCurrent = idx === 0; // First session is usually current

                            return (
                                <div
                                    key={session.token || idx}
                                    className={`p-4 rounded-xl border transition-all ${isCurrent
                                            ? 'bg-secondary/5 border-secondary/30'
                                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Device Icon */}
                                        <div className={`p-3 rounded-lg ${isCurrent ? 'bg-secondary/10 text-secondary' : 'bg-white text-slate-600'
                                            }`}>
                                            {getDeviceIcon(session.device)}
                                        </div>

                                        {/* Session Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-slate-800">
                                                    {session.device || 'Unknown Device'}
                                                </h3>
                                                {isCurrent && (
                                                    <span className="px-2 py-0.5 bg-secondary text-white text-[10px] font-bold rounded uppercase">
                                                        Current
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                {session.ipAddress && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        {session.ipAddress}
                                                    </div>
                                                )}
                                                {session.lastActive && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {formatLastActive(session.lastActive)}
                                                    </div>
                                                )}
                                                {session.createdAt && (
                                                    <div className="text-slate-400">
                                                        Signed in {new Date(session.createdAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Logout Button */}
                                        {!isCurrent && (
                                            <button
                                                onClick={() => handleLogoutSession(session.token)}
                                                disabled={actionLoading === session.token}
                                                className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {actionLoading === session.token ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <LogOut size={14} />
                                                )}
                                                Logout
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Security Tip */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <h4 className="text-sm font-bold text-blue-900 mb-1">Security Tip</h4>
                    <p className="text-xs text-blue-700">
                        If you see a session you don't recognize, logout from that device immediately and change your password.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SessionManagementTab;
