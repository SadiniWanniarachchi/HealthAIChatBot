import express from 'express';
import Diagnosis from '../models/Diagnosis.js';
import { auth } from '../middleware/auth.js';
import { createGeminiService, generateDiagnosis } from '../services/geminiService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Lazy-loaded Gemini service
let geminiService = null;
let geminiServiceInitialized = false;

const getGeminiService = () => {
    if (!geminiServiceInitialized) {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            console.log('GEMINI_API_KEY status:', apiKey ? 'Available' : 'Not set');

            if (apiKey) {
                geminiService = createGeminiService();
                console.log('Gemini AI service initialized for backend');
            } else {
                console.log('GEMINI_API_KEY not found, using fallback responses');
                geminiService = null;
            }
        } catch (error) {
            console.error('Failed to initialize Gemini service:', error.message);
            geminiService = null;
        }
        geminiServiceInitialized = true;
    }
    return geminiService;
};// @route   POST /api/diagnosis/start
// @desc    Start a new diagnosis session
// @access  Private
router.post('/start', auth, async (req, res) => {
    try {
        const { age, gender, firstName, lastName } = req.body;

        if (!age || !gender) {
            return res.status(400).json({
                message: 'Age and gender are required to start diagnosis'
            });
        }

        if (age < 1 || age > 120) {
            return res.status(400).json({
                message: 'Please enter a valid age between 1 and 120'
            });
        }

        const sessionId = uuidv4();

        const diagnosis = new Diagnosis({
            user: req.user._id,
            sessionId,
            age: parseInt(age),
            gender,
            userInfo: {
                firstName: firstName || req.user.firstName,
                lastName: lastName || req.user.lastName,
                email: req.user.email,
                age: parseInt(age),
                gender
            },
            symptoms: [],
            chatMessages: [{
                message: `Hello! I'm your AI Health Assistant. I understand you're ${age} years old and ${gender}. I'm here to help analyze your symptoms and provide health guidance. Please describe your main symptoms or concerns.`,
                sender: 'bot',
                messageType: 'text'
            }]
        });

        await diagnosis.save();

        res.status(201).json({
            message: 'Diagnosis session started successfully',
            sessionId,
            diagnosis: {
                sessionId: diagnosis.sessionId,
                createdAt: diagnosis.createdAt,
                userInfo: diagnosis.userInfo,
                messages: diagnosis.chatMessages.map(msg => ({
                    message: msg.message,
                    sender: msg.sender,
                    timestamp: msg.timestamp,
                    messageType: msg.messageType
                })),
                isLocal: false
            }
        });
    } catch (error) {
        console.error('Start diagnosis error:', error);
        res.status(500).json({
            message: 'Server error starting diagnosis session'
        });
    }
});

// @route   POST /api/diagnosis/:sessionId/message
// @desc    Add message to diagnosis session
// @access  Private
router.post('/:sessionId/message', auth, async (req, res) => {
    try {
        const { message, symptoms } = req.body;
        const { sessionId } = req.params;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                message: 'Message is required'
            });
        }

        const diagnosis = await Diagnosis.findOne({
            sessionId,
            user: req.user._id
        });

        if (!diagnosis) {
            return res.status(404).json({
                message: 'Diagnosis session not found'
            });
        }

        // Add user message
        await diagnosis.addMessage(message.trim(), 'user');

        // Add symptoms if provided
        if (symptoms && Array.isArray(symptoms)) {
            symptoms.forEach(symptom => {
                if (symptom.name && symptom.category) {
                    diagnosis.symptoms.push({
                        name: symptom.name.trim(),
                        category: symptom.category,
                        severity: symptom.severity || 'mild'
                    });
                }
            });
        }

        // Generate AI response
        const aiResponse = await generateAIResponse(diagnosis, message);
        await diagnosis.addMessage(aiResponse.message, 'bot', aiResponse.messageType);

        await diagnosis.save();

        res.json({
            message: 'Message added successfully',
            botResponse: aiResponse,
            symptomsCount: diagnosis.symptoms.length,
            messages: diagnosis.chatMessages.slice(-2).map(msg => ({
                message: msg.message,
                sender: msg.sender,
                timestamp: msg.timestamp,
                messageType: msg.messageType
            }))
        });
    } catch (error) {
        console.error('Add message error:', error);
        res.status(500).json({
            message: 'Server error adding message'
        });
    }
});

