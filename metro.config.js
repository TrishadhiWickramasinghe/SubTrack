const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration for SubTrack with all features
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    minifierConfig: {
      keep_classnames: true,
      keep_fnames: true,
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    },
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg' && ext !== 'lottie'),
    sourceExts: [...sourceExts, 'svg', 'cjs', 'lottie'],
    resolverMainFields: ['react-native', 'browser', 'main'],
    extraNodeModules: {
      // Core aliases
      '@': `${__dirname}/src`,
      '@app': `${__dirname}/src`,
      
      // Components
      '@components': `${__dirname}/src/components`,
      '@common': `${__dirname}/src/components/common`,
      '@subscription': `${__dirname}/src/components/subscription`,
      '@dashboard': `${__dirname}/src/components/dashboard`,
      '@analytics': `${__dirname}/src/components/analytics`,
      '@budget': `${__dirname}/src/components/budget`,
      '@trial': `${__dirname}/src/components/trial`,
      '@splitting': `${__dirname}/src/components/splitting`,
      '@marketplace': `${__dirname}/src/components/marketplace`,
      '@scanner': `${__dirname}/src/components/scanner`,
      '@gamification': `${__dirname}/src/components/gamification`,
      '@forms': `${__dirname}/src/components/forms`,
      '@settings': `${__dirname}/src/components/settings`,
      
      // Screens
      '@screens': `${__dirname}/src/screens`,
      '@auth': `${__dirname}/src/screens/auth`,
      '@main': `${__dirname}/src/screens/main`,
      '@subscription-screens': `${__dirname}/src/screens/subscription`,
      '@trial-screens': `${__dirname}/src/screens/trial`,
      '@splitting-screens': `${__dirname}/src/screens/splitting`,
      '@marketplace-screens': `${__dirname}/src/screens/marketplace`,
      '@scanner-screens': `${__dirname}/src/screens/scanner`,
      '@reports': `${__dirname}/src/screens/reports`,
      '@profile': `${__dirname}/src/screens/profile`,
      '@misc': `${__dirname}/src/screens/misc`,
      
      // Services
      '@services': `${__dirname}/src/services`,
      '@api': `${__dirname}/src/services/api`,
      '@storage': `${__dirname}/src/services/storage`,
      '@notifications': `${__dirname}/src/services/notifications`,
      '@analytics-service': `${__dirname}/src/services/analytics`,
      '@scanner-service': `${__dirname}/src/services/scanner`,
      '@security': `${__dirname}/src/services/security`,
      '@backup': `${__dirname}/src/services/backup`,
      '@gamification-service': `${__dirname}/src/services/gamification`,
      '@ai': `${__dirname}/src/services/ai`,
      
      // Utils & Hooks
      '@utils': `${__dirname}/src/utils`,
      '@hooks': `${__dirname}/src/hooks`,
      '@context': `${__dirname}/src/context`,
      '@models': `${__dirname}/src/models`,
      '@config': `${__dirname}/src/config`,
      '@styles': `${__dirname}/src/styles`,
      '@assets': `${__dirname}/src/assets`,
      '@locales': `${__dirname}/src/locales`,
      
      // Navigation
      '@navigation': `${__dirname}/src/navigation`,
    },
    nodeModulesPaths: [
      `${__dirname}/node_modules`,
      `${__dirname}/../node_modules`,
    ],
  },
  watchFolders: [
    __dirname,
    `${__dirname}/src`,
    `${__dirname}/../node_modules`,
  ],
  maxWorkers: 4,
  resetCache: false,
  cacheVersion: '1.0',
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    assetPlugins: ['react-native-svg-asset-plugin'],
  },
  serializer: {
    createModuleIdFactory: () => {
      return (path) => {
        // Create stable module IDs
        const projectRootPath = __dirname;
        let moduleId = path.substr(projectRootPath.length + 1);
        return moduleId;
      };
    },
  },
};

// Apply Reanimated config
const reanimatedConfig = wrapWithReanimatedMetroConfig(config);

module.exports = mergeConfig(defaultConfig, reanimatedConfig);