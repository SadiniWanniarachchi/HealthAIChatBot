import express from 'express';
import Chat from '../models/Chat.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/chat
// @desc    Get all chats for current user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const chats = await Chat.findByUser(req.user._id);

        res.json({
            message: 'Chats retrieved successfully',
            chats
        });
    } catch (error) {
        console.error('Get chats error:', error);
        res.status(500).json({
            message: 'Server error retrieving chats'
        });
    }
});

// @route   POST /api/chat
// @desc    Create a new chat
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, participants, chatType = 'group' } = req.body;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                message: 'Chat title is required'
            });
        }

        // Prepare participants array
        const chatParticipants = [{
            user: req.user._id,
            role: 'admin',
            joinedAt: new Date()
        }];

        // Add other participants if provided
        if (participants && Array.isArray(participants)) {
            participants.forEach(participantId => {
                if (participantId !== req.user._id.toString()) {
                    chatParticipants.push({
                        user: participantId,
                        role: 'member',
                        joinedAt: new Date()
                    });
                }
            });
        }

        const chat = new Chat({
            title: title.trim(),
            description: description ? description.trim() : '',
            participants: chatParticipants,
            chatType,
            createdBy: req.user._id
        });

        await chat.save();

        // Populate the created chat
        await chat.populate('participants.user', 'username firstName lastName avatar');
        await chat.populate('createdBy', 'username firstName lastName');

        res.status(201).json({
            message: 'Chat created successfully',
            chat
        });
    } catch (error) {
        console.error('Create chat error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            message: 'Server error creating chat'
        });
    }
});

// @route   GET /api/chat/:id
// @desc    Get chat by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id)
            .populate('participants.user', 'username firstName lastName avatar')
            .populate('createdBy', 'username firstName lastName')
            .populate('messages.sender', 'username firstName lastName avatar');

        if (!chat) {
            return res.status(404).json({
                message: 'Chat not found'
            });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            p => p.user._id.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: 'Access denied. You are not a participant in this chat.'
            });
        }

        res.json({
            message: 'Chat retrieved successfully',
            chat
        });
    } catch (error) {
        console.error('Get chat by ID error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid chat ID format'
            });
        }

        res.status(500).json({
            message: 'Server error retrieving chat'
        });
    }
});

// @route   POST /api/chat/:id/messages
// @desc    Add message to chat
// @access  Private
router.post('/:id/messages', auth, async (req, res) => {
    try {
        const { content, messageType = 'text' } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                message: 'Message content is required'
            });
        }

        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).json({
                message: 'Chat not found'
            });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            p => p.user.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: 'Access denied. You are not a participant in this chat.'
            });
        }

        const message = {
            content: content.trim(),
            sender: req.user._id,
            messageType
        };

        await chat.addMessage(message);

        // Get the updated chat with populated fields
        const updatedChat = await Chat.findById(chat._id)
            .populate('messages.sender', 'username firstName lastName avatar')
            .select('messages');

        // Get the last message (the one we just added)
        const newMessage = updatedChat.messages[updatedChat.messages.length - 1];

        res.status(201).json({
            message: 'Message added successfully',
            newMessage
        });
    } catch (error) {
        console.error('Add message error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid chat ID format'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            message: 'Server error adding message'
        });
    }
});

// @route   PUT /api/chat/:id/participants
// @desc    Add participant to chat
// @access  Private
router.put('/:id/participants', auth, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required'
            });
        }

        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).json({
                message: 'Chat not found'
            });
        }

        // Check if current user is admin of the chat
        const currentUserParticipant = chat.participants.find(
            p => p.user.toString() === req.user._id.toString()
        );

        if (!currentUserParticipant || currentUserParticipant.role !== 'admin') {
            return res.status(403).json({
                message: 'Access denied. Only chat admins can add participants.'
            });
        }

        await chat.addParticipant(userId);

        // Get updated chat
        await chat.populate('participants.user', 'username firstName lastName avatar');

        res.json({
            message: 'Participant added successfully',
            chat
        });
    } catch (error) {
        console.error('Add participant error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid ID format'
            });
        }

        res.status(500).json({
            message: 'Server error adding participant'
        });
    }
});

// @route   DELETE /api/chat/:id/participants/:userId
// @desc    Remove participant from chat
// @access  Private
router.delete('/:id/participants/:userId', auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).json({
                message: 'Chat not found'
            });
        }

        // Check if current user is admin or removing themselves
        const currentUserParticipant = chat.participants.find(
            p => p.user.toString() === req.user._id.toString()
        );

        const isAdmin = currentUserParticipant && currentUserParticipant.role === 'admin';
        const isRemovingSelf = req.params.userId === req.user._id.toString();

        if (!isAdmin && !isRemovingSelf) {
            return res.status(403).json({
                message: 'Access denied. Only chat admins can remove participants or users can remove themselves.'
            });
        }

        await chat.removeParticipant(req.params.userId);

        // Get updated chat
        await chat.populate('participants.user', 'username firstName lastName avatar');

        res.json({
            message: 'Participant removed successfully',
            chat
        });
    } catch (error) {
        console.error('Remove participant error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid ID format'
            });
        }

        res.status(500).json({
            message: 'Server error removing participant'
        });
    }
});

// @route   DELETE /api/chat/:id
// @desc    Delete chat
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).json({
                message: 'Chat not found'
            });
        }

        // Check if user is the creator or admin
        const currentUserParticipant = chat.participants.find(
            p => p.user.toString() === req.user._id.toString()
        );

        const isCreator = chat.createdBy.toString() === req.user._id.toString();
        const isAdmin = currentUserParticipant && currentUserParticipant.role === 'admin';

        if (!isCreator && !isAdmin) {
            return res.status(403).json({
                message: 'Access denied. Only chat creator or admins can delete the chat.'
            });
        }

        // Soft delete
        chat.isActive = false;
        await chat.save();

        res.json({
            message: 'Chat deleted successfully'
        });
    } catch (error) {
        console.error('Delete chat error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid chat ID format'
            });
        }

        res.status(500).json({
            message: 'Server error deleting chat'
        });
    }
});

export default router;