// @route   POST /api/diagnosis/:sessionId/complete
// @desc    Complete diagnosis and get final analysis
// @access  Private
router.post('/:sessionId/complete', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { medicalHistory = [], currentMedications = [] } = req.body;

        console.log('Complete diagnosis request:', { sessionId, userId: req.user._id });

        const diagnosis = await Diagnosis.findOne({
            sessionId,
            user: req.user._id
        });

        if (!diagnosis) {
            console.log('Diagnosis session not found for:', { sessionId, userId: req.user._id });
            return res.status(404).json({
                message: 'Diagnosis session not found'
            });
        }

        console.log('Found diagnosis with chat messages:', diagnosis.chatMessages.length);

        // Check if there's at least some conversation to summarize
        if (diagnosis.chatMessages.length === 0) {
            console.log('No conversation found, returning 400 error');
            return res.status(400).json({
                message: 'Please have a conversation before requesting health assessment'
            });
        }

        // Update medical history and medications
        diagnosis.medicalHistory = medicalHistory;
        diagnosis.currentMedications = currentMedications;

        // Generate final diagnosis using AI
        let finalDiagnosis;

        // Get Gemini service (lazy-loaded)
        const geminiService = getGeminiService();

        if (geminiService) {
            try {
                // Use Gemini for final assessment based on conversation
                console.log('Backend: Generating health consultation summary using Gemini AI');
                finalDiagnosis = await geminiService.generateHealthAssessment(
                    [], // No specific symptoms - use conversation instead
                    {
                        age: diagnosis.age,
                        gender: diagnosis.gender,
                        firstName: req.user.firstName,
                        lastName: req.user.lastName
                    },
                    diagnosis.chatMessages
                );
            } catch (error) {
                console.error('Gemini assessment failed, using fallback:', error);
                // Fallback to traditional method
                finalDiagnosis = await generateDiagnosis({
                    symptoms: [],
                    age: diagnosis.age,
                    gender: diagnosis.gender,
                    medicalHistory,
                    currentMedications,
                    chatHistory: diagnosis.chatMessages
                });
            }
        } else {
            // Fallback to traditional method
            finalDiagnosis = await generateDiagnosis({
                symptoms: [],
                age: diagnosis.age,
                gender: diagnosis.gender,
                medicalHistory,
                currentMedications,
                chatHistory: diagnosis.chatMessages
            });
        }

        await diagnosis.completeDiagnosis(finalDiagnosis);

        // Add final diagnosis message
        const diagnosisMessage = formatDiagnosisMessage(finalDiagnosis);
        await diagnosis.addMessage(diagnosisMessage, 'bot', 'diagnosis');

        res.json({
            message: 'Diagnosis completed successfully',
            diagnosis: finalDiagnosis,
            sessionId
        });
    } catch (error) {
        console.error('Complete diagnosis error:', error);
        console.error('Error stack:', error.stack);

        // Return more specific error messages
        if (error.message.includes('symptoms')) {
            return res.status(400).json({
                message: 'Invalid symptoms data',
                error: error.message
            });
        }

        res.status(500).json({
            message: 'Server error completing diagnosis',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/diagnosis/history
// @desc    Get user's diagnosis history
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log('Fetching diagnosis history for user:', req.user._id);

        const diagnoses = await Diagnosis.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Diagnosis.countDocuments({ user: req.user._id });

        console.log('Found diagnoses count:', diagnoses.length);
        console.log('Total diagnoses for user:', total);

        // Transform data to match frontend expectations
        const transformedDiagnoses = diagnoses.map(diag => ({
            sessionId: diag.sessionId,
            createdAt: diag.createdAt,
            completedAt: diag.completedAt,
            userInfo: diag.userInfo || {
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                age: diag.age,
                gender: diag.gender
            },
            diagnosis: diag.diagnosis,
            symptoms: diag.symptoms || [],
            urgencyLevel: diag.diagnosis?.urgencyLevel || 'low',
            primaryCondition: diag.diagnosis?.primaryCondition?.name || 'Health Consultation',
            recommendations: diag.diagnosis?.recommendations || [],
            messages: diag.chatMessages.map(msg => ({
                message: msg.message,
                sender: msg.sender,
                timestamp: msg.timestamp,
                messageType: msg.messageType
            })),
            isLocal: false // Mark as backend session
        }));

        console.log('Returning transformed diagnoses:', transformedDiagnoses.length);

        res.json({
            message: 'Diagnosis history retrieved successfully',
            diagnoses: transformedDiagnoses,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get diagnosis history error:', error);
        res.status(500).json({
            message: 'Server error retrieving diagnosis history'
        });
    }
});

// @route   GET /api/diagnosis/:sessionId
// @desc    Get specific diagnosis session
// @access  Private
router.get('/:sessionId', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const diagnosis = await Diagnosis.findOne({
            sessionId,
            user: req.user._id
        });

        if (!diagnosis) {
            return res.status(404).json({
                message: 'Diagnosis session not found'
            });
        }

        // Transform data to match frontend expectations
        const transformedDiagnosis = {
            sessionId: diagnosis.sessionId,
            createdAt: diagnosis.createdAt,
            completedAt: diagnosis.completedAt,
            userInfo: diagnosis.userInfo || {
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                age: diagnosis.age,
                gender: diagnosis.gender
            },
            diagnosis: diagnosis.diagnosis,
            symptoms: diagnosis.symptoms || [],
            messages: diagnosis.chatMessages.map(msg => ({
                message: msg.message,
                sender: msg.sender,
                timestamp: msg.timestamp,
                messageType: msg.messageType
            })),
            isLocal: false
        };

        res.json({
            message: 'Diagnosis session retrieved successfully',
            diagnosis: transformedDiagnosis
        });
    } catch (error) {
        console.error('Get diagnosis session error:', error);
        res.status(500).json({
            message: 'Server error retrieving diagnosis session'
        });
    }
});

