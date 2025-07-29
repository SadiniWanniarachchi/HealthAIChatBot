import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    HeartPulse,
    ArrowLeft,
    User,
    Mail,
    Calendar,
    Save,
    Eye,
    EyeOff,
    CheckCircle
} from 'lucide-react';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        avatar: user?.avatar || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveProfile = async (e) => {
        e.preventDefault();

        if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
            toast.error('First name and last name are required');
            return;
        }

        try {
            setIsLoading(true);
            const response = await usersAPI.updateProfile(profileData);
            updateUser(response.user);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('All password fields are required');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            setIsLoading(true);
            await usersAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setIsChangingPassword(false);
            toast.success('Password changed successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Clean Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <motion.button
                                onClick={() => navigate('/dashboard')}
                                className="mr-4 p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </motion.button>
                            <div className="flex items-center">
                                <HeartPulse className="h-8 w-8 text-blue-600 mr-3" />
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
                                    <p className="text-sm text-gray-500">Manage your account information</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                                <p className="text-sm text-gray-500">@{user?.username}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-5 h-5 text-blue-600" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Profile Information Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-lg shadow border border-gray-200"
                    >
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {isEditing ? (
                                <form onSubmit={saveProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                value={profileData.firstName}
                                                onChange={handleProfileChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                value={profileData.lastName}
                                                onChange={handleProfileChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
                                            Avatar URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            id="avatar"
                                            name="avatar"
                                            value={profileData.avatar}
                                            onChange={handleProfileChange}
                                            placeholder="https://example.com/avatar.jpg"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setProfileData({
                                                    firstName: user?.firstName || '',
                                                    lastName: user?.lastName || '',
                                                    avatar: user?.avatar || ''
                                                });
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    {/* User Info Display */}
                                    <div className="flex items-center pb-4 border-b border-gray-200">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                            {user?.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt="Avatar"
                                                    className="w-16 h-16 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-8 h-8 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {user?.firstName} {user?.lastName}
                                            </h3>
                                            <p className="text-gray-600">@{user?.username}</p>
                                        </div>
                                    </div>

                                    {/* Account Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                                                <span className="text-gray-900">{user?.email}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Member Since
                                            </label>
                                            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                                <span className="text-gray-900">{formatDate(user?.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {user?.lastLogin && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Login
                                            </label>
                                            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                                <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                                                <span className="text-gray-900">{formatDate(user.lastLogin)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Security Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white rounded-lg shadow border border-gray-200"
                    >
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                                {!isChangingPassword && (
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Change Password
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {isChangingPassword ? (
                                <form onSubmit={changePassword} className="space-y-4">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? "text" : "password"}
                                                id="currentPassword"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => togglePasswordVisibility('current')}
                                            >
                                                {showPasswords.current ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                id="newPassword"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => togglePasswordVisibility('new')}
                                            >
                                                {showPasswords.new ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                            >
                                                {showPasswords.confirm ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'Changing...' : 'Change Password'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsChangingPassword(false);
                                                setPasswordData({
                                                    currentPassword: '',
                                                    newPassword: '',
                                                    confirmPassword: ''
                                                });
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Password Security</h3>
                                        <p className="text-sm text-gray-600">
                                            Your password was last changed on {formatDate(user?.createdAt)}
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                        <h4 className="font-medium text-blue-900 mb-2">Security Tips</h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Use a strong password with at least 8 characters</li>
                                            <li>• Include uppercase and lowercase letters, numbers, and symbols</li>
                                            <li>• Don't use the same password for multiple accounts</li>
                                            <li>• Change your password regularly</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Account Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-lg shadow border border-gray-200"
                    >
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Account Status</h2>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">Account Status</h3>
                                    <p className="text-sm text-gray-600">Your account is active and in good standing</p>
                                </div>
                                <div className="flex items-center text-blue-600">
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    <span className="text-sm font-medium">Active</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
