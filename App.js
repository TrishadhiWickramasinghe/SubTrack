import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { AppState, StatusBar } from 'react-native';
import codePush from 'react-native-code-push';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { Host } from 'react-native-portalize';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

// Import all contexts
import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import { BudgetProvider } from './src/context/BudgetContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { GamificationProvider } from './src/context/GamificationContext';
import { MarketplaceProvider } from './src/context/MarketplaceContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { SplittingProvider } from './src/context/SplittingContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { TrialProvider } from './src/context/TrialContext';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import services
import { loadFonts } from './src/config/fonts';
import { initializeAnalytics } from './src/services/analytics/analyticsService';
import { checkForUpdates } from './src/services/backup/backupService';
import { initializeNotifications } from './src/services/notifications/notificationService';
import { initializeSecurity } from './src/services/security/biometricAuth';
import { setupStorage } from './src/services/storage/mmkvStorage';

// Import components
import ErrorBoundary from './src/components/common/ErrorBoundary';
import NetworkStatus from './src/components/common/NetworkStatus';
import OfflineBanner from './src/components/common/OfflineBanner';
import UpdateModal from './src/components/common/UpdateModal';
import LoadingScreen from './src/screens/auth/LoadingScreen';

// Performance optimizations
enableScreens();

// Initialize Query Client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Main App component with all providers
 */
function MainApp() {
  const { isDarkMode, colors, theme } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  // Initialize app
  const initializeApp = useCallback(async () => {
    try {
      console.log('Initializing SubTrack App...');
      
      // Step 1: Setup storage
      await setupStorage();
      
      // Step 2: Load fonts
      await loadFonts();
      
      // Step 3: Initialize notifications
      await initializeNotifications();
      
      // Step 4: Initialize analytics
      await initializeAnalytics();
      
      // Step 5: Initialize security
      await initializeSecurity();
      
      // Step 6: Check for updates
      const updateAvailable = await checkForUpdates();
      if (updateAvailable) {
        setUpdateInfo(updateAvailable);
        setShowUpdateModal(true);
      }
      
      // Step 7: Any other async initialization
      
      console.log('App initialization complete');
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Still show app even if some services fail
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    initializeApp();
    
    // Handle app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
        // Refresh data, check notifications, etc.
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [initializeApp]);

  // Handle CodePush sync status
  const codePushStatusDidChange = useCallback((syncStatus) => {
    switch (syncStatus) {
      case codePush.SyncStatus.CHECKING_FOR_UPDATE:
        console.log('Checking for updates...');
        break;
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        console.log('Downloading package...');
        break;
      case codePush.SyncStatus.INSTALLING_UPDATE:
        console.log('Installing update...');
        break;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        console.log('Update installed');
        break;
      case codePush.SyncStatus.UPDATE_IGNORED:
        console.log('Update ignored');
        break;
      case codePush.SyncStatus.ERROR:
        console.log('Error during sync');
        break;
    }
  }, []);

  useEffect(() => {
    // Configure CodePush
    codePush.sync(
      {
        updateDialog: {
          appendReleaseDescription: true,
          descriptionPrefix: '\n\nChange log:\n',
          title: 'A new update is available!',
          mandatoryUpdateMessage: '',
          mandatoryContinueButtonLabel: 'Update',
        },
        installMode: codePush.InstallMode.IMMEDIATE,
      },
      codePushStatusDidChange
    );
  }, [codePushStatusDidChange]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <Host>
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
                animated
              />
              <NetworkStatus />
              <OfflineBanner />
              <NavigationContainer theme={theme}>
                <AppNavigator />
              </NavigationContainer>
              <UpdateModal
                visible={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                updateInfo={updateInfo}
              />
            </Host>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PaperProvider>
    </QueryClientProvider>
  );
}

/**
 * Root App component wrapped with all providers
 */
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <ThemeProvider>
            <CurrencyProvider>
              <NotificationProvider>
                <SubscriptionProvider>
                  <BudgetProvider>
                    <TrialProvider>
                      <SplittingProvider>
                        <MarketplaceProvider>
                          <GamificationProvider>
                            <MainApp />
                          </GamificationProvider>
                        </MarketplaceProvider>
                      </SplittingProvider>
                    </TrialProvider>
                  </BudgetProvider>
                </SubscriptionProvider>
              </NotificationProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

// Configure CodePush
const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
  installMode: codePush.InstallMode.IMMEDIATE,
  mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
  updateDialog: {
    appendReleaseDescription: true,
    title: 'A new update is available!',
  },
};

export default codePush(codePushOptions)(App);