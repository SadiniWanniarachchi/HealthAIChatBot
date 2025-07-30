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

                        {/* Right Sidebar - Health Profile */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            {/* Health Profile Header */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200/50"
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
                                    <div className="space-y-4">
                                        {/* BMI Section */}
                                        {calculateBMI() && (
                                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-medium text-gray-700">BMI Index</h4>
                                                    <Activity className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="text-2xl font-bold text-blue-600">{calculateBMI()}</span>
                                                    {getBMICategory(calculateBMI()) && (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBMICategory(calculateBMI()).bg} ${getBMICategory(calculateBMI()).color} ring-1 ${getBMICategory(calculateBMI()).ring}`}>
                                                            {getBMICategory(calculateBMI()).category}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">Body Mass Index</p>
                                            </div>
                                        )}

                                        {/* Basic Measurements */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {user.healthProfile.weight && (
                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="text-xs font-medium text-gray-700">Weight</h4>
                                                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-green-600 font-semibold text-xs">kg</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-lg font-bold text-green-600">{user.healthProfile.weight}</span>
                                                    <p className="text-xs text-gray-500">kilograms</p>
                                                </div>
                                            )}

                                            {user.healthProfile.height && (
                                                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 border border-purple-100">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="text-xs font-medium text-gray-700">Height</h4>
                                                        <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-purple-600 font-semibold text-xs">cm</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-lg font-bold text-purple-600">{user.healthProfile.height}</span>
                                                    <p className="text-xs text-gray-500">centimeters</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Vital Health Metrics */}
                                        <div className="space-y-3">
                                            {/* Blood Pressure */}
                                            {(user.healthProfile.bloodPressureSystolic || user.healthProfile.bloodPressureDiastolic) && (
                                                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-medium text-gray-700">Blood Pressure</h4>
                                                        <Heart className="h-4 w-4 text-red-500" />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xl font-bold text-red-600">
                                                            {user.healthProfile.bloodPressureSystolic || '---'}/{user.healthProfile.bloodPressureDiastolic || '---'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">mmHg</span>
                                                    </div>
                                                    <div className="mt-2">
                                                        {user.healthProfile.bloodPressureSystolic && user.healthProfile.bloodPressureDiastolic && (
                                                            <span className={`text-xs px-2 py-1 rounded-full ${user.healthProfile.bloodPressureSystolic <= 120 && user.healthProfile.bloodPressureDiastolic <= 80
                                                                ? 'text-green-600 bg-green-50'
                                                                : user.healthProfile.bloodPressureSystolic <= 140 && user.healthProfile.bloodPressureDiastolic <= 90
                                                                    ? 'text-yellow-600 bg-yellow-50'
                                                                    : 'text-red-600 bg-red-50'
                                                                }`}>
                                                                {user.healthProfile.bloodPressureSystolic <= 120 && user.healthProfile.bloodPressureDiastolic <= 80
                                                                    ? 'Normal'
                                                                    : user.healthProfile.bloodPressureSystolic <= 140 && user.healthProfile.bloodPressureDiastolic <= 90
                                                                        ? 'Elevated'
                                                                        : 'High'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Cholesterol */}
                                            {user.healthProfile.cholesterolLevel && (
                                                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-medium text-gray-700">Cholesterol</h4>
                                                        <Activity className="h-4 w-4 text-yellow-500" />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xl font-bold text-yellow-600">{user.healthProfile.cholesterolLevel}</span>
                                                        <span className="text-xs text-gray-500">mg/dL</span>
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${user.healthProfile.cholesterolLevel < 200
                                                            ? 'text-green-600 bg-green-50'
                                                            : user.healthProfile.cholesterolLevel < 240
                                                                ? 'text-yellow-600 bg-yellow-50'
                                                                : 'text-red-600 bg-red-50'
                                                            }`}>
                                                            {user.healthProfile.cholesterolLevel < 200
                                                                ? 'Desirable'
                                                                : user.healthProfile.cholesterolLevel < 240
                                                                    ? 'Borderline'
                                                                    : 'High'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Diabetes Status */}
                                            {user.healthProfile.diabetesStatus && (
                                                <div className={`rounded-xl p-4 border ${user.healthProfile.diabetesStatus === 'No Diabetes'
                                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
                                                    : user.healthProfile.diabetesStatus === 'Pre-diabetic'
                                                        ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100'
                                                        : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'
                                                    }`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-medium text-gray-700">Diabetes</h4>
                                                        <Shield className={`h-4 w-4 ${user.healthProfile.diabetesStatus === 'No Diabetes'
                                                            ? 'text-green-500'
                                                            : user.healthProfile.diabetesStatus === 'Pre-diabetic'
                                                                ? 'text-orange-500'
                                                                : 'text-red-500'
                                                            }`} />
                                                    </div>
                                                    <span className={`text-sm font-bold ${user.healthProfile.diabetesStatus === 'No Diabetes'
                                                        ? 'text-green-600'
                                                        : user.healthProfile.diabetesStatus === 'Pre-diabetic'
                                                            ? 'text-orange-600'
                                                            : 'text-red-600'
                                                        }`}>
                                                        {user.healthProfile.diabetesStatus}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Blood Group */}
                                            {user.healthProfile.bloodGroup && (
                                                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-medium text-gray-700">Blood Type</h4>
                                                        <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-red-600 text-sm">🩸</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-xl font-bold text-red-600">{user.healthProfile.bloodGroup}</span>
                                                    <p className="text-xs text-gray-500">blood group</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Additional Info */}
                                        {(calculateAge() || user.healthProfile.emergencyContact || user.healthProfile.allergies || user.healthProfile.chronicConditions) && (
                                            <div className="pt-4 border-t border-gray-100 space-y-2">
                                                {calculateAge() && (
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">Age: <span className="font-medium">{calculateAge()} years</span></span>
                                                    </div>
                                                )}

                                                {user.healthProfile.emergencyContact && (
                                                    <div className="flex items-center space-x-2">
                                                        <AlertCircle className="h-4 w-4 text-orange-400" />
                                                        <span className="text-sm text-gray-600">Emergency: <span className="font-medium">{user.healthProfile.emergencyContact}</span></span>
                                                    </div>
                                                )}

                                                {(user.healthProfile.allergies || user.healthProfile.chronicConditions) && (
                                                    <div className="flex items-center space-x-2">
                                                        <Settings className="h-4 w-4 text-yellow-400" />
                                                        <span className="text-sm text-gray-600">Medical conditions noted</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