// @route   DELETE /api/diagnosis/:sessionId
// @desc    Delete a specific diagnosis session
// @access  Private
router.delete('/:sessionId', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        console.log('Delete request received for sessionId:', sessionId);
        console.log('User ID:', req.user._id);

        const diagnosis = await Diagnosis.findOne({
            sessionId,
            user: req.user._id
        });

        if (!diagnosis) {
            console.log('Diagnosis not found for sessionId:', sessionId);
            return res.status(404).json({
                message: 'Diagnosis session not found'
            });
        }

        console.log('Found diagnosis to delete:', diagnosis._id);

        await Diagnosis.findByIdAndDelete(diagnosis._id);

        console.log('Successfully deleted diagnosis:', sessionId);

        res.json({
            message: 'Diagnosis session deleted successfully',
            sessionId
        });
    } catch (error) {
        console.error('Delete diagnosis session error:', error);
        res.status(500).json({
            message: 'Server error deleting diagnosis session'
        });
    }
});

// Helper function to generate AI response
const generateAIResponse = async (diagnosis, userMessage) => {
    try {
        // Get Gemini service (lazy-loaded)
        const geminiService = getGeminiService();

        // If Gemini service is available, use it
        if (geminiService) {
            // Prepare conversation history for Gemini
            const messages = [];

            // Add conversation context
            diagnosis.chatMessages.forEach(msg => {
                if (msg.sender === 'user') {
                    messages.push({ role: 'user', content: msg.message });
                } else if (msg.sender === 'bot') {
                    messages.push({ role: 'assistant', content: msg.message });
                }
            });

            // Add current user message
            messages.push({ role: 'user', content: userMessage });

            console.log('Backend: Sending message to Gemini AI');
            const aiResponse = await geminiService.sendMessage(messages, {
                userAge: diagnosis.age,
                userGender: diagnosis.gender,
                messageCount: diagnosis.chatMessages.length
            });

            return {
                message: aiResponse,
                messageType: 'text'
            };
        }

        // Fallback to enhanced rule-based responses if Gemini is not available
        const messageCount = diagnosis.chatMessages.length;
        const userMessageLower = userMessage.toLowerCase();

        // Comprehensive symptom keywords for better detection
        const symptomKeywords = {
            pain: ['pain', 'ache', 'hurt', 'sore', 'tender', 'sharp', 'dull', 'throbbing', 'burning', 'stabbing'],
            respiratory: ['cough', 'shortness of breath', 'wheezing', 'congestion', 'runny nose', 'stuffy nose', 'sneezing'],
            fever: ['fever', 'temperature', 'hot', 'chills', 'sweating', 'feverish'],
            gastrointestinal: ['nausea', 'vomit', 'diarrhea', 'constipation', 'stomach', 'belly', 'abdominal'],
            neurological: ['headache', 'migraine', 'dizzy', 'lightheaded', 'confusion', 'memory'],
            skin: ['rash', 'itch', 'red', 'swollen', 'bump', 'spot'],
            general: ['tired', 'fatigue', 'weak', 'exhausted', 'energy', 'sleep']
        };

        // Advanced response templates based on context
        const responseTemplates = {
            initial: [
                "Thank you for sharing that with me. I'm here to help you understand your symptoms better. Can you tell me when you first started experiencing this?",
                "I appreciate you describing your symptoms. To provide the best guidance, could you help me understand how long you've been feeling this way?",
                "I understand your concern about these symptoms. Let me ask a few questions to better assist you. When did you first notice these symptoms?"
            ],
            followUp: {
                pain: [
                    "I see you're experiencing pain. Can you describe the type of pain - is it sharp, dull, throbbing, or burning? And where exactly do you feel it most?",
                    "Pain can be quite concerning. On a scale of 1-10, how would you rate the intensity? Also, does anything make it better or worse?",
                    "Thank you for mentioning the pain. How would you describe it - constant or comes and goes? Have you tried anything to relieve it?"
                ],
                respiratory: [
                    "Respiratory symptoms can be bothersome. Is this a dry cough or are you bringing up any mucus? Also, are you having any difficulty breathing?",
                    "I understand you're having breathing-related symptoms. Have you noticed if they're worse at certain times of the day or with activity?",
                    "These respiratory symptoms sound uncomfortable. Have you been around anyone who's been sick recently, or noticed any triggers?"
                ],
                fever: [
                    "Fever often indicates your body is fighting something. Have you been able to take your temperature? Are you experiencing chills or sweating?",
                    "A fever can make you feel quite unwell. Along with the fever, are you experiencing any body aches, headache, or other symptoms?",
                    "Thank you for mentioning the fever. How long have you had it, and have you tried any fever-reducing medications?"
                ],
                general: [
                    "Fatigue can really impact your daily life. How long have you been feeling this way? Is it affecting your ability to do normal activities?",
                    "Feeling tired or weak can be concerning. Have you noticed if it's worse at certain times, or if you're getting enough restful sleep?",
                    "I understand you're feeling exhausted. Are there any other symptoms accompanying this fatigue, like changes in appetite or mood?"
                ]
            },
            progression: [
                "Based on what you've shared so far, I'm getting a clearer picture. Are there any other symptoms, even minor ones, that you've noticed?",
                "Thank you for providing those details. I'd like to understand the complete picture. Have you experienced any changes in appetite, sleep, or energy levels?",
                "This information is very helpful. To ensure I don't miss anything important, are there any other symptoms or concerns you'd like to mention?",
                "I appreciate your detailed responses. Sometimes people forget to mention seemingly unrelated symptoms - is there anything else, however small, that you've noticed?"
            ],
            assessment: [
                "You've provided very comprehensive information about your symptoms. Based on our conversation, I have enough details to provide some guidance. Would you like me to share my assessment?",
                "Thank you for being so thorough in describing your symptoms. I believe I have sufficient information to offer some insights. Shall I proceed with my analysis?",
                "Based on everything you've shared, I can now provide you with a health assessment. This will include some observations and recommendations. Would you like to proceed?"
            ]
        };

        // Determine response category based on message content and conversation progress
        let responseCategory = 'general';
        let responses = responseTemplates.initial;

        // Detect symptom categories
        for (const [category, keywords] of Object.entries(symptomKeywords)) {
            if (keywords.some(keyword => userMessageLower.includes(keyword))) {
                responseCategory = category;
                break;
            }
        }

        // Choose response based on conversation progress
        if (messageCount <= 2) {
            responses = responseTemplates.initial;
        } else if (messageCount >= 8) {
            responses = responseTemplates.assessment;
        } else if (messageCount >= 5) {
            responses = responseTemplates.progression;
        } else if (responseTemplates.followUp[responseCategory]) {
            responses = responseTemplates.followUp[responseCategory];
        } else {
            responses = responseTemplates.followUp.general;
        }

        // Select a random response from the appropriate category
        const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

        // Add contextual follow-up questions
        let finalResponse = selectedResponse;

        // Add helpful context for certain symptoms
        if (userMessageLower.includes('chest pain')) {
            finalResponse += " If you're experiencing severe chest pain, especially with shortness of breath, please consider seeking immediate medical attention.";
        } else if (userMessageLower.includes('severe') || userMessageLower.includes('emergency')) {
            finalResponse += " For any severe or emergency symptoms, please don't hesitate to seek immediate medical care.";
        }

        // Determine message type
        let messageType = 'text';
        if (messageCount >= 8) {
            messageType = 'assessment_ready';
        } else if (finalResponse.includes('?')) {
            messageType = 'question';
        }

        return {
            message: finalResponse,
            messageType: messageType
        };

    } catch (error) {
        console.error('AI Response generation error:', error);

        // Provide more helpful error responses
        const errorResponses = [
            "I want to make sure I understand your symptoms correctly. Could you please describe what you're experiencing?",
            "I'm here to help you with your health concerns. Please tell me more about how you're feeling.",
            "Let me help you with your symptoms. Can you share more details about what's bothering you?"
        ];

        return {
            message: errorResponses[Math.floor(Math.random() * errorResponses.length)],
            messageType: 'text'
        };
    }
};

