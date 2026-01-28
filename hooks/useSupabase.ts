/**
 * Custom Supabase Hook
 * High-level hook for common Supabase operations
 */

// TODO: Implement SupabaseContext
// import { useSupabase } from '@/context/SupabaseContext';
import { budgetsService } from '@/services/supabase/budgets';
import { categoriesService } from '@/services/supabase/categories';
import { subscriptionsService } from '@/services/supabase/subscriptions';
import type { Budget, Category, Subscription } from '@/types/supabase';
import { useEffect, useState } from 'react';

// Stub for useSupabase hook - returns a user object
const useSupabase = () => ({
  user: { id: 'stub-user-id' } as any,
});

interface UseSupabaseDataOptions {
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

/**
 * Hook to fetch subscriptions
 */
export function useSubscriptions(options?: UseSupabaseDataOptions) {
  const { user } = useSupabase();
  const [data, setData] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await subscriptionsService.getSubscriptions(user.id);

        if (response.error) {
          const errorMsg = response.error.message;
          setError(errorMsg);
          options?.onError?.(errorMsg);
          return;
        }

        setData(response.data?.data || []);
        options?.onSuccess?.();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        options?.onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, options]);

  return { data, loading, error };
}

/**
 * Hook to fetch active subscriptions
 */
export function useActiveSubscriptions(options?: UseSupabaseDataOptions) {
  const { user } = useSupabase();
  const [data, setData] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await subscriptionsService.getActiveSubscriptions(
          user.id
        );

        if (response.error) {
          const errorMsg = response.error.message;
          setError(errorMsg);
          options?.onError?.(errorMsg);
          return;
        }

        setData(response.data || []);
        options?.onSuccess?.();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        options?.onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, options]);

  return { data, loading, error };
}

/**
 * Hook to fetch categories
 */
export function useCategories(options?: UseSupabaseDataOptions) {
  const { user } = useSupabase();
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await categoriesService.getCategories(user.id);

        if (response.error) {
          const errorMsg = response.error.message;
          setError(errorMsg);
          options?.onError?.(errorMsg);
          return;
        }

        setData(response.data || []);
        options?.onSuccess?.();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        options?.onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, options]);

  return { data, loading, error };
}

/**
 * Hook to fetch monthly budget
 */
export function useMonthlyBudget(month: string, options?: UseSupabaseDataOptions) {
  const { user } = useSupabase();
  const [data, setData] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await budgetsService.getOrCreateMonthlyBudget(
          user.id,
          month,
          0 // Default limit, user can update later
        );

        if (response.error) {
          const errorMsg = response.error.message;
          setError(errorMsg);
          options?.onError?.(errorMsg);
          return;
        }

        setData(response.data);
        options?.onSuccess?.();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        options?.onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, month, options]);

  return { data, loading, error };
}

/**
 * Hook for upcoming subscriptions (next 7 days)
 */
export function useUpcomingSubscriptions(
  daysAhead: number = 7,
  options?: UseSupabaseDataOptions
) {
  const { user } = useSupabase();
  const [data, setData] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await subscriptionsService.getUpcomingSubscriptions(
          user.id,
          daysAhead
        );

        if (response.error) {
          const errorMsg = response.error.message;
          setError(errorMsg);
          options?.onError?.(errorMsg);
          return;
        }

        setData(response.data || []);
        options?.onSuccess?.();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        options?.onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, daysAhead, options]);

  return { data, loading, error };
}

/**
 * Hook for subscription statistics
 */
export function useSubscriptionStats() {
  const { user } = useSupabase();
  const [stats, setStats] = useState({
    totalActive: 0,
    totalMonthlySpending: 0,
    totalYearlySpending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const activeResponse = await subscriptionsService.getActiveSubscriptions(
          user.id
        );
        const monthlySpendingResponse =
          await subscriptionsService.getTotalMonthlySpending(
            user.id,
            new Date().toISOString().split('T')[0].substring(0, 7)
          );

        const totalActive = activeResponse.data?.length || 0;
        const monthlySpending = monthlySpendingResponse.data || 0;
        const yearlySpending = monthlySpending * 12;

        setStats({
          totalActive,
          totalMonthlySpending: monthlySpending,
          totalYearlySpending: yearlySpending,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { stats, loading, error };
}
