// AI Health Diagnosis Service
// This service provides AI-powered health diagnosis based on symptoms

// Symptom to condition mapping database
const symptomDatabase = {
    // Respiratory conditions
    'common_cold': {
        symptoms: ['runny nose', 'sneezing', 'mild cough', 'sore throat', 'mild fever'],
        description: 'A viral infection of the upper respiratory tract',
        recommendations: [
            'Get plenty of rest',
            'Stay hydrated with fluids',
            'Use a humidifier or breathe steam',
            'Consider over-the-counter cold medications',
            'Symptoms typically resolve in 7-10 days'
        ],
        urgency: 'low'
    },
    'flu': {
        symptoms: ['high fever', 'body aches', 'fatigue', 'chills', 'headache', 'dry cough'],
        description: 'Influenza viral infection affecting the respiratory system',
        recommendations: [
            'Rest and stay home to avoid spreading infection',
            'Drink plenty of fluids',
            'Consider antiviral medications if caught early',
            'Monitor fever and seek help if it becomes very high',
            'Recovery typically takes 1-2 weeks'
        ],
        urgency: 'medium'
    },
    'bronchitis': {
        symptoms: ['persistent cough', 'mucus production', 'chest discomfort', 'mild fever', 'fatigue'],
        description: 'Inflammation of the bronchial tubes in the lungs',
        recommendations: [
            'Rest and avoid irritants like smoke',
            'Use a humidifier',
            'Drink warm liquids',
            'Consider honey for cough relief',
            'See a doctor if symptoms worsen or persist beyond 3 weeks'
        ],
        urgency: 'medium'
    },

    // Digestive conditions
    'gastroenteritis': {
        symptoms: ['nausea', 'vomiting', 'diarrhea', 'stomach cramps', 'mild fever'],
        description: 'Inflammation of the stomach and intestines, often called stomach flu',
        recommendations: [
            'Stay hydrated with clear fluids',
            'Follow the BRAT diet (bananas, rice, applesauce, toast)',
            'Avoid dairy and fatty foods temporarily',
            'Rest and avoid solid foods until vomiting stops',
            'Seek medical attention if dehydration occurs'
        ],
        urgency: 'medium'
    },
    'acid_reflux': {
        symptoms: ['heartburn', 'chest pain', 'regurgitation', 'difficulty swallowing', 'sour taste'],
        description: 'Stomach acid backing up into the esophagus',
        recommendations: [
            'Avoid trigger foods (spicy, fatty, acidic)',
            'Eat smaller, more frequent meals',
            'Avoid lying down after eating',
            'Elevate the head of your bed',
            'Consider over-the-counter antacids'
        ],
        urgency: 'low'
    },

    // Neurological conditions
    'tension_headache': {
        symptoms: ['headache', 'neck tension', 'scalp tenderness', 'mild sensitivity to light'],
        description: 'The most common type of headache, often stress-related',
        recommendations: [
            'Apply cold or heat to your head or neck',
            'Practice relaxation techniques',
            'Get adequate sleep',
            'Stay hydrated',
            'Consider over-the-counter pain relievers'
        ],
        urgency: 'low'
    },
    'migraine': {
        symptoms: ['severe headache', 'nausea', 'vomiting', 'sensitivity to light', 'sensitivity to sound'],
        description: 'A neurological condition causing intense, debilitating headaches',
        recommendations: [
            'Rest in a quiet, dark room',
            'Apply cold compress to forehead',
            'Stay hydrated',
            'Identify and avoid triggers',
            'Consider prescribed migraine medications'
        ],
        urgency: 'medium'
    },

    // Emergency conditions
    'heart_attack': {
        symptoms: ['chest pain', 'shortness of breath', 'nausea', 'sweating', 'pain radiating to arm'],
        description: 'Serious medical emergency requiring immediate attention',
        recommendations: [
            '🚨 CALL EMERGENCY SERVICES IMMEDIATELY',
            'Chew aspirin if not allergic',
            'Stay calm and sit upright',
            'Do not drive yourself to hospital'
        ],
        urgency: 'emergency'
    },
    'stroke': {
        symptoms: ['sudden weakness', 'face drooping', 'speech difficulty', 'severe headache', 'confusion'],
        description: 'Medical emergency caused by interrupted blood flow to the brain',
        recommendations: [
            '🚨 CALL EMERGENCY SERVICES IMMEDIATELY',
            'Note the time symptoms started',
            'Do not give food or water',
            'Keep the person calm and lying down'
        ],
        urgency: 'emergency'
    }
};

