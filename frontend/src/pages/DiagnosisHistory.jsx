import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    HeartPulse,
    ArrowLeft,
    User,
    Mail,
    Calendar,
    History,
    Clock,
    CheckCircle,
    AlertTriangle,
    FileText,
    Trash2,
    X,
    AlertCircle,
    MessageCircle,
    TrendingUp,
    Activity
} from 'lucide-react';
import { diagnosisAPI } from '../services/api';
import { validateUserOwnership, filterUserData, logSecurityEvent, isUserAuthenticated } from '../utils/userSecurity';
import toast from 'react-hot-toast';

const DiagnosisHistory = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [diagnoses, setDiagnoses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [deletingIds, setDeletingIds] = useState(new Set());

    useEffect(() => {
        fetchDiagnoses();
    }, [currentPage]);

    const fetchDiagnoses = async () => {
        try {
            setIsLoading(true);

            // Ensure user is authenticated
            if (!isUserAuthenticated(user)) {
                toast.error('Please log in to view your consultation history');
                navigate('/login');
                return;
            }

            // Fetch from MongoDB (backend) only - backend will filter by authenticated user
            const response = await diagnosisAPI.getDiagnosisHistory(currentPage, 10);

            // Additional frontend validation using security utilities
            const userDiagnoses = filterUserData(response.diagnoses || [], user);

            setDiagnoses(userDiagnoses);
            setPagination(response.pagination);

            logSecurityEvent('DIAGNOSIS_HISTORY_LOADED', {
                userEmail: user.email,
                totalDiagnoses: userDiagnoses.length,
                page: currentPage
            });

            console.log(`Fetched ${userDiagnoses.length} diagnoses for user:`, user.email);

        } catch (error) {
            console.error('Error fetching diagnosis history:', error);
            if (error.response?.status === 401) {
                logSecurityEvent('UNAUTHORIZED_HISTORY_ACCESS', {
                    userEmail: user?.email || 'unknown',
                    error: error.message
                });
                toast.error('Session expired. Please log in again.');
                navigate('/login');
            } else {
                toast.error('Failed to fetch consultation history');
            }
            setDiagnoses([]);
            setPagination({ totalPages: 1, currentPage: 1, total: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'emergency':
                return 'text-red-600 bg-red-100';
            case 'high':
                return 'text-orange-600 bg-orange-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'low':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getUrgencyIcon = (urgency) => {
        switch (urgency) {
            case 'emergency':
            case 'high':
                return <AlertTriangle className="h-4 w-4" />;
            case 'medium':
                return <Clock className="h-4 w-4" />;
            case 'low':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const viewDiagnosis = (diagnosis) => {
        // Ensure user is authenticated
        if (!isUserAuthenticated(user)) {
            toast.error('Please log in to view your consultation');
            navigate('/login');
            return;
        }

        // Validate diagnosis ownership using security utility
        if (!validateUserOwnership(diagnosis, user)) {
            logSecurityEvent('UNAUTHORIZED_DIAGNOSIS_ACCESS_ATTEMPT', {
                userEmail: user.email,
                attemptedSessionId: diagnosis.sessionId,
                diagnosisUserEmail: diagnosis.userInfo?.email || 'unknown'
            });
            toast.error('Access denied. This consultation does not belong to you.');
            return;
        }

        // Log successful access
        logSecurityEvent('DIAGNOSIS_ACCESSED', {
            userEmail: user.email,
            sessionId: diagnosis.sessionId
        });

        // Navigate to the chat interface to show the original conversation
        console.log('Viewing diagnosis:', diagnosis.sessionId, 'for user:', user.email);
        console.log('Messages to pass:', diagnosis.messages);

        navigate(`/chat/${diagnosis.sessionId}`, {
            state: {
                existingSession: diagnosis,
                messages: diagnosis.messages || []
            }
        });
    };

    const handleDeleteClick = (e, diagnosis) => {
        e.stopPropagation();
        setDeleteConfirmation(diagnosis);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmation) return;

        const diagnosisId = deleteConfirmation.sessionId;

        console.log('Attempting to delete from MongoDB:', diagnosisId);

        setDeletingIds(prev => new Set([...prev, diagnosisId]));

        try {
            // Delete from MongoDB
            await diagnosisAPI.deleteDiagnosis(diagnosisId);
            console.log('Successfully deleted from MongoDB:', diagnosisId);

            // Remove from local state immediately
            setDiagnoses(prev => prev.filter(d => d.sessionId !== diagnosisId));

            toast.success('Consultation deleted successfully');

            // Refresh data to ensure consistency
            setTimeout(() => fetchDiagnoses(), 500);

        } catch (error) {
            console.error('Error deleting diagnosis:', error);
            toast.error(`Failed to delete consultation: ${error.message || 'Unknown error'}`);
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(diagnosisId);
                return newSet;
            });
            setDeleteConfirmation(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <HeartPulse className="h-8 w-8 text-blue-600" />
                            <div className="ml-3">
                                <h1 className="text-lg font-semibold text-gray-900">Diagnosis History</h1>
                                <p className="text-sm text-gray-500">Your health consultation records</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-900">{diagnoses.length}</h3>
                                <p className="text-gray-600">Total Consultations</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <MessageCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {diagnoses.reduce((total, d) => total + (d.messages?.length || 0), 0)}
                                </h3>
                                <p className="text-gray-600">Total Messages</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Activity className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {diagnoses.length > 0 ?
                                        Math.round(diagnoses.reduce((total, d) => total + (d.diagnosis?.primaryCondition?.confidence || 0), 0) / diagnoses.length) : 0}%
                                </h3>
                                <p className="text-gray-600">Avg Confidence</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diagnosis List */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Health Consultation History</h2>
                        <p className="text-gray-600 mt-1">Review your past health consultations and diagnoses</p>
                    </div>

                    {diagnoses.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations yet</h3>
                            <p className="text-gray-600 mb-4">Start your first health consultation to see your history here</p>
                            <button
                                onClick={() => navigate('/chat')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
                            >
                                Start New Consultation
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            <AnimatePresence>
                                {diagnoses.map((diagnosis, index) => (
                                    <motion.div
                                        key={diagnosis.sessionId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{
                                            opacity: deletingIds.has(diagnosis.sessionId) ? 0.5 : 1,
                                            y: 0,
                                            scale: deletingIds.has(diagnosis.sessionId) ? 0.95 : 1
                                        }}
                                        exit={{ opacity: 0, x: -100, scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: 0.1 * index }}
                                        className="p-6 hover:bg-gray-50 cursor-pointer transition-all duration-200 relative group"
                                        onClick={() => !deletingIds.has(diagnosis.sessionId) && viewDiagnosis(diagnosis)}
                                    >
                                        {/* Loading overlay for deleting items */}
                                        {deletingIds.has(diagnosis.sessionId) && (
                                            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(diagnosis.createdAt)}
                                                    </span>
                                                </div>
                                                <h4 className="font-medium text-gray-900 mb-1">
                                                    {diagnosis.diagnosis?.primaryCondition?.name || 'Consultation in progress'}
                                                </h4>

                                                {diagnosis.diagnosis?.primaryCondition?.confidence && (
                                                    <div className="flex items-center space-x-4">
                                                        <span className="text-sm text-gray-500">
                                                            Confidence: {diagnosis.diagnosis.primaryCondition.confidence}%
                                                        </span>
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full"
                                                                style={{ width: `${diagnosis.diagnosis.primaryCondition.confidence}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-2 ml-4">
                                                {/* Direct delete button - always visible */}
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, diagnosis)}
                                                    className="p-2 rounded-full hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                                                    disabled={deletingIds.has(diagnosis.sessionId)}
                                                    title="Delete consultation"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing page {pagination.current} of {pagination.pages} ({pagination.total} total)
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={pagination.current === 1}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                                        disabled={pagination.current === pagination.pages}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modern Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmation && (
                    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            {/* Header with gradient */}
                            <div className="bg-red-700 p-6 text-white">
                                <div className="flex items-center">

                                    <div>
                                        <h3 className="text-lg font-semibold">Delete Consultation</h3>
                                        <p className="text-red-100 text-sm">This action cannot be undone</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="mb-4">
                                    <p className="text-gray-700 mb-2">
                                        Are you sure you want to delete this health consultation?
                                    </p>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm font-medium text-gray-900">
                                            {deleteConfirmation.diagnosis?.primaryCondition?.name || 'Consultation'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDate(deleteConfirmation.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-start">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Warning</p>
                                            <p className="text-xs text-yellow-700 mt-1">
                                                All conversation history, symptoms, and recommendations will be permanently deleted.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setDeleteConfirmation(null)}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center cursor-pointer"
                                        disabled={deletingIds.has(deleteConfirmation.sessionId)}
                                    >
                                        {deletingIds.has(deleteConfirmation.sessionId) ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DiagnosisHistory;
