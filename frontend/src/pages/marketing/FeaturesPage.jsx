import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Eye, Mic, BarChart, Shield, Zap, Users, Clock, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const FeaturesPage = () => {
    const features = [
        {
            icon: <Brain size={32} className="text-secondary" />,
            title: "AI-Powered Analysis",
            description: "Advanced machine learning models analyze candidate responses, tone, and engagement in real-time."
        },
        {
            icon: <Eye size={32} className="text-purple-500" />,
            title: "Gaze & Attention Tracking",
            description: "Computer vision technology monitors eye contact and focus patterns during interviews."
        },
        {
            icon: <Mic size={32} className="text-green-500" />,
            title: "Speech & Sentiment Analysis",
            description: "NLP algorithms evaluate communication clarity, confidence, and emotional intelligence."
        },
        {
            icon: <BarChart size={32} className="text-orange-500" />,
            title: "Comprehensive Scoring",
            description: "Multi-dimensional scoring system combines technical skills, soft skills, and cultural fit."
        },
        {
            icon: <Shield size={32} className="text-red-500" />,
            title: "Bias Detection & Fairness",
            description: "Built-in safeguards ensure equitable evaluation across all candidates."
        },
        {
            icon: <Zap size={32} className="text-yellow-500" />,
            title: "Real-Time Insights",
            description: "Live dashboards provide instant feedback during interviews for better decision-making."
        },
        {
            icon: <Users size={32} className="text-indigo-500" />,
            title: "Collaborative Hiring",
            description: "Team-based review system with shared notes and evaluation workflows."
        },
        {
            icon: <Clock size={32} className="text-pink-500" />,
            title: "Automated Scheduling",
            description: "Smart calendar integration and availability management for seamless coordination."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            {/* Hero */}
            <div className="bg-linear-to-br from-slate-900 via-secondary/20 to-slate-900 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">Powerful Features for Modern Hiring</h1>
                    <p className="text-xl text-slate-300 mb-8">
                        Everything you need to conduct fair, efficient, and data-driven interviews.
                    </p>
                    <Link to="/register" className="inline-block px-8 py-4 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl transition shadow-lg">
                        Start Free Trial
                    </Link>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                            <div className="mb-4 p-3 bg-slate-50 rounded-xl w-fit">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-secondary text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Hiring?</h2>
                    <p className="text-xl text-secondary/20 mb-8">Join hundreds of companies using InViewAI to find the best talent.</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register" className="px-8 py-3 bg-white text-secondary font-bold rounded-lg hover:bg-secondary/10 transition">
                            Get Started
                        </Link>
                        <Link to="/contact-support" className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default FeaturesPage;
