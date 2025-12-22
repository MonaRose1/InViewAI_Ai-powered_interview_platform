import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Calendar, Video, BarChart, CheckCircle, ArrowRight, Brain } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const HowItWorksPage = () => {
    const steps = [
        {
            icon: <UserPlus size={40} className="text-secondary" />,
            title: "1. Create Your Account",
            description: "Sign up and set up your organization profile in minutes. Invite team members and configure your hiring workflow."
        },
        {
            icon: <Calendar size={40} className="text-purple-500" />,
            title: "2. Schedule Interviews",
            description: "Create job postings, review applications, and schedule AI-powered interviews with candidates automatically."
        },
        {
            icon: <Brain size={32} className="text-secondary" />,
            title: "3. Conduct AI Interviews",
            description: "Candidates complete video interviews while our AI analyzes their responses, engagement, and communication skills in real-time."
        },
        {
            icon: <BarChart size={40} className="text-orange-500" />,
            title: "4. Review AI Insights",
            description: "Access comprehensive reports with AI-generated scores, sentiment analysis, and detailed candidate evaluations."
        },
        {
            icon: <CheckCircle size={40} className="text-emerald-500" />,
            title: "5. Make Better Decisions",
            description: "Use data-driven insights combined with human judgment to select the best candidates for your team."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            {/* Hero */}
            <div className="bg-linear-to-br from-slate-900 via-secondary/20 to-slate-900 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">How InViewAI Works</h1>
                    <p className="text-xl text-slate-300">
                        A simple, powerful process to revolutionize your hiring workflow.
                    </p>
                </div>
            </div>

            {/* Steps */}
            <div className="max-w-5xl mx-auto px-4 py-20">
                <div className="space-y-16">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-center gap-8">
                            <div className="md:w-1/3 flex justify-center">
                                <div className="w-32 h-32 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center">
                                    {step.icon}
                                </div>
                            </div>
                            <div className="md:w-2/3 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">{step.title}</h3>
                                <p className="text-lg text-slate-600 leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-secondary text-white py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-white mb-12">Why Choose InViewAI?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-secondary mb-2">10x</div>
                            <p className="text-white">Faster screening process</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">92%</div>
                            <p className="text-white">Accuracy in candidate matching</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">50%</div>
                            <p className="text-white">Reduction in hiring costs</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-linear-to-r from-secondary to-purple-600 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl text-secondary/20 mb-8">Join hundreds of companies using InViewAI to find the best talent.</p>
                    <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-secondary font-bold rounded-xl hover:bg-secondary/10 transition shadow-lg">
                        Start Your Free Trial <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default HowItWorksPage;
