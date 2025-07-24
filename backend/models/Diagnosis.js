import mongoose from 'mongoose';

const symptomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['general', 'respiratory', 'digestive', 'neurological', 'cardiovascular', 'dermatological', 'musculoskeletal', 'other']
    },
    severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        default: 'mild'
    }
});

const diagnosisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    symptoms: [symptomSchema],
    age: {
        type: Number,
        required: true,
        min: 1,
        max: 120
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    medicalHistory: [{
        condition: String,
        year: Number
    }],
    currentMedications: [{
        name: String,
        dosage: String
    }],
    diagnosis: {
        primaryCondition: {
            name: String,
            confidence: Number, // 0-100
            description: String
        },
        alternativeConditions: [{
            name: String,
            confidence: Number,
            description: String
        }],
        recommendations: [String],
        urgencyLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'emergency'],
            default: 'low'
        },
        disclaimerShown: {
            type: Boolean,
            default: true
        }
    },
    chatMessages: [{
        message: String,
        sender: {
            type: String,
            enum: ['user', 'bot'],
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        messageType: {
            type: String,
            enum: ['text', 'symptom', 'question', 'diagnosis'],
            default: 'text'
        }
    }],
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Composite index for better query performance on user history
diagnosisSchema.index({ user: 1, createdAt: -1 });

// Instance method to add chat message
diagnosisSchema.methods.addMessage = function (message, sender, messageType = 'text') {
    this.chatMessages.push({
        message,
        sender,
        messageType,
        timestamp: new Date()
    });
    return this.save();
};

// Instance method to complete diagnosis
diagnosisSchema.methods.completeDiagnosis = function (diagnosisData) {
    this.diagnosis = diagnosisData;
    this.status = 'completed';
    this.completedAt = new Date();
    return this.save();
};

// Static method to find user's diagnosis history
diagnosisSchema.statics.findUserHistory = function (userId, limit = 10) {
    return this.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('symptoms diagnosis createdAt status urgencyLevel');
};

const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);

export default Diagnosis;
