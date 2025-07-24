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
    X
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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await diagnosisAPI.getDiagnosisHistory(1, 5);
            setRecentDiagnoses(response.diagnoses || []);

            // Calculate stats
            const totalConsultations = response.pagination?.total || 0;
            const completedDiagnoses = response.diagnoses?.filter(d => d.status === 'completed').length || 0;

            setStats({
                totalConsultations,
                completedDiagnoses,
                averageRating: 4.8 // Placeholder
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    const handleStartNewDiagnosis = () => {
        navigate('/chat');
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'emergency':
                return 'text-red-600 bg-red-100';
            case 'high':
                return 'text-orange-600 bg-orange-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'low':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
            {/* Modern Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                        rotate: [360, 180, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"
                />
            </div>
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90"></div>
                <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex justify-between items-center h-16">
                        <motion.div
                            className="flex items-center min-w-0"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                                <HeartPulse className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
                            </div>
                            <span className="ml-3 text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent truncate">
                                AI Health Assistant
                            </span>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-6">
                            <motion.div
                                className="text-sm text-gray-700 whitespace-nowrap px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                Welcome back, <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user?.firstName}</span>
                            </motion.div>
                            <div className="relative group">
                                <motion.button
                                    className="flex items-center text-gray-500 hover:text-white p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <User className="h-5 w-5" />
                                </motion.button>
                                <motion.div
                                    className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-white/20"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 0, y: -10 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                >
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 mx-2 rounded-xl"
                                    >
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-3" />
                                            Profile Settings
                                        </div>
                                    </Link>
                                    <Link
                                        to="/history"
                                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 mx-2 rounded-xl"
                                    >
                                        <div className="flex items-center">
                                            <History className="h-4 w-4 mr-3" />
                                            Diagnosis History
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 mx-2 rounded-xl"
                                    >
                                        <div className="flex items-center">
                                            <LogOut className="h-4 w-4 mr-3" />
                                            Sign Out
                                        </div>
                                    </button>
                                </motion.div>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center space-x-3">
                            <div className="text-xs text-gray-700 truncate max-w-20 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100">
                                {user?.firstName}
                            </div>
                            <motion.button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-gray-500 hover:text-white p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </motion.button>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="md:hidden border-t border-white/20 bg-white/90 backdrop-blur-xl py-2 relative z-10"
                        >
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                <Link
                                    to="/profile"
                                    className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 mx-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <User className="h-5 w-5 mr-3" />
                                    Profile Settings
                                </Link>
                                <Link
                                    to="/history"
                                    className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 mx-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <History className="h-5 w-5 mr-3" />
                                    Diagnosis History
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center w-full text-left text-gray-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 mx-2"
                                >
                                    <LogOut className="h-5 w-5 mr-3" />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 lg:mb-12 text-center lg:text-left"
                >
                    <motion.h1
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight mb-4"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName}! ✨
                    </motion.h1>
                    <motion.p
                        className="text-gray-600 mt-3 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        How are you feeling today? I'm here to help with any health concerns and provide personalized insights.
                    </motion.p>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 lg:mb-12"
                >
                    <motion.button
                        onClick={handleStartNewDiagnosis}
                        className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group w-full relative overflow-hidden"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <div className="flex items-center justify-start relative z-10">
                            <div className="p-3 bg-white/20 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                                <Plus className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                            </div>
                            <div className="text-left min-w-0">
                                <h3 className="font-bold text-base sm:text-lg mb-1">New Diagnosis</h3>
                                <p className="text-blue-100 text-sm sm:text-base truncate">Start symptom analysis</p>
                            </div>
                        </div>
                    </motion.button>

                    <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            to="/history"
                            className="bg-white/80 backdrop-blur-xl hover:bg-white/90 border border-white/40 p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group w-full block relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-blue-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <div className="flex items-center justify-start relative z-10">
                                <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100 rounded-xl mr-4 group-hover:scale-110 transition-all duration-300">
                                    <History className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                                </div>
                                <div className="text-left min-w-0">
                                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">History</h3>
                                    <p className="text-gray-600 text-sm sm:text-base truncate">View past consultations</p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            to="/profile"
                            className="bg-white/80 backdrop-blur-xl hover:bg-white/90 border border-white/40 p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group w-full block relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-indigo-50/50 to-indigo-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <div className="flex items-center justify-start relative z-10">
                                <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-indigo-100 group-hover:to-purple-100 rounded-xl mr-4 group-hover:scale-110 transition-all duration-300">
                                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                                </div>
                                <div className="text-left min-w-0">
                                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">Profile</h3>
                                    <p className="text-gray-600 text-sm sm:text-base truncate">Manage your account</p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    <motion.button
                        className="bg-white/80 backdrop-blur-xl hover:bg-white/90 border border-white/40 p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group w-full relative overflow-hidden"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/0 via-cyan-50/50 to-cyan-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <div className="flex items-center justify-start relative z-10">
                            <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-cyan-100 group-hover:to-teal-100 rounded-xl mr-4 group-hover:scale-110 transition-all duration-300">
                                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 group-hover:text-cyan-600 transition-colors flex-shrink-0" />
                            </div>
                            <div className="text-left min-w-0">
                                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">Support</h3>
                                <p className="text-gray-600 text-sm sm:text-base truncate">Get help & support</p>
                            </div>
                        </div>
                    </motion.button>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
                >
                    <motion.div
                        className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                        whileHover={{ scale: 1.02, y: -2 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/30 to-blue-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="flex items-center relative z-10">
                            <motion.div
                                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <TrendingUp className="h-6 w-6 text-white" />
                            </motion.div>
                            <div className="ml-4">
                                <motion.h3
                                    className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                >
                                    {stats.totalConsultations}
                                </motion.h3>
                                <p className="text-gray-600 font-medium">Total Consultations</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                        whileHover={{ scale: 1.02, y: -2 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-50/0 via-green-50/30 to-green-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="flex items-center relative z-10">
                            <motion.div
                                className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <CheckCircle className="h-6 w-6 text-white" />
                            </motion.div>
                            <div className="ml-4">
                                <motion.h3
                                    className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.7 }}
                                >
                                    {stats.completedDiagnoses}
                                </motion.h3>
                                <p className="text-gray-600 font-medium">Completed Diagnoses</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                        whileHover={{ scale: 1.02, y: -2 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/0 via-amber-50/30 to-amber-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="flex items-center relative z-10">
                            <motion.div
                                className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Clock className="h-6 w-6 text-white" />
                            </motion.div>
                            <div className="ml-4">
                                <motion.h3
                                    className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.9 }}
                                >
                                    {stats.averageRating}
                                </motion.h3>
                                <p className="text-gray-600 font-medium">Avg. Satisfaction</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Recent Diagnoses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/40"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">Recent Health Consultations</h2>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to="/history"
                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200"
                            >
                                View All →
                            </Link>
                        </motion.div>
                    </div>

                    {recentDiagnoses.length === 0 ? (
                        <motion.div
                            className="text-center py-16"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="inline-block p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl mb-6"
                            >
                                <MessageCircle className="h-12 w-12 text-blue-600" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">No consultations yet</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">Start your first health consultation with our AI assistant and get personalized medical insights</p>
                            <motion.button
                                onClick={handleStartNewDiagnosis}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                🩺 Start Diagnosis
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {recentDiagnoses.map((diagnosis, index) => (
                                <motion.div
                                    key={diagnosis.sessionId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 * index }}
                                    className="border border-white/60 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm hover:from-white/60 hover:to-white/40 group"
                                    onClick={() => navigate(`/chat/${diagnosis.sessionId}`)}
                                    whileHover={{ scale: 1.01, y: -2 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <motion.span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(diagnosis.diagnosis?.urgencyLevel)} backdrop-blur-sm`}
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    {diagnosis.diagnosis?.urgencyLevel || 'pending'}
                                                </motion.span>
                                                <span className="text-sm text-gray-500 font-medium">
                                                    {formatDate(diagnosis.createdAt)}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-900 transition-colors">
                                                {diagnosis.diagnosis?.primaryCondition?.name || 'Diagnosis in progress'}
                                            </h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                <span className="font-medium">Symptoms:</span> {diagnosis.symptoms?.map(s => s.name).join(', ') || 'No symptoms recorded'}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <motion.span
                                                className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold ${diagnosis.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                    diagnosis.status === 'active' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                        'bg-gray-100 text-gray-800 border border-gray-200'
                                                    } backdrop-blur-sm`}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {diagnosis.status}
                                            </motion.span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Health Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-indigo-100/30 to-purple-100/20 rounded-2xl"></div>
                    <div className="relative z-10">
                        <motion.div
                            className="flex items-center mb-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl mr-4 shadow-lg">
                                <motion.span
                                    className="text-2xl"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    💡
                                </motion.span>
                            </div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">Daily Health Tip</h3>
                        </motion.div>
                        <motion.p
                            className="text-gray-700 leading-relaxed text-base"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                        >
                            <span className="font-semibold text-blue-700">Stay hydrated throughout the day!</span> Drinking adequate water helps maintain body temperature,
                            lubricates joints, and aids in nutrient transportation. Aim for <span className="font-semibold text-indigo-700">8 glasses of water daily</span> for optimal health.
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