// Helper function to normalize symptoms
const normalizeSymptom = (symptom) => {
    return symptom.toLowerCase().trim().replace(/[^\w\s]/g, '');
};

// Helper function to calculate symptom match score
const calculateSymptomMatch = (userSymptoms, conditionSymptoms) => {
    const normalizedUserSymptoms = userSymptoms.map(s => normalizeSymptom(s.name || s));
    const normalizedConditionSymptoms = conditionSymptoms.map(normalizeSymptom);

    let matches = 0;
    let totalWeight = 0;

    normalizedUserSymptoms.forEach(userSymptom => {
        normalizedConditionSymptoms.forEach(conditionSymptom => {
            if (conditionSymptom.includes(userSymptom) || userSymptom.includes(conditionSymptom)) {
                matches += 1;
            }
        });
        totalWeight += 1;
    });

    return totalWeight > 0 ? (matches / totalWeight) * 100 : 0;
};

// Helper function to adjust confidence based on user factors
const adjustConfidenceForUserFactors = (baseConfidence, userProfile) => {
    let adjustedConfidence = baseConfidence;

    // Age adjustments
    if (userProfile.age < 18) {
        adjustedConfidence *= 0.9; // Slightly lower confidence for pediatric cases
    } else if (userProfile.age > 65) {
        adjustedConfidence *= 0.95; // Account for complex elderly health
    }

    // Medical history adjustments
    if (userProfile.medicalHistory && userProfile.medicalHistory.length > 0) {
        adjustedConfidence *= 0.9; // Lower confidence with existing conditions
    }

    // Medication adjustments
    if (userProfile.currentMedications && userProfile.currentMedications.length > 0) {
        adjustedConfidence *= 0.95; // Account for drug interactions
    }

    return Math.min(Math.max(adjustedConfidence, 10), 95); // Keep between 10-95%
};

