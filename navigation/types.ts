import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  // Main Tabs
  Home: undefined;
  Dashboard: undefined;
  Subscriptions: undefined;
  Analytics: undefined;
  Settings: undefined;
  
  // Subscription Screens
  AddSubscription: undefined;
  EditSubscription: { subscriptionId: string };
  SubscriptionDetails: { subscriptionId: string };
  SubscriptionHistory: { subscriptionId: string };
  DuplicateSubscription: { subscriptionId: string };
  
  // Other screens
  Budget: undefined;
  TrialManager: undefined;
  Splitting: undefined;
  Marketplace: undefined;
  Scanner: undefined;
  Reports: undefined;
  Profile: undefined;
};

// Navigation props type for screens
export type ScreenNavigationProp<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};