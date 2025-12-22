import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Video, Shield, TrendingUp, Users, CheckCircle,
    Play, Server, Lock, Code, ArrowRight
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <PageTransition>
            <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-secondary/30">
                <Navbar />

                {/* Hero Section */}
                <section className="pt-20 pb-16 md:pt-28 md:pb-20 px-4 relative overflow-hidden bg-linear-to-br from-secondary/5 via-white to-purple-50">
                    {/* ... (Hero Content) ... */}
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-secondary/10 rounded-full blur-[100px] -z-10" />
                    <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] -z-10" />

                    <div className="max-w-7xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-medium text-secondary mb-8"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                            </span>
                            v2.0 Now Live with Advanced Emotion AI
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-tight"
                        >
                            Hire Smarter with <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-secondary to-purple-600">AI-Powered Interviews</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
                        >
                            InViewAI analyzes candidate behavior, confidence, engagement, and responses in real time—helping you make faster, unbiased, and data-driven hiring decisions.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="flex flex-col sm:flex-row justify-center gap-4"
                        >
                            <Link to="/register" className="px-8 py-4 rounded-full bg-secondary text-white text-lg font-semibold hover:bg-[#1289b4] transition shadow-xl shadow-secondary/20 flex items-center justify-center gap-2">
                                Get Started Free <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button className="px-8 py-4 rounded-full bg-white text-slate-800 text-lg font-semibold border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm">
                                <Play className="w-5 h-5 fill-current text-secondary" /> Request a Demo
                            </button>
                        </motion.div>

                        {/* Dashboard Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.7 }}
                            className="mt-20 relative mx-auto max-w-5xl"
                        >
                            <div className="rounded-xl bg-white border border-gray-200 shadow-2xl overflow-hidden aspect-video relative group">
                                <div className="absolute inset-0 bg-linear-to-b from-transparent to-white/20 z-10" />
                                <img
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2670"
                                    alt="Dashboard Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 z-20 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-lg">
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div className="px-4 py-2 rounded bg-white border border-slate-200">
                                                    <div className="text-2xl font-bold text-secondary">98%</div>
                                                    <div className="text-xs text-slate-500">Engagement</div>
                                                </div>
                                                <div className="px-4 py-2 rounded bg-white border border-slate-200">
                                                    <div className="text-2xl font-bold text-green-600">High</div>
                                                    <div className="text-xs text-slate-500">Confidence</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Key Features Section */}
                <section className="py-24 bg-slate-50 relative">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything You Need to Hire Top Talent</h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">Our platform combines advanced AI with a seamless user experience to transform your hiring workflow.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <FeatureCard
                                icon={<TrendingUp className="w-6 h-6 text-secondary" />}
                                title="AI Interview Analysis"
                                desc="Real-time behavior, gaze, and response evaluation using computer vision and AI."
                            />
                            <FeatureCard
                                icon={<Video className="w-6 h-6 text-purple-600" />}
                                title="Live Video Interviews"
                                desc="Built-in WebRTC-based interview system with ultra-low latency and HD quality."
                            />
                            <FeatureCard
                                icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                                title="Smart Reports"
                                desc="Automatic interview summaries, scoring, and detailed candidate comparisons."
                            />
                            <FeatureCard
                                icon={<Shield className="w-6 h-6 text-red-600" />}
                                title="Secure & Private"
                                desc="Local frame storage, encrypted sessions, and privacy-first architecture."
                            />
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-linear-to-r from-secondary/20 via-purple-500/20 to-secondary/20" />

                            <StepCard
                                number="01"
                                title="Schedule Interview"
                                desc="Create and assign structured interviews to candidates in seconds."
                            />
                            <StepCard
                                number="02"
                                title="Conduct AI Interview"
                                desc="Candidates join via secure video call while AI analyzes behavior in real-time."
                            />
                            <StepCard
                                number="03"
                                title="Review Insights"
                                desc="Get structured reports, scores, and hiring recommendations instantly."
                            />
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Modern Teams Switch to InViewAI</h2>
                            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Remove the guesswork from hiring. Our platform provides objective data to back your decisions.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                                    <CheckCircle className="w-6 h-6 text-secondary" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Reduce Hiring Bias</h3>
                                <p className="text-slate-600">Objective AI scoring ensures fair evaluation across all candidates.</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Save Recruiter Time</h3>
                                <p className="text-slate-600">Automated screening reduces manual review time by 80%.</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Better Candidate Experience</h3>
                                <p className="text-slate-600">Faster feedback and transparent process improves satisfaction.</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                    <Shield className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Data-Backed Decisions</h3>
                                <p className="text-slate-600">Make confident hiring choices with comprehensive analytics.</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                    <Server className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Scalable Architecture</h3>
                                <p className="text-slate-600">Handle large hiring pipelines with enterprise-grade infrastructure.</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                                    <Lock className="w-6 h-6 text-pink-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure & Compliant</h3>
                                <p className="text-slate-600">Enterprise security with GDPR and SOC 2 compliance.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tech & Trust Section */}
                <section className="py-24 text-center">
                    <div className="max-w-4xl mx-auto px-4">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8">Powered by Industry Leading Technology</h2>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
                            <TechBadge label="Computer Vision" />
                            <TechBadge label="FastAPI" />
                            <TechBadge label="React" />
                            <TechBadge label="Node.js" />
                            <TechBadge label="WebRTC" />
                            <TechBadge label="TensorFlow" />
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm border border-green-200">
                            <Lock className="w-4 h-4" /> GDPR Ready & Privacy First Design
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 relative overflow-hidden bg-secondary">

                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Transform the Way You Interview</h2>
                        <p className="text-xl text-white/90 mb-10">Join thousands of companies using InViewAI to find their next superstar.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/register" className="px-8 py-4 rounded-full bg-white text-secondary text-lg font-bold hover:bg-slate-50 transition shadow-xl">
                                Get Started Now
                            </Link>
                            <button className="px-8 py-4 rounded-full bg-transparent text-white text-lg font-semibold border border-white/20 hover:bg-white/10 transition">
                                Talk to Sales
                            </button>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </PageTransition>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-all group"
    >
        <div className="mb-4 bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center border border-secondary/20 group-hover:border-secondary/30 transition-colors">
            {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-slate-900">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </motion.div>
);

const StepCard = ({ number, title, desc }) => (
    <div className="relative text-center z-10">
        <div className="w-16 h-16 mx-auto bg-secondary rounded-full border-2 border-secondary/20 flex items-center justify-center text-xl font-bold text-white mb-6 shadow-lg">
            {number}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600">{desc}</p>
    </div>
);

const BenefitItem = ({ text }) => (
    <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
        <span className="text-slate-700">{text}</span>
    </div>
);

const UseCaseCard = ({ title, icon }) => (
    <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center gap-4 hover:shadow-md transition">
        <div className="p-2 rounded bg-secondary/10 text-secondary">
            {icon}
        </div>
        <span className="font-medium text-slate-900">{title}</span>
    </div>
);

const TechBadge = ({ label }) => (
    <span className="px-4 py-2 rounded-lg bg-slate-100 border border-gray-200 text-slate-700 text-sm font-medium">
        {label}
    </span>
);

export default LandingPage;
