import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    HeartPulse,
    MessageCircle,
    History,
    User,
    LogOut,
    AlertCircle,
    Calendar,
    Activity,
    Bot,
    Settings,
    Heart,
    Shield,
    Brain
} from 'lucide-react';
import { diagnosisAPI } from '../services/api';
import toast from 'react-hot-toast';

// Modern Circular Progress Component with Enhanced Design
const CircularProgress = ({ percentage, size = 120, strokeWidth = 12, color = 'blue', children, label, showPercentage = true }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colorClasses = {
        blue: {
            stroke: 'stroke-blue-500',
            glow: '',
            gradient: 'from-blue-400 to-blue-600',
            bg: 'bg-blue-50'
        },
        green: {
            stroke: 'stroke-green-500',
            glow: '',
            gradient: 'from-green-400 to-green-600',
            bg: 'bg-green-50'
        },
        red: {
            stroke: 'stroke-red-500',
            glow: '',
            gradient: 'from-red-400 to-red-600',
            bg: 'bg-red-50'
        },
        yellow: {
            stroke: 'stroke-yellow-500',
            glow: '',
            gradient: 'from-yellow-400 to-yellow-600',
            bg: 'bg-yellow-50'
        },
        purple: {
            stroke: 'stroke-purple-500',
            glow: '',
            gradient: 'from-purple-400 to-purple-600',
            bg: 'bg-purple-50'
        },
        orange: {
            stroke: 'stroke-orange-500',
            glow: '',
            gradient: 'from-orange-400 to-orange-600',
            bg: 'bg-orange-50'
        },
        gray: {
            stroke: 'stroke-gray-400',
            glow: '',
            gradient: 'from-gray-300 to-gray-500',
            bg: 'bg-gray-50'
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Gradient definitions */}
                <svg width="0" height="0">
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" className={`stop-${color}-400`} />
                            <stop offset="100%" className={`stop-${color}-600`} />
                        </linearGradient>
                    </defs>
                </svg>

                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="text-gray-200"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${colorClasses[color].stroke} transition-all duration-1500 ease-out`}
                    />
                </svg>

                {/* Center content with enhanced styling */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        {children}
                        {showPercentage && (
                            <div className={`text-xs font-semibold mt-1 ${colorClasses[color].stroke.replace('stroke-', 'text-')}`}>
                                {Math.round(percentage)}%
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {label && (
                <span className="text-sm font-medium text-gray-700 mt-3 text-center">{label}</span>
            )}
        </div>
    );
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [recentDiagnoses, setRecentDiagnoses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        totalConsultations: 0,
        completedDiagnoses: 0,
        averageRating: 0
    });

    // Health Profile Functions
    const calculateBMI = () => {
        const weight = user?.healthProfile?.weight;
        const height = user?.healthProfile?.height;
        if (weight && height) {
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            return bmi.toFixed(1);
        }
        return null;
    };

    const getBMICategory = (bmi) => {
        if (!bmi) return null;
        const bmiValue = parseFloat(bmi);
        if (bmiValue < 18.5) return { category: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-100', ring: 'ring-blue-200' };
        if (bmiValue < 25) return { category: 'Normal', color: 'text-green-600', bg: 'bg-green-100', ring: 'ring-green-200' };
        if (bmiValue < 30) return { category: 'Overweight', color: 'text-yellow-600', bg: 'bg-yellow-100', ring: 'ring-yellow-200' };
        return { category: 'Obese', color: 'text-red-600', bg: 'bg-red-100', ring: 'ring-red-200' };
    };

    // Health score calculation functions
    const getBMIProgress = () => {
        const bmi = calculateBMI();
        if (!bmi) return { percentage: 0, color: 'gray', status: 'No Data' };

        const bmiValue = parseFloat(bmi);
        if (bmiValue < 18.5) return { percentage: 60, color: 'blue', status: 'Underweight' };
        if (bmiValue < 25) return { percentage: 100, color: 'green', status: 'Normal' };
        if (bmiValue < 30) return { percentage: 70, color: 'yellow', status: 'Overweight' };
        return { percentage: 40, color: 'red', status: 'Obese' };
    };

    const getBloodPressureProgress = () => {
        const systolic = user?.healthProfile?.bloodPressureSystolic;
        const diastolic = user?.healthProfile?.bloodPressureDiastolic;

        if (!systolic || !diastolic) return { percentage: 0, color: 'gray', status: 'No Data' };

        if (systolic <= 120 && diastolic <= 80) return { percentage: 100, color: 'green', status: 'Normal' };
        if (systolic <= 140 && diastolic <= 90) return { percentage: 70, color: 'yellow', status: 'Elevated' };
        return { percentage: 40, color: 'red', status: 'High' };
    };

    const getCholesterolProgress = () => {
        const cholesterol = user?.healthProfile?.cholesterolLevel;
        if (!cholesterol) return { percentage: 0, color: 'gray', status: 'No Data' };

        if (cholesterol < 200) return { percentage: 100, color: 'green', status: 'Desirable' };
        if (cholesterol < 240) return { percentage: 60, color: 'yellow', status: 'Borderline' };
        return { percentage: 30, color: 'red', status: 'High' };
    };

    const getDiabetesProgress = () => {
        const diabetes = user?.healthProfile?.diabetesStatus;
        if (!diabetes) return { percentage: 0, color: 'gray', status: 'No Data' };

        if (diabetes === 'No Diabetes') return { percentage: 100, color: 'green', status: 'Healthy' };
        if (diabetes === 'Pre-diabetic') return { percentage: 60, color: 'orange', status: 'Pre-diabetic' };
        return { percentage: 30, color: 'red', status: 'Diabetic' };
    };

    const calculateAge = () => {
        if (user?.healthProfile?.dateOfBirth) {
            const birthDate = new Date(user.healthProfile.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }
        return null;
    };

    useEffect(() => {
        fetchRecentDiagnoses();
    }, []);

    const fetchRecentDiagnoses = async () => {
        try {
            setIsLoading(true);
            // Use the existing diagnosis history endpoint to get recent diagnoses
            const response = await diagnosisAPI.getDiagnosisHistory(1, 5);
            setRecentDiagnoses(response.diagnoses || []);
            setStats({
                totalConsultations: response.pagination?.total || 0,
                completedDiagnoses: response.diagnoses?.filter(d => d.status === 'completed').length || 0,
                averageRating: 4.5 // Mock rating for now
            });
        } catch (error) {
            console.error('Error fetching recent diagnoses:', error);
            // Set default empty state on error
            setRecentDiagnoses([]);
            setStats({
                totalConsultations: 0,
                completedDiagnoses: 0,
                averageRating: 0
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartNewDiagnosis = () => {
        navigate('/chat');
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = () => {
            setIsMobileMenuOpen(false);
        };

        if (isMobileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex">
            {/* Vertical Sidebar Navigation */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="w-20 bg-white/90 backdrop-blur-xl shadow-xl border-r border-gray-200/50 flex flex-col items-center py-6 sticky top-0 h-screen z-50"
            >
                {/* Logo */}
                <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-8 cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <HeartPulse className="h-7 w-7 text-white" />
                </motion.div>

                {/* Navigation Icons */}
                <div className="flex flex-col space-y-6 flex-1">
                    <motion.button
                        onClick={() => navigate('/chat')}
                        className="w-12 h-12 bg-white border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 group relative cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Start Chat with AI"
                    >
                        <Bot className="h-6 w-6" />
                        <div className="absolute left-16 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            Start Chat with AI
                        </div>
                    </motion.button>

                    <motion.button
                        onClick={() => navigate('/profile')}
                        className="w-12 h-12 bg-white border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 group relative cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Profile"
                    >
                        <User className="h-6 w-6" />
                        <div className="absolute left-16 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            Profile
                        </div>
                    </motion.button>

                    <motion.button
                        onClick={() => navigate('/history')}
                        className="w-12 h-12 bg-white border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 group relative cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Chat History"
                    >
                        <History className="h-6 w-6" />
                        <div className="absolute left-16 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            Chat History
                        </div>
                    </motion.button>
                </div>

                {/* Logout Button at Bottom */}
                <motion.button
                    onClick={handleLogout}
                    className="w-12 h-12 bg-white border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 group relative mt-auto cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Logout"
                >
                    <LogOut className="h-6 w-6" />
                    <div className="absolute left-16 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        Logout
                    </div>
                </motion.button>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                {/* Top Header with Welcome Message */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-40 px-8 py-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                Hello, {user?.firstName || 'User'}! 👋
                            </h1>
                            <p className="text-gray-600 font-medium">Welcome back to your health dashboard</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Main Dashboard Content */}
                <div className="p-8">
                    {/* Hero Section - Health Check Reminder */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-3xl p-8 mb-8 text-white overflow-hidden shadow-2xl"
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/5 rounded-full"></div>

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex-1 max-w-2xl">
                                <motion.div
                                    className="text-sm font-semibold text-blue-100 mb-3 tracking-wider uppercase"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                    HealthCare
                                </motion.div>
                                <motion.h2
                                    className="text-3xl md:text-4xl font-bold mb-6 leading-tight"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    Have You Had a<br />
                                    Routine Health Check<br />
                                    this Month?
                                </motion.h2>
                                <motion.div
                                    className="flex flex-col sm:flex-row gap-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >


                                </motion.div>
                            </div>

                            {/* Hero Image */}
                            <motion.div
                                className="hidden lg:block flex-shrink-0 ml-8"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <div className="relative">
                                    <img
                                        src="/image.jpg"
                                        alt="Healthcare Professional"
                                        className="w-72 h-72 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
                                    />
                                    {/* Decorative elements */}
                                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-white/30 rounded-full animate-pulse"></div>
                                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/20 rounded-full animate-pulse delay-300"></div>
                                    <div className="absolute top-1/2 -right-6 w-6 h-6 bg-cyan-300/40 rounded-full animate-bounce"></div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Incomplete Health Profile Prompt - Show only if no health data */}
                    {(!user?.healthProfile || (!user.healthProfile.weight && !user.healthProfile.height && !user.healthProfile.bloodGroup && !user.healthProfile.bloodPressureSystolic && !user.healthProfile.diabetesStatus && !user.healthProfile.cholesterolLevel)) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 mb-8 border border-orange-200"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                                        <Heart className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-orange-900 mb-1">Complete Your Health Profile</h3>
                                        <p className="text-sm text-orange-700">Add your health information to get personalized insights and better consultation experiences.</p>
                                    </div>
                                </div>
                                <Link
                                    to="/profile"
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
                                >
                                    Add Health Info
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-12 gap-8">
                        {/* Left Side - Main Content */}
                        <div className="col-span-12 lg:col-span-6 space-y-8">

                            {/* Start Consultation Card - Full Width */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-200/30 shadow-xl relative overflow-hidden mb-8"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-2xl"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                                            <Bot className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">AI Health Assistant</h3>
                                            <p className="text-gray-600 text-sm">Get instant medical consultation</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-6 leading-relaxed">
                                        Start a conversation with our AI-powered medical assistant for personalized health insights and medical guidance.
                                    </p>
                                    <motion.button
                                        onClick={() => navigate('/chat')}
                                        className="w-full max-w-md bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <MessageCircle className="mr-3 h-5 w-5" />
                                        Start Consultation
                                    </motion.button>
                                </div>
                            </motion.div>

                            {/* Health Knowledge Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200/50 mb-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">Daily Health Tips</h3>
                                    <Brain className="h-7 w-7 text-emerald-600" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Hydration Tip */}
                                    <motion.div
                                        className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200/30"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl mr-4">
                                                💧
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">Stay Hydrated</h4>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            Drink at least 8 glasses of water daily. Start your morning with a glass of water to kickstart your metabolism and stay hydrated throughout the day.
                                        </p>
                                    </motion.div>

                                    {/* Exercise Tip */}
                                    <motion.div
                                        className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200/30"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-2xl mr-4">
                                                🏃‍♂️
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">Move More</h4>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            Take a 10-minute walk after meals to improve digestion and blood sugar levels. Even small movements can make a big difference in your health.
                                        </p>
                                    </motion.div>

                                    {/* Sleep Tip */}
                                    <motion.div
                                        className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200/30"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-2xl mr-4">
                                                😴
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">Quality Sleep</h4>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            Aim for 7-9 hours of sleep nightly. Create a bedtime routine and avoid screens 1 hour before sleep for better rest and recovery.
                                        </p>
                                    </motion.div>

                                    {/* Nutrition Tip */}
                                    <motion.div
                                        className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200/30"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-2xl mr-4">
                                                🥗
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">Eat Mindfully</h4>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            Include colorful fruits and vegetables in every meal. Chew slowly and listen to your body's hunger cues for better digestion.
                                        </p>
                                    </motion.div>
                                </div>
                            </motion.div>

                        </div>

                        {/* Right Sidebar - Health Profile */}
                        <div className="col-span-12 lg:col-span-6 space-y-6">
                            {/* Health Profile Header */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200/50"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mr-3">
                                            <Heart className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Health Profile</h3>
                                            <p className="text-sm text-gray-500">Real-time health data</p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                                    >
                                        Update
                                    </Link>
                                </div>

                                {/* Show health profile data or prompt to complete */}
                                {user?.healthProfile && (user.healthProfile.weight || user.healthProfile.height || user.healthProfile.bloodGroup || user.healthProfile.bloodPressureSystolic || user.healthProfile.diabetesStatus || user.healthProfile.cholesterolLevel) ? (
                                    <div className="space-y-8">
                                        {/* Health Metrics with Clean Circular Charts - 2 per row */}
                                        <div className="grid grid-cols-2 gap-6">
                                            {/* BMI Chart */}
                                            {calculateBMI() && (
                                                <motion.div
                                                    className="bg-white rounded-2xl p-6 border border-gray-200"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.6, delay: 0.1 }}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <CircularProgress
                                                            percentage={getBMIProgress().percentage}
                                                            size={120}
                                                            strokeWidth={10}
                                                            color={getBMIProgress().color}
                                                            label="BMI Index"
                                                            showPercentage={false}
                                                        >
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-gray-800 mb-1">{calculateBMI()}</div>
                                                                <div className="text-xs font-medium text-gray-500">{getBMIProgress().status}</div>
                                                            </div>
                                                        </CircularProgress>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Blood Pressure Chart */}
                                            {user.healthProfile.bloodPressureSystolic && (
                                                <motion.div
                                                    className="bg-white rounded-2xl p-6 border border-gray-200"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.6, delay: 0.2 }}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <CircularProgress
                                                            percentage={getBloodPressureProgress().percentage}
                                                            size={120}
                                                            strokeWidth={10}
                                                            color={getBloodPressureProgress().color}
                                                            label="Blood Pressure"
                                                            showPercentage={false}
                                                        >
                                                            <div className="text-center">
                                                                <div className="text-lg font-bold text-gray-800 mb-1">
                                                                    {user.healthProfile.bloodPressureSystolic}/{user.healthProfile.bloodPressureDiastolic || '---'}
                                                                </div>
                                                                <div className="text-xs font-medium text-gray-500">{getBloodPressureProgress().status}</div>
                                                            </div>
                                                        </CircularProgress>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Cholesterol Chart */}
                                            {user.healthProfile.cholesterolLevel && (
                                                <motion.div
                                                    className="bg-white rounded-2xl p-6 border border-gray-200"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.6, delay: 0.3 }}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <CircularProgress
                                                            percentage={getCholesterolProgress().percentage}
                                                            size={120}
                                                            strokeWidth={10}
                                                            color={getCholesterolProgress().color}
                                                            label="Cholesterol"
                                                            showPercentage={false}
                                                        >
                                                            <div className="text-center">
                                                                <div className="text-xl font-bold text-gray-800 mb-1">{user.healthProfile.cholesterolLevel}</div>
                                                                <div className="text-xs text-gray-500">mg/dL</div>
                                                                <div className="text-xs font-medium text-gray-500 mt-1">{getCholesterolProgress().status}</div>
                                                            </div>
                                                        </CircularProgress>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Diabetes Status Chart */}
                                            {user.healthProfile.diabetesStatus && (
                                                <motion.div
                                                    className="bg-white rounded-2xl p-6 border border-gray-200"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.6, delay: 0.4 }}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <CircularProgress
                                                            percentage={getDiabetesProgress().percentage}
                                                            size={120}
                                                            strokeWidth={10}
                                                            color={getDiabetesProgress().color}
                                                            label="Diabetes Status"
                                                            showPercentage={false}
                                                        >
                                                            <div className="text-center">
                                                                <div className="text-lg font-bold text-gray-800 mb-1">
                                                                    {user.healthProfile.diabetesStatus === 'No Diabetes' ? 'Healthy' :
                                                                        user.healthProfile.diabetesStatus === 'Pre-diabetic' ? 'Pre-Diabetic' : 'Diabetic'}
                                                                </div>
                                                                <div className="text-xs font-medium text-gray-500">{getDiabetesProgress().status}</div>
                                                            </div>
                                                        </CircularProgress>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Physical Measurements - Simple List Layout */}
                                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                            <h4 className="text-xl font-bold text-gray-800 mb-6">Physical Measurements</h4>
                                            <div className="space-y-4">
                                                {user.healthProfile.weight && (
                                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                        <span className="text-gray-600 font-medium">Weight</span>
                                                        <span className="text-gray-900 font-semibold">{user.healthProfile.weight} kg</span>
                                                    </div>
                                                )}

                                                {user.healthProfile.height && (
                                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                        <span className="text-gray-600 font-medium">Height</span>
                                                        <span className="text-gray-900 font-semibold">{user.healthProfile.height} cm</span>
                                                    </div>
                                                )}

                                                {user.healthProfile.bloodGroup && (
                                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                        <span className="text-gray-600 font-medium">Blood Type</span>
                                                        <span className="text-gray-900 font-semibold">{user.healthProfile.bloodGroup}</span>
                                                    </div>
                                                )}

                                                {calculateAge() && (
                                                    <div className="flex justify-between items-center py-3">
                                                        <span className="text-gray-600 font-medium">Age</span>
                                                        <span className="text-gray-900 font-semibold">{calculateAge()} years</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Heart className="h-8 w-8 text-orange-600" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h4>
                                        <p className="text-sm text-gray-600 mb-4">Add your health information for personalized insights</p>
                                        <Link
                                            to="/profile"
                                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                                        >
                                            Add Health Info
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
