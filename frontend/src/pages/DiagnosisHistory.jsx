import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    FileText
} from 'lucide-react';
import { diagnosisAPI } from '../services/api';

const DiagnosisHistory = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [diagnoses, setDiagnoses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);

    useEffect(() => {
        fetchDiagnoses();
    }, [currentPage]);

    const fetchDiagnoses = async () => {
        try {
            setIsLoading(true);
            const response = await diagnosisAPI.getDiagnosisHistory(currentPage, 10);
            setDiagnoses(response.diagnoses || []);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Error fetching diagnosis history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'active':
                return 'bg-blue-100 text-blue-800';
            case 'abandoned':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
        if (diagnosis.status === 'active') {
            navigate(`/chat/${diagnosis.sessionId}`);
        } else {
            setSelectedDiagnosis(diagnosis);
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
                                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-900">{pagination?.total || 0}</h3>
                                <p className="text-gray-600">Total Consultations</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {diagnoses.filter(d => d.status === 'completed').length}
                                </h3>
                                <p className="text-gray-600">Completed</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {diagnoses.filter(d => d.status === 'active').length}
                                </h3>
                                <p className="text-gray-600">In Progress</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {diagnoses.filter(d => d.diagnosis?.urgencyLevel === 'high' || d.diagnosis?.urgencyLevel === 'emergency').length}
                                </h3>
                                <p className="text-gray-600">High Priority</p>
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
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                Start New Consultation
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {diagnoses.map((diagnosis, index) => (
                                <motion.div
                                    key={diagnosis.sessionId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 * index }}
                                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => viewDiagnosis(diagnosis)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(diagnosis.status)}`}>
                                                    {diagnosis.status}
                                                </span>
                                                {diagnosis.diagnosis?.urgencyLevel && (
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(diagnosis.diagnosis.urgencyLevel)}`}>
                                                        {getUrgencyIcon(diagnosis.diagnosis.urgencyLevel)}
                                                        <span className="ml-1">{diagnosis.diagnosis.urgencyLevel}</span>
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(diagnosis.createdAt)}
                                                </span>
                                            </div>

                                            <h4 className="font-medium text-gray-900 mb-1">
                                                {diagnosis.diagnosis?.primaryCondition?.name || 'Consultation in progress'}
                                            </h4>

                                            <p className="text-sm text-gray-600 mb-2">
                                                <strong>Symptoms:</strong> {diagnosis.symptoms?.map(s => s.name).join(', ') || 'No symptoms recorded'}
                                            </p>

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

                                        <div className="text-right ml-4">
                                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                {diagnosis.status === 'active' ? 'Continue' : 'View Details'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
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
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                                        disabled={pagination.current === pagination.pages}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Diagnosis Detail Modal */}
            {selectedDiagnosis && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Diagnosis Details</h3>
                                <button
                                    onClick={() => setSelectedDiagnosis(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Session Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm"><strong>Date:</strong> {formatDate(selectedDiagnosis.createdAt)}</p>
                                        <p className="text-sm"><strong>Session ID:</strong> {selectedDiagnosis.sessionId}</p>
                                        <p className="text-sm"><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedDiagnosis.status)}`}>{selectedDiagnosis.status}</span></p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                                    <div className="space-y-2">
                                        {selectedDiagnosis.symptoms?.map((symptom, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                <span className="text-sm">{symptom.name}</span>
                                                <span className={`px-2 py-1 rounded text-xs ${symptom.severity === 'severe' ? 'bg-red-100 text-red-800' :
                                                        symptom.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                    }`}>
                                                    {symptom.severity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedDiagnosis.diagnosis?.primaryCondition && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Primary Assessment</h4>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h5 className="font-medium text-blue-900">{selectedDiagnosis.diagnosis.primaryCondition.name}</h5>
                                            <p className="text-sm text-blue-800 mt-1">{selectedDiagnosis.diagnosis.primaryCondition.description}</p>
                                            <div className="mt-2">
                                                <span className="text-sm text-blue-700">Confidence: {selectedDiagnosis.diagnosis.primaryCondition.confidence}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedDiagnosis.diagnosis?.recommendations && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                                        <ul className="space-y-2">
                                            {selectedDiagnosis.diagnosis.recommendations.map((rec, index) => (
                                                <li key={index} className="flex items-start text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DiagnosisHistory;
