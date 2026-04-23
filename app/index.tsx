import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { authService } from '../services/supabase/auth';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status from Supabase session
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        setIsAuthenticated(!!response.data);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return null;
  }

  // Redirect based on authentication status
  return <Redirect href={isAuthenticated ? '/(tabs)/home' : '/auth/welcome'} />;
}
