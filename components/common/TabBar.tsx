import { colors, fonts, spacing } from '@config/theme';
import { BlurView } from '@react-native-community/blur';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    LayoutChangeEvent,
    ScrollView,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type TabBarVariant = 'default' | 'scrollable' | 'segmented' | 'floating' | 'bottom' | 'icon-only';
export type TabBarPosition = 'top' | 'bottom';
export type TabBarSize = 'small' | 'medium' | 'large';
export type TabBarIndicatorStyle = 'line' | 'dot' | 'pill' | 'background' | 'none';

interface TabItem {
  id: string;
  label: string;
  icon?: string;
  iconSelected?: string;
  badge?: number | string;
  badgeColor?: string;
  badgeTextColor?: string;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  variant?: TabBarVariant;
  position?: TabBarPosition;
  size?: TabBarSize;
  indicatorStyle?: TabBarIndicatorStyle;
  showIndicator?: boolean;
  indicatorColor?: string;
  indicatorHeight?: number;
  indicatorWidth?: number | string;
  animatedIndicator?: boolean;
  indicatorAnimationDuration?: number;
  scrollEnabled?: boolean;
  scrollViewProps?: any;
  tabSpacing?: number;
  tabPadding?: number;
  tabBorderRadius?: number;
  tabBackgroundColor?: string;
  tabSelectedBackgroundColor?: string;
  tabTextColor?: string;
  tabSelectedTextColor?: string;
  tabIconColor?: string;
  tabSelectedIconColor?: string;
  tabIconSize?: number;
  showBadge?: boolean;
  badgeSize?: number;
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showDivider?: boolean;
  dividerColor?: string;
  dividerHeight?: number;
  blurBackground?: boolean;
  blurAmount?: number;
  elevation?: number;
  shadow?: boolean;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  tabTextStyle?: TextStyle;
  selectedTabStyle?: ViewStyle;
  selectedTabTextStyle?: TextStyle;
  indicatorStyleCustom?: ViewStyle;
  badgeStyle?: ViewStyle;
  badgeTextStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  showScrollButtons?: boolean;
  scrollButtonSize?: number;
  scrollButtonColor?: string;
  onScrollButtonPress?: (direction: 'left' | 'right') => void;
  initialScrollOffset?: number;
  centered?: boolean;
  fullWidth?: boolean;
  tabFlex?: number;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  variant = 'default',
  position = 'top',
  size = 'medium',
  indicatorStyle = 'line',
  showIndicator = true,
  indicatorColor = colors.primary,
  indicatorHeight = 3,
  indicatorWidth,
  animatedIndicator = true,
  indicatorAnimationDuration = 300,
  scrollEnabled = true,
  scrollViewProps,
  tabSpacing = spacing.md,
  tabPadding = spacing.md,
  tabBorderRadius = 8,
  tabBackgroundColor = 'transparent',
  tabSelectedBackgroundColor = colors.primary,
  tabTextColor = colors.textSecondary,
  tabSelectedTextColor = colors.primary,
  tabIconColor = colors.textSecondary,
  tabSelectedIconColor = colors.primary,
  tabIconSize,
  showBadge = true,
  badgeSize = 18,
  badgePosition = 'top-right',
  showDivider = true,
  dividerColor = colors.border,
  dividerHeight = 1,
  blurBackground = false,
  blurAmount = 10,
  elevation = 0,
  shadow = false,
  shadowColor = '#000',
  shadowOffset = { width: 0, height: 2 },
  shadowOpacity = 0.1,
  shadowRadius = 4,
  style,
  containerStyle,
  tabStyle,
  tabTextStyle,
  selectedTabStyle,
  selectedTabTextStyle,
  indicatorStyleCustom,
  badgeStyle,
  badgeTextStyle,
  testID = 'tab-bar',
  accessibilityLabel = 'Tab bar',
  showScrollButtons = false,
  scrollButtonSize = 40,
  scrollButtonColor = colors.text,
  onScrollButtonPress,
  initialScrollOffset = 0,
  centered = false,
  fullWidth = false,
  tabFlex = 1,
}) => {
  const [tabWidths, setTabWidths] = useState<Record<string, number>>({});
  const [tabPositions, setTabPositions] = useState<Record<string, number>>({});
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { width: screenWidth } = Dimensions.get('window');
  const isScrollable = variant === 'scrollable' && scrollEnabled;
  const isSegmented = variant === 'segmented';
  const isFloating = variant === 'floating';
  const isBottom = position === 'bottom';
  const isIconOnly = variant === 'icon-only';

  // Get size configuration
  const getSizeConfig = () => {
    const sizeConfigs = {
      small: {
        tabHeight: 36,
        fontSize: 12,
        iconSize: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
      },
      medium: {
        tabHeight: 48,
        fontSize: 14,
        iconSize: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
      },
      large: {
        tabHeight: 56,
        fontSize: 16,
        iconSize: 24,
        paddingVertical: 12,
        paddingHorizontal: 20,
      },
    };

    return sizeConfigs[size] || sizeConfigs.medium;
  };

  const sizeConfig = getSizeConfig();

  // Calculate indicator position and width
  const calculateIndicator = () => {
    const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (activeTabIndex === -1) return { left: 0, width: 0 };

    const tabWidth = tabWidths[activeTab] || 0;
    const tabPosition = tabPositions[activeTab] || 0;

    let indicatorLeft = tabPosition;
    let indicatorWidthValue = tabWidth;

    if (indicatorWidth) {
      if (typeof indicatorWidth === 'string' && indicatorWidth.includes('%')) {
        const percentage = parseFloat(indicatorWidth) / 100;
        indicatorWidthValue = tabWidth * percentage;
        indicatorLeft = tabPosition + (tabWidth - indicatorWidthValue) / 2;
      } else {
        indicatorWidthValue = indicatorWidth;
        indicatorLeft = tabPosition + (tabWidth - indicatorWidthValue) / 2;
      }
    }

    return { left: indicatorLeft, width: indicatorWidthValue };
  };

  const indicator = calculateIndicator();

  // Animate indicator
  useEffect(() => {
    if (!showIndicator || !animatedIndicator) return;

    const { left, width } = indicator;

    Animated.parallel([
      Animated.timing(indicatorAnim, {
        toValue: left,
        duration: indicatorAnimationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab, indicator, animatedIndicator]);

  // Handle tab layout
  const handleTabLayout = (tabId: string, event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    setTabWidths(prev => ({ ...prev, [tabId]: width }));
    setTabPositions(prev => ({ ...prev, [tabId]: x }));
  };

  // Handle scroll view layout
  const handleScrollViewLayout = (event: LayoutChangeEvent) => {
    setScrollViewWidth(event.nativeEvent.layout.width);
  };

  // Handle content size change
  const handleContentSizeChange = (width: number) => {
    setContentWidth(width);
  };

  // Scroll to active tab
  const scrollToActiveTab = () => {
    if (!isScrollable || !scrollViewRef.current) return;

    const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    const tabWidth = tabWidths[activeTab] || 0;
    const tabPosition = tabPositions[activeTab] || 0;
    const centerPosition = tabPosition - (scrollViewWidth - tabWidth) / 2;

    scrollViewRef.current.scrollTo({
      x: Math.max(0, centerPosition),
      animated: true,
    });
  };

  // Handle tab press
  const handleTabPress = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.disabled) return;

    onTabPress(tabId);

    // Animate press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    if (isScrollable) {
      setTimeout(scrollToActiveTab, 100);
    }
  };

  // Render badge
  const renderBadge = (tab: TabItem) => {
    if (!showBadge || !tab.badge) return null;

    const badgeNumber = typeof tab.badge === 'string' ? tab.badge : 
      tab.badge > 99 ? '99+' : tab.badge.toString();

    const badgeStyles: ViewStyle[] = [
      styles.badge,
      {
        width: badgeSize,
        height: badgeSize,
        borderRadius: badgeSize / 2,
        backgroundColor: tab.badgeColor || colors.error,
      },
    ];

    // Position badge
    switch (badgePosition) {
      case 'top-right':
        badgeStyles.push(styles.badgeTopRight);
        break;
      case 'top-left':
        badgeStyles.push(styles.badgeTopLeft);
        break;
      case 'bottom-right':
        badgeStyles.push(styles.badgeBottomRight);
        break;
      case 'bottom-left':
        badgeStyles.push(styles.badgeBottomLeft);
        break;
    }

    return (
      <View style={[badgeStyles, badgeStyle]}>
        <Text
          style={[
            styles.badgeText,
            {
              fontSize: badgeSize * 0.6,
              color: tab.badgeTextColor || colors.surface,
            },
            badgeTextStyle,
          ]}>
          {badgeNumber}
        </Text>
      </View>
    );
  };

  // Render tab content
  const renderTabContent = (tab: TabItem, isActive: boolean) => {
    const textColor = isActive ? tabSelectedTextColor : tabTextColor;
    const iconColor = isActive ? tabSelectedIconColor : tabIconColor;
    const iconName = isActive && tab.iconSelected ? tab.iconSelected : tab.icon;
    const iconSize = tabIconSize || sizeConfig.iconSize;

    return (
      <>
        {iconName && (
          <Icon
            name={iconName}
            size={iconSize}
            color={iconColor}
            style={isIconOnly ? null : styles.iconWithText}
          />
        )}
        
        {(!isIconOnly || !iconName) && tab.label && (
          <Text
            style={[
              styles.tabText,
              {
                fontSize: sizeConfig.fontSize,
                color: textColor,
                fontFamily: isActive ? fonts.semiBold : fonts.medium,
                marginLeft: iconName && !isIconOnly ? spacing.xs : 0,
              },
              tabTextStyle,
              isActive && selectedTabTextStyle,
            ]}
            numberOfLines={1}>
            {tab.label}
          </Text>
        )}
      </>
    );
  };

  // Render tab
  const renderTab = (tab: TabItem) => {
    const isActive = tab.id === activeTab;
    const isDisabled = tab.disabled;
    
    const tabStyles: ViewStyle[] = [
      styles.tab,
      {
        height: sizeConfig.tabHeight,
        paddingVertical: sizeConfig.paddingVertical,
        paddingHorizontal: isSegmented ? 0 : sizeConfig.paddingHorizontal,
        borderRadius: tabBorderRadius,
        backgroundColor: isActive && isSegmented ? tabSelectedBackgroundColor : tabBackgroundColor,
        marginRight: isSegmented ? 0 : tabSpacing,
        flex: isSegmented || fullWidth ? tabFlex : undefined,
        opacity: isDisabled ? 0.5 : 1,
      },
      tabStyle,
      isActive && !isSegmented && selectedTabStyle,
    ];

    if (isSegmented && tabs.length > 0) {
      if (tab.id === tabs[0].id) {
        tabStyles.push(styles.segmentedFirst);
      } else if (tab.id === tabs[tabs.length - 1].id) {
        tabStyles.push(styles.segmentedLast);
      } else {
        tabStyles.push(styles.segmentedMiddle);
      }
    }

    return (
      <TouchableOpacity
        key={tab.id}
        style={tabStyles}
        onPress={() => handleTabPress(tab.id)}
        onLayout={(event) => handleTabLayout(tab.id, event)}
        disabled={isDisabled}
        activeOpacity={0.7}
        testID={tab.testID || `tab-${tab.id}`}
        accessibilityLabel={tab.accessibilityLabel || tab.label}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive, disabled: isDisabled }}>
        <Animated.View style={{ transform: [{ scale: isActive ? scaleAnim : 1 }] }}>
          {renderTabContent(tab, isActive)}
          {renderBadge(tab)}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Render indicator
  const renderIndicator = () => {
    if (!showIndicator || indicatorStyle === 'none') return null;

    const { left, width } = indicator;
    const isActive = tabs.some(tab => tab.id === activeTab);

    const indicatorStyles: ViewStyle[] = [
      styles.indicator,
      {
        backgroundColor: indicatorColor,
      },
      indicatorStyleCustom,
    ];

    // Style based on indicator type
    switch (indicatorStyle) {
      case 'line':
        indicatorStyles.push({
          height: indicatorHeight,
          width: Animated.add(indicatorAnim, width),
          left: indicatorAnim,
          borderRadius: indicatorHeight / 2,
        });
        break;
      case 'dot':
        indicatorStyles.push({
          width: indicatorHeight * 2,
          height: indicatorHeight * 2,
          borderRadius: indicatorHeight,
          left: Animated.add(indicatorAnim, (width - indicatorHeight * 2) / 2),
          bottom: -indicatorHeight,
        });
        break;
      case 'pill':
        indicatorStyles.push({
          height: sizeConfig.tabHeight - 8,
          width: Animated.add(indicatorAnim, width),
          left: indicatorAnim,
          borderRadius: tabBorderRadius,
          top: 4,
        });
        break;
      case 'background':
        indicatorStyles.push({
          height: sizeConfig.tabHeight,
          width: Animated.add(indicatorAnim, width),
          left: indicatorAnim,
          borderRadius: tabBorderRadius,
        });
        break;
    }

    return <Animated.View style={indicatorStyles} />;
  };

  // Render scroll buttons
  const renderScrollButtons = () => {
    if (!showScrollButtons || !isScrollable) return null;

    const canScrollLeft = initialScrollOffset > 0;
    const canScrollRight = contentWidth > scrollViewWidth;

    return (
      <>
        {canScrollLeft && (
          <TouchableOpacity
            style={[styles.scrollButton, styles.scrollButtonLeft]}
            onPress={() => onScrollButtonPress?.('left')}>
            <Icon
              name="chevron-left"
              size={scrollButtonSize * 0.6}
              color={scrollButtonColor}
            />
          </TouchableOpacity>
        )}
        
        {canScrollRight && (
          <TouchableOpacity
            style={[styles.scrollButton, styles.scrollButtonRight]}
            onPress={() => onScrollButtonPress?.('right')}>
            <Icon
              name="chevron-right"
              size={scrollButtonSize * 0.6}
              color={scrollButtonColor}
            />
          </TouchableOpacity>
        )}
      </>
    );
  };

  // Container styles
  const containerStyles: ViewStyle[] = [
    styles.container,
    {
      elevation,
      position: isFloating ? 'absolute' : 'relative',
      bottom: isFloating || isBottom ? spacing.lg : undefined,
      left: isFloating ? spacing.lg : undefined,
      right: isFloating ? spacing.lg : undefined,
      borderRadius: isFloating ? tabBorderRadius : 0,
      backgroundColor: blurBackground ? 'transparent' : colors.surface,
    },
    containerStyle,
  ];

  if (shadow) {
    containerStyles.push({
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
    });
  }

  // Tabs container
  const tabsContainer = (
    <View
      style={[
        styles.tabsContainer,
        isSegmented && styles.segmentedContainer,
        centered && styles.centeredContainer,
        fullWidth && styles.fullWidthContainer,
        { paddingHorizontal: isSegmented ? 0 : tabSpacing },
      ]}>
      {tabs.map(renderTab)}
      {showIndicator && renderIndicator()}
    </View>
  );

  // Scrollable tabs
  const scrollableTabs = isScrollable ? (
    <View style={styles.scrollableContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollableContent,
          centered && { justifyContent: 'center' },
        ]}
        onLayout={handleScrollViewLayout}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
        {...scrollViewProps}>
        {tabs.map(renderTab)}
        {showIndicator && renderIndicator()}
      </ScrollView>
      {renderScrollButtons()}
    </View>
  ) : null;

  // Divider
  const divider = showDivider && !isFloating && !isBottom ? (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: dividerColor,
          height: dividerHeight,
        },
      ]}
    />
  ) : null;

  return (
    <View style={[styles.wrapper, style]} testID={testID} accessibilityLabel={accessibilityLabel}>
      {blurBackground && (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor={colors.surface}
        />
      )}
      
      <Animated.View style={containerStyles}>
        {position === 'top' && divider}
        {isScrollable ? scrollableTabs : tabsContainer}
        {position === 'bottom' && divider}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    zIndex: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    position: 'relative',
    paddingVertical: spacing.sm,
  },
  segmentedContainer: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    padding: 2,
  },
  centeredContainer: {
    justifyContent: 'center',
  },
  fullWidthContainer: {
    width: '100%',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  segmentedFirst: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  segmentedMiddle: {
    borderRadius: 0,
  },
  segmentedLast: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  tabText: {
    textAlign: 'center',
  },
  iconWithText: {
    marginRight: spacing.xs,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
  },
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTopRight: {
    top: -6,
    right: -6,
  },
  badgeTopLeft: {
    top: -6,
    left: -6,
  },
  badgeBottomRight: {
    bottom: -6,
    right: -6,
  },
  badgeBottomLeft: {
    bottom: -6,
    left: -6,
  },
  badgeText: {
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollableContainer: {
    position: 'relative',
  },
  scrollableContent: {
    flexGrow: 1,
    paddingVertical: spacing.sm,
  },
  scrollButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollButtonLeft: {
    left: spacing.sm,
  },
  scrollButtonRight: {
    right: spacing.sm,
  },
});

export default TabBar;