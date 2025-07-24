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
    const [selectedDisease, setSelectedDisease] = useState(null);
    const [stats, setStats] = useState({
        totalConsultations: 0,
        completedDiagnoses: 0,
        averageRating: 0
    });

    // Common diseases data
    const commonDiseases = [
        {
            id: 1,
            name: "Common Cold",
            icon: "🤧",
            shortDescription: "Viral infection affecting the upper respiratory tract",
            commonSymptoms: ["Runny nose", "Sneezing", "Cough", "Sore throat", "Mild fever"],
            description: "The common cold is a viral infection of your nose and throat (upper respiratory tract). It's usually harmless, although it might not feel that way. Many types of viruses can cause a common cold.",
            causes: [
                "Viral infection (rhinoviruses, coronaviruses)",
                "Spread through airborne droplets",
                "Contact with contaminated surfaces",
                "Weakened immune system"
            ],
            treatments: [
                "Get plenty of rest and sleep",
                "Stay hydrated with water, warm liquids",
                "Use a humidifier or breathe steam",
                "Gargle with salt water for sore throat",
                "Over-the-counter pain relievers if needed"
            ],
            prevention: [
                "Wash hands frequently",
                "Avoid touching face with unwashed hands",
                "Stay away from sick people",
                "Maintain a healthy lifestyle"
            ],
            whenToSeeDoctor: [
                "Symptoms last more than 10 days",
                "Fever above 101.3°F (38.5°C)",
                "Severe headache or sinus pain",
                "Difficulty breathing or wheezing"
            ]
        },
        {
            id: 2,
            name: "Headache",
            icon: "🤕",
            shortDescription: "Pain in the head or upper neck area",
            commonSymptoms: ["Head pain", "Sensitivity to light", "Nausea", "Tension", "Throbbing"],
            description: "Headaches are among the most common health complaints. They can range from mild discomfort to severe, debilitating pain that affects daily activities.",
            causes: [
                "Stress and tension",
                "Dehydration",
                "Lack of sleep",
                "Eye strain",
                "Hormonal changes",
                "Certain foods or drinks"
            ],
            treatments: [
                "Rest in a quiet, dark room",
                "Apply cold or warm compress",
                "Stay hydrated",
                "Gentle neck and shoulder massage",
                "Over-the-counter pain relievers",
                "Practice relaxation techniques"
            ],
            prevention: [
                "Maintain regular sleep schedule",
                "Stay hydrated",
                "Manage stress effectively",
                "Take regular breaks from screens",
                "Avoid known triggers"
            ],
            whenToSeeDoctor: [
                "Sudden, severe headache",
                "Headache with fever and stiff neck",
                "Changes in vision or speech",
                "Headaches becoming more frequent or severe"
            ]
        },
        {
            id: 3,
            name: "Stomach Flu",
            icon: "🤢",
            shortDescription: "Viral infection causing stomach and intestinal inflammation",
            commonSymptoms: ["Nausea", "Vomiting", "Diarrhea", "Stomach cramps", "Low fever"],
            description: "Gastroenteritis, often called stomach flu, is an inflammation of the stomach and intestines. It's usually caused by a viral infection and is highly contagious.",
            causes: [
                "Viral infections (norovirus, rotavirus)",
                "Bacterial infections",
                "Contaminated food or water",
                "Close contact with infected person"
            ],
            treatments: [
                "Stay hydrated with clear fluids",
                "Rest and avoid solid foods initially",
                "Gradually reintroduce bland foods (BRAT diet)",
                "Electrolyte replacement drinks",
                "Avoid dairy and caffeine temporarily"
            ],
            prevention: [
                "Wash hands frequently and thoroughly",
                "Avoid contaminated food and water",
                "Disinfect surfaces regularly",
                "Avoid close contact with sick individuals"
            ],
            whenToSeeDoctor: [
                "Signs of severe dehydration",
                "Blood in vomit or stool",
                "High fever (over 102°F)",
                "Severe abdominal pain",
                "Symptoms lasting more than several days"
            ]
        },
        {
            id: 4,
            name: "Allergies",
            icon: "🤧",
            shortDescription: "Immune system reaction to normally harmless substances",
            commonSymptoms: ["Sneezing", "Runny nose", "Itchy eyes", "Rash", "Congestion"],
            description: "Allergies occur when your immune system reacts to a foreign substance such as pollen, bee venom, pet dander, or a food that doesn't cause a reaction in most people.",
            causes: [
                "Pollen from trees, grasses, weeds",
                "Dust mites and pet dander",
                "Certain foods (nuts, shellfish, etc.)",
                "Insect stings",
                "Certain medications"
            ],
            treatments: [
                "Avoid known allergens when possible",
                "Antihistamines for symptom relief",
                "Nasal decongestants",
                "Eye drops for itchy eyes",
                "Allergy shots (immunotherapy) for severe cases"
            ],
            prevention: [
                "Identify and avoid triggers",
                "Keep windows closed during high pollen days",
                "Use air purifiers",
                "Wash bedding in hot water weekly",
                "Shower after being outdoors"
            ],
            whenToSeeDoctor: [
                "Severe allergic reaction (anaphylaxis)",
                "Symptoms interfering with daily life",
                "Need for allergy testing",
                "Asthma symptoms developing"
            ]
        },
        {
            id: 5,
            name: "Back Pain",
            icon: "😣",
            shortDescription: "Pain in the back muscles, bones, or nerves",
            commonSymptoms: ["Lower back pain", "Stiffness", "Muscle spasms", "Limited mobility", "Radiating pain"],
            description: "Back pain is one of the most common medical problems. It can range from a dull, constant ache to a sudden, sharp pain that makes it hard to move.",
            causes: [
                "Muscle strain or sprain",
                "Poor posture",
                "Herniated disc",
                "Arthritis",
                "Osteoporosis",
                "Stress and tension"
            ],
            treatments: [
                "Rest for short periods only",
                "Apply ice for first 48 hours, then heat",
                "Gentle stretching and movement",
                "Over-the-counter pain relievers",
                "Physical therapy exercises",
                "Maintain good posture"
            ],
            prevention: [
                "Exercise regularly to strengthen back muscles",
                "Maintain good posture",
                "Lift objects properly",
                "Maintain healthy weight",
                "Sleep on a supportive mattress"
            ],
            whenToSeeDoctor: [
                "Severe pain after injury",
                "Pain radiating down legs",
                "Numbness or weakness in legs",
                "Pain lasting more than few days",
                "Bowel or bladder problems"
            ]
        },
        {
            id: 6,
            name: "Insomnia",
            icon: "😴",
            shortDescription: "Difficulty falling asleep or staying asleep",
            commonSymptoms: ["Difficulty falling asleep", "Waking up frequently", "Daytime fatigue", "Irritability", "Concentration problems"],
            description: "Insomnia is a sleep disorder that regularly affects millions of people. It can make it hard to fall asleep, hard to stay asleep, or cause early awakening.",
            causes: [
                "Stress and anxiety",
                "Poor sleep habits",
                "Caffeine or alcohol consumption",
                "Medical conditions",
                "Medications",
                "Environmental factors"
            ],
            treatments: [
                "Establish regular sleep schedule",
                "Create comfortable sleep environment",
                "Limit screen time before bed",
                "Practice relaxation techniques",
                "Avoid caffeine late in day",
                "Consider cognitive behavioral therapy"
            ],
            prevention: [
                "Maintain consistent bedtime routine",
                "Keep bedroom cool and dark",
                "Exercise regularly (not close to bedtime)",
                "Manage stress effectively",
                "Limit daytime naps"
            ],
            whenToSeeDoctor: [
                "Insomnia lasting more than few weeks",
                "Severe daytime impairment",
                "Signs of sleep apnea",
                "Depression or anxiety symptoms"
            ]
        },
        {
            id: 7,
            name: "High Blood Pressure",
            icon: "💓",
            shortDescription: "Elevated pressure in the arteries",
            commonSymptoms: ["Often no symptoms", "Headaches", "Shortness of breath", "Nosebleeds", "Chest pain"],
            description: "High blood pressure (hypertension) is a common condition where the force of blood against artery walls is consistently too high, potentially leading to health problems.",
            causes: [
                "Family history",
                "Age and gender",
                "Excess weight",
                "Lack of physical activity",
                "High sodium diet",
                "Stress and smoking"
            ],
            treatments: [
                "Lifestyle modifications (diet, exercise)",
                "Reduce sodium intake",
                "Maintain healthy weight",
                "Limit alcohol consumption",
                "Quit smoking",
                "Medications as prescribed by doctor"
            ],
            prevention: [
                "Eat healthy diet (DASH diet)",
                "Exercise regularly",
                "Maintain healthy weight",
                "Limit alcohol and quit smoking",
                "Manage stress",
                "Regular blood pressure monitoring"
            ],
            whenToSeeDoctor: [
                "Blood pressure consistently above 140/90",
                "Symptoms like severe headaches",
                "Chest pain or shortness of breath",
                "Regular monitoring needed"
            ]
        },
        {
            id: 8,
            name: "Anxiety",
            icon: "😰",
            shortDescription: "Excessive worry and fear affecting daily life",
            commonSymptoms: ["Excessive worry", "Restlessness", "Rapid heartbeat", "Sweating", "Difficulty concentrating"],
            description: "Anxiety is a normal response to stress, but when it becomes excessive and interferes with daily activities, it may be an anxiety disorder requiring attention.",
            causes: [
                "Genetics and family history",
                "Brain chemistry imbalances",
                "Stressful life events",
                "Medical conditions",
                "Substance use",
                "Personality factors"
            ],
            treatments: [
                "Cognitive behavioral therapy (CBT)",
                "Regular exercise and physical activity",
                "Relaxation techniques and meditation",
                "Deep breathing exercises",
                "Support groups",
                "Medications if recommended by doctor"
            ],
            prevention: [
                "Regular exercise",
                "Adequate sleep",
                "Healthy diet",
                "Limit caffeine and alcohol",
                "Practice stress management",
                "Stay connected with supportive people"
            ],
            whenToSeeDoctor: [
                "Anxiety interfering with daily life",
                "Panic attacks occurring",
                "Avoiding normal activities",
                "Physical symptoms present",
                "Thoughts of self-harm"
            ]
        }
    ];

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 relative overflow-hidden">
            {/* Sophisticated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-300/5 to-purple-300/5 rounded-full blur-3xl"></div>
            </div>

            {/* Professional Header */}
            <nav className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Left - Logo & Brand */}
                        <motion.div
                            className="flex items-center space-x-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg flex items-center justify-center">
                                <HeartPulse className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                                    HealthAI Assistant
                                </h1>
                                <p className="text-sm text-gray-500 font-medium">Advanced Medical Diagnosis</p>
                            </div>
                        </motion.div>

                        {/* Right - User Profile */}
                        <motion.div
                            className="flex items-center space-x-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="hidden md:block text-right">
                                <p className="text-sm text-gray-600">Welcome back,</p>
                                <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                            </div>

                            <div className="relative group">
                                <motion.button
                                    className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-500 hover:to-indigo-600 rounded-xl shadow-lg flex items-center justify-center transition-all duration-300 group"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <User className="h-6 w-6 text-gray-600 group-hover:text-white transition-colors" />
                                </motion.button>

                                {/* Dropdown Menu */}
                                <motion.div
                                    className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-200/50"
                                    initial={{ opacity: 0, y: -10 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                >
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                                    >
                                        <User className="h-4 w-4 mr-3" />
                                        Profile Settings
                                    </Link>
                                    <Link
                                        to="/history"
                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                                    >
                                        <History className="h-4 w-4 mr-3" />
                                        Medical History
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                                    >
                                        <LogOut className="h-4 w-4 mr-3" />
                                        Sign Out
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">

                {/* Professional Greeting Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center py-8"
                >
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, Dr. {user?.firstName}
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Ready to assist with intelligent medical diagnosis and health insights. How can I help you today?
                    </motion.p>
                </motion.div>

                {/* Premium Action Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    {/* New Diagnosis - Primary Action */}
                    <motion.button
                        onClick={handleStartNewDiagnosis}
                        className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 rounded-3xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 group relative overflow-hidden"
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                                <Plus className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">New Diagnosis</h3>
                            <p className="text-blue-100 text-lg">Start AI-powered medical analysis</p>
                        </div>
                    </motion.button>

                    {/* Profile - Secondary Action */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            to="/profile"
                            className="block bg-gradient-to-br from-blue-400 to-blue-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-blue-400/25 transition-all duration-500 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                                    <User className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Profile</h3>
                                <p className="text-blue-100 text-lg">Manage your account settings</p>
                            </div>
                        </Link>
                    </motion.div>

                    {/* History - Secondary Action */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            to="/history"
                            className="block bg-gradient-to-br from-blue-400 to-blue-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-blue-400/25 transition-all duration-500 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                                    <History className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">History</h3>
                                <p className="text-blue-100 text-lg">View past consultations</p>
                            </div>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Professional Statistics Dashboard */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    <motion.div
                        className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group"
                        whileHover={{ scale: 1.02, y: -4 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-right">
                                <motion.h3
                                    className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                >
                                    {stats.totalConsultations}
                                </motion.h3>
                                <p className="text-gray-600 font-semibold text-lg">Total Consultations</p>
                            </div>
                        </div>
                        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                transition={{ duration: 1.5, delay: 0.8 }}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group"
                        whileHover={{ scale: 1.02, y: -4 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-right">
                                <motion.h3
                                    className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.7 }}
                                >
                                    {stats.completedDiagnoses}
                                </motion.h3>
                                <p className="text-gray-600 font-semibold text-lg">Completed Diagnoses</p>
                            </div>
                        </div>
                        <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: '60%' }}
                                transition={{ duration: 1.5, delay: 1.0 }}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group"
                        whileHover={{ scale: 1.02, y: -4 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Clock className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-right">
                                <motion.h3
                                    className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.9 }}
                                >
                                    24/7
                                </motion.h3>
                                <p className="text-gray-600 font-semibold text-lg">Available Support</p>
                            </div>
                        </div>
                        <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.5, delay: 1.2 }}
                            />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Recent Health Consultations - Premium Design */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100 mb-12"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                                <History className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                                    Recent Health Consultations
                                </h2>
                                <p className="text-gray-600 mt-1">Your latest medical assessments and diagnoses</p>
                            </div>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to="/history"
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                            >
                                View All History
                                <TrendingUp className="ml-2 h-4 w-4" />
                            </Link>
                        </motion.div>
                    </div>

                    {recentDiagnoses.length === 0 ? (
                        <motion.div
                            className="text-center py-20"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.div
                                className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-8"
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <MessageCircle className="h-12 w-12 text-blue-600" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No consultations yet</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                                Begin your journey to better health with our AI-powered medical assistant.
                                Get personalized insights and professional medical guidance.
                            </p>
                            <motion.button
                                onClick={handleStartNewDiagnosis}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-5 rounded-3xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 text-lg flex items-center mx-auto"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Plus className="mr-3 h-6 w-6" />
                                Start Your First Diagnosis
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {recentDiagnoses.map((diagnosis, index) => (
                                <motion.div
                                    key={diagnosis.sessionId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 * index }}
                                    className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:border-blue-200"
                                    onClick={() => navigate(`/chat/${diagnosis.sessionId}`)}
                                    whileHover={{ scale: 1.01, y: -2 }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <motion.span
                                                    className={`px-4 py-2 rounded-full text-sm font-bold ${getUrgencyColor(diagnosis.diagnosis?.urgencyLevel)} shadow-sm`}
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    {diagnosis.diagnosis?.urgencyLevel || 'pending'}
                                                </motion.span>
                                                <span className="text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full text-sm">
                                                    {formatDate(diagnosis.createdAt)}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-xl mb-3 group-hover:text-blue-900 transition-colors">
                                                {diagnosis.diagnosis?.primaryCondition?.name || 'Comprehensive Health Assessment'}
                                            </h4>
                                            <p className="text-gray-600 leading-relaxed mb-4">
                                                <span className="font-semibold text-gray-800">Symptoms analyzed:</span> {diagnosis.symptoms?.map(s => s.name).join(', ') || 'Complete symptom evaluation in progress'}
                                            </p>
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-500 mr-4">Session ID: {diagnosis.sessionId}</span>
                                                <motion.span
                                                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${diagnosis.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                        diagnosis.status === 'active' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                            'bg-gray-100 text-gray-800 border border-gray-200'
                                                        }`}
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    {diagnosis.status === 'completed' && <CheckCircle className="w-4 h-4 mr-2" />}
                                                    {diagnosis.status === 'active' && <Clock className="w-4 h-4 mr-2" />}
                                                    {diagnosis.status}
                                                </motion.span>
                                            </div>
                                        </div>
                                        <motion.div
                                            className="ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            whileHover={{ x: 5 }}
                                        >
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <MessageCircle className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Common Diseases & Treatments - Premium Design */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100 mb-12"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                                <motion.span
                                    className="text-3xl"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    🏥
                                </motion.span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent">
                                    Common Diseases & Treatments
                                </h2>
                                <p className="text-gray-600 mt-1">Comprehensive medical knowledge at your fingertips</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {commonDiseases.map((disease, index) => (
                            <motion.div
                                key={disease.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 * index }}
                                className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-200 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 cursor-pointer group"
                                whileHover={{ scale: 1.03, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedDisease(disease)}
                            >
                                <div className="text-center">
                                    <motion.div
                                        className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300 shadow-lg"
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        {disease.icon}
                                    </motion.div>
                                    <h3 className="font-bold text-gray-900 text-xl mb-3 group-hover:text-blue-900 transition-colors">
                                        {disease.name}
                                    </h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                                        {disease.shortDescription}
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                                        {disease.commonSymptoms.slice(0, 2).map((symptom, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold shadow-sm">
                                                {symptom}
                                            </span>
                                        ))}
                                        {disease.commonSymptoms.length > 2 && (
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-semibold shadow-sm">
                                                +{disease.commonSymptoms.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                    <motion.div
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        whileHover={{ y: -2 }}
                                    >
                                        <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Health Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
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

            {/* Disease Details Modal */}
            {selectedDisease && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedDisease(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/40"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-4xl mr-4">
                                    {selectedDisease.icon}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                                        {selectedDisease.name}
                                    </h2>
                                    <p className="text-gray-600 mt-1">{selectedDisease.shortDescription}</p>
                                </div>
                            </div>
                            <motion.button
                                onClick={() => setSelectedDisease(null)}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.button>
                        </div>

                        <div className="space-y-8">
                            {/* Description */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        📖
                                    </span>
                                    About
                                </h3>
                                <p className="text-gray-700 leading-relaxed bg-blue-50/50 p-4 rounded-2xl">
                                    {selectedDisease.description}
                                </p>
                            </div>

                            {/* Common Symptoms */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                                    <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                        🩺
                                    </span>
                                    Common Symptoms
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedDisease.commonSymptoms.map((symptom, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center p-3 bg-red-50/50 rounded-xl border border-red-100"
                                        >
                                            <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                                            <span className="text-gray-700 font-medium">{symptom}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Causes */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                                    <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                                        🔍
                                    </span>
                                    Common Causes
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedDisease.causes.map((cause, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center p-3 bg-yellow-50/50 rounded-xl border border-yellow-100"
                                        >
                                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                                            <span className="text-gray-700">{cause}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Treatments */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                                    <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                        💊
                                    </span>
                                    Treatment Options
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedDisease.treatments.map((treatment, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center p-3 bg-green-50/50 rounded-xl border border-green-100"
                                        >
                                            <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                                            <span className="text-gray-700">{treatment}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Prevention */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                                    <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                        🛡️
                                    </span>
                                    Prevention Tips
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedDisease.prevention.map((tip, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100"
                                        >
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                                            <span className="text-gray-700">{tip}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* When to See Doctor */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                                    <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                        ⚠️
                                    </span>
                                    When to See a Doctor
                                </h3>
                                <div className="bg-red-50/50 border border-red-200 rounded-2xl p-4">
                                    <div className="grid grid-cols-1 gap-3">
                                        {selectedDisease.whenToSeeDoctor.map((warning, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-center p-3 bg-white/60 rounded-xl"
                                            >
                                                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                                                <span className="text-gray-700 font-medium">{warning}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4">
                                <div className="flex items-center mb-2">
                                    <span className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                                        ⚠️
                                    </span>
                                    <h4 className="font-bold text-amber-800">Medical Disclaimer</h4>
                                </div>
                                <p className="text-amber-700 text-sm leading-relaxed">
                                    This information is for educational purposes only and should not replace professional medical advice.
                                    Always consult with a qualified healthcare professional for proper diagnosis and treatment of any health condition.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <motion.button
                                    onClick={handleStartNewDiagnosis}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Get AI Diagnosis
                                </motion.button>
                                <motion.button
                                    onClick={() => setSelectedDisease(null)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Close
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;
