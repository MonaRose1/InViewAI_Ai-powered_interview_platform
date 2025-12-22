import React, { useState } from 'react';
import { Send, MapPin, Mail, Phone } from 'lucide-react';

const ContactSupport = () => {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-5xl w-full rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">

                {/* Contact Info */}
                <div className="bg-slate-900 text-white p-10 md:w-1/3 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                        <p className="text-slate-300 mb-8 leading-relaxed">
                            Need help? Our support team is available 24/7 to assist you.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Mail className="text-secondary" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Email Us</p>
                                    <p className="text-sm text-slate-500">support@inviewai.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="text-secondary" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Call Us</p>
                                    <p className="text-sm text-slate-500">+1 (555) 000-0000</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <MapPin className="text-secondary" />
                                <span>123 AI Street, Tech City</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 md:mt-0">
                        <div className="w-12 h-12 bg-secondary rounded-full mb-4"></div>
                        <p className="text-sm text-slate-400">"InViewAI has the best support team I've ever dealt with."</p>
                        <p className="text-xs font-bold mt-2">- Happy Customer</p>
                    </div>
                </div>

                {/* Form */}
                <div className="p-10 md:w-2/3">
                    {sent ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <Send size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Message Sent!</h2>
                            <p className="text-slate-500">We'll get back to you within 24 hours.</p>
                            <button onClick={() => setSent(false)} className="mt-6 text-secondary font-medium">Send another message</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-800">Send us a message</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                                    <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 outline-none" placeholder="John Doe" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Work Email</label>
                                    <input type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 outline-none" placeholder="john@example.com" required />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Subject</label>
                                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 outline-none">
                                    <option>Technical Support</option>
                                    <option>Billing Inquiry</option>
                                    <option>Feature Request</option>
                                    <option>General Question</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Message</label>
                                <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-secondary/20 outline-none resize-none" placeholder="How can we help?" required></textarea>
                            </div>

                            <button type="submit" className="px-8 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-lg transition shadow-md w-full md:w-auto">
                                Send Message
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactSupport;
