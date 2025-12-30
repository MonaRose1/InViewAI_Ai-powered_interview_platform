import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Building, Rocket, UserPlus } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const PricingPage = () => {
    const plans = [
        {
            name: "Starter",
            icon: <Zap size={24} className="text-secondary" />,
            price: "$99",
            period: "/month",
            description: "Perfect for small teams getting started",
            features: [
                "Up to 50 interviews/month",
                "Basic AI analysis",
                "Email support",
                "1 admin user",
                "Standard reports"
            ],
            cta: "Start Free Trial",
            popular: false
        },
        {
            name: "Professional",
            icon: <UserPlus size={40} className="text-secondary" />,
            price: "$299",
            period: "/month",
            description: "For growing companies with serious hiring needs",
            features: [
                "Up to 200 interviews/month",
                "Advanced AI analysis",
                "Priority support",
                "5 admin users",
                "Custom reports",
                "API access",
                "Bias detection"
            ],
            cta: "Get Started",
            popular: true
        },
        {
            name: "Enterprise",
            icon: <UserPlus size={40} className="text-secondary" />,
            price: "Custom",
            period: "",
            description: "Tailored solutions for large organizations",
            features: [
                "Unlimited interviews",
                "Full AI suite",
                "Dedicated support",
                "Unlimited users",
                "White-label options",
                "Custom integrations",
                "SLA guarantee",
                "On-premise deployment"
            ],
            cta: "Contact Sales",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            {/* Hero */}
            <div className="bg-linear-to-r from-secondary to-purple-600 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-slate-300">
                        Choose the plan that fits your hiring needs. No hidden fees.
                    </p>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl shadow-lg border-2 p-8 relative ${plan.popular ? 'border-secondary scale-105' : 'border-gray-100'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1 rounded-full text-sm font-bold">
                                    Most Popular
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <div className="inline-block p-3 bg-slate-50 rounded-xl mb-4">
                                    {plan.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-secondary mb-2">{plan.name}</h3>
                                <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                    <span className="text-slate-500">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check size={20} className="text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-slate-600">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to={plan.name === "Enterprise" ? "/contact" : "/register"}
                                className={`block w-full py-3 text-center font-bold rounded-lg transition ${plan.popular
                                    ? 'bg-secondary text-white hover:bg-secondary/90 shadow-md'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ */}
            <div className="bg-secondary text-white py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-white mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Is there a free trial?</h3>
                            <p className="text-slate-600">Absolutely. All plans come with a 14-day free trial. No credit card required.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">What payment methods do you accept?</h3>
                            <p className="text-slate-600">We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PricingPage;
