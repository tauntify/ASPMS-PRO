/**
 * Error Tracking & Logging Utility
 * Integrates with Firebase Analytics and Console Logging
 */

import { getAnalytics, logEvent, setUserId, isSupported } from 'firebase/analytics';
import { app } from './firebase';

// Initialize Analytics
let analytics: ReturnType<typeof getAnalytics> | null = null;
let analyticsInitialized = false;

// Try to initialize Analytics asynchronously
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
        analyticsInitialized = true;
        console.log('✅ Firebase Analytics initialized');
      } catch (error) {
        console.warn('⚠️ Firebase Analytics initialization failed:', error);
        console.info('💡 Analytics is optional - error tracking will work via console logs');
      }
    } else {
      console.info('ℹ️ Firebase Analytics not supported in this environment');
    }
  }).catch((error) => {
    console.warn('⚠️ Could not check Analytics support:', error);
  });
}

/**
 * Log an error to Firebase Analytics and console
 */
export function logError(error: Error | string, context?: Record<string, any>) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' && error.stack ? error.stack : undefined;

  // Log to console with styling
  console.group('🔴 Error Logged');
  console.error('Message:', errorMessage);
  if (errorStack) console.error('Stack:', errorStack);
  if (context) console.error('Context:', context);
  console.groupEnd();

  // Log to Firebase Analytics
  if (analytics) {
    try {
      logEvent(analytics, 'error', {
        error_message: errorMessage.substring(0, 100), // Firebase has limits
        error_type: typeof error === 'object' ? error.constructor.name : 'string',
        ...context,
      });
    } catch (e) {
      console.warn('Failed to log to Analytics:', e);
    }
  }
}

/**
 * Log a warning to Firebase Analytics and console
 */
export function logWarning(message: string, context?: Record<string, any>) {
  console.group('⚠️ Warning Logged');
  console.warn('Message:', message);
  if (context) console.warn('Context:', context);
  console.groupEnd();

  if (analytics) {
    try {
      logEvent(analytics, 'warning', {
        warning_message: message.substring(0, 100),
        ...context,
      });
    } catch (e) {
      console.warn('Failed to log warning to Analytics:', e);
    }
  }
}

/**
 * Log an info event to Firebase Analytics
 */
export function logInfo(eventName: string, params?: Record<string, any>) {
  console.log(`ℹ️ Info: ${eventName}`, params);

  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (e) {
      console.warn('Failed to log info to Analytics:', e);
    }
  }
}

/**
 * Set the current user ID for tracking
 */
export function setTrackingUserId(userId: string) {
  if (analytics) {
    try {
      setUserId(analytics, userId);
      console.log('✅ User ID set for tracking:', userId);
    } catch (e) {
      console.warn('Failed to set user ID:', e);
    }
  }
}

/**
 * Log page views
 */
export function logPageView(pageName: string, params?: Record<string, any>) {
  if (analytics) {
    try {
      logEvent(analytics, 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: window.location.pathname,
        ...params,
      });
    } catch (e) {
      console.warn('Failed to log page view:', e);
    }
  }
}

/**
 * Log custom events
 */
export function logCustomEvent(eventName: string, params?: Record<string, any>) {
  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (e) {
      console.warn('Failed to log custom event:', e);
    }
  }
}

/**
 * Global error handler
 */
export function setupGlobalErrorHandlers() {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        type: 'unhandled_promise_rejection',
        url: window.location.href,
      }
    );
  });

  // Catch uncaught errors
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), {
      type: 'uncaught_error',
      url: window.location.href,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  console.log('✅ Global error handlers set up');
}
