// Utility functions for user security and validation

/**
 * Validates if a session or data belongs to the current authenticated user
 * @param {Object} dataItem - The data item to validate (diagnosis, session, etc.)
 * @param {Object} currentUser - The current authenticated user
 * @returns {boolean} - True if data belongs to user, false otherwise
 */
export const validateUserOwnership = (dataItem, currentUser) => {
    if (!currentUser || !dataItem) {
        console.warn('Missing user or data for ownership validation');
        return false;
    }

    // Check email match if available
    if (dataItem.userInfo?.email && currentUser.email) {
        const matches = dataItem.userInfo.email === currentUser.email;
        if (!matches) {
            console.warn('Email mismatch detected:', {
                dataEmail: dataItem.userInfo.email,
                currentEmail: currentUser.email,
                itemId: dataItem.sessionId || dataItem._id || 'unknown'
            });
        }
        return matches;
    }

    // Check user ID match if available
    if (dataItem.user && currentUser._id) {
        const matches = dataItem.user.toString() === currentUser._id.toString();
        if (!matches) {
            console.warn('User ID mismatch detected:', {
                dataUserId: dataItem.user,
                currentUserId: currentUser._id,
                itemId: dataItem.sessionId || dataItem._id || 'unknown'
            });
        }
        return matches;
    }

    console.warn('Insufficient data for ownership validation:', {
        hasDataUserInfo: !!dataItem.userInfo,
        hasDataUser: !!dataItem.user,
        hasCurrentUser: !!currentUser,
        itemId: dataItem.sessionId || dataItem._id || 'unknown'
    });

    return false;
};

/**
 * Filters an array of data items to only include those belonging to the current user
 * @param {Array} dataArray - Array of data items to filter
 * @param {Object} currentUser - The current authenticated user
 * @returns {Array} - Filtered array containing only user's data
 */
export const filterUserData = (dataArray, currentUser) => {
    if (!Array.isArray(dataArray) || !currentUser) {
        console.warn('Invalid parameters for user data filtering');
        return [];
    }

    const filtered = dataArray.filter(item => validateUserOwnership(item, currentUser));

    if (dataArray.length !== filtered.length) {
        console.warn(`Filtered out ${dataArray.length - filtered.length} items not belonging to user:`, {
            originalCount: dataArray.length,
            filteredCount: filtered.length,
            userEmail: currentUser.email
        });
    }

    return filtered;
};

/**
 * Logs security events for monitoring
 * @param {string} event - The security event type
 * @param {Object} details - Event details
 */
export const logSecurityEvent = (event, details) => {
    const timestamp = new Date().toISOString();
    console.log(`[SECURITY] ${event}:`, {
        timestamp,
        ...details
    });
};

/**
 * Checks if user is properly authenticated
 * @param {Object} user - User object from auth context
 * @returns {boolean} - True if authenticated, false otherwise
 */
export const isUserAuthenticated = (user) => {
    if (!user) {
        logSecurityEvent('AUTHENTICATION_CHECK_FAILED', { reason: 'No user object' });
        return false;
    }

    if (!user.email || !user._id) {
        logSecurityEvent('AUTHENTICATION_CHECK_FAILED', {
            reason: 'Missing required user fields',
            hasEmail: !!user.email,
            hasId: !!user._id
        });
        return false;
    }

    return true;
};
