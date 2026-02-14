import { useCallback, useEffect, useRef, useState } from 'react';

interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
};

/**
 * Hook for debouncing values
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for debouncing functions
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds
 * @param options - Debounce options
 * @returns Debounced function
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const { leading = false, maxWait } = options;

  const fnRef = useRef(fn);
  const timeoutRef = useRef<NodeJS.Timeout | number | undefined>(undefined);
  const maxTimeoutRef = useRef<NodeJS.Timeout | number | undefined>(undefined);
  const lastCallRef = useRef<{ args: Parameters<T>; context: any } | undefined>(undefined);
  const lastInvokeTimeRef = useRef<number>(0);
  const pendingRef = useRef(false);

  // Update ref when function changes
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  const invokeFunc = useCallback((time: number) => {
    const callData = lastCallRef.current;
    if (callData) {
      const { args } = callData;
      lastInvokeTimeRef.current = time;
      pendingRef.current = false;
      fnRef.current(...args);
      
      // Clear max timeout if it exists
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
        maxTimeoutRef.current = undefined;
      }
    }
  }, []);

  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastCall = time - (lastCallRef.current ? lastInvokeTimeRef.current : 0);
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

    return (
      !lastCallRef.current ||
      timeSinceLastCall >= delay ||
      timeSinceLastInvoke >= (maxWait || delay)
    );
  }, [delay, maxWait]);

  const startTimer = useCallback((timeout: number, time: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      invokeFunc(time);
      timeoutRef.current = undefined;
    }, timeout);

    // Set max wait timer if needed
    if (maxWait && !maxTimeoutRef.current && shouldInvoke(time)) {
      maxTimeoutRef.current = setTimeout(() => {
        if (pendingRef.current) {
          invokeFunc(time);
        }
        maxTimeoutRef.current = undefined;
      }, maxWait);
    }
  }, [maxWait, shouldInvoke, invokeFunc]);

  const debounced = useCallback((...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastCallRef.current = { args, context: null as any };
    pendingRef.current = true;

    if (isInvoking) {
      if (leading && !timeoutRef.current) {
        invokeFunc(time);
      }
      startTimer(delay, time);
    } else {
      startTimer(delay, time);
    }
  }, [leading, delay, startTimer, shouldInvoke, invokeFunc]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
    lastCallRef.current = undefined;
    pendingRef.current = false;
  }, []);

  const flush = useCallback(() => {
    if (pendingRef.current && lastCallRef.current) {
      invokeFunc(Date.now());
      cancel();
    }
  }, [invokeFunc, cancel]);

  const pending = useCallback(() => pendingRef.current, []);

  const debouncedWithMethods = debounced as DebouncedFunction<T>;
  debouncedWithMethods.cancel = cancel;
  debouncedWithMethods.flush = flush;
  debouncedWithMethods.pending = pending;

  return debouncedWithMethods;
}

/**
 * Hook for debouncing state updates
 * @param initialState - Initial state
 * @param delay - Delay in milliseconds
 * @returns [state, setState, debouncedState]
 */
export function useDebouncedState<T>(
  initialState: T | (() => T),
  delay: number
): [T, (value: T | ((prev: T) => T)) => void, T] {
  const [state, setState] = useState<T>(initialState);
  const [debouncedState, setDebouncedState] = useState<T>(state);

  const debouncedSetState = useDebounceFn(
    (value: T | ((prev: T) => T)) => {
      if (typeof value === 'function') {
        setDebouncedState((prev) => (value as (prev: T) => T)(prev));
      } else {
        setDebouncedState(value);
      }
    },
    delay
  );

  const handleSetState = useCallback((value: T | ((prev: T) => T)) => {
    if (typeof value === 'function') {
      setState((prev) => {
        const newValue = (value as (prev: T) => T)(prev);
        debouncedSetState(newValue);
        return newValue;
      });
    } else {
      setState(value);
      debouncedSetState(value);
    }
  }, [debouncedSetState]);

  return [state, handleSetState, debouncedState];
}

/**
 * Hook for debouncing API calls
 * @param apiCall - The API call function
 * @param delay - Delay in milliseconds
 * @returns [debouncedApiCall, cancel, loading]
 */
export function useDebouncedApi<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  delay: number = 300
): [DebouncedFunction<T>, () => void, boolean] {
  const [loading, setLoading] = useState(false);

  const debouncedApi = useDebounceFn(
    async (...args: Parameters<T>) => {
      setLoading(true);
      try {
        return await apiCall(...args);
      } finally {
        setLoading(false);
      }
    },
    delay,
    { leading: false, trailing: true }
  );

  const cancel = useCallback(() => {
    debouncedApi.cancel();
    setLoading(false);
  }, [debouncedApi]);

  return [debouncedApi, cancel, loading];
}

/**
 * Hook for debouncing form inputs
 * @param initialValues - Initial form values
 * @param delay - Delay in milliseconds
 * @returns [values, setValue, debouncedValues]
 */
export function useDebouncedForm<T extends Record<string, any>>(
  initialValues: T,
  delay: number = 300
): [T, (key: keyof T, value: any) => void, T] {
  const [values, setValues] = useState<T>(initialValues);
  const [debouncedValues, setDebouncedValues] = useState<T>(initialValues);

  const debouncedUpdate = useDebounceFn(
    (key: keyof T, value: any) => {
      setDebouncedValues(prev => ({ ...prev, [key]: value }));
    },
    delay
  );

  const setValue = useCallback((key: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
    debouncedUpdate(key, value);
  }, [debouncedUpdate]);

  return [values, setValue, debouncedValues];
}

/**
 * Hook for debouncing search
 * @param delay - Delay in milliseconds
 * @returns [searchTerm, setSearchTerm, debouncedSearchTerm]
 */
export function useDebouncedSearch(
  delay: number = 300
): [string, (text: string) => void, string] {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  return [searchTerm, setSearchTerm, debouncedSearchTerm];
}

/**
 * Hook for debouncing with leading/trailing options
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @param options - Options for leading/trailing
 * @returns Debounced value
 */
export function useDebounceAdvanced<T>(
  value: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T {
  const { leading = false, trailing = true } = options;
  
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const leadingRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | number | undefined>(undefined);

  useEffect(() => {
    if (leading && leadingRef.current) {
      setDebouncedValue(value);
      leadingRef.current = false;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        leadingRef.current = true;
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  return debouncedValue;
}

export default useDebounce;