import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('candidate'); // Default role
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await register({ name, email, password, role });
            // Redirect based on role
            if (data.role === 'admin') navigate('/admin/dashboard');
            else if (data.role === 'interviewer') navigate('/interviewer/dashboard');
            else navigate('/candidate/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left Side: Brand Illustration */}
            <div className="hidden lg:flex w-1/2 bg-secondary items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary/30 z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
                    alt="Team"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="relative z-20 text-white p-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">Join Us</h1>
                    <p className="text-lg text-gray-100">Start your journey with AI-driven career growth.</p>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-primary mb-2">Create Account</h2>
                    <p className="text-textMuted mb-8">Sign up to get started.</p>

                    {error && <div className="bg-red-50 text-error p-3 rounded mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-textPrimary mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition"
                                placeholder="John Doe"
                                required
                            />
                        </div>
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
                            <label className="block text-sm font-medium text-textPrimary mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textPrimary mb-1">I am a...</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition bg-white"
                            >
                                <option value="candidate">Candidate (Looking for jobs)</option>
                                <option value="interviewer">Interviewer (Conducting interviews)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-secondary text-white py-2.5 rounded-lg font-semibold hover:bg-secondary/90 transition shadow-md mt-4"
                        >
                            Sign Up
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-textMuted">
                        Already have an account? <Link to="/login" className="text-secondary font-medium hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
