import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No token provided, authorization denied'
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by id
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'Token is not valid - user not found'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                message: 'Account is deactivated'
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Token is not valid'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token has expired'
            });
        }

        res.status(500).json({
            message: 'Server error during authentication'
        });
    }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// Optional auth - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');

            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

export { auth, adminAuth, optionalAuth };
