import settingsStorage from '@services/storage/settingsStorage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';

// Create context
const ThemeContext = createContext();

// Default themes
const LIGHT_THEME = {
  mode: 'light',
  colors: {
    // Primary colors
    primary: '#4ECDC4',
    primaryDark: '#3DA69E',
    primaryLight: '#6FDAD2',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#E9ECEF',
    card: '#FFFFFF',
    
    // Text colors
    text: '#212529',
    textSecondary: '#6C757D',
    textTertiary: '#ADB5BD',
    textInverse: '#FFFFFF',
    
    // Border colors
    border: '#DEE2E6',
    borderLight: '#E9ECEF',
    borderDark: '#CED4DA',
    
    // Status colors
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
    
    // UI element colors
    inputBackground: '#FFFFFF',
    placeholder: '#6C757D',
    disabled: '#E9ECEF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Chart colors (for pie charts, etc.)
    chart: [
      '#4ECDC4', '#FF6B6B', '#95E1D3', '#FCE38A',
      '#F38181', '#A8E6CF', '#FFAAA5', '#FFD3B6',
      '#6C5CE7', '#00CEC9', '#FF7675', '#74B9FF',
    ],
  },
  
  // Typography
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    round: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  
  // Animation
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      default: 'ease-in-out',
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
    },
  },
};

const DARK_THEME = {
  mode: 'dark',
  colors: {
    // Primary colors (same as light theme for consistency)
    primary: '#4ECDC4',
    primaryDark: '#3DA69E',
    primaryLight: '#6FDAD2',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    
    // Background colors
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#2D2D2D',
    card: '#1E1E1E',
    
    // Text colors
    text: '#E9ECEF',
    textSecondary: '#ADB5BD',
    textTertiary: '#6C757D',
    textInverse: '#121212',
    
    // Border colors
    border: '#2D2D2D',
    borderLight: '#3D3D3D',
    borderDark: '#1E1E1E',
    
    // Status colors
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
    
    // UI element colors
    inputBackground: '#2D2D2D',
    placeholder: '#6C757D',
    disabled: '#3D3D3D',
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Chart colors
    chart: [
      '#4ECDC4', '#FF6B6B', '#95E1D3', '#FCE38A',
      '#F38181', '#A8E6CF', '#FFAAA5', '#FFD3B6',
      '#6C5CE7', '#00CEC9', '#FF7675', '#74B9FF',
    ],
  },
  
  // Typography, spacing, etc. same as light theme
  typography: LIGHT_THEME.typography,
  spacing: LIGHT_THEME.spacing,
  borderRadius: LIGHT_THEME.borderRadius,
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.5,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.7,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.9,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  animation: LIGHT_THEME.animation,
};

// High contrast themes for accessibility
const HIGH_CONTRAST_LIGHT_THEME = {
  ...LIGHT_THEME,
  colors: {
    ...LIGHT_THEME.colors,
    primary: '#0056B3',
    text: '#000000',
    background: '#FFFFFF',
    border: '#000000',
    success: '#006400',
    error: '#8B0000',
  },
};

const HIGH_CONTRAST_DARK_THEME = {
  ...DARK_THEME,
  colors: {
    ...DARK_THEME.colors,
    primary: '#4FA0FF',
    text: '#FFFFFF',
    background: '#000000',
    border: '#FFFFFF',
    success: '#00FF00',
    error: '#FF0000',
  },
};

