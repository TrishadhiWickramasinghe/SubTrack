import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Check authentication status from Supabase session
    const checkAuth = async () => {
      try {
        // const session = await authService.getSession();
        // setIsAuthenticated(!!session);
        setIsAuthenticated(false); // Start with auth required
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
