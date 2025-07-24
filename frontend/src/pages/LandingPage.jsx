import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    HeartPulse,
    Brain,
    Shield,
    Clock,
    Users,
    Star,
    ArrowRight,
    Play,
    CheckCircle,
    Sparkles,
    Award,
    UserCheck,
    LogIn,
    ChevronDown,
    X,
    AlertCircle,
    Stethoscope,
    Activity,
    TrendingUp,
    Zap,
    MessageCircle,
    Menu,
    Home
} from 'lucide-react';

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const features = [
        {
            icon: Brain,
            title: "Advanced AI Diagnosis",
            description: "Our medical AI analyzes symptoms using the latest clinical databases and medical research for accurate health assessments.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: Clock,
            title: "24/7 Availability",
            description: "Get instant health guidance anytime, anywhere. No appointments needed - just describe your symptoms and get immediate insights.",
            color: "from-green-500 to-teal-500"
        },
        {
            icon: Shield,
            title: "HIPAA Compliant",
            description: "Your health information is completely secure and private. We follow the highest standards of medical data protection.",
            color: "from-purple-500 to-indigo-500"
        },
        {
            icon: UserCheck,
            title: "Doctor Verified",
            description: "All our AI recommendations are based on protocols verified by licensed medical professionals and clinical experts.",
            color: "from-orange-500 to-red-500"
        },
        {
            icon: TrendingUp,
            title: "Health Tracking",
            description: "Monitor your health trends over time with personalized insights and recommendations for better wellness outcomes.",
            color: "from-pink-500 to-rose-500"
        },
        {
            icon: MessageCircle,
            title: "Interactive Chat",
            description: "Natural conversation with our medical AI that asks relevant follow-up questions for more accurate assessments.",
            color: "from-cyan-500 to-blue-500"
        }
    ];

    const steps = [
        {
            step: "01",
            title: "Describe Your Symptoms",
            description: "Tell our AI about your health concerns in natural language. Be as detailed as possible for accurate assessment.",
            icon: MessageCircle
        },
        {
            step: "02",
            title: "AI Medical Analysis",
            description: "Our advanced medical AI analyzes your symptoms against comprehensive clinical databases and medical literature.",
            icon: Brain
        },
        {
            step: "03",
            title: "Get Health Insights",
            description: "Receive detailed health insights, potential causes, and recommendations for next steps in your care journey.",
            icon: Stethoscope
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center group">
                            <div className="relative">
                                <HeartPulse className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                                <div className="absolute inset-0 h-8 w-8 text-blue-600 animate-ping opacity-20">
                                    <HeartPulse className="h-8 w-8" />
                                </div>
                            </div>
                            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                MediCare AI
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                                Features
                            </a>
                            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                                How It Works
                            </a>
                            <a href="#technology" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                                Technology
                            </a>
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:text-blue-700 transition-colors font-medium px-4 py-2 rounded-full border border-blue-600 hover:border-blue-700"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 font-medium shadow-lg"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="md:hidden py-4 border-t border-blue-100"
                        >
                            <div className="flex flex-col space-y-4">
                                <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                                    Features
                                </a>
                                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                                    How It Works
                                </a>
                                <a href="#technology" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                                    Technology
                                </a>
                                <div className="flex flex-col space-y-3 pt-2">
                                    <Link
                                        to="/login"
                                        className="text-blue-600 hover:text-blue-700 transition-colors font-medium px-4 py-2 rounded-full border border-blue-600 hover:border-blue-700 text-center"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all text-center font-medium"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen overflow-hidden pt-16">
                {/* Full-width Medical Professional Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1551076805-e1869033e561?w=1920&h=1080&fit=crop&crop=center')`
                    }}
                >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/50 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
                    <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center lg:text-left z-10"
                        >
                            {/* Trust Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 mt-6 mb-8"
                            >
                                <Award className="h-4 w-4 text-white mr-2" />
                                <span className="text-white text-sm font-medium">Trusted by 100,000+ Patients</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl lg:text-7xl font-bold text-white leading-tight mb-8"
                            >
                                Your Trusted
                                <span className="block bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
                                    Medical AI
                                </span>
                                Assistant
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl lg:text-xl text-white/90 leading-relaxed mb-12"
                            >
                                Get instant, accurate health insights powered by advanced medical AI.
                                Available 24/7 to help you understand your symptoms and guide your healthcare decisions.
                            </motion.p>




                            {/* Trust Indicators */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mt-12 grid grid-cols-3"
                            >
                                <div className="text-left">
                                    <div className="text-xl lg:text-2xl font-bold text-white">24/7</div>
                                    <div className="text-white/70 text-sm">Available</div>
                                </div>
                                <div className="text-left">
                                    <div className="text-xl lg:text-2xl font-bold text-white">95%</div>
                                    <div className="text-white/70 text-sm">Accuracy</div>
                                </div>
                                <div className="text-left">
                                    <div className="text-xl lg:text-2xl font-bold text-white">2 min</div>
                                    <div className="text-white/70 text-sm">Assessment</div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Floating Medical Icons for Text Area */}
                        <motion.div
                            animate={{
                                y: [0, -12, 0],
                                rotate: [0, 3, 0]
                            }}
                            transition={{
                                duration: 4.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.8
                            }}
                            className="absolute bottom-20 right-10 lg:right-24 bg-white/15 backdrop-blur-sm rounded-full p-3 shadow-lg z-20"
                        >
                            <Shield className="h-6 w-6 text-cyan-300" />
                        </motion.div>

                        <motion.div
                            animate={{
                                y: [0, 8, 0],
                                x: [0, -3, 0],
                                rotate: [0, -4, 0]
                            }}
                            transition={{
                                duration: 3.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 2
                            }}
                            className="absolute bottom-32 left-5 lg:left-32 bg-white/15 backdrop-blur-sm rounded-full p-2.5 shadow-lg z-20"
                        >
                            <UserCheck className="h-5 w-5 text-white" />
                        </motion.div>

                        {/* Right Content - AI Chat Interface */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative flex justify-center lg:justify-end"
                        >
                            {/* Floating Medical Icons */}
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, 0]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute top-10 left-10 bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg"
                            >
                                <Stethoscope className="h-6 w-6 text-white" />
                            </motion.div>

                            <motion.div
                                animate={{
                                    y: [0, 10, 0],
                                    rotate: [0, -5, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                                className="absolute top-32 right-20 bg-white/20 backdrop-blur-sm rounded-full p-2 shadow-lg"
                            >
                                <HeartPulse className="h-5 w-5 text-white" />
                            </motion.div>

                            <motion.div
                                animate={{
                                    y: [0, -8, 0],
                                    x: [0, 5, 0]
                                }}
                                transition={{
                                    duration: 3.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.5
                                }}
                                className="absolute bottom-20 left-5 bg-white/20 backdrop-blur-sm rounded-full p-2 shadow-lg"
                            >
                                <Activity className="h-5 w-5 text-white" />
                            </motion.div>

                            {/* Main Chat Interface */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                                className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md border border-white/20"
                            >
                                {/* Professional Badge */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1.0 }}
                                    className="flex items-center justify-center mb-6"
                                >
                                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full px-4 py-2">
                                        <span className="text-white text-sm font-semibold">AI-POWERED HEALTHCARE</span>
                                    </div>
                                </motion.div>

                                {/* Chat Header */}
                                <div className="flex items-center mb-6">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                            <Stethoscope className="h-6 w-6 text-white" />
                                        </div>
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                                        ></motion.div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="font-bold text-gray-900 text-lg">MediCare AI Assistant</div>
                                        <div className="text-sm text-green-600 flex items-center">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                            Online now
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                    className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 mb-4"
                                >
                                    <p className="text-gray-800 text-base leading-relaxed">

                                        Hello! I'm your AI medical assistant. I'm here to help analyze your symptoms
                                        and provide professional health guidance. How can I help you today?
                                    </p>
                                </motion.div>

                                {/* Typing Indicator */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5 }}
                                    className="flex items-center text-blue-600"
                                >
                                    <div className="flex space-x-1 mr-3">
                                        <motion.div
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity }}
                                            className="w-2 h-2 bg-blue-500 rounded-full"
                                        ></motion.div>
                                        <motion.div
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                                            className="w-2 h-2 bg-blue-500 rounded-full"
                                        ></motion.div>
                                        <motion.div
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                            className="w-2 h-2 bg-blue-500 rounded-full"
                                        ></motion.div>
                                    </div>
                                    <span className="text-gray-500">Ready to help you...</span>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70"
                >
                    <ChevronDown className="h-8 w-8" />
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <div className="inline-flex items-center bg-blue-100 border border-blue-200 rounded-full px-6 py-2 mb-6">
                            <Award className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-blue-700 text-sm font-medium">Award-Winning Medical Technology</span>
                        </div>
                        <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Why Choose
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> MediCare AI</span>?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Advanced medical AI technology combined with clinical expertise to provide you with reliable, instant health insights
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:border-blue-200"
                            >
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                            How It
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Works</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Get accurate health insights in three simple steps with our advanced medical AI technology
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="text-center relative"
                            >
                                {/* Connection Line */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-300 to-cyan-300 z-0"></div>
                                )}

                                <div className="relative z-10 bg-white">
                                    <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                                        <step.icon className="h-12 w-12 text-white" />
                                    </div>

                                    <div className="bg-blue-100 border border-blue-200 rounded-full px-4 py-2 inline-block mb-4">
                                        <span className="text-blue-700 font-bold text-sm">STEP {step.step}</span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                                    <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology & Innovation Section */}
            <section id="technology" className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6">
                            <Zap className="h-4 w-4 text-cyan-400 mr-2" />
                            <span className="text-cyan-300 text-sm font-medium">Powered by Advanced AI Technology</span>
                        </div>
                        <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                            Cutting-Edge
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Medical AI</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Our platform combines the latest in artificial intelligence, machine learning, and medical expertise to deliver unprecedented accuracy in health assessments
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
                    >
                        {[
                            { number: "98.5%", label: "Diagnostic Accuracy", icon: TrendingUp },
                            { number: "100K+", label: "Patients Served", icon: Users },
                            { number: "24/7", label: "Always Available", icon: Clock },
                            { number: "2 min", label: "Average Response", icon: Zap }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300"
                            >
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <stat.icon className="h-8 w-8 text-white" />
                                </div>
                                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.number}</div>
                                <div className="text-gray-300">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Technology Features */}
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-8">
                                Advanced AI Technologies
                            </h3>

                            <div className="space-y-6">
                                {[
                                    {
                                        icon: Brain,
                                        title: "Neural Network Processing",
                                        description: "Deep learning algorithms trained on millions of medical cases for pattern recognition and diagnostic accuracy."
                                    },
                                    {
                                        icon: Shield,
                                        title: "Secure Cloud Infrastructure",
                                        description: "Military-grade encryption and HIPAA-compliant data handling ensure your medical information stays private."
                                    },
                                    {
                                        icon: Activity,
                                        title: "Real-time Analysis",
                                        description: "Instant processing of symptoms using advanced NLP and medical knowledge graphs for immediate insights."
                                    }
                                ].map((tech, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-start space-x-4"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <tech.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-semibold text-white mb-2">{tech.title}</h4>
                                            <p className="text-gray-300 leading-relaxed">{tech.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right Content - Interactive Tech Display */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Main Tech Panel */}
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                                {/* Animated Circuit Pattern */}
                                <div className="absolute inset-0 opacity-20">
                                    <svg className="w-full h-full" viewBox="0 0 400 300">
                                        <defs>
                                            <linearGradient id="circuit" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#3B82F6" />
                                                <stop offset="100%" stopColor="#06B6D4" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M50 50 L150 50 L150 100 L250 100 L250 150 L350 150" stroke="url(#circuit)" strokeWidth="2" fill="none" className="animate-pulse" />
                                        <path d="M50 200 L100 200 L100 150 L200 150 L200 100 L300 100" stroke="url(#circuit)" strokeWidth="2" fill="none" className="animate-pulse" style={{ animationDelay: '1s' }} />
                                        <circle cx="150" cy="50" r="4" fill="#3B82F6" className="animate-pulse" />
                                        <circle cx="250" cy="100" r="4" fill="#06B6D4" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                                        <circle cx="200" cy="150" r="4" fill="#8B5CF6" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
                                    </svg>
                                </div>

                                <div className="relative z-10">
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Brain className="h-10 w-10 text-white" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-white mb-2">AI Processing Engine</h4>
                                        <p className="text-gray-300">Real-time medical analysis in progress</p>
                                    </div>

                                    {/* Processing Steps */}
                                    <div className="space-y-4">
                                        {[
                                            { step: "Symptom Analysis", progress: 100, status: "complete" },
                                            { step: "Pattern Recognition", progress: 85, status: "processing" },
                                            { step: "Database Matching", progress: 60, status: "processing" },
                                            { step: "Recommendation Generation", progress: 30, status: "pending" }
                                        ].map((process, index) => (
                                            <div key={index} className="bg-white/5 rounded-lg p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-white text-sm font-medium">{process.step}</span>
                                                    <span className="text-gray-300 text-xs">{process.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${process.progress}%` }}
                                                        transition={{ duration: 2, delay: index * 0.3 }}
                                                        viewport={{ once: true }}
                                                        className={`h-2 rounded-full ${process.status === 'complete' ? 'bg-green-500' :
                                                            process.status === 'processing' ? 'bg-blue-500' : 'bg-gray-500'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-6 -right-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-4 shadow-2xl"
                            >
                                <Sparkles className="h-6 w-6 text-white" />
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-4 -left-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-3 shadow-2xl"
                            >
                                <Activity className="h-5 w-5 text-white" />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gradient-to-br from-blue-50 to-cyan-50 border-t border-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Main Footer Content */}
                    <div className="py-16 grid md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center mb-6">
                                <div className="relative">
                                    <HeartPulse className="h-10 w-10 text-blue-600" />
                                    <div className="absolute inset-0 h-10 w-10 text-blue-600 animate-ping opacity-20">
                                        <HeartPulse className="h-10 w-10" />
                                    </div>
                                </div>
                                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    MediCare AI
                                </span>
                            </div>
                            <p className="text-gray-700 text-base leading-relaxed max-w-md mb-6">
                                Empowering patients with AI-driven health insights for better healthcare decisions and improved quality of life.
                            </p>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap gap-3">
                                <div className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-lg px-3 py-2 flex items-center">
                                    <Shield className="h-4 w-4 text-blue-600 mr-2" />
                                    <span className="text-blue-700 text-xs font-medium">HIPAA Compliant</span>
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-lg px-3 py-2 flex items-center">
                                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                    <span className="text-green-700 text-xs font-medium">FDA Approved</span>
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-lg px-3 py-2 flex items-center">
                                    <Award className="h-4 w-4 text-purple-600 mr-2" />
                                    <span className="text-purple-700 text-xs font-medium">ISO 27001</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 text-base mb-6">Services</h3>
                            <ul className="space-y-3">
                                <li><a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center">
                                    <Brain className="h-4 w-4 mr-2 text-blue-500" />
                                    Health Assessment
                                </a></li>
                                <li><a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center">
                                    <Stethoscope className="h-4 w-4 mr-2 text-blue-500" />
                                    How it Works
                                </a></li>
                                <li><a href="#technology" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center">
                                    <Zap className="h-4 w-4 mr-2 text-blue-500" />
                                    Technology
                                </a></li>
                                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center">
                                    <Activity className="h-4 w-4 mr-2 text-blue-500" />
                                    API Access
                                </a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 text-base mb-6">Support</h3>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center">
                                    <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
                                    Help Center
                                </a></li>
                                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center">
                                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                                    Contact Team
                                </a></li>
                                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center">
                                    <Shield className="h-4 w-4 mr-2 text-blue-500" />
                                    Privacy Policy
                                </a></li>
                                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                                    Terms of Service
                                </a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="border-t border-blue-200 bg-white/30 backdrop-blur-sm py-8">
                        <div className="flex flex-col lg:flex-row justify-between items-center">
                            <div className="text-center lg:text-left mb-6 lg:mb-0">
                                <p className="text-gray-600 text-sm mb-2">&copy; 2025 MediCare AI. All rights reserved.</p>
                                <div className="flex items-center justify-center lg:justify-start text-xs text-gray-500">
                                    <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                                    <span>For informational purposes only. Not a substitute for professional medical advice.</span>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </footer>

            {/* Video Modal */}
            {
                isVideoPlaying && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsVideoPlaying(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-2xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">MediCare AI Demo</h3>
                                <button
                                    onClick={() => setIsVideoPlaying(false)}
                                    className="text-gray-500 hover:text-gray-700 p-2"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Play className="h-16 w-16 mx-auto mb-4 opacity-60" />
                                    <p className="text-lg">Demo video coming soon</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )
            }
        </div >
    );
};

export default LandingPage;
