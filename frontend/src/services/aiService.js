import { createAIService, GeminiService } from './aiProviders';

// AI Service for health consultations
class AIService {
    constructor() {
        // Create appropriate AI provider based on available API keys
        this.provider = createAIService();
        console.log('AI Service initialized with provider:', this.provider.constructor.name);

        // Enhanced health-focused system prompt
        this.systemPrompt = `You are a professional AI health assistant designed to help users with their health concerns. Your role is to:

CORE RESPONSIBILITIES:
1. Listen carefully to user symptoms and health concerns
2. Ask relevant, focused follow-up questions to gather more information
3. Provide general health guidance and education
4. Show empathy and understanding for user concerns
5. ALWAYS emphasize that you are not a replacement for professional medical care
6. Recommend seeing healthcare providers for proper diagnosis and treatment

CONVERSATION STYLE:
- Be empathetic, professional, and supportive
- Ask one or two focused questions at a time to avoid overwhelming users
- Keep responses concise but informative (2-4 sentences usually)
- Use clear, non-medical language that users can understand
- Acknowledge user concerns and validate their feelings

MEDICAL GUIDELINES:
- Never provide specific medical diagnoses
- Don't recommend specific medications or treatments
- Always suggest consulting healthcare providers for proper evaluation
- For serious symptoms, emphasize seeking immediate medical attention
- Provide general health education and wellness advice when appropriate

IMPORTANT DISCLAIMERS TO REMEMBER:
- You are NOT a licensed medical professional
- This consultation is for informational purposes only
- Users should consult healthcare providers for medical diagnosis and treatment
- In emergencies, users should call emergency services immediately

RESPONSE FORMAT:
- Start with acknowledgment of their concern
- Ask relevant follow-up questions
- Provide educational information when helpful
- End with appropriate medical disclaimer when needed

Example approach: "I understand your concern about [symptom]. To better help you, can you tell me [specific question]? While I can provide general information, it's important to consult with a healthcare provider for proper evaluation."`;
    }

    async sendMessage(message, conversationHistory = []) {
        try {
            console.log('Sending message to AI provider:', this.provider.constructor.name);

            // For Gemini AI provider, prepare the conversation with system prompt
            const messages = [
                { role: 'system', content: this.systemPrompt }
            ];

            // Add conversation history (limit to last 10 messages to avoid token limits)
            const recentHistory = conversationHistory.slice(-10);
            recentHistory.forEach(msg => {
                messages.push({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.message
                });
            });

            // Add current user message
            messages.push({ role: 'user', content: message });

            console.log('Sending messages to AI provider:', messages.length, 'messages');

            const response = await this.provider.sendMessage(messages);

            return {
                message: response,
                messageType: 'text'
            };
        } catch (error) {
            console.error('AI Service Error:', error);

            // Provide different error messages based on error type
            let errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";

            if (error.message.includes('API key')) {
                errorMessage = "There seems to be an issue with the AI service configuration. Please check the API key setup.";
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                errorMessage = "The AI service has reached its usage limit. Please try again later or contact support.";
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = "I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
            }

            errorMessage += " If you're experiencing a medical emergency, please contact emergency services immediately.";

            return {
                message: errorMessage,
                messageType: 'error'
            };
        }
    }

    // Generate a health assessment summary
    async generateHealthAssessment(symptoms, userInfo, conversationHistory) {
        try {
            console.log('Generating health assessment with provider:', this.provider.constructor.name);

            // Use provider's assessment method if available
            if (this.provider.generateHealthAssessment) {
                return await this.provider.generateHealthAssessment(symptoms, userInfo, conversationHistory);
            }

            // Fallback for providers without assessment method
            const assessmentPrompt = `Based on our conversation, please provide a comprehensive health consultation summary.

User Information:
- Age: ${userInfo.age}  
- Gender: ${userInfo.gender}

Our Conversation:
${conversationHistory.map(msg => `${msg.sender}: ${msg.message}`).join('\n')}

Please provide a structured assessment including:
1. **Symptom Summary**: What the user has described
2. **Key Discussion Points**: Important topics we covered
3. **General Health Guidance**: Educational information and general advice
4. **Recommended Actions**: Practical next steps for the user
5. **When to Seek Care**: Guidelines for when to contact healthcare providers

Please format this as a clear, comprehensive summary that the user can reference. Remember to emphasize that this is informational guidance only and not a medical diagnosis.`;

            const messages = [
                { role: 'system', content: this.systemPrompt },
                { role: 'user', content: assessmentPrompt }
            ];

            const response = await this.provider.sendMessage(messages);

            // Determine urgency level based on conversation content
            let urgencyLevel = 'medium';
            const conversationText = conversationHistory.map(msg => msg.message).join(' ').toLowerCase();

            if (conversationText.includes('chest pain') || conversationText.includes('difficulty breathing') ||
                conversationText.includes('severe pain') || conversationText.includes('emergency')) {
                urgencyLevel = 'high';
            } else if (conversationText.includes('mild') || conversationText.includes('occasional')) {
                urgencyLevel = 'low';
            }

            return {
                assessment: response,
                confidence: 85,
                recommendations: [
                    "Schedule an appointment with your primary care physician",
                    "Keep a detailed record of your symptoms and any changes",
                    "Follow up if symptoms persist, worsen, or new symptoms develop",
                    "Maintain healthy lifestyle practices and self-care",
                    "Seek immediate medical attention if you experience severe or emergency symptoms"
                ],
                urgencyLevel: urgencyLevel
            };
        } catch (error) {
            console.error('Assessment Error:', error);
            throw new Error('Unable to generate health assessment at this time. Please try again later.');
        }
    }
}

export const aiService = new AIService();
