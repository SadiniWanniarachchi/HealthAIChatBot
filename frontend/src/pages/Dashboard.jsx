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
    TrendingUp,
    Clock,
    AlertCircle,
    CheckCircle,
    Plus,
    Menu,
    X,
    ChevronDown,
    Calendar,
    Activity,
    Bot,
    Settings,
    Home,
    Heart,
    Zap,
    Brain
} from 'lucide-react';
import { diagnosisAPI } from '../services/api';
import toast from 'react-hot-toast';

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

    // Current date for display
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today = currentDate.getDate();

    // Mock health data matching the reference design
    const healthMetrics = {
        heartRate: { value: 80, unit: 'beats/min', status: 'normal', change: '+5 million' },
        bloodPressure: { value: '4.75', unit: 'liters', status: 'normal', change: '+2.3%' },
        temperature: { value: 5, unit: 'million/ml', status: 'normal', change: '+1.2%' }
    };

    useEffect(() => {
        fetchRecentDiagnoses();
    }, []);

    const fetchRecentDiagnoses = async () => {
        try {
            setIsLoading(true);
            const response = await diagnosisAPI.getRecentDiagnoses();
            setRecentDiagnoses(response.data.diagnoses || []);
            setStats({
                totalConsultations: response.data.totalConsultations || 0,
                completedDiagnoses: response.data.completedDiagnoses || 0,
                averageRating: response.data.averageRating || 0
            });
        } catch (error) {
            console.error('Error fetching recent diagnoses:', error);
            // Removed toast notification - just set default empty state
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartNewDiagnosis = () => {
        navigate('/diagnosis');
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
                    className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-8"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <HeartPulse className="h-7 w-7 text-white" />
                </motion.div>

                {/* Navigation Icons */}
                <div className="flex flex-col space-y-6 flex-1">
                    <motion.button
                        onClick={() => navigate('/chat')}
                        className="w-12 h-12 bg-white border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 group relative"
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
                        className="w-12 h-12 bg-white border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 group relative"
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
                        className="w-12 h-12 bg-white border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 group relative"
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
                    className="w-12 h-12 bg-white border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 group relative mt-auto"
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

                    <div className="grid grid-cols-12 gap-8">
                        {/* Left Side - Consultation Card */}
                        <div className="col-span-12 lg:col-span-8 space-y-8">

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

                        {/* Right Sidebar */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            {/* Mini Calendar Widget */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200/50"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-md font-bold text-gray-900">{currentMonth}</h4>
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                                        <div key={day} className="text-gray-500 font-semibold py-1">{day}</div>
                                    ))}
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                                        <motion.div
                                            key={date}
                                            className={`py-1 rounded-md cursor-pointer transition-all duration-200 text-xs font-medium ${date === today
                                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm'
                                                : 'hover:bg-gray-100 text-gray-700'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {date}
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="text-center mt-2">
                                    <div className="flex items-center justify-center text-xs">
                                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-1"></div>
                                        <span className="text-gray-600">Today</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Health Measurements Chart */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200/50"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Health Metrics</h3>
                                    <Heart className="h-7 w-7 text-red-500" />
                                </div>
                                <div className="space-y-6">
                                    {/* Blood Pressure */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center relative mr-4">
                                                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 50 50">
                                                    <circle
                                                        cx="25"
                                                        cy="25"
                                                        r="18"
                                                        stroke="#fee2e2"
                                                        strokeWidth="4"
                                                        fill="none"
                                                    />
                                                    <motion.circle
                                                        cx="25"
                                                        cy="25"
                                                        r="18"
                                                        stroke="#ef4444"
                                                        strokeWidth="4"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeDasharray={`${2 * Math.PI * 18}`}
                                                        initial={{ strokeDashoffset: `${2 * Math.PI * 18}` }}
                                                        animate={{ strokeDashoffset: `${2 * Math.PI * 18 * (1 - 0.82)}` }}
                                                        transition={{ duration: 2, delay: 1 }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-red-600">82%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Blood Pressure</h4>
                                                <p className="text-sm text-gray-600">120/80 mmHg</p>
                                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Normal</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BMI */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center relative mr-4">
                                                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 50 50">
                                                    <circle
                                                        cx="25"
                                                        cy="25"
                                                        r="18"
                                                        stroke="#dbeafe"
                                                        strokeWidth="4"
                                                        fill="none"
                                                    />
                                                    <motion.circle
                                                        cx="25"
                                                        cy="25"
                                                        r="18"
                                                        stroke="#3b82f6"
                                                        strokeWidth="4"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeDasharray={`${2 * Math.PI * 18}`}
                                                        initial={{ strokeDashoffset: `${2 * Math.PI * 18}` }}
                                                        animate={{ strokeDashoffset: `${2 * Math.PI * 18 * (1 - 0.75)}` }}
                                                        transition={{ duration: 2, delay: 1.2 }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-blue-600">75%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">BMI Index</h4>
                                                <p className="text-sm text-gray-600">22.5 kg/m²</p>
                                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Healthy</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Heart Rate */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center relative mr-4">
                                                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 50 50">
                                                    <circle
                                                        cx="25"
                                                        cy="25"
                                                        r="18"
                                                        stroke="#d1fae5"
                                                        strokeWidth="4"
                                                        fill="none"
                                                    />
                                                    <motion.circle
                                                        cx="25"
                                                        cy="25"
                                                        r="18"
                                                        stroke="#10b981"
                                                        strokeWidth="4"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeDasharray={`${2 * Math.PI * 18}`}
                                                        initial={{ strokeDashoffset: `${2 * Math.PI * 18}` }}
                                                        animate={{ strokeDashoffset: `${2 * Math.PI * 18 * (1 - 0.88)}` }}
                                                        transition={{ duration: 2, delay: 1.4 }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-emerald-600">88%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Heart Rate</h4>
                                                <p className="text-sm text-gray-600">72 bpm</p>
                                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Excellent</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body Temperature */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 flex items-center justify-center relative mr-4">
                                                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 50 50">
                                                    <circle
                                                        cx="25"
                                                        cy="25"
                                                        r="18"
                                                        stroke="#fed7aa"
                                                        strokeWidth="4"
                                                        fill="none"
                                                    />
                                                    <motion.circle
                                                        cx="25"
                                                        cy="25"
                                                        r="18"
                                                        stroke="#f97316"
                                                        strokeWidth="4"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeDasharray={`${2 * Math.PI * 18}`}
                                                        initial={{ strokeDashoffset: `${2 * Math.PI * 18}` }}
                                                        animate={{ strokeDashoffset: `${2 * Math.PI * 18 * (1 - 0.95)}` }}
                                                        transition={{ duration: 2, delay: 1.6 }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-orange-600">95%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Body Temp</h4>
                                                <p className="text-sm text-gray-600">98.6°F</p>
                                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Normal</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/30">
                                    <div className="flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                        <p className="text-green-700 text-sm font-medium">All vitals within healthy range! 🎉</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
