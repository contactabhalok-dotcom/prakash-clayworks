/**
 * Centralized logging utility
 * Provides structured logging for better debugging
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
}

/**
 * Log a message with structured context
 */
export function log(level: LogLevel, message: string, context?: any): void {
  const timestamp = new Date().toISOString();

  const logEntry: LogEntry = {
    timestamp,
    level,
    message,
    context,
  };

  // In development, use console with formatting
  if (process.env.NODE_ENV === 'development') {
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'error':
        console.error(formattedMessage, context || '');
        break;
      case 'warn':
        console.warn(formattedMessage, context || '');
        break;
      case 'info':
        console.info(formattedMessage, context || '');
        break;
      case 'debug':
        console.debug(formattedMessage, context || '');
        break;
    }
  } else {
    // In production, log as JSON for log aggregation services
    console[level](JSON.stringify(logEntry));

    // TODO: Send to logging service (Sentry, LogRocket, CloudWatch, etc.)
    // Example: sendToLoggingService(logEntry);
  }
}

/**
 * Log an error with stack trace
 */
export function logError(message: string, error: Error, context?: any): void {
  log('error', message, {
    ...context,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });
}

/**
 * Log function execution time
 */
export async function logExecutionTime<T>(
  functionName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    log('debug', `Function execution completed`, {
      function: functionName,
      duration: `${duration}ms`,
      success: true,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logError(`Function execution failed`, error as Error, {
      function: functionName,
      duration: `${duration}ms`,
    });

    throw error;
  }
}

// Convenience methods
export const logger = {
  info: (message: string, context?: any) => log('info', message, context),
  warn: (message: string, context?: any) => log('warn', message, context),
  error: (message: string, context?: any) => log('error', message, context),
  debug: (message: string, context?: any) => log('debug', message, context),
};
