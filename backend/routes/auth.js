import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Validation
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findByEmailOrUsername(email);
        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email or username already exists'
            });
        }

        // Check if username is taken
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                message: 'Username is already taken'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName
        });

        await user.save();

        // Generate JWT token
        const payload = {
            userId: user._id,
            username: user.username,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or username

        // Validation
        if (!identifier || !password) {
            return res.status(400).json({
                message: 'Email/Username and password are required'
            });
        }

        // Find user by email or username
        const user = await User.findByEmailOrUsername(identifier);
        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(400).json({
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const payload = {
            userId: user._id,
            username: user.username,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });

        res.json({
            message: 'Login successful',
            token,
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            message: 'User retrieved successfully',
            user: req.user.getPublicProfile()
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            message: 'Server error retrieving user data'
        });
    }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
    try {
        const payload = {
            userId: req.user._id,
            username: req.user.username,
            email: req.user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });

        res.json({
            message: 'Token refreshed successfully',
            token
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            message: 'Server error during token refresh'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
    // Since JWT is stateless, logout is handled client-side by removing the token
    res.json({
        message: 'Logout successful. Please remove token from client storage.'
    });
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({
                message: 'If an account with that email exists, we have sent a password reset link.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set reset token and expiry (10 minutes)
        user.passwordResetToken = resetTokenHash;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Create reset URL
        const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

        // Email content
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">MediCare AI</h1>
                    <p style="color: white; margin: 5px 0 0 0;">Advanced Healthcare Intelligence</p>
                </div>
                
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                        You are receiving this email because you (or someone else) has requested a password reset for your MediCare AI account.
                    </p>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                        Please click the button below to reset your password. This link will expire in 10 minutes for security reasons.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetURL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                            Reset My Password
                        </a>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                        If the button doesn't work, you can copy and paste this link into your browser:
                    </p>
                    
                    <p style="color: #007bff; word-break: break-all; margin-bottom: 30px;">
                        ${resetURL}
                    </p>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                        If you did not request this password reset, please ignore this email and your password will remain unchanged.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This is an automated message from MediCare AI. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `;

        // Configure email transporter (using environment variables)
        const transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Send email
        try {
            await transporter.sendMail({
                from: `"MediCare AI" <${process.env.EMAIL_FROM || 'noreply@medicareai.com'}>`,
                to: user.email,
                subject: 'MediCare AI - Password Reset Request',
                html: message
            });

            res.json({
                message: 'Password reset email sent successfully'
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);

            // Clear the reset token if email fails
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            return res.status(500).json({
                message: 'There was an error sending the email. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            message: 'Server error during password reset request'
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: 'Token and password are required'
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long'
            });
        }

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Token is invalid or has expired'
            });
        }

        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            message: 'Server error during password reset'
        });
    }
});

export default router;
