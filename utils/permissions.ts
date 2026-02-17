import { PermissionsAndroid, Platform } from 'react-native';

// Mock react-native-permissions (optional dependency)
// import { check, request, PERMISSIONS, RESULTS, PermissionStatus } from 'react-native-permissions';

type Permission = string;
type Rationale = { title: string; message: string; buttonPositive?: string; buttonNegative?: string; buttonNeutral?: string };
type PermissionStatus = string;

const PERMISSIONS = {
  IOS: {
    NOTIFICATIONS: 'ios.permission.NOTIFICATIONS',
    CAMERA: 'ios.permission.CAMERA',
    PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    FACE_ID: 'ios.permission.FACE_ID',
    CALENDARS: 'ios.permission.CALENDARS',
    CONTACTS: 'ios.permission.CONTACTS',
    LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
  },
  ANDROID: {
    CAMERA: 'android.permission.CAMERA',
    READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    USE_BIOMETRIC: 'android.permission.USE_BIOMETRIC',
    READ_CALENDAR: 'android.permission.READ_CALENDAR',
    READ_CONTACTS: 'android.permission.READ_CONTACTS',
    ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
  },
};

const RESULTS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  BLOCKED: 'blocked',
  UNAVAILABLE: 'unavailable',
};

// Mock notifee (optional dependency)
// import notifee from '@notifee/react-native';
const notifee = {
  getNotificationSettings: async () => ({ authorizationStatus: 0 }),
  requestPermission: async () => ({ authorizationStatus: 0 }),
  openNotificationSettings: async () => {},
};

// Mock functions
const check = async (_permission: string): Promise<PermissionStatus> => RESULTS.UNAVAILABLE;
const request = async (_permission: string): Promise<PermissionStatus> => RESULTS.UNAVAILABLE;

export type PermissionType = 
  | 'notifications'
  | 'camera'
  | 'photos'
  | 'storage'
  | 'biometric'
  | 'calendar'
  | 'contacts'
  | 'location';

export interface PermissionResult {
  granted: boolean;
  status: PermissionStatus;
  error?: string;
}

export interface PermissionCheck {
  type: PermissionType;
  status: PermissionStatus;
  granted: boolean;
  rationale?: string;
  error?: string;
}

class PermissionService {
  private static instance: PermissionService;
  private permissionStatus: Map<PermissionType, PermissionStatus> = new Map();
  private permissionCallbacks: Map<PermissionType, Array<(status: PermissionStatus) => void>> = new Map();

  private constructor() {}

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Get platform-specific permission
   */
  private getPlatformPermission(type: PermissionType): Permission | string | null {
    if (Platform.OS === 'ios') {
      switch (type) {
        case 'notifications':
          return PERMISSIONS.IOS.NOTIFICATIONS;
        case 'camera':
          return PERMISSIONS.IOS.CAMERA;
        case 'photos':
          return PERMISSIONS.IOS.PHOTO_LIBRARY;
        case 'biometric':
          return PERMISSIONS.IOS.FACE_ID;
        case 'calendar':
          return PERMISSIONS.IOS.CALENDARS;
        case 'contacts':
          return PERMISSIONS.IOS.CONTACTS;
        case 'location':
          return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
        default:
          return null;
      }
    } else {
      switch (type) {
        case 'camera':
          return PERMISSIONS.ANDROID.CAMERA;
        case 'photos':
        case 'storage':
          return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        case 'biometric':
          return PERMISSIONS.ANDROID.USE_BIOMETRIC;
        case 'calendar':
          return PERMISSIONS.ANDROID.READ_CALENDAR;
        case 'contacts':
          return PERMISSIONS.ANDROID.READ_CONTACTS;
        case 'location':
          return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        case 'notifications':
          return 'android.permission.POST_NOTIFICATIONS'; // Android 13+
        default:
          return null;
      }
    }
  }

