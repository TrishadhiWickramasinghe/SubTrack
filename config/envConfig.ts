/**
 * Environment Configuration Helper
 * Provides typed access to environment variables
 */

interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  api: {
    timeout: number;
    maxRetries: number;
  };
  features: {
    offlineMode: boolean;
    realTime: boolean;
    analytics: boolean;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
}

class EnvironmentConfig {
  private static instance: EnvironmentConfig;

  private constructor() {
    this.validate();
  }

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private validate(): void {
    const required = [
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`);
    }
  }

  getConfig(): EnvironmentConfig {
    return {
      supabase: {
        url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
        anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      api: {
        timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10),
        maxRetries: parseInt(process.env.EXPO_PUBLIC_MAX_RETRIES || '3', 10),
      },
      features: {
        offlineMode: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
        realTime: process.env.EXPO_PUBLIC_ENABLE_REAL_TIME === 'true',
        analytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
      },
      app: {
        name: process.env.EXPO_PUBLIC_APP_NAME || 'SubTrack',
        version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
        environment: (process.env.EXPO_PUBLIC_ENVIRONMENT as any) || 'development',
      },
    };
  }

  get supabaseUrl(): string {
    return process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  }

  get supabaseAnonKey(): string {
    return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  }

  get supabaseServiceRoleKey(): string | undefined {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  get apiTimeout(): number {
    return parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10);
  }

  get maxRetries(): number {
    return parseInt(process.env.EXPO_PUBLIC_MAX_RETRIES || '3', 10);
  }

  get isDevelopment(): boolean {
    return process.env.EXPO_PUBLIC_ENVIRONMENT === 'development';
  }

  get isProduction(): boolean {
    return process.env.EXPO_PUBLIC_ENVIRONMENT === 'production';
  }

  get offlineModeEnabled(): boolean {
    return process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true';
  }

  get realTimeEnabled(): boolean {
    return process.env.EXPO_PUBLIC_ENABLE_REAL_TIME === 'true';
  }

  get analyticsEnabled(): boolean {
    return process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true';
  }
}

export const envConfig = EnvironmentConfig.getInstance();
