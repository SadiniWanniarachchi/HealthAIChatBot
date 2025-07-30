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
    CheckCircle,
    Activity,
    Weight,
    Ruler,
    Droplet,
    AlertCircle,
    Phone,
    Shield,
    Heart
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

    const [healthData, setHealthData] = useState({
        weight: user?.healthProfile?.weight || '',
        height: user?.healthProfile?.height || '',
        bloodGroup: user?.healthProfile?.bloodGroup || '',
        bloodPressureSystolic: user?.healthProfile?.bloodPressureSystolic || '',
        bloodPressureDiastolic: user?.healthProfile?.bloodPressureDiastolic || '',
        diabetesStatus: user?.healthProfile?.diabetesStatus || '',
        cholesterolLevel: user?.healthProfile?.cholesterolLevel || '',
        allergies: user?.healthProfile?.allergies || '',
        chronicConditions: user?.healthProfile?.chronicConditions || '',
        medications: user?.healthProfile?.medications || '',
        emergencyContact: user?.healthProfile?.emergencyContact || '',
        emergencyPhone: user?.healthProfile?.emergencyPhone || '',
        dateOfBirth: user?.healthProfile?.dateOfBirth || ''
    });

    const [isEditingHealth, setIsEditingHealth] = useState(false);

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

    const handleHealthChange = (e) => {
        const { name, value } = e.target;
        setHealthData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateBMI = () => {
        if (healthData.weight && healthData.height) {
            const weight = parseFloat(healthData.weight);
            const height = parseFloat(healthData.height) / 100; // Convert cm to meters
            const bmi = weight / (height * height);
            return bmi.toFixed(1);
        }
        return null;
    };

    const getBMICategory = (bmi) => {
        if (!bmi) return null;
        const bmiValue = parseFloat(bmi);
        if (bmiValue < 18.5) return { category: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-100' };
        if (bmiValue < 25) return { category: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };
        if (bmiValue < 30) return { category: 'Overweight', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        return { category: 'Obese', color: 'text-red-600', bg: 'bg-red-100' };
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

    const saveHealthProfile = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            console.log('Saving health profile data:', healthData);
            const response = await usersAPI.updateHealthProfile(healthData);
            console.log('Backend response:', response);
            updateUser(response.user);
            console.log('Updated user in context:', response.user);
            setIsEditingHealth(false);
            toast.success('Health profile updated successfully!');
        } catch (error) {
            console.error('Health profile save error:', error);
            toast.error(error.response?.data?.message || 'Failed to update health profile');
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
                                className="mr-4 p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
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
                                <div className="flex items-center">
                                    <User className="h-5 w-5 text-blue-500 mr-2" />
                                    <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
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
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
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
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
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
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 text-green-600 mr-2" />
                                    <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                                </div>
                                {!isChangingPassword && (
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
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
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
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
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
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
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
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
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
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
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
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

                    {/* Health Profile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="bg-white rounded-lg shadow border border-gray-200"
                    >
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                                    <h2 className="text-lg font-semibold text-gray-900">Health Profile</h2>
                                </div>
                                {!isEditingHealth && (
                                    <button
                                        onClick={() => setIsEditingHealth(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                                    >
                                        Edit Health Info
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {isEditingHealth ? (
                                <form onSubmit={saveHealthProfile} className="space-y-6">
                                    {/* Basic Measurements */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                                            <Activity className="h-4 w-4 mr-2 text-blue-500" />
                                            Basic Measurements
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Weight (kg)
                                                </label>
                                                <div className="relative">
                                                    <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        id="weight"
                                                        name="weight"
                                                        value={healthData.weight}
                                                        onChange={handleHealthChange}
                                                        placeholder="70"
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Height (cm)
                                                </label>
                                                <div className="relative">
                                                    <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        id="height"
                                                        name="height"
                                                        value={healthData.height}
                                                        onChange={handleHealthChange}
                                                        placeholder="175"
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Blood Group
                                                </label>
                                                <div className="relative">
                                                    <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <select
                                                        id="bloodGroup"
                                                        name="bloodGroup"
                                                        value={healthData.bloodGroup}
                                                        onChange={handleHealthChange}
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="A+">A+</option>
                                                        <option value="A-">A-</option>
                                                        <option value="B+">B+</option>
                                                        <option value="B-">B-</option>
                                                        <option value="AB+">AB+</option>
                                                        <option value="AB-">AB-</option>
                                                        <option value="O+">O+</option>
                                                        <option value="O-">O-</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                                            Date of Birth
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="date"
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                value={healthData.dateOfBirth}
                                                onChange={handleHealthChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Vital Health Metrics */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                                            <Heart className="h-4 w-4 mr-2 text-red-500" />
                                            Vital Health Metrics
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Blood Pressure (mmHg)
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <input
                                                            type="number"
                                                            name="bloodPressureSystolic"
                                                            value={healthData.bloodPressureSystolic}
                                                            onChange={handleHealthChange}
                                                            placeholder="120"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        <label className="text-xs text-gray-500 mt-1 block">Systolic</label>
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="number"
                                                            name="bloodPressureDiastolic"
                                                            value={healthData.bloodPressureDiastolic}
                                                            onChange={handleHealthChange}
                                                            placeholder="80"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        <label className="text-xs text-gray-500 mt-1 block">Diastolic</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="cholesterolLevel" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Cholesterol Level (mg/dL)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="cholesterolLevel"
                                                    name="cholesterolLevel"
                                                    value={healthData.cholesterolLevel}
                                                    onChange={handleHealthChange}
                                                    placeholder="180"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label htmlFor="diabetesStatus" className="block text-sm font-medium text-gray-700 mb-2">
                                                Diabetes Status
                                            </label>
                                            <select
                                                id="diabetesStatus"
                                                name="diabetesStatus"
                                                value={healthData.diabetesStatus}
                                                onChange={handleHealthChange}
                                                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select Status</option>
                                                <option value="No Diabetes">No Diabetes</option>
                                                <option value="Pre-diabetic">Pre-diabetic</option>
                                                <option value="Type 1 Diabetes">Type 1 Diabetes</option>
                                                <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                                                <option value="Gestational Diabetes">Gestational Diabetes</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Medical Information */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                                            <Shield className="h-4 w-4 mr-2 text-green-500" />
                                            Medical Information
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Allergies
                                                </label>
                                                <textarea
                                                    id="allergies"
                                                    name="allergies"
                                                    value={healthData.allergies}
                                                    onChange={handleHealthChange}
                                                    placeholder="Food allergies, drug allergies, environmental allergies..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="chronicConditions" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Chronic Conditions
                                                </label>
                                                <textarea
                                                    id="chronicConditions"
                                                    name="chronicConditions"
                                                    value={healthData.chronicConditions}
                                                    onChange={handleHealthChange}
                                                    placeholder="Diabetes, hypertension, heart disease, asthma..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Current Medications
                                                </label>
                                                <textarea
                                                    id="medications"
                                                    name="medications"
                                                    value={healthData.medications}
                                                    onChange={handleHealthChange}
                                                    placeholder="List your current medications and dosages..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Emergency Contact */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                                            Emergency Contact
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Emergency Contact Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="emergencyContact"
                                                    name="emergencyContact"
                                                    value={healthData.emergencyContact}
                                                    onChange={handleHealthChange}
                                                    placeholder="Full name"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Emergency Contact Phone
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        id="emergencyPhone"
                                                        name="emergencyPhone"
                                                        value={healthData.emergencyPhone}
                                                        onChange={handleHealthChange}
                                                        placeholder="+1 (555) 123-4567"
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                                        >
                                            {isLoading ? 'Saving...' : 'Save Health Profile'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditingHealth(false);
                                                setHealthData({
                                                    weight: user?.healthProfile?.weight || '',
                                                    height: user?.healthProfile?.height || '',
                                                    bloodGroup: user?.healthProfile?.bloodGroup || '',
                                                    bloodPressureSystolic: user?.healthProfile?.bloodPressureSystolic || '',
                                                    bloodPressureDiastolic: user?.healthProfile?.bloodPressureDiastolic || '',
                                                    diabetesStatus: user?.healthProfile?.diabetesStatus || '',
                                                    cholesterolLevel: user?.healthProfile?.cholesterolLevel || '',
                                                    allergies: user?.healthProfile?.allergies || '',
                                                    chronicConditions: user?.healthProfile?.chronicConditions || '',
                                                    medications: user?.healthProfile?.medications || '',
                                                    emergencyContact: user?.healthProfile?.emergencyContact || '',
                                                    emergencyPhone: user?.healthProfile?.emergencyPhone || '',
                                                    dateOfBirth: user?.healthProfile?.dateOfBirth || ''
                                                });
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    {/* BMI Display */}
                                    {healthData.weight && healthData.height && (
                                        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900 mb-1">Body Mass Index (BMI)</h3>
                                                    <div className="flex items-center space-x-4">
                                                        <span className="text-2xl font-bold text-blue-600">{calculateBMI()}</span>
                                                        {getBMICategory(calculateBMI()) && (
                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBMICategory(calculateBMI()).bg} ${getBMICategory(calculateBMI()).color}`}>
                                                                {getBMICategory(calculateBMI()).category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Activity className="h-8 w-8 text-blue-500" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Basic Info Display */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {healthData.weight && (
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <Weight className="h-5 w-5 text-gray-600 mr-3" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Weight</p>
                                                        <p className="font-medium text-gray-900">{healthData.weight} kg</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {healthData.height && (
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <Ruler className="h-5 w-5 text-gray-600 mr-3" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Height</p>
                                                        <p className="font-medium text-gray-900">{healthData.height} cm</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {healthData.bloodGroup && (
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center">
                                                    <Droplet className="h-5 w-5 text-red-500 mr-3" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Blood Group</p>
                                                        <p className="font-medium text-gray-900">{healthData.bloodGroup}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vital Health Metrics Display */}
                                    {(healthData.bloodPressureSystolic || healthData.bloodPressureDiastolic || healthData.diabetesStatus || healthData.cholesterolLevel) && (
                                        <div className="space-y-4">
                                            <h3 className="font-medium text-gray-900 flex items-center">
                                                <Heart className="h-4 w-4 mr-2 text-red-500" />
                                                Vital Health Metrics
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {(healthData.bloodPressureSystolic || healthData.bloodPressureDiastolic) && (
                                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                        <div className="flex items-center">
                                                            <Heart className="h-5 w-5 text-red-600 mr-3" />
                                                            <div>
                                                                <p className="text-sm text-red-600">Blood Pressure</p>
                                                                <p className="font-medium text-red-900">
                                                                    {healthData.bloodPressureSystolic || '---'}/{healthData.bloodPressureDiastolic || '---'} mmHg
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {healthData.cholesterolLevel && (
                                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                        <div className="flex items-center">
                                                            <Activity className="h-5 w-5 text-yellow-600 mr-3" />
                                                            <div>
                                                                <p className="text-sm text-yellow-600">Cholesterol</p>
                                                                <p className="font-medium text-yellow-900">{healthData.cholesterolLevel} mg/dL</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {healthData.diabetesStatus && (
                                                    <div className={`border rounded-lg p-3 ${healthData.diabetesStatus === 'No Diabetes' ? 'bg-green-50 border-green-200' :
                                                        healthData.diabetesStatus === 'Pre-diabetic' ? 'bg-orange-50 border-orange-200' :
                                                            'bg-red-50 border-red-200'
                                                        }`}>
                                                        <div className="flex items-center">
                                                            <Shield className={`h-5 w-5 mr-3 ${healthData.diabetesStatus === 'No Diabetes' ? 'text-green-600' :
                                                                healthData.diabetesStatus === 'Pre-diabetic' ? 'text-orange-600' :
                                                                    'text-red-600'
                                                                }`} />
                                                            <div>
                                                                <p className={`text-sm ${healthData.diabetesStatus === 'No Diabetes' ? 'text-green-600' :
                                                                    healthData.diabetesStatus === 'Pre-diabetic' ? 'text-orange-600' :
                                                                        'text-red-600'
                                                                    }`}>Diabetes Status</p>
                                                                <p className={`font-medium ${healthData.diabetesStatus === 'No Diabetes' ? 'text-green-900' :
                                                                    healthData.diabetesStatus === 'Pre-diabetic' ? 'text-orange-900' :
                                                                        'text-red-900'
                                                                    }`}>{healthData.diabetesStatus}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Medical Information Display */}
                                    {(healthData.allergies || healthData.chronicConditions || healthData.medications) && (
                                        <div className="space-y-4">
                                            <h3 className="font-medium text-gray-900 flex items-center">
                                                <Shield className="h-4 w-4 mr-2 text-green-500" />
                                                Medical Information
                                            </h3>

                                            {healthData.allergies && (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                    <h4 className="font-medium text-yellow-800 mb-1">Allergies</h4>
                                                    <p className="text-sm text-yellow-700">{healthData.allergies}</p>
                                                </div>
                                            )}

                                            {healthData.chronicConditions && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                    <h4 className="font-medium text-red-800 mb-1">Chronic Conditions</h4>
                                                    <p className="text-sm text-red-700">{healthData.chronicConditions}</p>
                                                </div>
                                            )}

                                            {healthData.medications && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <h4 className="font-medium text-blue-800 mb-1">Current Medications</h4>
                                                    <p className="text-sm text-blue-700">{healthData.medications}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Emergency Contact Display */}
                                    {(healthData.emergencyContact || healthData.emergencyPhone) && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <h3 className="font-medium text-orange-800 mb-2 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-2" />
                                                Emergency Contact
                                            </h3>
                                            <div className="space-y-1">
                                                {healthData.emergencyContact && (
                                                    <p className="text-sm text-orange-700">
                                                        <span className="font-medium">Name:</span> {healthData.emergencyContact}
                                                    </p>
                                                )}
                                                {healthData.emergencyPhone && (
                                                    <p className="text-sm text-orange-700">
                                                        <span className="font-medium">Phone:</span> {healthData.emergencyPhone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!healthData.weight && !healthData.height && !healthData.bloodGroup &&
                                        !healthData.bloodPressureSystolic && !healthData.bloodPressureDiastolic &&
                                        !healthData.diabetesStatus && !healthData.cholesterolLevel && (
                                            <div className="text-center py-8">
                                                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Health Profile</h3>
                                                <p className="text-gray-600 mb-4">
                                                    Add your health information to get personalized insights and better health consultations.
                                                </p>
                                                <button
                                                    onClick={() => setIsEditingHealth(true)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                                                >
                                                    Add Health Information
                                                </button>
                                            </div>
                                        )}
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
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900">Account Status</h2>
                            </div>
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