// Main diagnosis generation function
export const generateDiagnosis = async (diagnosisData) => {
    try {
        const { symptoms, age, gender, medicalHistory = [], currentMedications = [] } = diagnosisData;

        if (!symptoms || symptoms.length === 0) {
            throw new Error('No symptoms provided for diagnosis');
        }

        // Calculate match scores for all conditions
        const conditionScores = Object.entries(symptomDatabase).map(([conditionKey, conditionData]) => {
            const matchScore = calculateSymptomMatch(symptoms, conditionData.symptoms);
            const adjustedConfidence = adjustConfidenceForUserFactors(matchScore, {
                age,
                gender,
                medicalHistory,
                currentMedications
            });

            return {
                name: conditionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                confidence: Math.round(adjustedConfidence),
                description: conditionData.description,
                recommendations: conditionData.recommendations,
                urgencyLevel: conditionData.urgency,
                rawScore: matchScore
            };
        });

        // Sort by confidence and filter relevant ones
        const sortedConditions = conditionScores
            .filter(condition => condition.confidence > 15) // Only include conditions with >15% confidence
            .sort((a, b) => b.confidence - a.confidence);

        if (sortedConditions.length === 0) {
            return {
                primaryCondition: {
                    name: 'Symptoms Require Professional Evaluation',
                    confidence: 0,
                    description: 'The symptoms you described require professional medical evaluation for accurate diagnosis.'
                },
                alternativeConditions: [],
                recommendations: [
                    'Schedule an appointment with your healthcare provider',
                    'Keep a symptom diary noting when symptoms occur',
                    'Monitor your symptoms for any changes',
                    'Seek immediate care if symptoms worsen significantly'
                ],
                urgencyLevel: 'medium',
                disclaimerShown: true
            };
        }

        const primaryCondition = sortedConditions[0];
        const alternativeConditions = sortedConditions.slice(1, 4); // Top 3 alternatives

        // Determine overall urgency level
        let overallUrgency = 'low';
        if (sortedConditions.some(c => c.urgencyLevel === 'emergency')) {
            overallUrgency = 'emergency';
        } else if (sortedConditions.some(c => c.urgencyLevel === 'high')) {
            overallUrgency = 'high';
        } else if (sortedConditions.some(c => c.urgencyLevel === 'medium')) {
            overallUrgency = 'medium';
        }

        // Generate comprehensive recommendations
        const allRecommendations = new Set();

        // Add primary condition recommendations
        primaryCondition.recommendations.forEach(rec => allRecommendations.add(rec));

        // Add general health recommendations
        allRecommendations.add('Monitor your symptoms and note any changes');
        allRecommendations.add('Maintain good hydration');
        allRecommendations.add('Get adequate rest');

        if (overallUrgency === 'emergency') {
            allRecommendations.add('🚨 SEEK IMMEDIATE EMERGENCY MEDICAL CARE');
        } else if (overallUrgency === 'high') {
            allRecommendations.add('Contact your healthcare provider within 24 hours');
        } else if (overallUrgency === 'medium') {
            allRecommendations.add('Consider scheduling a medical appointment within a few days');
        }

        return {
            primaryCondition: {
                name: primaryCondition.name,
                confidence: primaryCondition.confidence,
                description: primaryCondition.description
            },
            alternativeConditions: alternativeConditions.map(condition => ({
                name: condition.name,
                confidence: condition.confidence,
                description: condition.description
            })),
            recommendations: Array.from(allRecommendations),
            urgencyLevel: overallUrgency,
            disclaimerShown: true
        };

    } catch (error) {
        console.error('Diagnosis generation error:', error);

        return {
            primaryCondition: {
                name: 'Unable to Generate Diagnosis',
                confidence: 0,
                description: 'An error occurred while analyzing your symptoms. Please consult with a healthcare professional.'
            },
            alternativeConditions: [],
            recommendations: [
                'Consult with a healthcare provider for proper evaluation',
                'Keep track of your symptoms',
                'Seek immediate care if symptoms are severe or worsening'
            ],
            urgencyLevel: 'medium',
            disclaimerShown: true
        };
    }
};

// Function to get symptom suggestions based on user input
export const getSymptomSuggestions = (inputText) => {
    const allSymptoms = new Set();

    Object.values(symptomDatabase).forEach(condition => {
        condition.symptoms.forEach(symptom => allSymptoms.add(symptom));
    });

    const input = inputText.toLowerCase().trim();

    return Array.from(allSymptoms)
        .filter(symptom => symptom.toLowerCase().includes(input))
        .slice(0, 10); // Return top 10 suggestions
};

// Function to validate symptom input
export const validateSymptoms = (symptoms) => {
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
        return { isValid: false, message: 'At least one symptom is required' };
    }

    for (const symptom of symptoms) {
        if (!symptom.name || symptom.name.trim().length < 2) {
            return { isValid: false, message: 'Each symptom must have a valid name' };
        }

        if (symptom.category && !['general', 'respiratory', 'digestive', 'neurological', 'cardiovascular', 'dermatological', 'musculoskeletal', 'other'].includes(symptom.category)) {
            return { isValid: false, message: 'Invalid symptom category' };
        }
    }

    return { isValid: true, message: 'Symptoms are valid' };
};

export default { generateDiagnosis, getSymptomSuggestions, validateSymptoms };
