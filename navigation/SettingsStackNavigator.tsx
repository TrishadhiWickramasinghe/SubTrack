import CurrencySelector from '@components/settings/CurrencySelector';
import NotificationSettings from '@components/settings/NotificationSettings';
import ThemeSelector from '@components/settings/ThemeSelector';
import { useTheme } from '@context/ThemeContext';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '@screens/main/SettingsScreen';
import BackupScreen from '@screens/misc/BackupScreen';
import HelpScreen from '@screens/misc/HelpScreen';
import SecurityScreen from '@screens/misc/SecurityScreen';
import AboutScreen from '@screens/profile/AboutScreen';
import EditProfileScreen from '@screens/profile/EditProfileScreen';
import PreferencesScreen from '@screens/profile/PreferencesScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';
import React from 'react';
import { SettingsStackParamList } from './types';

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsStackNavigator() {
  const { theme, colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="SettingsMain"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        cardStyle: {
          backgroundColor: colors.background,
        },
        animationEnabled: true,
        gestureEnabled: true,
      }}>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen
        name="Preferences"
        component={PreferencesScreen}
        options={{
          title: 'Preferences',
        }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettings}
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="CurrencySettings"
        component={CurrencySelector}
        options={{
          title: 'Currency',
        }}
      />
      <Stack.Screen
        name="ThemeSettings"
        component={ThemeSelector}
        options={{
          title: 'Theme',
        }}
      />
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{
          title: 'Security',
        }}
      />
      <Stack.Screen
        name="Backup"
        component={BackupScreen}
        options={{
          title: 'Backup & Sync',
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'About',
        }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          title: 'Help & Support',
        }}
      />
    </Stack.Navigator>
  );
}