import { useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing function calls
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced function
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
};

/**
 * Custom hook for debouncing async function calls
 * @param callback - The async function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced async function
 */
export const useDebounceAsync = <T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number = 300
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Return a promise that resolves after the debounced delay
      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            const result = await callback(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}; 