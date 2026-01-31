import { colors, fonts } from '@/config/theme';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    ImageSourcePropType,
    ImageStyle,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number;
export type AvatarVariant = 'circle' | 'rounded' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'invisible';
export type AvatarBadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface AvatarProps {
  source?: ImageSourcePropType;
  uri?: string;
  text?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: number;
  size?: AvatarSize;
  variant?: AvatarVariant;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  elevation?: number;
  status?: AvatarStatus;
  statusSize?: number;
  badge?: React.ReactNode;
  badgePosition?: AvatarBadgePosition;
  badgeOffset?: number;
  showInitials?: boolean;
  initialsLength?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  loading?: boolean;
  loadingIndicator?: React.ReactNode;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  overlay?: React.ReactNode;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  statusStyle?: ViewStyle;
  badgeStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessible?: boolean;
  animated?: boolean;
  animationType?: 'scale' | 'fade' | 'bounce' | 'none';
  animationDuration?: number;
  group?: boolean;
  groupSpacing?: number;
  groupOverlap?: number;
  showEditButton?: boolean;
  editButtonIcon?: string;
  editButtonSize?: number;
  editButtonColor?: string;
  onEditPress?: () => void;
  editButtonStyle?: ViewStyle;
  editButtonPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  shadow?: boolean;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  uri,
  text,
  icon,
  iconColor = colors.neutral[0],
  iconSize,
  size = 'md',
  variant = 'circle',
  backgroundColor = colors.primary,
  textColor = colors.neutral[0],
  borderColor,
  borderWidth = 0,
  elevation = 0,
  status,
  statusSize = 8,
  badge,
  badgePosition = 'bottom-right',
  badgeOffset = 0,
  showInitials = true,
  initialsLength = 2,
  onPress,
  onLongPress,
  onLoadStart,
  onLoadEnd,
  onError,
  loading = false,
  loadingIndicator,
  placeholder,
  fallback,
  overlay,
  style,
  imageStyle,
  textStyle,
  containerStyle,
  statusStyle,
  badgeStyle,
  testID = 'avatar',
  accessibilityLabel,
  accessible = true,
  animated = false,
  animationType = 'scale',
  animationDuration = 300,
  group = false,
  groupSpacing = -8,
  groupOverlap = 0.7,
  showEditButton = false,
  editButtonIcon = 'pencil',
  editButtonSize = 16,
  editButtonColor = colors.neutral[0],
  onEditPress,
  editButtonStyle,
  editButtonPosition = 'bottom-right',
  shadow = false,
  shadowColor = '#000',
  shadowOffset = { width: 0, height: 2 },
  shadowOpacity = 0.25,
  shadowRadius = 3.84,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Calculate size
  const getSize = () => {
    const sizeMap = {
      xs: 24,
      sm: 32,
      md: 48,
      lg: 64,
      xl: 80,
      xxl: 96,
    };

    if (typeof size === 'number') return size;
    return sizeMap[size] || sizeMap.md;
  };

  const avatarSize = getSize();
  const iconSizeCalculated = iconSize || avatarSize * 0.6;
  const borderRadius = variant === 'circle' ? avatarSize / 2 : variant === 'rounded' ? avatarSize * 0.2 : 0;

  // Get border radius style
  const getBorderRadiusStyle = () => {
    return {
      borderRadius,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
    };
  };

  // Get shadow style
  const getShadowStyle = () => {
    if (!shadow) return {};
    
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation: elevation || 4,
    };
  };

  // Get initials from text
  const getInitials = () => {
    if (!text || !showInitials) return '';
    
    const words = text.trim().split(/\s+/);
    let initials = '';
    
    for (let i = 0; i < Math.min(words.length, initialsLength); i++) {
      initials += words[i].charAt(0).toUpperCase();
    }
    
    return initials;
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'online': return colors.success;
      case 'offline': return colors.neutral[300];
      case 'away': return colors.warning;
      case 'busy': return colors.error;
      case 'invisible': return colors.neutral[500];
      default: return colors.success;
    }
  };

  // Get status size
  const getStatusSize = () => {
    return Math.min(statusSize, avatarSize * 0.3);
  };

  // Get status position
  const getStatusPosition = () => {
    const statusSize = getStatusSize();
    const offset = statusSize / 2;
    
    return {
      width: statusSize,
      height: statusSize,
      borderRadius: statusSize / 2,
      borderWidth: 2,
      borderColor: colors.neutral[0],
    };
  };

  // Get badge position
  const getBadgePosition = () => {
    const badgeSize = avatarSize * 0.4;
    const offset = badgeOffset || -badgeSize / 4;
    
    switch (badgePosition) {
      case 'top-right':
        return { top: offset, right: offset };
      case 'top-left':
        return { top: offset, left: offset };
      case 'bottom-right':
        return { bottom: offset, right: offset };
      case 'bottom-left':
        return { bottom: offset, left: offset };
      default:
        return { bottom: offset, right: offset };
    }
  };

  // Get edit button position
  const getEditButtonPosition = () => {
    const buttonSize = editButtonSize * 1.5;
    const offset = -buttonSize / 4;
    
    switch (editButtonPosition) {
      case 'top-right':
        return { top: offset, right: offset };
      case 'top-left':
        return { top: offset, left: offset };
      case 'bottom-right':
        return { bottom: offset, right: offset };
      case 'bottom-left':
        return { bottom: offset, left: offset };
      default:
        return { bottom: offset, right: offset };
    }
  };

  // Handle image load
  const handleLoadStart = () => {
    setImageLoaded(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setImageLoaded(true);
    onLoadEnd?.();
  };

  const handleError = (error: any) => {
    setImageError(true);
    onError?.(error);
  };

  // Animation
  useEffect(() => {
    if (!animated) return;

    switch (animationType) {
      case 'scale':
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: animationDuration,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: animationDuration,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;

      case 'fade':
        Animated.loop(
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.5,
              duration: animationDuration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: animationDuration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;

      case 'bounce':
        Animated.loop(
          Animated.sequence([
            Animated.spring(scaleAnim, {
              toValue: 1.2,
              friction: 1,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
    }

    return () => {
      scaleAnim.stopAnimation();
      fadeAnim.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, [animated, animationType]);

  // Render content
  const renderContent = () => {
    if (loading) {
      return loadingIndicator || (
        <View style={styles.loadingContainer}>
          <Icon name="loading" size={iconSizeCalculated} color={iconColor} />
        </View>
      );
    }

    if (source || uri) {
      if (imageError && fallback) {
        return fallback;
      }

      const imageSource = source || { uri };

      return (
        <Image
          source={imageSource}
          style={[
            styles.image,
            getBorderRadiusStyle(),
            { width: avatarSize, height: avatarSize },
            imageStyle,
          ]}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          resizeMode="cover"
        />
      );
    }

    if (icon) {
      return (
        <Icon
          name={icon as any}
          size={iconSizeCalculated}
          color={iconColor}
        />
      );
    }

    if (text && getInitials()) {
      return (
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: avatarSize * 0.4,
              fontFamily: fonts.medium.fontFamily,
            },
            textStyle,
          ]}>
          {getInitials()}
        </Text>
      );
    }

    return placeholder || (
      <Icon
        name="account"
        size={iconSizeCalculated}
        color={iconColor}
      />
    );
  };

  // Render status indicator
  const renderStatus = () => {
    if (!status) return null;

    const statusPosition = getStatusPosition();
    const statusColor = getStatusColor();

    return (
      <View
        style={[
          styles.status,
          statusPosition,
          {
            backgroundColor: (getStatusColor() as any) as string,
            borderColor: colors.neutral[0],
          },
          statusStyle,
        ]}
      />
    );
  };

  // Render badge
  const renderBadge = () => {
    if (!badge) return null;

    const badgePosition = getBadgePosition();

    return (
      <View style={[styles.badge, badgePosition, badgeStyle]}>
        {badge}
      </View>
    );
  };

  // Render edit button
  const renderEditButton = () => {
    if (!showEditButton) return null;

    const editButtonPosition = getEditButtonPosition();

    return (
      <TouchableOpacity
        style={[
          styles.editButton,
          editButtonPosition,
          {
            width: editButtonSize * 1.5,
            height: editButtonSize * 1.5,
            borderRadius: (editButtonSize * 1.5) / 2,
            backgroundColor: colors.primary[500] as any,
          },
          editButtonStyle,
        ]}
        onPress={onEditPress}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
        <Icon
          name={editButtonIcon as any}
          size={editButtonSize}
          color={editButtonColor}
        />
      </TouchableOpacity>
    );
  };

  const content = renderContent();
  const statusIndicator = renderStatus();
  const badgeComponent = renderBadge();
  const editButton = renderEditButton();

  const AvatarContent = () => (
    <Animated.View
      style={[
        styles.container,
        getBorderRadiusStyle(),
        getShadowStyle(),
        {
          width: avatarSize,
          height: avatarSize,
          backgroundColor: (backgroundColor || colors.primary[500]) as any,
          borderWidth,
          borderColor: borderColor || colors.neutral[200],
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
        style,
      ]}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || text || 'Avatar'}
      accessibilityRole={onPress ? 'button' : 'image'}>
      {content}
      {overlay && (
        <View style={[styles.overlay, getBorderRadiusStyle()]}>
          {overlay}
        </View>
      )}
      {statusIndicator}
      {badgeComponent}
      {editButton}
    </Animated.View>
  );

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
        style={containerStyle}>
        <AvatarContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      <AvatarContent />
    </View>
  );
};

// Avatar Group Component
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  spacing?: number;
  overlap?: number;
  variant?: AvatarVariant;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  remainingAvatarStyle?: ViewStyle;
  remainingTextStyle?: TextStyle;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 4,
  size = 'md',
  spacing = -8,
  overlap = 0.7,
  variant = 'circle',
  style,
  containerStyle,
  remainingAvatarStyle,
  remainingTextStyle,
}) => {
  const avatars = React.Children.toArray(children);
  const totalAvatars = avatars.length;
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = totalAvatars - max;

  const avatarSize = typeof size === 'number' ? size : 
    size === 'xs' ? 24 :
    size === 'sm' ? 32 :
    size === 'md' ? 48 :
    size === 'lg' ? 64 :
    size === 'xl' ? 80 : 96;

  return (
    <View style={[styles.groupContainer, containerStyle]}>
      {displayAvatars.map((avatar, index) => {
        const offset = index * spacing * overlap;
        
        return (
          <View
            key={index}
            style={[
              styles.groupAvatar,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: variant === 'circle' ? avatarSize / 2 : 
                            variant === 'rounded' ? avatarSize * 0.2 : 0,
                marginLeft: index === 0 ? 0 : offset,
                zIndex: displayAvatars.length - index,
              },
              style,
            ]}>
            {avatar}
          </View>
        );
      })}
      
      {remainingCount > 0 && (
        <View
          style={[
            styles.remainingAvatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: variant === 'circle' ? avatarSize / 2 : 
                          variant === 'rounded' ? avatarSize * 0.2 : 0,
              marginLeft: (displayAvatars.length - 1) * spacing * overlap,
              backgroundColor: colors.primary[500] as any,
              zIndex: 0,
            },
            remainingAvatarStyle,
          ]}>
          <Text
            style={[
              styles.remainingText,
              {
                color: colors.neutral[0],
                fontSize: avatarSize * 0.3,
              },
              remainingTextStyle,
            ]}>
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  status: {
    position: 'absolute',
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    zIndex: 10,
  },
  editButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  groupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    position: 'relative',
  },
  remainingAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingText: {
    fontFamily: fonts.medium.fontFamily,
    textAlign: 'center',
  },
});

export { AvatarGroup };
export default Avatar;