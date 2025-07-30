import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: action.payload,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check for existing token on app load
    useEffect(() => {
        const initializeAuth = async () => {
            // Clean up old localStorage session data that should now be in MongoDB
            try {
                localStorage.removeItem('completedSessions');
                localStorage.removeItem('syncedSessions');
            } catch (error) {
                console.warn('Error cleaning up old session data:', error);
            }

            // Check both localStorage and sessionStorage for token
            let token = localStorage.getItem('token') || sessionStorage.getItem('token');
            let user = localStorage.getItem('user') || sessionStorage.getItem('user');

            if (token && user) {
                try {
                    // Verify token is still valid
                    const response = await authAPI.getCurrentUser();
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            user: response.user,
                            token,
                        },
                    });
                } catch (error) {
                    // Token is invalid, clear all storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('rememberMe');
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } else {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });

            const response = await authAPI.login(credentials);

            // Store token and user based on remember me preference
            if (credentials.rememberMe) {
                // Store in localStorage for persistent login
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('rememberMe', 'true');
            } else {
                // Store in sessionStorage for session-only login
                sessionStorage.setItem('token', response.token);
                sessionStorage.setItem('user', JSON.stringify(response.user));
                // Remove any existing localStorage data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('rememberMe');
            }

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: response.user,
                    token: response.token,
                },
            });

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'CLEAR_ERROR' });

            const response = await authAPI.register(userData);

            // Store token and user data in localStorage after successful registration
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Set user as logged in
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: response.user,
                    token: response.token,
                },
            });

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all storage regardless of API call success
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('completedSessions');
            localStorage.removeItem('syncedSessions');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            dispatch({ type: 'LOGOUT' });
        }
    };

    const updateUser = (userData) => {
        // Update both localStorage and sessionStorage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (localStorage.getItem('token')) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
        if (sessionStorage.getItem('token')) {
            sessionStorage.setItem('user', JSON.stringify(userData));
        }
        dispatch({ type: 'UPDATE_USER', payload: userData });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateUser,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
