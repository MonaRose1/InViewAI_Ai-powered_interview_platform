import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t border-gray-200 bg-slate-50 py-12 text-sm text-slate-600">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <img src="/Asset 1.png" alt="Logo" className="h-6 w-auto opacity-80" />
                        <span className="text-lg font-bold text-slate-900">InViewAI</span>
                    </div>
                    <p className="text-slate-600">The future of intelligent hiring.</p>
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 mb-4">Product</h3>
                    <ul className="space-y-2 text-slate-600">
                        <li><a href="#" className="hover:text-secondary transition">Features</a></li>
                        <li><a href="#" className="hover:text-secondary transition">Pricing</a></li>
                        <li><a href="#" className="hover:text-secondary transition">Security</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 mb-6 uppercase text-xs tracking-widest">Company</h4>
                    <ul className="space-y-4 text-slate-600 text-sm">
                        <li><a href="#" className="hover:text-secondary transition">About</a></li>
                        <li><a href="/contact" className="hover:text-secondary transition">Contact</a></li>
                        <li><a href="#" className="hover:text-secondary transition">Blog</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 mb-6 uppercase text-xs tracking-widest">Legal</h4>
                    <ul className="space-y-4 text-slate-600 text-sm">
                        <li><a href="#" className="hover:text-secondary transition">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-secondary transition">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-600">
                &copy; 2025 InViewAI Platform. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
