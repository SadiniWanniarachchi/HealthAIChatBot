import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    passwordResetToken: {
        type: String,
        default: undefined
    },
    passwordResetExpires: {
        type: Date,
        default: undefined
    },
    healthProfile: {
        weight: {
            type: Number,
            min: [1, 'Weight must be greater than 0'],
            max: [1000, 'Weight seems unrealistic']
        },
        height: {
            type: Number,
            min: [1, 'Height must be greater than 0'],
            max: [300, 'Height seems unrealistic']
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            trim: true
        },
        dateOfBirth: {
            type: Date
        },
        allergies: {
            type: String,
            trim: true,
            maxlength: [500, 'Allergies description too long']
        },
        chronicConditions: {
            type: String,
            trim: true,
            maxlength: [500, 'Chronic conditions description too long']
        },
        medications: {
            type: String,
            trim: true,
            maxlength: [1000, 'Medications list too long']
        },
        emergencyContact: {
            type: String,
            trim: true,
            maxlength: [100, 'Emergency contact name too long']
        },
        emergencyPhone: {
            type: String,
            trim: true,
            maxlength: [20, 'Emergency phone number too long']
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = function (identifier) {
    return this.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    });
};

const User = mongoose.model('User', userSchema);

export default User;
