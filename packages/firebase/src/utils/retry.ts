/**
 * Retry utility with exponential backoff
 * Attempts an operation multiple times with increasing delays
 */

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Calculate exponential backoff delay
      const delay = initialDelay * Math.pow(2, attempt);

      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`, error);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Retry with specific error handling
 * Only retries on specific error types
 */
export async function retryOnError<T>(
  operation: () => Promise<T>,
  shouldRetry: (error: Error) => boolean,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this error
      if (!shouldRetry(lastError) || attempt === maxRetries - 1) {
        throw lastError;
      }

      const delay = initialDelay * Math.pow(2, attempt);
      console.warn(`Retryable error (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`, error);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
