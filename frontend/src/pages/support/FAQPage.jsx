import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQPage = () => {
    const faqs = [
        {
            q: "How accurate is the AI scoring?",
            a: "Our AI analysis achieves over 92% correlation with human expert raters. It uses multiple signals including speech patterns, gaze tracking, and sentiment analysis to provide a balanced score, but we always recommend human review as the final decision maker."
        },
        {
            q: "Can I customize the interview questions?",
            a: "Yes! You can create custom question banks or use our predefined templates for various roles like Frontend, Backend, and Product Management."
        },
        {
            q: "Is the candidate's data secure?",
            a: "Absolutely. We are SOC2 compliant and encrypt all data at rest and in transit. Candidate videos are stored securely with limited access controls."
        },
        {
            q: "What happens if a candidate loses internet connection?",
            a: "Our platform supports auto-save and reconnection. Use the System Check tool before the interview to minimize risks. If a dropout occurs, the session is paused and can be resumed."
        }
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">Frequently Asked Questions</h1>
            <p className="text-slate-500 text-center mb-12">Answers to the most common questions about InViewAI.</p>

            <div className="space-y-4">
                {faqs.map((item, index) => (
                    <FAQItem key={index} question={item.q} answer={item.a} />
                ))}
            </div>
        </div>
    );
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            <div className="p-5 flex justify-between items-center hover:bg-slate-50 transition">
                <h3 className="font-semibold text-slate-800 text-lg">{question}</h3>
                {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </div>
            {isOpen && (
                <div className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-gray-100 pt-4">
                    {answer}
                </div>
            )}
        </div>
    );
};

export default FAQPage;
