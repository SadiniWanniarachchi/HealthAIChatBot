import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const chatSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Chat title is required'],
        trim: true,
        maxlength: [100, 'Chat title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Chat description cannot exceed 500 characters']
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    messages: [messageSchema],
    chatType: {
        type: String,
        enum: ['direct', 'group', 'ai'],
        default: 'group'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for better query performance
chatSchema.index({ participants: 1 });
chatSchema.index({ createdBy: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ 'messages.sender': 1 });

// Update lastActivity when new message is added
chatSchema.pre('save', function (next) {
    if (this.isModified('messages')) {
        this.lastActivity = new Date();
    }
    next();
});

// Instance method to add message
chatSchema.methods.addMessage = function (messageData) {
    this.messages.push(messageData);
    this.lastActivity = new Date();
    return this.save();
};

// Instance method to add participant
chatSchema.methods.addParticipant = function (userId, role = 'member') {
    const existingParticipant = this.participants.find(
        p => p.user.toString() === userId.toString()
    );

    if (!existingParticipant) {
        this.participants.push({
            user: userId,
            role: role,
            joinedAt: new Date()
        });
    }

    return this.save();
};

// Instance method to remove participant
chatSchema.methods.removeParticipant = function (userId) {
    this.participants = this.participants.filter(
        p => p.user.toString() !== userId.toString()
    );
    return this.save();
};

// Static method to find chats by user
chatSchema.statics.findByUser = function (userId) {
    return this.find({
        'participants.user': userId,
        isActive: true
    }).populate('participants.user', 'username firstName lastName avatar')
        .populate('createdBy', 'username firstName lastName')
        .sort({ lastActivity: -1 });
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
