import { useState, useEffect } from 'react';

// Responsive utility functions and configurations

export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
};

// Common responsive classes for consistency
export const responsiveClasses = {
    // Container classes
    container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    containerSmall: 'w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',

    // Grid layouts
    gridResponsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
    gridTwoColumn: 'grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12',

    // Text sizes
    headingPrimary: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold',
    headingSecondary: 'text-2xl sm:text-3xl md:text-4xl font-bold',
    headingTertiary: 'text-xl sm:text-2xl font-bold',
    textBody: 'text-base sm:text-lg',
    textSmall: 'text-sm sm:text-base',

    // Spacing
    paddingSection: 'py-8 sm:py-12 lg:py-16',
    paddingCard: 'p-4 sm:p-6 lg:p-8',
    marginBottom: 'mb-4 sm:mb-6 lg:mb-8',

    // Navigation
    navHeight: 'h-14 sm:h-16',
    navItem: 'px-3 py-2 text-sm font-medium transition-colors',

    // Buttons
    buttonPrimary: 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-colors',
    buttonSecondary: 'px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors',

    // Forms
    formInput: 'w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base',
    formLabel: 'block text-sm font-medium text-gray-700 mb-1',

    // Cards
    card: 'bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8',
    cardSmall: 'bg-white rounded-lg shadow-md p-3 sm:p-4',

    // Icons
    iconSmall: 'h-4 w-4 sm:h-5 sm:w-5',
    iconMedium: 'h-5 w-5 sm:h-6 sm:w-6',
    iconLarge: 'h-6 w-6 sm:h-8 sm:w-8',

    // Chat specific
    chatMessage: 'rounded-lg px-3 sm:px-4 py-2 sm:py-3 max-w-xs sm:max-w-md lg:max-w-2xl',
    chatAvatar: 'w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center',

    // Dashboard specific
    statsGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
    dashboardCard: 'bg-white rounded-lg shadow-md p-4 sm:p-6'
};

// Viewport detection utilities
export const useViewport = () => {
    if (typeof window === 'undefined') return { width: 0, height: 0 };

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

// Responsive breakpoint helpers
export const isSmallScreen = (width) => width < 640;
export const isMediumScreen = (width) => width >= 640 && width < 1024;
export const isLargeScreen = (width) => width >= 1024;

// Touch device detection
export const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Mobile detection (more comprehensive)
export const isMobile = () => {
    if (typeof window === 'undefined') return false;

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for mobile user agents
    const mobileUserAgents = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return mobileUserAgents.some((toMatchItem) => userAgent.match(toMatchItem))
        || window.innerWidth < 768;
};

// Safe area helpers for mobile devices with notches
export const getSafeAreaInsets = () => {
    if (typeof CSS === 'undefined' || !CSS.supports('padding-top', 'env(safe-area-inset-top)')) {
        return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const style = getComputedStyle(document.documentElement);
    return {
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
    };
};

export default {
    breakpoints,
    responsiveClasses,
    useViewport,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isTouchDevice,
    isMobile,
    getSafeAreaInsets
};
