import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft, Shield, Users, Clock, User, Mail, Lock, UserPlus, AlertCircle, Sparkles, Zap, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [errors, setErrors] = useState({});

    const { register, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Check password strength
        if (name === 'password') {
            checkPasswordStrength(value);
        }

        // Clear errors when user starts typing
        if (error) clearError();
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 0:
            case 1:
                return { text: 'Weak', color: 'text-red-500' };
            case 2:
            case 3:
                return { text: 'Medium', color: 'text-yellow-500' };
            case 4:
            case 5:
                return { text: 'Strong', color: 'text-green-500' };
            default:
                return { text: '', color: '' };
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (passwordStrength < 3) {
            newErrors.password = 'Password is too weak. Include uppercase, lowercase, and numbers';
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
            const registerData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
            };

            await register(registerData);
            toast.success('Registration successful! Please login with your credentials.');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            toast.error(errorMessage);

            // Handle specific field errors from backend
            if (error.response?.data?.errors) {
                const backendErrors = {};
                error.response.data.errors.forEach(err => {
                    backendErrors[err.path] = err.msg;
                });
                setErrors(backendErrors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const strengthData = getPasswordStrengthText();

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
                    className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl"
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

            {/* Left Side - Registration Form (2/3 width) */}
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
                    className="w-full max-w-2xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mt-18 mb-8">
                        <motion.h2
                            className="text-4xl font-bold text-gray-900 mb-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            Join Our Community
                        </motion.h2>
                        <motion.p
                            className="text-gray-600 text-medium"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            Create your account to access personalized health insights
                        </motion.p>
                    </div>



                    {/* Enhanced Registration Form */}
                    <motion.div
                        className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10 relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        {/* Glassmorphism effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl"></div>

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

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label htmlFor="firstName" className="flex items-center text-sm font-semibold text-gray-700">
                                        <User className="w-4 h-4 mr-2 text-blue-500" />
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className={`w-full px-6 py-5 pl-14 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white/50 backdrop-blur-sm text-base ${errors.firstName
                                                ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                                                : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                                }`}
                                            placeholder="Enter first name"
                                        />
                                        <User className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                    {errors.firstName && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 flex items-center mt-2"
                                        >
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.firstName}
                                        </motion.p>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="lastName" className="flex items-center text-sm font-semibold text-gray-700">
                                        <User className="w-4 h-4 mr-2 text-blue-500" />
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className={`w-full px-6 py-5 pl-14 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white/50 backdrop-blur-sm text-base ${errors.lastName
                                                ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                                                : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                                }`}
                                            placeholder="Enter last name"
                                        />
                                        <User className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                    {errors.lastName && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 flex items-center mt-2"
                                        >
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.lastName}
                                        </motion.p>
                                    )}
                                </div>
                            </div>

                            {/* Username and Email Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label htmlFor="username" className="flex items-center text-sm font-semibold text-gray-700">
                                        <UserPlus className="w-4 h-4 mr-2 text-blue-500" />
                                        Username
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={`w-full px-6 py-5 pl-14 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white/50 backdrop-blur-sm text-base ${errors.username
                                                ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                                                : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                                }`}
                                            placeholder="Choose username"
                                        />
                                        <UserPlus className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                    {errors.username && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 flex items-center mt-2"
                                        >
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.username}
                                        </motion.p>
                                    )}
                                </div>
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
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-6 py-5 pl-14 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white/50 backdrop-blur-sm text-base ${errors.email
                                                ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                                                : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300'
                                                }`}
                                            placeholder="Enter your email"
                                        />
                                        <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                    {errors.email && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 flex items-center mt-2"
                                        >
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.email}
                                        </motion.p>
                                    )}
                                </div>
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            placeholder="Create password"
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
                                    {formData.password && (
                                        <motion.div
                                            className="mt-3"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength <= 2 ? 'bg-red-500' :
                                                            passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-indigo-500'
                                                            }`}
                                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-sm font-medium ${strengthData.color}`}>
                                                    {strengthData.text}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="confirmPassword" className="flex items-center text-sm font-semibold text-gray-700">
                                        <Lock className="w-4 h-4 mr-2 text-blue-500" />
                                        Confirm Password
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
                                            placeholder="Confirm password"
                                        />
                                        <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <button
                                            type="button"
                                            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <motion.div
                                            className="flex items-center text-blue-600 mt-2"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            <span className="text-sm font-medium">Passwords match</span>
                                        </motion.div>
                                    )}
                                </div>
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
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-5 w-5" />
                                        <span>Create Account</span>
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-10 text-center relative z-10">
                            <p className="text-gray-600 text-base">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 underline-offset-2 hover:underline cursor-pointer relative z-20 inline-block"
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>

                        {/* Terms and Privacy */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">Privacy Policy</a>
                            </p>
                        </div>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        className="mt-10 grid grid-cols-3 gap-4 mb-12 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <motion.div
                            className="flex flex-col items-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Shield className="h-8 w-8 text-blue-600 mb-2" />
                            <span className="text-sm text-gray-600 font-medium">Secure & Private</span>
                        </motion.div>
                        <motion.div
                            className="flex flex-col items-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Users className="h-8 w-8 text-purple-600 mb-2" />
                            <span className="text-sm text-gray-600 font-medium">100K+ Users</span>
                        </motion.div>
                        <motion.div
                            className="flex flex-col items-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Clock className="h-8 w-8 text-cyan-600 mb-2" />
                            <span className="text-sm text-gray-600 font-medium">24/7 Support</span>
                        </motion.div>
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
                    {/* Professional Business Meeting Background Image */}
                    <div
                        className="h-full w-full bg-cover bg-center bg-no-repeat relative"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=1200&fit=crop&crop=center')`
                        }}
                    >
                        {/* Elegant Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/70 via-blue-800/50 to-blue-900/60"></div>
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
                                <h3 className="text-white font-semibold text-lg mb-2">Join Our Community</h3>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    Start your journey with AI-powered healthcare insights
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
