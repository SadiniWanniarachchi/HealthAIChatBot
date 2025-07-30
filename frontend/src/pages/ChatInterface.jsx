import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    HeartPulse,
    Send,
    ArrowLeft,
    Bot,
    User as UserIcon,
    AlertTriangle,
    CheckCircle,
    Clock,
    Loader2
} from 'lucide-react';
import { diagnosisAPI } from '../services/api';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const ChatInterface = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [currentSession, setCurrentSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showInitialForm, setShowInitialForm] = useState(!sessionId);
    const [userInfo, setUserInfo] = useState({ age: '', gender: '' });
    const messagesEndRef = useRef(null);

    // Debug function to log state changes
    const debugLog = (action, data) => {
        console.log(`[ChatInterface] ${action}:`, data);
    };

    useEffect(() => {
        debugLog('useEffect triggered', {
            sessionId,
            hasLocationState: !!location.state?.existingSession,
            messagesLength: messages.length
        });

        // Ensure user is authenticated
        if (!user) {
            toast.error('Please log in to access chat interface');
            navigate('/login');
            return;
        }

        // Check if we have existing session data from navigation state (from history page)
        if (location.state?.existingSession) {
            const existingSession = location.state.existingSession;
            const existingMessages = location.state.messages || [];

            // Validate that the session belongs to the current user
            const sessionUserEmail = existingSession.userInfo?.email;
            const currentUserEmail = user.email;

            if (sessionUserEmail && currentUserEmail && sessionUserEmail !== currentUserEmail) {
                toast.error('Access denied. This conversation does not belong to you.');
                console.error('Attempted to access session belonging to different user:', {
                    sessionUser: sessionUserEmail,
                    currentUser: currentUserEmail,
                    sessionId: existingSession.sessionId
                });
                navigate('/dashboard');
                return;
            }

            debugLog('Loading from location.state', {
                sessionId: existingSession.sessionId,
                messagesCount: existingMessages.length,
                userEmail: currentUserEmail
            });

            setCurrentSession(existingSession);
            setMessages(existingMessages);
            setUserInfo(existingSession.userInfo || { age: '', gender: '' });
            setShowInitialForm(false);

            console.log('Loaded existing session from state:', existingSession);
            console.log('Loaded existing messages:', existingMessages);

            // Clear the navigation state to prevent reloading on re-renders
            window.history.replaceState({}, document.title);

        } else if (sessionId && !sessionId.startsWith('local_') && messages.length === 0) {
            // Only load from backend if we don't have existing session data and messages
            debugLog('Loading from backend', { sessionId, userEmail: user.email });
            loadExistingSession();
        }
    }, [sessionId, location.state?.existingSession]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadExistingSession = async () => {
        try {
            setIsLoading(true);
            const response = await diagnosisAPI.getDiagnosisSession(sessionId);
            setCurrentSession(response.diagnosis);

            // Only update messages if we don't already have messages in state
            // This prevents overwriting messages loaded from navigation state
            if (messages.length === 0) {
                setMessages(response.diagnosis.chatMessages || []);
                console.log('Loaded messages from backend:', response.diagnosis.chatMessages);
            } else {
                console.log('Keeping existing messages, not loading from backend');
            }

            setShowInitialForm(false);
        } catch (error) {
            console.warn('Session not found in backend:', error);
            // Don't navigate away if we have messages, might be a local session
            if (messages.length === 0) {
                toast.error('Session not found');
                navigate('/dashboard');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const startNewSession = async (e) => {
        e.preventDefault();

        if (!userInfo.age || !userInfo.gender) {
            toast.error('Please provide your age and gender to start');
            return;
        }

        if (userInfo.age < 1 || userInfo.age > 120) {
            toast.error('Please enter a valid age');
            return;
        }

        try {
            setIsLoading(true);

            // Initialize with AI welcome message first
            const welcomeMessage = {
                message: `Hello! I'm your AI health assistant. I understand you're ${userInfo.age} years old and identify as ${userInfo.gender}. I'm here to help discuss your health concerns and provide general guidance.\n\nPlease tell me what's bothering you today or what symptoms you're experiencing. Remember, I'm here to provide information and support, but I cannot replace professional medical care.\n\nWhat brings you here today?`,
                sender: 'bot',
                timestamp: new Date(),
                messageType: 'text'
            };

            setMessages([welcomeMessage]);
            setShowInitialForm(false);

            // Try to create backend session, but don't block if it fails
            let sessionData = null;
            try {
                const response = await diagnosisAPI.startDiagnosis(userInfo);
                setCurrentSession(response.diagnosis);
                sessionData = response;
                // Update URL with session ID - use setTimeout to ensure messages are set first
                setTimeout(() => {
                    navigate(`/chat/${response.sessionId}`, { replace: true });
                }, 100);
            } catch (backendError) {
                console.warn('Backend session creation failed, continuing with local session:', backendError);
                // Create a local session ID for UI purposes
                const localSessionId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                setCurrentSession({ sessionId: localSessionId });
                setTimeout(() => {
                    navigate(`/chat/${localSessionId}`, { replace: true });
                }, 100);
            }

            toast.success('Health consultation started!');

        } catch (error) {
            toast.error('Failed to start session');
            console.error('Session start error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!inputMessage.trim()) return;

        const userMessage = {
            message: inputMessage.trim(),
            sender: 'user',
            timestamp: new Date(),
            messageType: 'text'
        };

        // Add user message immediately to UI
        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputMessage.trim();
        setInputMessage('');
        setIsTyping(true);

        try {
            // If we have a backend session, use backend API for proper message saving
            if (currentSession && !currentSession.sessionId.startsWith('local_')) {
                try {
                    // Send message to backend - this will save both user message and generate bot response
                    const response = await diagnosisAPI.sendMessage(currentSession.sessionId, {
                        message: currentInput,
                        symptoms: []
                    });

                    // Simulate realistic typing delay - reduced for faster response
                    const typingDelay = Math.min(response.botResponse.message.length * 5, 800);

                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            message: response.botResponse.message,
                            sender: 'bot',
                            timestamp: new Date(),
                            messageType: response.botResponse.messageType || 'text'
                        }]);
                        setIsTyping(false);
                    }, typingDelay);

                    return; // Exit early since backend handled everything
                } catch (backendError) {
                    console.warn('Backend message sending failed, falling back to local AI:', backendError);
                    // Continue to local AI service below
                }
            }

            // Fallback to local AI service (for local sessions or backend failures)
            const aiResponse = await aiService.sendMessage(currentInput, messages);

            // Simulate realistic typing delay - reduced for faster response
            const typingDelay = Math.min(aiResponse.message.length * 5, 800);

            setTimeout(() => {
                setMessages(prev => [...prev, {
                    message: aiResponse.message,
                    sender: 'bot',
                    timestamp: new Date(),
                    messageType: aiResponse.messageType
                }]);
                setIsTyping(false);
            }, typingDelay);

        } catch (error) {
            setIsTyping(false);
            toast.error('Failed to get AI response. Please try again.');

            // Add error message from AI
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    message: "I apologize, but I'm having trouble responding right now. Please try again, and if you're experiencing a medical emergency, contact emergency services immediately.",
                    sender: 'bot',
                    timestamp: new Date(),
                    messageType: 'error'
                }]);
            }, 500);
        }
    };

    const completeDiagnosis = async () => {
        try {
            setIsLoading(true);

            // Check if user is logged in
            if (!user) {
                toast.error('Please log in to save your consultation');
                return;
            }

            let diagnosisResponse = null;

            // If this is a local session, we need to create a backend session first
            if (!currentSession || currentSession.sessionId.startsWith('local_')) {
                try {
                    console.log('Creating backend session for local conversation...');

                    // Create a new backend session
                    const mongoResponse = await diagnosisAPI.startDiagnosis({
                        age: userInfo.age,
                        gender: userInfo.gender,
                        firstName: user.firstName,
                        lastName: user.lastName
                    });

                    // Save all the conversation messages to the backend session
                    for (const message of messages) {
                        if (message.sender === 'user') {
                            await diagnosisAPI.sendMessage(mongoResponse.sessionId, {
                                message: message.message,
                                symptoms: []
                            });
                        }
                    }

                    // Update current session to use the backend session
                    setCurrentSession({
                        sessionId: mongoResponse.sessionId,
                        createdAt: new Date().toISOString(),
                        userInfo: userInfo,
                        isLocal: false
                    });

                    // Complete the diagnosis and capture the response
                    diagnosisResponse = await diagnosisAPI.completeDiagnosis(mongoResponse.sessionId, {
                        medicalHistory: [],
                        currentMedications: []
                    });

                    console.log('Saved local conversation to MongoDB:', mongoResponse.sessionId);
                    toast.success('Conversation saved and assessment completed!');

                } catch (error) {
                    console.error('Failed to save local conversation:', error);
                    toast.error('Failed to save conversation. Please try again.');
                    return;
                }
            } else {
                // Complete the existing diagnosis session in MongoDB
                try {
                    diagnosisResponse = await diagnosisAPI.completeDiagnosis(currentSession.sessionId, {
                        medicalHistory: [],
                        currentMedications: []
                    });

                    console.log('Completed diagnosis session:', currentSession.sessionId);
                    toast.success('Health assessment completed and saved to your history');

                    // Update current session status
                    setCurrentSession({
                        ...currentSession,
                        completedAt: new Date().toISOString(),
                        status: 'completed'
                    });

                } catch (error) {
                    console.error('Failed to complete diagnosis:', error);
                    toast.error('Failed to complete assessment. Please try again.');
                    return;
                }
            }

            // Display the diagnosis in real-time in the chat
            if (diagnosisResponse && diagnosisResponse.diagnosis) {
                const formattedDiagnosis = formatDiagnosisResult(diagnosisResponse.diagnosis);

                // Add the diagnosis message to the chat immediately
                const diagnosisMessage = {
                    message: formattedDiagnosis,
                    sender: 'bot',
                    timestamp: new Date(),
                    messageType: 'diagnosis'
                };

                setMessages(prev => [...prev, diagnosisMessage]);
            }

        } catch (error) {
            toast.error('Failed to complete assessment');
            console.error('Assessment error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to extract symptoms from conversation messages
    const extractSymptomsFromMessages = (messages) => {
        const symptoms = [];
        messages.forEach(msg => {
            if (msg.sender === 'user') {
                // Simple keyword extraction for common symptoms
                const symptomKeywords = [
                    'headache', 'fever', 'pain', 'cough', 'sore throat', 'nausea',
                    'fatigue', 'dizziness', 'chest pain', 'shortness of breath',
                    'stomach ache', 'back pain', 'joint pain', 'rash', 'vomiting'
                ];

                symptomKeywords.forEach(keyword => {
                    if (msg.message.toLowerCase().includes(keyword) &&
                        !symptoms.some(s => s.name.toLowerCase().includes(keyword))) {
                        symptoms.push({
                            name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
                            severity: 'mild', // Default severity
                            duration: 'recent'
                        });
                    }
                });
            }
        });

        // If no symptoms found, add a generic one
        if (symptoms.length === 0) {
            symptoms.push({
                name: 'General health concern',
                severity: 'mild',
                duration: 'recent'
            });
        }

        return symptoms;
    };

    const formatDiagnosisResult = (diagnosis) => {
        let result = `##Health Assessment Complete\n\n`;
        result += `---\n\n`;

        if (diagnosis.primaryCondition) {
            result += `### 📊 Primary Assessment\n\n`;
            result += `**Condition:** ${diagnosis.primaryCondition.name}\n\n`;
            result += `**Confidence Level:** ${diagnosis.primaryCondition.confidence}%\n\n`;
            result += `**Description:**\n\n${diagnosis.primaryCondition.description}\n\n`;
            result += `---\n\n`;
        }

        if (diagnosis.alternativeConditions && diagnosis.alternativeConditions.length > 0) {
            result += `### 🔍 Alternative Considerations\n\n`;
            diagnosis.alternativeConditions.forEach((condition, index) => {
                result += `**${index + 1}. ${condition.name}** (${condition.confidence}% confidence)\n\n`;
                if (condition.description) {
                    result += `${condition.description}\n\n`;
                } else {
                    result += `\n`;
                }
            });
            result += `---\n\n`;
        }

        if (diagnosis.recommendations && diagnosis.recommendations.length > 0) {
            result += `### 📋 Recommendations\n\n`;
            diagnosis.recommendations.forEach((rec, index) => {
                result += `**${index + 1}.** ${rec}\n\n`;
            });
            result += `---\n\n`;
        }

        result += `### ⚠️ Important Disclaimer\n\n`;
        result += `> This assessment is for **informational purposes only** and should not replace professional medical advice.\n\n`;
        result += `> Please consult with a healthcare provider for proper diagnosis and treatment.\n\n`;

        result += `---\n\n`;
        result += `*Assessment completed at ${new Date().toLocaleString()}*`;

        return result;
    };

    const getUrgencyIcon = (urgency) => {
        switch (urgency) {
            case 'emergency':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'high':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'medium':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'low':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    if (isLoading && !currentSession) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading health consultation...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Initial Form */}
            {showInitialForm && (
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

                    {/* Back Button */}
                    <motion.button
                        onClick={() => navigate('/dashboard')}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-300 group bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm hover:shadow-md z-20 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium text-sm">Back</span>
                    </motion.button>

                    <div className="flex w-full min-h-screen">
                        {/* Left Side - Form (2/3 width) */}
                        <div className="w-full lg:w-2/3 flex items-center justify-center px-6 sm:px-8 lg:px-16 xl:px-20 relative mt-14 mb-10 z-10">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="w-full max-w-md mx-auto"
                            >
                                {/* Enhanced Form */}
                                <motion.div
                                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 sm:p-12 relative"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    {/* Glassmorphism effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl"></div>

                                    <div className="text-center mb-8 relative z-10">
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.4 }}
                                        >
                                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                                <HeartPulse className="h-8 w-8 text-blue-600" />
                                            </div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Start Health Consultation</h2>
                                            <p className="text-gray-600 leading-relaxed">
                                                Let's gather some basic information to provide you with personalized health insights and accurate medical assistance.
                                            </p>
                                        </motion.div>
                                    </div>

                                    <form onSubmit={startNewSession} className="space-y-6 relative z-10">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                What's your age?
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="120"
                                                value={userInfo.age}
                                                onChange={(e) => setUserInfo(prev => ({ ...prev, age: e.target.value }))}
                                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-base transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
                                                placeholder="Enter your age"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                What's your gender?
                                            </label>
                                            <select
                                                value={userInfo.gender}
                                                onChange={(e) => setUserInfo(prev => ({ ...prev, gender: e.target.value }))}
                                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-base transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
                                                required
                                            >
                                                <option value="">Select your gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <motion.button
                                            type="submit"
                                            disabled={isLoading}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden text-base cursor-pointer"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span>Starting Consultation...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <HeartPulse className="h-5 w-5" />
                                                    <span>Start Health Consultation</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </form>


                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Right Side - Medical Image (1/3 width) */}
                        <div className="hidden lg:block w-1/3 relative">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="absolute inset-0 h-full w-full"
                            >
                                {/* Professional Medical Consultation Background Image */}
                                <div
                                    className="h-full w-full bg-cover bg-center bg-no-repeat relative"
                                    style={{
                                        backgroundImage: `url('https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&h=1200&fit=crop&crop=center')`
                                    }}
                                >
                                    {/* Elegant Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/50 to-cyan-900/60"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                                    {/* Professional Medical Badge */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1.5, duration: 0.8 }}
                                        className="absolute top-8 left-6 right-6 bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                                    >
                                        <div className="text-center">
                                            <HeartPulse className="h-8 w-8 text-white mx-auto mb-3" />
                                            <h3 className="text-white font-semibold text-lg mb-2">AI Health Assistant</h3>
                                            <p className="text-white/80 text-sm leading-relaxed">
                                                Start your personalized health consultation with our advanced medical AI
                                            </p>
                                        </div>
                                    </motion.div>

                                    {/* Medical Features */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 2, duration: 0.8 }}
                                        className="absolute bottom-8 left-6 right-6 space-y-4"
                                    >
                                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                            <div className="flex items-center text-white">
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                                    <CheckCircle className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">Instant Analysis</p>
                                                    <p className="text-xs text-white/70">Get immediate health insights</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                            <div className="flex items-center text-white">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                                    <Bot className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">AI Powered</p>
                                                    <p className="text-xs text-white/70">Advanced medical knowledge</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Interface */}
            {!showInitialForm && (
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    {/* Header */}
                    <div className="bg-white shadow-sm border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-14 sm:h-16">
                                <div className="flex items-center min-w-0 flex-1">
                                    <button
                                        onClick={() => navigate('/history')}
                                        className="mr-2 sm:mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0 cursor-pointer"
                                    >
                                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                    <HeartPulse className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                                    <div className="ml-2 sm:ml-3 min-w-0">
                                        <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                            AI Health Assistant
                                        </h1>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                                            {currentSession ? `Session #${currentSession.sessionId.slice(-8).toUpperCase()}` : 'New Consultation'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm text-gray-500 flex-shrink-0">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1 sm:mr-2"></div>
                                        <span className="hidden sm:inline">Online</span>
                                        <div className="w-2 h-2 bg-green-400 rounded-full sm:hidden"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-4xl mx-auto px-4 py-6">
                            <AnimatePresence>
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`mb-6 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Avatar */}
                                            <div className={`flex-shrink-0 ${message.sender === 'user' ? 'ml-3' : 'mr-3'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {message.sender === 'user' ? (
                                                        <UserIcon className="w-5 h-5" />
                                                    ) : (
                                                        <Bot className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Message */}
                                            <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                                <div className={`rounded-lg px-3 sm:px-4 py-2 sm:py-3 ${message.messageType === 'diagnosis'
                                                    ? 'max-w-full lg:max-w-4xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg'
                                                    : `max-w-xs sm:max-w-md lg:max-w-2xl ${message.sender === 'user'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white border border-gray-200 text-gray-900'
                                                    }`
                                                    }`}>
                                                    {message.messageType === 'diagnosis' ? (
                                                        <div className="prose prose-sm max-w-none diagnosis-content">
                                                            <ReactMarkdown
                                                                components={{
                                                                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-blue-700 mb-4 pb-2 border-b-2 border-blue-200" {...props} />,
                                                                    h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4" {...props} />,
                                                                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-700" {...props} />,
                                                                    strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900 mr-2" {...props} />,
                                                                    hr: ({ node, ...props }) => <hr className="my-4 border-gray-300" {...props} />,
                                                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-yellow-400 bg-yellow-50 pl-4 py-2 my-3 italic text-gray-700" {...props} />,
                                                                    em: ({ node, ...props }) => <em className="text-sm text-gray-500" {...props} />
                                                                }}
                                                            >
                                                                {message.message}
                                                            </ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm leading-relaxed break-words">{message.message}</p>
                                                    )}
                                                </div>

                                                <div className={`text-xs text-gray-500 mt-1 px-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 flex justify-start"
                                >
                                    <div className="flex mr-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="bg-white border-t border-gray-200">
                        <div className="max-w-4xl mx-auto px-4 py-4">
                            {messages.length >= 6 && (
                                <div className="mb-4">
                                    <button
                                        onClick={completeDiagnosis}
                                        disabled={isLoading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4 mr-2 inline" />
                                        )}
                                        Get Health Assessment
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Get a comprehensive summary of our consultation
                                    </p>
                                </div>
                            )}

                            <form onSubmit={sendMessage} className="flex space-x-2 sm:space-x-3">
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Describe your symptoms..."
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                        disabled={isTyping || isLoading}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputMessage.trim() || isTyping || isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
                                >
                                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </form>

                            <div className="mt-2 sm:mt-3 text-center">
                                <p className="text-xs text-gray-500 px-2">
                                    This AI assistant provides informational content only and is not a substitute for professional medical advice.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatInterface;
