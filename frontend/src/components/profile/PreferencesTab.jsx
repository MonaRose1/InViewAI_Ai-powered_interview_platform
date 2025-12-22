import React, { useState } from 'react';
import { Bell, Moon, Volume2, Globe, Loader2, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const PreferencesTab = ({ user }) => {
    const [preferences, setPreferences] = useState({
        emailNotifications: user?.preferences?.emailNotifications ?? true,
        inAppNotifications: user?.preferences?.inAppNotifications ?? true,
        theme: user?.preferences?.theme ?? 'light',
        sound: user?.preferences?.soundAlerts ?? true,
        language: user?.preferences?.language ?? 'en'
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleToggle = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (e) => {
        setPreferences({ ...preferences, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.put('/profile/preferences', {
                emailNotifications: preferences.emailNotifications,
                inAppNotifications: preferences.inAppNotifications,
                theme: preferences.theme,
                soundAlerts: preferences.sound,
                language: preferences.language
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save preferences:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                        <Bell size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                            <p className="font-medium text-slate-700">Email Notifications</p>
                            <p className="text-xs text-slate-500">Receive updates and alerts via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={preferences.emailNotifications}
                                onChange={() => handleToggle('emailNotifications')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                            <p className="font-medium text-slate-700">In-App Notifications</p>
                            <p className="text-xs text-slate-500">Show pop-up notifications while using the app</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={preferences.inAppNotifications}
                                onChange={() => handleToggle('inAppNotifications')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Appearance & Sound */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Moon size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Appearance</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
                            <select
                                name="theme"
                                value={preferences.theme}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                            >
                                <option value="light">Light Mode</option>
                                <option value="dark">Dark Mode</option>
                                <option value="system">System Default</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                                <span className="p-1.5 bg-slate-100 rounded text-slate-500"><Volume2 size={16} /></span>
                                <span className="text-sm font-medium text-slate-700">Sound Effects</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.sound}
                                    onChange={() => handleToggle('sound')}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Localization</h2>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                        <select
                            name="language"
                            value={preferences.language}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                        >
                            <option value="en">English (US)</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                        </select>
                        <p className="text-xs text-slate-400 mt-2">More languages coming soon.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end items-center gap-4">
                {success && (
                    <span className="text-green-600 text-sm font-medium flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                        <CheckCircle size={16} className="text-green-500" /> Preferences saved!
                    </span>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
};

export default PreferencesTab;
