import express from 'express';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', auth, adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await User.countDocuments();

        res.json({
            message: 'Users retrieved successfully',
            users,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            message: 'Server error retrieving users'
        });
    }
});

// @route   GET /api/users/search
// @desc    Search users by username or name
// @access  Private
router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                message: 'Search query must be at least 2 characters long'
            });
        }

        const searchRegex = new RegExp(q.trim(), 'i');

        const users = await User.find({
            $or: [
                { username: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex }
            ],
            isActive: true,
            _id: { $ne: req.user._id } // Exclude current user
        })
            .select('username firstName lastName avatar')
            .limit(20);

        res.json({
            message: 'Search completed successfully',
            users,
            query: q
        });
    } catch (error) {
        console.error('User search error:', error);
        res.status(500).json({
            message: 'Server error during user search'
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'User retrieved successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Get user by ID error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid user ID format'
            });
        }

        res.status(500).json({
            message: 'Server error retrieving user'
        });
    }
});

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
    try {
        const { firstName, lastName, avatar } = req.body;

        // Build update object
        const updateFields = {};
        if (firstName) updateFields.firstName = firstName.trim();
        if (lastName) updateFields.lastName = lastName.trim();
        if (avatar !== undefined) updateFields.avatar = avatar;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                message: 'No valid fields provided for update'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'Profile updated successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Update profile error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            message: 'Server error updating profile'
        });
    }
});

// @route   PUT /api/users/health-profile
// @desc    Update user health profile
// @access  Private
router.put('/health-profile', auth, async (req, res) => {
    try {
        const {
            weight,
            height,
            bloodGroup,
            bloodPressureSystolic,
            bloodPressureDiastolic,
            diabetesStatus,
            cholesterolLevel,
            allergies,
            chronicConditions,
            medications,
            emergencyContact,
            emergencyPhone,
            dateOfBirth
        } = req.body;

        // Build health profile object
        const healthProfile = {};
        if (weight !== undefined) healthProfile.weight = parseFloat(weight) || undefined;
        if (height !== undefined) healthProfile.height = parseFloat(height) || undefined;
        if (bloodGroup !== undefined) healthProfile.bloodGroup = bloodGroup.trim();
        if (bloodPressureSystolic !== undefined) healthProfile.bloodPressureSystolic = parseFloat(bloodPressureSystolic) || undefined;
        if (bloodPressureDiastolic !== undefined) healthProfile.bloodPressureDiastolic = parseFloat(bloodPressureDiastolic) || undefined;
        if (diabetesStatus !== undefined) healthProfile.diabetesStatus = diabetesStatus.trim();
        if (cholesterolLevel !== undefined) healthProfile.cholesterolLevel = parseFloat(cholesterolLevel) || undefined;
        if (allergies !== undefined) healthProfile.allergies = allergies.trim();
        if (chronicConditions !== undefined) healthProfile.chronicConditions = chronicConditions.trim();
        if (medications !== undefined) healthProfile.medications = medications.trim();
        if (emergencyContact !== undefined) healthProfile.emergencyContact = emergencyContact.trim();
        if (emergencyPhone !== undefined) healthProfile.emergencyPhone = emergencyPhone.trim();
        if (dateOfBirth !== undefined) healthProfile.dateOfBirth = dateOfBirth;

        // Remove empty string values
        Object.keys(healthProfile).forEach(key => {
            if (healthProfile[key] === '' || healthProfile[key] === undefined) {
                delete healthProfile[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { healthProfile },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'Health profile updated successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Update health profile error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            message: 'Server error updating health profile'
        });
    }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id);

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            message: 'Server error changing password'
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: 'You cannot delete your own account'
            });
        }

        // Soft delete - deactivate user instead of removing
        user.isActive = false;
        await user.save();

        res.json({
            message: 'User deactivated successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid user ID format'
            });
        }

        res.status(500).json({
            message: 'Server error deleting user'
        });
    }
});

export default router;
