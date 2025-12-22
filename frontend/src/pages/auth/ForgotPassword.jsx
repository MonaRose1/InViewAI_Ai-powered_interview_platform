import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock API call
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
                    <p className="text-slate-500 mt-2">Enter your email to receive recovery instructions.</p>
                </div>

                {submitted ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Check your email</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            We have sent a password reset link to <span className="font-semibold text-slate-700">{email}</span>.
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-secondary hover:text-secondary/80 font-medium text-sm"
                        >
                            But wait, I didn't get it?
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-lg transition shadow-md flex items-center justify-center gap-2"
                        >
                            Send Reset Link <ArrowRight size={18} />
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="text-sm text-slate-500 hover:text-slate-800 font-medium">
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
