import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, LogIn, AlertCircle, Shield, Zap, Heart, Sparkles, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({
        identifier: '', // This will accept either username or email
        password: '',
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear errors when user starts typing
        if (error) clearError();
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.identifier.trim()) {
            newErrors.identifier = 'Username or email is required';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
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
            await login({
                identifier: formData.identifier.trim(),
                password: formData.password,
                rememberMe: formData.rememberMe
            });
            toast.success('Login successful! Welcome back!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            toast.error(errorMessage);

            // Handle specific field errors from backend
            if (err.response?.data?.errors) {
                const backendErrors = {};
                err.response.data.errors.forEach(error => {
                    backendErrors[error.path] = error.msg;
                });
                setErrors(backendErrors);
            }
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

            {/* Left Side - Login Form (2/3 width) */}
            <div className="w-full lg:w-2/3 flex items-center justify-center px-6 sm:px-8 lg:px-16 xl:px-20 relative z-10">
                {/* Back Button - Enhanced */}
                <motion.button
                    onClick={() => navigate('/')}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-300 group bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm hover:shadow-md z-20 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="font-medium text-sm">Back</span>
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-8 sm:mb-10">
                        <motion.h2
                            className="text-3xl sm:text-4xl font-bold mt-14 text-gray-900 mb-2 sm:mb-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            Welcome Back!
                        </motion.h2>

                    </div>

                    {/* Trust Indicators */}
                    <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <p className="text-sm text-gray-500 mt-12 mb-4">Trusted by healthcare professionals worldwide</p>
                        <div className="flex justify-center mt-7 mb-12 space-x-8 text-gray-400">
                            <motion.div
                                className="flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Shield className="w-5 h-5 text-green-500" />
                                <span className="text-xs font-medium">Secure Login</span>
                            </motion.div>
                            <motion.div
                                className="flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Zap className="w-5 h-5 text-blue-500" />
                                <span className="text-xs font-medium">HIPAA Compliant</span>
                            </motion.div>
                            <motion.div
                                className="flex items-center space-x-2"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Heart className="w-5 h-5 text-red-500" />
                                <span className="text-xs font-medium">24/7 Support</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Enhanced Login Form */}
                    <motion.div
                        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl mb-12 border border-white/60 p-8 sm:p-12 relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        {/* Glassmorphism effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl"></div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
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

                            {/* Username/Email Field */}
                            <div className="space-y-3">
                                <label htmlFor="identifier" className="flex items-center text-sm font-semibold text-gray-700">
                                    <Mail className="w-4 h-4 mr-2 text-blue-500" />
                                    Username or Email
                                </label>
                                <div className="relative">
                                    <input
                                        id="identifier"
                                        name="identifier"
                                        type="text"
                                        required
                                        value={formData.identifier}
                                        onChange={handleChange}
                                        className={`w-full px-6 py-5 pl-14 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white/50 backdrop-blur-sm text-base ${errors.identifier
                                            ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                            }`}
                                        placeholder="Enter username or email"
                                    />
                                    <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    You can login with either your username or email address
                                </p>
                                {errors.identifier && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-600 flex items-center mt-2"
                                    >
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.identifier}
                                    </motion.p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-3">
                                <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-700">
                                    <Lock className="w-4 h-4 mr-2 text-blue-500" />
                                    Password
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
                                        placeholder="Enter your password"
                                    />
                                    <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <button
                                        type="button"
                                        className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
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

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center">
                                    <input
                                        id="rememberMe"
                                        name="rememberMe"
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="rememberMe" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                                        Remember me
                                    </label>
                                </div>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors cursor-pointer"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-5 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden text-base cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-5 w-5" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-10 text-center relative z-10">
                            <p className="text-gray-600 text-base">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 underline-offset-2 hover:underline cursor-pointer relative z-20 inline-block"
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </motion.div>


                </motion.div>
            </div>

            {/* Right Side - Hero Style Medical Image (1/3 width) */}
            <div className="hidden lg:block w-1/3 relative">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="absolute inset-0 h-full w-full"
                >
                    {/* Professional Technology Workspace Background Image */}
                    <div
                        className="h-full w-full bg-cover bg-center bg-no-repeat relative"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=1200&fit=crop&crop=center')`
                        }}
                    >
                        {/* Elegant Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/50 to-cyan-900/60"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                        {/* Professional Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.5, duration: 0.8 }}
                            className="absolute top-8 left-6 right-6 bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                        >
                            <div className="text-center">
                                <HeartPulse className="h-8 w-8 text-white mx-auto mb-3" />
                                <h3 className="text-white font-semibold text-lg mb-2">Advanced Medical AI</h3>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    Secure login to access your personalized healthcare insights
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