// Helper function to format diagnosis message
const formatDiagnosisMessage = (diagnosis) => {
    let message = `## 🏥 Health Assessment Complete\n\n`;
    message += `---\n\n`;

    if (diagnosis.primaryCondition) {
        message += `### 📊 Primary Assessment\n\n`;
        message += `**Condition:** ${diagnosis.primaryCondition.name}\n\n`;
        message += `**Confidence Level:** ${diagnosis.primaryCondition.confidence}%\n\n`;
        message += `**Description:**\n\n${diagnosis.primaryCondition.description}\n\n`;
        message += `---\n\n`;
    }

    if (diagnosis.recommendations && diagnosis.recommendations.length > 0) {
        message += `### 📋 Recommendations\n\n`;
        diagnosis.recommendations.forEach((rec, index) => {
            message += `**${index + 1}.** ${rec}\n\n`;
        });
        message += `---\n\n`;
    }

    message += `### ⚠️ Important Disclaimer\n\n`;
    message += `> This assessment is for **informational purposes only** and should not replace professional medical advice.\n\n`;
    message += `> Please consult with a healthcare provider for proper diagnosis and treatment.\n\n`;

    message += `---\n\n`;
    message += `*Assessment completed at ${new Date().toLocaleString()}*`;

    return message;
};

export default router;
