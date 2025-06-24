import { useState, useCallback, useMemo } from "react";
import { ApiError } from "@/lib/api-client";

interface UseApiErrorResult {
  displayError: string | null;
  errorCode: string | null;
  hasError: boolean;
  retry: () => void;
  clearError: () => void;
  isRetrying: boolean;
}

/**
 * Standardized error handling hook
 * Single responsibility: transform and manage error states
 * Reusable across all components that handle API errors
 */
export function useApiError(
  error: unknown,
  retryFn: () => Promise<void> | void,
): UseApiErrorResult {
  const [isRetrying, setIsRetrying] = useState(false);

  // Transform error into user-friendly message
  const { displayError, errorCode } = useMemo(() => {
    if (!error) {
      return { displayError: null, errorCode: null };
    }

    let message = "An unexpected error occurred. Please try again.";
    let code = "UNKNOWN_ERROR";

    if (error instanceof ApiError) {
      code = error.code;
      switch (error.code) {
        case "NETWORK_ERROR":
          message =
            "Unable to connect to server. Please check your internet connection.";
          break;
        case "REQUEST_TIMEOUT":
          message = "Request timed out. Please try again later.";
          break;
        case "HTTP_ERROR":
          message = `Server error (${error.status}). Please try again later.`;
          break;
        case "NOT_FOUND":
          message = "The requested data was not found.";
          break;
        case "PARSE_ERROR":
          message = "Invalid response from server. Please try again.";
          break;
        default:
          message = error.message || message;
      }
    } else if (error instanceof Error) {
      message = error.message;
      code = "CLIENT_ERROR";
    }

    return { displayError: message, errorCode: code };
  }, [error]);

  const retry = useCallback(async () => {
    if (isRetrying) return;

    try {
      setIsRetrying(true);
      await retryFn();
    } catch (retryError) {
      console.error("Retry failed:", retryError);
      // The error will be handled by the component that calls this
    } finally {
      setIsRetrying(false);
    }
  }, [retryFn, isRetrying]);

  const clearError = useCallback(() => {
    // This is typically used when navigating away or manually dismissing errors
    // The actual error clearing happens in the data hook
  }, []);

  return {
    displayError,
    errorCode,
    hasError: !!error,
    retry,
    clearError,
    isRetrying,
  };
}

/**
 * Hook for handling loading states with error context
 * Useful for components that need to show loading, error, or success states
 */
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const execute = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await asyncFn();
        return result;
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
  };
}