  /**
   * Check permission status
   */
  async checkPermission(type: PermissionType): Promise<PermissionCheck> {
    try {
      let status: PermissionStatus = RESULTS.UNAVAILABLE;

      // Special handling for notifications
      if (type === 'notifications') {
        const settings = await notifee.getNotificationSettings();
        status = settings.authorizationStatus >= 1 ? RESULTS.GRANTED : RESULTS.DENIED;
      } else {
        const permission = this.getPlatformPermission(type);
        if (permission) {
          status = await check(permission as any);
        }
      }

      // Cache status
      this.permissionStatus.set(type, status);

      // Get rationale
      const rationale = this.getPermissionRationale(type);

      return {
        type,
        status,
        granted: status === RESULTS.GRANTED,
        rationale,
      };
    } catch (error) {
      console.error(`Failed to check permission ${type}:`, error);
      return {
        type,
        status: RESULTS.UNAVAILABLE,
        granted: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Request permission
   */
  async requestPermission(
    type: PermissionType,
    rationale?: Rationale
  ): Promise<PermissionResult> {
    try {
      let status: PermissionStatus = RESULTS.UNAVAILABLE;

      // Special handling for notifications
      if (type === 'notifications') {
        const settings = await notifee.requestPermission();
        status = settings.authorizationStatus >= 1 ? RESULTS.GRANTED : RESULTS.DENIED;
      } else {
        const permission = this.getPlatformPermission(type);
        if (permission) {
          if (Platform.OS === 'android' && rationale) {
            status = await (PermissionsAndroid.request as any)(permission, rationale);
          } else {
            status = await request(permission as any);
          }
        }
      }

      // Update cache
      this.permissionStatus.set(type, status);

      // Notify callbacks
      const callbacks = this.permissionCallbacks.get(type) || [];
      callbacks.forEach(callback => callback(status));

      return {
        granted: status === RESULTS.GRANTED,
        status,
      };
    } catch (error) {
      console.error(`Failed to request permission ${type}:`, error);
      return {
        granted: false,
        status: RESULTS.UNAVAILABLE,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Request multiple permissions
   */
  async requestPermissions(
    types: PermissionType[],
    rationale?: Rationale
  ): Promise<Record<PermissionType, PermissionResult>> {
    const results: Record<PermissionType, PermissionResult> = {} as any;

    for (const type of types) {
      results[type] = await this.requestPermission(type, rationale);
    }

    return results;
  }

  /**
   * Check multiple permissions
   */
  async checkPermissions(types: PermissionType[]): Promise<Record<PermissionType, PermissionCheck>> {
    const results: Record<PermissionType, PermissionCheck> = {} as any;

    for (const type of types) {
      results[type] = await this.checkPermission(type);
    }

    return results;
  }

  /**
   * Check if all permissions are granted
   */
  async areAllGranted(types: PermissionType[]): Promise<boolean> {
    const checks = await this.checkPermissions(types);
    return Object.values(checks).every(check => check.granted);
  }

  /**
   * Check if any permission is granted
   */
  async isAnyGranted(types: PermissionType[]): Promise<boolean> {
    const checks = await this.checkPermissions(types);
    return Object.values(checks).some(check => check.granted);
  }

  /**
   * Open app settings
   */
  async openSettings(): Promise<boolean> {
    try {
      await notifee.openNotificationSettings();
      return true;
    } catch (error) {
      console.error('Failed to open settings:', error);
      return false;
    }
  }

  /**
   * Subscribe to permission changes
   */
  subscribeToPermission(
    type: PermissionType,
    callback: (status: PermissionStatus) => void
  ): () => void {
    if (!this.permissionCallbacks.has(type)) {
      this.permissionCallbacks.set(type, []);
    }

    this.permissionCallbacks.get(type)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.permissionCallbacks.get(type) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get permission rationale
   */
  private getPermissionRationale(type: PermissionType): string {
    const rationales: Record<PermissionType, string> = {
      notifications: 'We need notification permission to remind you about upcoming payments, trial endings, and budget alerts.',
      camera: 'We need camera access to scan receipts and subscription documents.',
      photos: 'We need photo access to attach receipt images to your subscription payments.',
      storage: 'We need storage access to save exported reports and backup your data.',
      biometric: 'We need biometric access to securely authenticate you and protect your financial data.',
      calendar: 'We need calendar access to sync your payment due dates with your calendar.',
      contacts: 'We need contacts access to share subscriptions with family members for bill splitting.',
      location: 'We need location access to provide region-specific subscription recommendations.',
    };

    return rationales[type] || 'This permission is required for app functionality.';
  }

  /**
   * Get permission status description
   */
  getStatusDescription(status: PermissionStatus): string {
    switch (status) {
      case RESULTS.GRANTED:
        return 'Permission granted';
      case RESULTS.DENIED:
        return 'Permission denied';
      case RESULTS.BLOCKED:
        return 'Permission permanently denied - please enable in settings';
      case RESULTS.UNAVAILABLE:
        return 'Permission not available on this device';
      default:
        return 'Unknown status';
    }
  }

  /**
   * Check if we should show rationale
   */
  async shouldShowRationale(type: PermissionType): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    const permission = this.getPlatformPermission(type);
    if (!permission || typeof permission !== 'string') return false;

    try {
      // Try to call the method if available
      if ((PermissionsAndroid as any).shouldShowRequestPermissionRationale) {
        return await (PermissionsAndroid as any).shouldShowRequestPermissionRationale(permission);
      }
      // Fallback: assume we should show rationale
      return true;
    } catch (error) {
      console.error('Failed to check rationale:', error);
      return true; // Default to true for safety
    }
  }

  /**
   * Get all permission statuses
   */
  async getAllPermissionStatuses(): Promise<Record<PermissionType, PermissionCheck>> {
    const allTypes: PermissionType[] = [
      'notifications',
      'camera',
      'photos',
      'storage',
      'biometric',
      'calendar',
      'contacts',
      'location',
    ];

    return this.checkPermissions(allTypes);
  }

  /**
   * Reset permission status cache
   */
  resetCache(): void {
    this.permissionStatus.clear();
  }
}

export const permissionService = PermissionService.getInstance();
export default permissionService;