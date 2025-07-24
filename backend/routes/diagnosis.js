import express from 'express';
import Diagnosis from '../models/Diagnosis.js';
import { auth } from '../middleware/auth.js';
import { generateDiagnosis } from '../services/aiService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// @route   POST /api/diagnosis/start
// @desc    Start a new diagnosis session
// @access  Private
router.post('/start', auth, async (req, res) => {
    try {
        const { age, gender } = req.body;

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
            diagnosis
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
            symptomsCount: diagnosis.symptoms.length
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

        const diagnosis = await Diagnosis.findOne({
            sessionId,
            user: req.user._id
        });

        if (!diagnosis) {
            return res.status(404).json({
                message: 'Diagnosis session not found'
            });
        }

        if (diagnosis.symptoms.length === 0) {
            return res.status(400).json({
                message: 'Please provide at least one symptom before completing diagnosis'
            });
        }

        // Update medical history and medications
        diagnosis.medicalHistory = medicalHistory;
        diagnosis.currentMedications = currentMedications;

        // Generate final diagnosis using AI
        const finalDiagnosis = await generateDiagnosis({
            symptoms: diagnosis.symptoms,
            age: diagnosis.age,
            gender: diagnosis.gender,
            medicalHistory,
            currentMedications,
            chatHistory: diagnosis.chatMessages
        });

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
        res.status(500).json({
            message: 'Server error completing diagnosis'
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

        const diagnoses = await Diagnosis.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .select('sessionId symptoms diagnosis createdAt status');

        const total = await Diagnosis.countDocuments({ user: req.user._id });

        res.json({
            message: 'Diagnosis history retrieved successfully',
            diagnoses,
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

        res.json({
            message: 'Diagnosis session retrieved successfully',
            diagnosis
        });
    } catch (error) {
        console.error('Get diagnosis session error:', error);
        res.status(500).json({
            message: 'Server error retrieving diagnosis session'
        });
    }
});

// Helper function to generate AI response
const generateAIResponse = async (diagnosis, userMessage) => {
    try {
        const symptomKeywords = [
            'pain', 'ache', 'hurt', 'fever', 'temperature', 'headache', 'cough',
            'nausea', 'vomit', 'diarrhea', 'constipation', 'tired', 'fatigue',
            'dizzy', 'shortness of breath', 'chest pain', 'rash', 'itch'
        ];

        const hasSymptomKeywords = symptomKeywords.some(keyword =>
            userMessage.toLowerCase().includes(keyword)
        );

        if (hasSymptomKeywords) {
            return {
                message: "I understand you're experiencing these symptoms. Can you tell me more about when these symptoms started and how severe they are on a scale of 1-10? Also, have you noticed anything that makes them better or worse?",
                messageType: 'question'
            };
        }

        if (diagnosis.symptoms.length >= 3) {
            return {
                message: "Thank you for providing detailed information about your symptoms. Based on what you've told me, I have enough information to provide a preliminary analysis. Would you like me to proceed with the diagnosis, or do you have any additional symptoms to mention?",
                messageType: 'question'
            };
        }

        return {
            message: "Thank you for that information. Can you describe any other symptoms you might be experiencing? Even minor ones can be important for an accurate assessment.",
            messageType: 'question'
        };
    } catch (error) {
        console.error('AI Response generation error:', error);
        return {
            message: "I understand. Please continue describing your symptoms, and I'll help analyze them.",
            messageType: 'text'
        };
    }
};

// Helper function to format diagnosis message
const formatDiagnosisMessage = (diagnosis) => {
    let message = `## Health Assessment Complete\n\n`;

    if (diagnosis.primaryCondition) {
        message += `**Primary Assessment:** ${diagnosis.primaryCondition.name}\n`;
        message += `**Confidence Level:** ${diagnosis.primaryCondition.confidence}%\n`;
        message += `**Description:** ${diagnosis.primaryCondition.description}\n\n`;
    }

    if (diagnosis.recommendations && diagnosis.recommendations.length > 0) {
        message += `**Recommendations:**\n`;
        diagnosis.recommendations.forEach((rec, index) => {
            message += `${index + 1}. ${rec}\n`;
        });
        message += `\n`;
    }

    message += `**⚠️ Important Disclaimer:**\n`;
    message += `This assessment is for informational purposes only and should not replace professional medical advice. `;

    if (diagnosis.urgencyLevel === 'emergency') {
        message += `**🚨 URGENT: Please seek immediate medical attention.**`;
    } else if (diagnosis.urgencyLevel === 'high') {
        message += `**Please consult with a healthcare provider soon.**`;
    } else {
        message += `Please consult with a healthcare provider for proper diagnosis and treatment.`;
    }

    return message;
};

export default router;
