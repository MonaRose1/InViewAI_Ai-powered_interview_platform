import React from 'react';
import { Search, BookOpen, MessageCircle, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="bg-slate-900 text-white py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">How can we help you?</h1>
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for articles, guides, and more..."
                            className="w-full py-3 pl-12 pr-4 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-secondary/30"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-5xl mx-auto px-4 -mt-10 pb-20">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center mb-4">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Getting Started</h3>
                        <p className="text-slate-500 text-sm mb-4">Learn the basics of setting up your account and profile.</p>
                        <Link to="/faq" className="text-secondary font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                            View Articles <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Interviews & Reviews</h3>
                        <p className="text-slate-500 text-sm mb-4">Guides on conducting interviews and reviewing AI scores.</p>
                        <Link to="/faq" className="text-purple-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                            Read Guides <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Account & Billing</h3>
                        <p className="text-slate-500 text-sm mb-4">Manage your subscription, team members, and security.</p>
                        <Link to="/contact-support" className="text-green-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                            Contact Support <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Popular Articles */}
                <div className="mt-16">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Popular Articles</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {['How does the AI scoring work?', 'Setting up your first interview', 'Integrating with ATS', 'Candidate troubleshooting guide'].map((article, i) => (
                            <Link key={article} to="/faq" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-secondary/30 hover:bg-secondary/10 transition flex justify-between items-center group">
                                <span className="text-slate-700 font-medium group-hover:text-secondary">{article}</span>
                                <ArrowRight size={16} className="text-gray-300 group-hover:text-secondary" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
