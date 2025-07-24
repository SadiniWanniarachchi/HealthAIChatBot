import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, ArrowLeft, Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            await authAPI.forgotPassword({ email: email.trim() });
            setIsEmailSent(true);
            toast.success('Password reset instructions sent to your email!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to send reset email. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 rounded-full blur-3xl"
                />
            </div>

            {/* Main Content */}
            <div className="w-full flex items-center justify-center px-6 sm:px-8 lg:px-16 xl:px-20 relative z-10">
                {/* Back Button */}
                <motion.button
                    onClick={() => navigate('/login')}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-300 group bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm hover:shadow-md z-20"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="font-medium text-sm">Back to Login</span>
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <HeartPulse className="h-12 w-12 text-blue-600" />
                                <div className="absolute inset-0 h-12 w-12 text-blue-600 animate-ping opacity-20">
                                    <HeartPulse className="h-12 w-12" />
                                </div>
                            </div>
                        </div>

                        <motion.h2
                            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Forgot Password?
                        </motion.h2>

                        <motion.p
                            className="text-gray-600 text-base leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {isEmailSent
                                ? "We've sent password reset instructions to your email address."
                                : "No worries! Enter your email address and we'll send you reset instructions."
                            }
                        </motion.p>
                    </div>

                    {/* Form Container */}
                    <motion.div
                        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 sm:p-10 relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        {/* Glassmorphism effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl"></div>

                        {isEmailSent ? (
                            // Success State
                            <div className="relative z-10 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, type: "spring" }}
                                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </motion.div>

                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Check Your Email
                                </h3>

                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    We've sent password reset instructions to <strong>{email}</strong>.
                                    Please check your inbox and follow the instructions to reset your password.
                                </p>

                                <div className="space-y-4">
                                    <motion.button
                                        onClick={() => {
                                            setIsEmailSent(false);
                                            setEmail('');
                                            setError('');
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                                    >
                                        <Mail className="h-5 w-5" />
                                        <span>Send Another Email</span>
                                    </motion.button>

                                    <Link
                                        to="/login"
                                        className="block w-full text-center text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            // Form State
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-6 py-4 rounded-2xl text-sm flex items-center"
                                    >
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        {error}
                                    </motion.div>
                                )}

                                {/* Email Field */}
                                <div className="space-y-3">
                                    <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700">
                                        <Mail className="w-4 h-4 mr-2 text-blue-500" />
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError('');
                                            }}
                                            className={`w-full px-6 py-5 pl-14 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white/50 backdrop-blur-sm text-base ${error
                                                ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                                                : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                                }`}
                                            placeholder="Enter your email address"
                                        />
                                        <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-5 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden text-base"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5" />
                                            <span>Send Reset Instructions</span>
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        )}

                        {/* Footer Links */}
                        {!isEmailSent && (
                            <div className="mt-8 text-center relative z-10">
                                <p className="text-gray-600 text-sm">
                                    Remember your password?{' '}
                                    <Link
                                        to="/login"
                                        className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
