import { createNavigationContainerRef } from '@react-navigation/native';

// Define your root stack param list
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
  PinSetup: undefined;
  Welcome: undefined;
  Setup: undefined;
};

// Define your main tab param list
export type MainTabParamList = {
  Dashboard: undefined;
  Subscriptions: undefined;
  Analytics: undefined;
  Budget: undefined;
  Settings: undefined;
};

// Define subscription stack param list
export type SubscriptionStackParamList = {
  SubscriptionList: undefined;
  AddSubscription: undefined;
  EditSubscription: { subscriptionId: string };
  SubscriptionDetails: { subscriptionId: string };
  SubscriptionHistory: { subscriptionId: string };
  DuplicateSubscription: { subscriptionId: string };
};

// Define analytics stack param list
export type AnalyticsStackParamList = {
  AnalyticsOverview: undefined;
  MonthlyReport: { month?: string; year?: number };
  YearlyReport: { year?: number };
  CustomReport: undefined;
  SpendingTrends: undefined;
  CategoryAnalysis: undefined;
};

// Define budget stack param list
export type BudgetStackParamList = {
  BudgetOverview: undefined;
  CreateBudget: undefined;
  EditBudget: { budgetId: string };
  BudgetDetails: { budgetId: string };
  CategoryBudget: { categoryId: string };
};

// Define trial stack param list
export type TrialStackParamList = {
  TrialManager: undefined;
  AddTrial: undefined;
  TrialDetails: { trialId: string };
  TrialCalendar: undefined;
};

// Define settings stack param list
export type SettingsStackParamList = {
  SettingsMenu: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Preferences: undefined;
  Notifications: undefined;
  Security: undefined;
  Backup: undefined;
  About: undefined;
  CurrencySettings: undefined;
  ThemeSettings: undefined;
};

// Define marketplace stack param list
export type MarketplaceStackParamList = {
  Marketplace: undefined;
  ServiceDetails: { serviceId: string };
  CategoryBrowse: { categoryId: string };
  TrendingServices: undefined;
};

// Define scanner stack param list
export type ScannerStackParamList = {
  Scanner: undefined;
  ReceiptReview: { imageUri: string; ocrData?: any };
  ReceiptGallery: undefined;
};

// Define reports stack param list
export type ReportsStackParamList = {
  MonthlyReport: { month?: string; year?: number };
  YearlyReport: { year?: number };
  CustomReport: undefined;
  Export: undefined;
};

// Define splitting stack param list
export type SplittingStackParamList = {
  SplittingOverview: undefined;
  CreateSplit: undefined;
  SplitDetails: { splitId: string };
  MemberManagement: { splitId: string };
  Settlement: { splitId: string };
};

// Define all param lists
export type AllParamLists = RootStackParamList &
  MainTabParamList &
  SubscriptionStackParamList &
  AnalyticsStackParamList &
  BudgetStackParamList &
  TrialStackParamList &
  SettingsStackParamList &
  MarketplaceStackParamList &
  ScannerStackParamList &
  ReportsStackParamList &
  SplittingStackParamList;

// Create navigation ref
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Navigation service for programmatic navigation
class NavigationService {
  // Navigate to a screen
  static navigate = <RouteName extends keyof AllParamLists>(
    name: RouteName,
    params?: AllParamLists[RouteName]
  ) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name as any, params as any);
    }
  };

  // Go back
  static goBack = () => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  };

  // Reset navigation state
  static reset = (name: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: name as string, params }],
      });
    }
  };

  // Get current route
  static getCurrentRoute = () => {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute();
    }
    return null;
  };

  // Get current route name
  static getCurrentRouteName = () => {
    const route = this.getCurrentRoute();
    return route?.name;
  };

  // Check if screen is focused
  static isFocused = () => {
    if (navigationRef.isReady()) {
      return navigationRef.isFocused();
    }
    return false;
  };

  // Open drawer (if using drawer navigator)
  static openDrawer = () => {
    if (navigationRef.isReady()) {
      // @ts-ignore - This is for drawer navigation
      navigationRef.dispatch({ type: 'OPEN_DRAWER' });
    }
  };

  // Close drawer
  static closeDrawer = () => {
    if (navigationRef.isReady()) {
      // @ts-ignore - This is for drawer navigation
      navigationRef.dispatch({ type: 'CLOSE_DRAWER' });
    }
  };

  // Navigate to subscription details
  static goToSubscriptionDetails = (subscriptionId: string) => {
    this.navigate('SubscriptionDetails', { subscriptionId });
  };

  // Navigate to add subscription
  static goToAddSubscription = () => {
    this.navigate('AddSubscription');
  };

  // Navigate to edit subscription
  static goToEditSubscription = (subscriptionId: string) => {
    this.navigate('EditSubscription', { subscriptionId });
  };

  // Navigate to analytics
  static goToAnalytics = () => {
    this.navigate('Analytics');
  };

  // Navigate to budget
  static goToBudget = () => {
    this.navigate('Budget');
  };

  // Navigate to settings
  static goToSettings = () => {
    this.navigate('Settings');
  };

  // Navigate to trial manager
  static goToTrialManager = () => {
    this.navigate('TrialManager');
  };

  // Navigate to marketplace
  static goToMarketplace = () => {
    this.navigate('Marketplace');
  };

  // Navigate to scanner
  static goToScanner = () => {
    this.navigate('Scanner');
  };

  // Navigate to reports
  static goToReports = () => {
    this.navigate('MonthlyReport');
  };

  // Navigate to splitting
  static goToSplitting = () => {
    this.navigate('SplittingOverview');
  };

  // Logout and go to auth
  static logout = () => {
    this.reset('Auth');
  };

  // Complete onboarding
  static completeOnboarding = () => {
    this.reset('Main');
  };

  // Set navigation params for current screen
  static setParams = (params: any) => {
    if (navigationRef.isReady()) {
      navigationRef.setParams(params);
    }
  };
}

export { NavigationService };
