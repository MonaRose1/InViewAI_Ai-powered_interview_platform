import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
    const [status, setStatus] = useState('verifying'); // verifying, success, error

    useEffect(() => {
        // Mock verification delay
        setTimeout(() => {
            setStatus('success');
        }, 2000);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">

                {status === 'verifying' && (
                    <>
                        <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Loader size={32} className="animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifying Email...</h2>
                        <p className="text-slate-500">Please wait while we confirm your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Email Verified!</h2>
                        <p className="text-slate-500 mb-6">Thank you. Your account is now fully active.</p>
                        <Link
                            to="/login"
                            className="block w-full py-2.5 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-lg transition"
                        >
                            Continue to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h2>
                        <p className="text-slate-500 mb-6">The link is invalid or has expired.</p>
                        <Link
                            to="/login"
                            className="text-secondary hover:text-secondary/80 font-medium"
                        >
                            Return to Login
                        </Link>
                    </>
                )}

            </div>
        </div>
    );
};

export default VerifyEmail;
