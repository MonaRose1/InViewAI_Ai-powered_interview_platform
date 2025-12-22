import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            // Redirect based on role
            if (data.role === 'admin') navigate('/admin/dashboard');
            else if (data.role === 'interviewer') navigate('/interviewer/dashboard');
            else navigate('/candidate/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left Side: Brand Illustration */}
            <div className="hidden lg:flex w-1/2 bg-secondary items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary/40 z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80"
                    alt="Office"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="relative z-20 text-white p-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
                    <p className="text-lg text-gray-200">Access your AI-powered interview dashboard.</p>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-primary mb-2">Sign In</h2>
                    <p className="text-textMuted mb-8">Enter your credentials to continue.</p>

                    {error && <div className="bg-red-50 text-error p-3 rounded mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-textPrimary mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-textPrimary">Password</label>
                                <Link to="/forgot-password" className="text-xs text-secondary hover:underline">Forgot password?</Link>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-secondary text-white py-2.5 rounded-lg font-semibold hover:bg-secondary/90 transition shadow-md"
                        >
                            Log In
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-textMuted">
                        Don't have an account? <Link to="/register" className="text-secondary font-medium hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
