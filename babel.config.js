module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
  ],
  plugins: [
    // Reanimated plugin has to be listed last
    'react-native-reanimated/plugin',
    
    // Import aliases for cleaner imports
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.json',
        ],
        alias: {
          // Main aliases
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@utils': './src/utils',
          '@hooks': './src/hooks',
          '@context': './src/context',
          '@models': './src/models',
          '@config': './src/config',
          '@styles': './src/styles',
          '@assets': './src/assets',
          '@locales': './src/locales',
          
          // Component specific aliases
          '@common': './src/components/common',
          '@subscription': './src/components/subscription',
          '@dashboard': './src/components/dashboard',
          '@analytics': './src/components/analytics',
          '@budget': './src/components/budget',
          
          // Service aliases
          '@api': './src/services/api',
          '@storage': './src/services/storage',
          '@notifications': './src/services/notifications',
        },
      },
    ],
    
    // Optional: Enable React Refresh in development
    process.env.NODE_ENV !== 'production' && 'react-refresh/babel',
    
    // Optional: For better debugging
    '@babel/plugin-transform-runtime',
  ].filter(Boolean),
  env: {
    production: {
      plugins: [
        // Remove console logs in production
        'transform-remove-console',
        // Optimize React Native
        'react-native-paper/babel',
      ],
    },
  },
};