// Available accent colors
const ACCENT_COLORS = [
  { name: 'Teal', value: '#4ECDC4' },
  { name: 'Coral', value: '#FF6B6B' },
  { name: 'Purple', value: '#6C5CE7' },
  { name: 'Blue', value: '#74B9FF' },
  { name: 'Green', value: '#00B894' },
  { name: 'Yellow', value: '#FDCB6E' },
  { name: 'Pink', value: '#FD79A8' },
  { name: 'Orange', value: '#E17055' },
];

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Main provider component
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(LIGHT_THEME);
  const [themeMode, setThemeMode] = useState('light');
  const [accentColor, setAccentColor] = useState('#4ECDC4');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize theme from settings
   */
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const settings = await settingsStorage.getSettings();
        const themeSettings = settings.theme;
        
        // Set theme mode
        let mode = themeSettings.mode;
        if (mode === 'system') {
          mode = systemColorScheme || 'light';
        }
        
        // Set accent color
        const accent = themeSettings.accentColor || '#4ECDC4';
        
        // Set high contrast
        const highContrast = settings.preferences.highContrast || false;
        
        // Apply theme
        applyTheme(mode, accent, highContrast);
        
        setIsInitialized(true);
        
      } catch (error) {
        console.error('Error initializing theme:', error);
        // Fallback to default
        applyTheme('light', '#4ECDC4', false);
        setIsInitialized(true);
      }
    };
    
    initializeTheme();
  }, [systemColorScheme]);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if theme mode is set to 'system'
      if (themeMode === 'system') {
        applyTheme(colorScheme || 'light', accentColor, isHighContrast);
      }
    });
    
    return () => subscription.remove();
  }, [themeMode, accentColor, isHighContrast]);

  /**
   * Apply theme with given parameters
   */
  const applyTheme = (mode, accent, highContrast = false) => {
    let baseTheme;
    
    // Select base theme based on mode and contrast
    if (highContrast) {
      baseTheme = mode === 'dark' ? HIGH_CONTRAST_DARK_THEME : HIGH_CONTRAST_LIGHT_THEME;
    } else {
      baseTheme = mode === 'dark' ? DARK_THEME : LIGHT_THEME;
    }
    
    // Apply accent color
    const themedTheme = {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: accent,
        primaryDark: darkenColor(accent, 20),
        primaryLight: lightenColor(accent, 20),
        accent: accent,
      },
    };
    
    setTheme(themedTheme);
    setThemeMode(mode);
    setAccentColor(accent);
    setIsHighContrast(highContrast);
  };

  /**
   * Toggle theme mode
   */
  const toggleTheme = async () => {
    try {
      const newMode = themeMode === 'light' ? 'dark' : 'light';
      await settingsStorage.updateSetting('theme.mode', newMode);
      applyTheme(newMode, accentColor, isHighContrast);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  /**
   * Set theme mode
   */
  const setThemeModeWithSave = async (mode) => {
    try {
      await settingsStorage.updateSetting('theme.mode', mode);
      
      let actualMode = mode;
      if (mode === 'system') {
        actualMode = systemColorScheme || 'light';
      }
      
      applyTheme(actualMode, accentColor, isHighContrast);
    } catch (error) {
      console.error('Error setting theme mode:', error);
    }
  };

  /**
   * Set accent color
   */
  const setAccentColorWithSave = async (color) => {
    try {
      await settingsStorage.updateSetting('theme.accentColor', color);
      applyTheme(themeMode, color, isHighContrast);
    } catch (error) {
      console.error('Error setting accent color:', error);
    }
  };

  /**
   * Toggle high contrast mode
   */
  const toggleHighContrast = async () => {
    try {
      const newHighContrast = !isHighContrast;
      await settingsStorage.updateSetting('preferences.highContrast', newHighContrast);
      applyTheme(themeMode, accentColor, newHighContrast);
    } catch (error) {
      console.error('Error toggling high contrast:', error);
    }
  };

  /**
   * Set custom theme
   */
  const setCustomTheme = async (customTheme) => {
    try {
      await settingsStorage.updateSetting('theme.customTheme', customTheme);
      // For now, just update accent color
      if (customTheme.accentColor) {
        await setAccentColorWithSave(customTheme.accentColor);
      }
    } catch (error) {
      console.error('Error setting custom theme:', error);
    }
  };

  /**
   * Reset to default theme
   */
  const resetTheme = async () => {
    try {
      await settingsStorage.updateSetting('theme.mode', 'system');
      await settingsStorage.updateSetting('theme.accentColor', '#4ECDC4');
      await settingsStorage.updateSetting('theme.customTheme', null);
      await settingsStorage.updateSetting('preferences.highContrast', false);
      
      applyTheme(systemColorScheme || 'light', '#4ECDC4', false);
    } catch (error) {
      console.error('Error resetting theme:', error);
    }
  };

  /**
   * Get theme info
   */
  const getThemeInfo = () => {
    return {
      mode: themeMode,
      accentColor,
      isHighContrast,
      isDark: themeMode === 'dark',
      isSystem: themeMode === 'system',
      availableAccentColors: ACCENT_COLORS,
    };
  };

  /**
   * Create style generator
   */
  const makeStyles = (stylesCreator) => {
    return stylesCreator(theme);
  };

  /**
   * Utility functions
   */
  
  // Darken a color
  const darkenColor = (color, percent) => {
    // Implementation for darkening color
    // This is a simplified version
    return color; // In production, implement proper color manipulation
  };

  // Lighten a color
  const lightenColor = (color, percent) => {
    // Implementation for lightening color
    return color; // In production, implement proper color manipulation
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.primary;
    }
  };

  /**
   * Provide context value
   */
  const value = useMemo(() => ({
    // Theme object
    theme,
    
    // Theme info
    ...getThemeInfo(),
    
    // Methods
    toggleTheme,
    setThemeMode: setThemeModeWithSave,
    setAccentColor: setAccentColorWithSave,
    toggleHighContrast,
    setCustomTheme,
    resetTheme,
    
    // Utilities
    makeStyles,
    getStatusColor,
    
    // State
    isInitialized,
  }), [theme, themeMode, accentColor, isHighContrast, isInitialized]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Higher-order component for theme context
export const withTheme = (Component) => {
  return function WrappedComponent(props) {
    return (
      <ThemeProvider>
        <Component {...props} />
      </ThemeProvider>
    );
  };
};

// Helper hooks for common theme usage

export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

export const useThemeSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

export const useThemeTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

export const useThemeShadows = () => {
  const { theme } = useTheme();
  return theme.shadows;
};

// Style generator helper
export const createStyles = (stylesCreator) => {
  return (props) => {
    const { theme } = useTheme();
    return stylesCreator(theme, props);
  };
};