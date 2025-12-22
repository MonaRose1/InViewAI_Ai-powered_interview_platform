import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, MessageSquare } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 lg:pt-32 pb-20">
                {/* Hero Section */}
                <div className="text-center px-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-bold mb-4">
                        <MessageSquare size={16} />
                        GET IN TOUCH
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
                        We'd Love to <span className="text-secondary">Hear From You</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Have a question about our AI technology? Need enterprise pricing?
                        Our team is ready to answer all your questions.
                    </p>
                </div>

                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-secondary">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                                            <a href="mailto:hello@inviewai.com" className="text-lg font-bold text-slate-800 hover:text-secondary transition">hello@inviewai.com</a>
                                            <p className="text-slate-500 text-sm mt-1">For general inquiries and support</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-secondary">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                                            <a href="tel:+1555000000" className="text-lg font-bold text-slate-800 hover:text-secondary transition">+1 (555) 000-0000</a>
                                            <p className="text-slate-500 text-sm mt-1">Mon-Fri from 8am to 5pm PST</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-secondary">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Office</p>
                                            <p className="text-lg font-bold text-slate-800">San Francisco, CA</p>
                                            <p className="text-slate-500 text-sm mt-1">123 AI Boulevard, Tech District</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
                            {submitted ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                        <Send size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-2">Message Sent!</h3>
                                    <p className="text-slate-500 mb-8">
                                        Thank you for reaching out. We'll get back to you within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="text-secondary font-bold hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <h3 className="text-xl font-bold text-slate-800">Send us a Message</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition hover:border-slate-300"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Email</label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="john@company.com"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition hover:border-slate-300"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Subject</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition hover:border-slate-300 text-slate-600"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        >
                                            <option value="">Select a topic...</option>
                                            <option value="sales">Sales & Enterprise</option>
                                            <option value="support">Technical Support</option>
                                            <option value="partnership">Partnerships</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Message</label>
                                        <textarea
                                            required
                                            rows="4"
                                            placeholder="Tell us how we can help..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition hover:border-slate-300 resize-none"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-bold shadow-lg shadow-secondary/20 transition transform active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        Send Message <Send size={20} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
