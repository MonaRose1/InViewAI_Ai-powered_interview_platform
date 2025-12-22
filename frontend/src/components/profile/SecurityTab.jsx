import React, { useState } from 'react';
import { Lock, Loader2, CheckCircle, AlertCircle, Check, X } from 'lucide-react';
import api from '../../services/api';

const SecurityTab = () => {
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Password validation rules
    const passwordRules = {
        minLength: { test: (pwd) => pwd.length >= 8, label: 'At least 8 characters' },
        hasUppercase: { test: (pwd) => /[A-Z]/.test(pwd), label: 'One uppercase letter' },
        hasLowercase: { test: (pwd) => /[a-z]/.test(pwd), label: 'One lowercase letter' },
        hasNumber: { test: (pwd) => /\d/.test(pwd), label: 'One number' },
        hasSymbol: { test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), label: 'One special character (!@#$%^&*)' }
    };

    const validatePassword = (password) => {
        const results = {};
        Object.keys(passwordRules).forEach(key => {
            results[key] = passwordRules[key].test(password);
        });
        return results;
    };

    const validationResults = validatePassword(passwordData.new);
    const isPasswordValid = Object.values(validationResults).every(v => v);

    const handleChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!isPasswordValid) {
            setError('Password does not meet all requirements');
            return;
        }

        if (passwordData.new !== passwordData.confirm) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.current === passwordData.new) {
            setError('New password must be different from current password');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.put('/profile/password', {
                currentPassword: passwordData.current,
                newPassword: passwordData.new
            });
            setSuccess(true);
            setPasswordData({ current: '', new: '', confirm: '' });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Change Password */}
            <form onSubmit={handlePasswordUpdate} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                        <Lock size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                        <input
                            type="password"
                            name="current"
                            value={passwordData.current}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                        <input
                            type="password"
                            name="new"
                            value={passwordData.new}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                        />

                        {/* Password Requirements */}
                        {passwordData.new && (
                            <div className="mt-3 p-4 bg-slate-50 rounded-lg space-y-2">
                                <p className="text-xs font-semibold text-slate-600 mb-2">Password Requirements:</p>
                                {Object.keys(passwordRules).map(key => (
                                    <div key={key} className="flex items-center gap-2 text-xs">
                                        {validationResults[key] ? (
                                            <Check size={14} className="text-green-500 shrink-0" />
                                        ) : (
                                            <X size={14} className="text-slate-400 shrink-0" />
                                        )}
                                        <span className={validationResults[key] ? 'text-green-600 font-medium' : 'text-slate-500'}>
                                            {passwordRules[key].label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirm"
                            value={passwordData.confirm}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                        />
                        {passwordData.confirm && passwordData.new !== passwordData.confirm && (
                            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle size={12} />
                                Passwords do not match
                            </p>
                        )}
                        {passwordData.confirm && passwordData.new === passwordData.confirm && (
                            <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                <Check size={12} />
                                Passwords match
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end items-center gap-4">
                    {success && (
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                            <CheckCircle size={16} /> Password updated!
                        </span>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !isPasswordValid || passwordData.new !== passwordData.confirm}
                        className="px-6 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SecurityTab;
