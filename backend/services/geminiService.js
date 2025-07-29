import fetch from 'node-fetch';

class GeminiService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';

        // Health-focused system prompt for backend AI
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

    async sendMessage(messages, conversationContext = {}) {
        try {
            // Convert messages to Gemini format
            const conversationText = messages
                .filter(msg => msg.role !== 'system')
                .map(msg => {
                    if (msg.role === 'user') {
                        return `Human: ${msg.content}`;
                    } else {
                        return `Assistant: ${msg.content}`;
                    }
                }).join('\n\n');

            // Combine system prompt with conversation
            const fullPrompt = `${this.systemPrompt}\n\nConversation:\n${conversationText}\n\nAssistant:`;

            const requestBody = {
                contents: [{
                    parts: [{ text: fullPrompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                    topP: 0.8,
                    topK: 40
                }
            };

            // Try different Gemini models in order of preference
            const modelNames = [
                'gemini-1.5-pro',
                'gemini-1.5-flash'
            ];

            let lastError = null;

            for (const modelName of modelNames) {
                try {
                    console.log(`Backend: Trying Gemini model: ${modelName}`);

                    const response = await fetch(`${this.baseURL}/models/${modelName}:generateContent?key=${this.apiKey}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody)
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        const errorMessage = errorData.error?.message || response.statusText;
                        console.warn(`Backend: Model ${modelName} failed:`, errorMessage);

                        // If model is overloaded, try with a short delay
                        if (errorMessage.includes('overloaded') && (modelName === 'gemini-1.5-pro' || modelName === 'gemini-1.5-flash')) {
                            console.log(`Backend: Retrying ${modelName} after brief delay...`);
                            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

                            const retryResponse = await fetch(`${this.baseURL}/models/${modelName}:generateContent?key=${this.apiKey}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(requestBody)
                            });

                            if (retryResponse.ok) {
                                const retryData = await retryResponse.json();
                                if (retryData.candidates && retryData.candidates.length > 0) {
                                    console.log(`Backend: Successfully used Gemini model: ${modelName} (after retry)`);
                                    return retryData.candidates[0].content.parts[0].text.trim();
                                }
                            }
                        }

                        lastError = new Error(`Gemini API Error with ${modelName}: ${errorMessage}`);
                        continue;
                    }

                    const data = await response.json();

                    if (!data.candidates || data.candidates.length === 0) {
                        console.warn(`Backend: Model ${modelName} returned no candidates`);
                        lastError = new Error(`No response generated by ${modelName}`);
                        continue;
                    }

                    const candidate = data.candidates[0];

                    // Handle safety filtering
                    if (candidate.finishReason === 'SAFETY') {
                        return "I understand you're looking for health guidance. Let me provide some general information while recommending you consult with a healthcare provider for personalized advice and proper evaluation.";
                    }

                    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                        console.warn(`Backend: Model ${modelName} returned no content`);
                        lastError = new Error(`No content in response from ${modelName}`);
                        continue;
                    }

                    console.log(`Backend: Successfully used Gemini model: ${modelName}`);
                    return candidate.content.parts[0].text;

                } catch (error) {
                    console.warn(`Backend: Error with model ${modelName}:`, error.message);
                    lastError = error;
                    continue;
                }
            }

            // If all models failed, throw the last error
            throw lastError || new Error('All Gemini models failed');

        } catch (error) {
            console.error('Backend Gemini Service Error:', error);
            throw error;
        }
    }

    async generateHealthAssessment(symptoms, userInfo, conversationHistory) {
        try {
            const assessmentPrompt = `As a professional AI health assistant, provide a comprehensive health consultation summary based on the information below.

User Profile:
- Age: ${userInfo.age}
- Gender: ${userInfo.gender}

Conversation History:
${conversationHistory.map(msg => `${msg.sender}: ${msg.message}`).join('\n')}

Please provide a structured health consultation summary with:

1. **Summary of Symptoms**: Brief overview of what the user has described
2. **Key Observations**: Important points from our conversation
3. **General Health Information**: Educational information related to their concerns (not medical diagnosis)
4. **Recommendations**: General health advice and next steps
5. **Urgency Assessment**: How urgent this seems (low/medium/high/emergency)

IMPORTANT GUIDELINES:
- Always emphasize this is informational only
- Recommend consulting healthcare providers for proper diagnosis
- Use clear, understandable language
- Be supportive and empathetic
- For concerning symptoms, emphasize seeking medical attention

Format your response as a comprehensive health consultation summary using markdown formatting.`;

            const messages = [
                { role: 'user', content: assessmentPrompt }
            ];

            const response = await this.sendMessage(messages);

            // Parse urgency level from response
            let urgencyLevel = 'medium';
            const responseText = response.toLowerCase();

            if (responseText.includes('emergency') || responseText.includes('urgent') || responseText.includes('immediate')) {
                urgencyLevel = 'emergency';
            } else if (responseText.includes('high priority') || responseText.includes('see doctor soon') || responseText.includes('concerning')) {
                urgencyLevel = 'high';
            } else if (responseText.includes('low priority') || responseText.includes('monitor') || responseText.includes('mild')) {
                urgencyLevel = 'low';
            }

            return {
                assessment: response,
                confidence: 85,
                primaryCondition: {
                    name: 'Health Consultation Complete',
                    confidence: 85,
                    description: 'Based on the conversation, general health guidance has been provided'
                },
                recommendations: [
                    "Schedule an appointment with a healthcare provider for proper evaluation",
                    "Keep track of your symptoms and any changes",
                    "Follow up if symptoms persist or worsen",
                    "Maintain healthy lifestyle practices",
                    "Seek immediate medical attention if symptoms become severe"
                ],
                urgencyLevel: urgencyLevel
            };
        } catch (error) {
            console.error('Backend Gemini Assessment Error:', error);
            throw error;
        }
    }
}

// Create and export Gemini service instance
const createGeminiService = () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
        console.log('GEMINI_API_KEY environment variable is not set or empty');
        return null;
    }

    console.log('Creating Gemini service with API key:', apiKey.substring(0, 10) + '...');
    return new GeminiService(apiKey);
};

// Fallback diagnosis generation function for when Gemini is not available
const generateDiagnosis = async (diagnosisData) => {
    // Simple fallback diagnosis structure
    return {
        primaryCondition: {
            name: 'Health Consultation',
            confidence: 70,
            description: 'Based on the symptoms described, general health guidance has been provided.'
        },
        recommendations: [
            "Schedule an appointment with a healthcare provider for proper evaluation",
            "Monitor your symptoms and note any changes",
            "Seek immediate medical attention if symptoms worsen",
            "Maintain good general health practices"
        ],
        urgencyLevel: 'medium',
        assessment: 'Please consult with a healthcare provider for proper medical evaluation and diagnosis.'
    };
};

export { GeminiService, createGeminiService, generateDiagnosis };