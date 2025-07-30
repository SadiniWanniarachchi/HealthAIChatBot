import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isTokenValid, setIsTokenValid] = useState(true);
    const [isPasswordReset, setIsPasswordReset] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setIsTokenValid(false);
            toast.error('Invalid or missing reset token');
        }
    }, [token]);

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            minLength: password.length >= minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChar,
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers
        };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else {
            const passwordValidation = validatePassword(formData.password);
            if (!passwordValidation.isValid) {
                newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and numbers';
            }
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors below');
            return;
        }

        setIsLoading(true);

        try {
            await authAPI.resetPassword({
                token,
                password: formData.password
            });

            setIsPasswordReset(true);
            toast.success('Password reset successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';

            if (err.response?.status === 400 && errorMessage.includes('token')) {
                setIsTokenValid(false);
            }

            toast.error(errorMessage);
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const passwordValidation = validatePassword(formData.password);

    if (!isTokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-6">
                <div className="w-full max-w-md mx-auto text-center">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
                        <p className="text-gray-600 mb-6">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
                        >
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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
                            Reset Password
                        </motion.h2>

                        <motion.p
                            className="text-gray-600 text-base leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {isPasswordReset
                                ? "Your password has been successfully reset!"
                                : "Enter your new password below to complete the reset process."
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

                        {isPasswordReset ? (
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
                                    Password Reset Successfully!
                                </h3>

                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Your password has been updated. You can now sign in with your new password.
                                </p>

                                <motion.button
                                    onClick={() => navigate('/login')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                                >
                                    <Shield className="h-5 w-5" />
                                    <span>Continue to Login</span>
                                </motion.button>
                            </div>
                        ) : (
                            // Form State
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                {errors.general && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-6 py-4 rounded-2xl text-sm flex items-center"
                                    >
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        {errors.general}
                                    </motion.div>
                                )}

                                {/* New Password Field */}
                                <div className="space-y-3">
                                    <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-700">
                                        <Lock className="w-4 h-4 mr-2 text-blue-500" />
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full px-6 py-5 pl-14 pr-14 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white/50 backdrop-blur-sm text-base ${errors.password
                                                ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                                                : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                                }`}
                                            placeholder="Enter your new password"
                                        />
                                        <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <button
                                            type="button"
                                            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {formData.password && (
                                        <div className="mt-3 space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-600">Password strength:</span>
                                                <span className={`font-medium ${passwordValidation.isValid ? 'text-green-600' : 'text-orange-600'
                                                    }`}>
                                                    {passwordValidation.isValid ? 'Strong' : 'Weak'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    8+ characters
                                                </div>
                                                <div className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Uppercase letter
                                                </div>
                                                <div className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Lowercase letter
                                                </div>
                                                <div className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-400'}`}>
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Number
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {errors.password && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 flex items-center mt-2"
                                        >
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.password}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-3">
                                    <label htmlFor="confirmPassword" className="flex items-center text-sm font-semibold text-gray-700">
                                        <Lock className="w-4 h-4 mr-2 text-blue-500" />
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full px-6 py-5 pl-14 pr-14 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white/50 backdrop-blur-sm text-base ${errors.confirmPassword
                                                ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                                                : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                                }`}
                                            placeholder="Confirm your new password"
                                        />
                                        <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <button
                                            type="button"
                                            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 flex items-center mt-2"
                                        >
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.confirmPassword}
                                        </motion.p>
                                    )}
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
                                            <span>Resetting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="h-5 w-5" />
                                            <span>Reset Password</span>
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
