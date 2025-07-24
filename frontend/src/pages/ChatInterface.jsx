import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const ChatInterface = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentSession, setCurrentSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showInitialForm, setShowInitialForm] = useState(!sessionId);
    const [userInfo, setUserInfo] = useState({ age: '', gender: '' });
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (sessionId) {
            loadExistingSession();
        }
    }, [sessionId]);

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
            setMessages(response.diagnosis.chatMessages || []);
            setShowInitialForm(false);
        } catch (error) {
            toast.error('Session not found');
            navigate('/dashboard');
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
            const response = await diagnosisAPI.startDiagnosis(userInfo);
            setCurrentSession(response.diagnosis);
            setMessages(response.diagnosis.chatMessages || []);
            setShowInitialForm(false);

            // Update URL with session ID
            navigate(`/chat/${response.sessionId}`, { replace: true });

            toast.success('New health consultation started!');
        } catch (error) {
            toast.error('Failed to start session');
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!inputMessage.trim() || !currentSession) return;

        const userMessage = {
            message: inputMessage.trim(),
            sender: 'user',
            timestamp: new Date(),
            messageType: 'text'
        };

        // Add user message immediately
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const response = await diagnosisAPI.sendMessage(currentSession.sessionId, {
                message: inputMessage.trim()
            });

            // Simulate typing delay
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    message: response.botResponse.message,
                    sender: 'bot',
                    timestamp: new Date(),
                    messageType: response.botResponse.messageType
                }]);
                setIsTyping(false);
            }, 1000 + Math.random() * 1000);

        } catch (error) {
            setIsTyping(false);
            toast.error('Failed to send message');
            // Remove user message on error
            setMessages(prev => prev.slice(0, -1));
        }
    };

    const completeDiagnosis = async () => {
        try {
            setIsLoading(true);
            const response = await diagnosisAPI.completeDiagnosis(currentSession.sessionId, {
                medicalHistory: [], // Could be collected from user
                currentMedications: []
            });

            // Add diagnosis result message
            const diagnosisMessage = {
                message: formatDiagnosisResult(response.diagnosis),
                sender: 'bot',
                timestamp: new Date(),
                messageType: 'diagnosis'
            };

            setMessages(prev => [...prev, diagnosisMessage]);
            toast.success('Diagnosis completed successfully!');

        } catch (error) {
            toast.error('Failed to complete diagnosis');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDiagnosisResult = (diagnosis) => {
        let result = `## 🏥 Health Assessment Complete\n\n`;

        if (diagnosis.primaryCondition) {
            result += `**Primary Assessment:** ${diagnosis.primaryCondition.name}\n`;
            result += `**Confidence Level:** ${diagnosis.primaryCondition.confidence}%\n`;
            result += `**Description:** ${diagnosis.primaryCondition.description}\n\n`;
        }

        if (diagnosis.recommendations && diagnosis.recommendations.length > 0) {
            result += `**📋 Recommendations:**\n`;
            diagnosis.recommendations.forEach((rec, index) => {
                result += `${index + 1}. ${rec}\n`;
            });
            result += `\n`;
        }

        result += `**⚠️ Important Medical Disclaimer:**\n`;
        result += `This assessment is for informational purposes only and should not replace professional medical advice. `;

        if (diagnosis.urgencyLevel === 'emergency') {
            result += `**🚨 URGENT: Please seek immediate medical attention.**`;
        } else if (diagnosis.urgencyLevel === 'high') {
            result += `**Please consult with a healthcare provider soon.**`;
        } else {
            result += `Please consult with a healthcare provider for proper diagnosis and treatment.`;
        }

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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <div className="flex items-center min-w-0 flex-1">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mr-2 sm:mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0"
                            >
                                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <HeartPulse className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                            <div className="ml-2 sm:ml-3 min-w-0">
                                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                    AI Health Assistant
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                    {currentSession ? `Session ${currentSession.sessionId.slice(-8)}` : 'New Consultation'}
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

            {/* Initial Form */}
            {showInitialForm && (
                <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 max-w-md w-full mx-auto"
                    >
                        <div className="text-center mb-4 sm:mb-6">
                            <HeartPulse className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Start Health Consultation</h2>
                            <p className="text-sm sm:text-base text-gray-600 mt-2">
                                I need some basic information to provide you with the best possible health assessment.
                            </p>
                        </div>

                        <form onSubmit={startNewSession} className="space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    What's your age?
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    value={userInfo.age}
                                    onChange={(e) => setUserInfo(prev => ({ ...prev, age: e.target.value }))}
                                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                                    placeholder="Enter your age"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    What's your gender?
                                </label>
                                <select
                                    value={userInfo.gender}
                                    onChange={(e) => setUserInfo(prev => ({ ...prev, gender: e.target.value }))}
                                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                                    required
                                >
                                    <option value="">Select your gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    'Start Consultation'
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Chat Interface */}
            {!showInitialForm && (
                <>
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
                                                <div className={`rounded-lg px-3 sm:px-4 py-2 sm:py-3 max-w-xs sm:max-w-md lg:max-w-2xl ${message.sender === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border border-gray-200 text-gray-900'
                                                    }`}>
                                                    {message.messageType === 'diagnosis' ? (
                                                        <div className="prose prose-sm max-w-none">
                                                            <ReactMarkdown>{message.message}</ReactMarkdown>
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
                            {currentSession?.symptoms?.length >= 3 && currentSession?.status !== 'completed' && (
                                <div className="mb-4">
                                    <button
                                        onClick={completeDiagnosis}
                                        disabled={isLoading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4 mr-2 inline" />
                                        )}
                                        Complete Diagnosis
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Click to get your comprehensive health assessment
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
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
                </>
            )}
        </div>
    );
};

export default ChatInterface;
