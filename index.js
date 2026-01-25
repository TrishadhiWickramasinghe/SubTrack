/**
 * SubTrack - Entry Point
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Error boundary setup
import * as Sentry from '@sentry/react-native';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';

// Initialize Sentry for error tracking
if (!__DEV__) {
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN_HERE',
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
    environment: __DEV__ ? 'development' : 'production',
  });
}

// Custom error handler
const errorHandler = (e, isFatal) => {
  if (__DEV__) {
    console.error('Global Error:', e, isFatal);
  } else {
    Sentry.captureException(e);
  }
  
  if (isFatal) {
    // Show error screen
    // You can show a custom error screen here
    console.log('Fatal error occurred. Please restart the app.');
  }
};

// Set global error handlers
setJSExceptionHandler(errorHandler, true);
setNativeExceptionHandler((errorString) => {
  if (!__DEV__) {
    Sentry.captureException(new Error(errorString));
  }
});

// Ignore specific warnings
LogBox.ignoreLogs([
  'Require cycle:',
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested inside plain ScrollViews',
  'Animated: `useNativeDriver` was not specified',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
  'Warning: componentWillReceiveProps',
  'Warning: componentWillMount',
  'Deprecation warning: value provided is not in a recognized RFC2822 or ISO format.',
  'new NativeEventEmitter',
  'EventEmitter.removeListener',
  'Setting a timer',
  'AsyncStorage',
  'Picker has been extracted',
  'Remote debugger',
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Warning: Failed prop type',
  'Require cycle: node_modules/victory',
]);

// Performance optimizations
if (__DEV__) {
  const { whyDidYouUpdate } = require('why-did-you-update');
  whyDidYouUpdate(React, { include: [/^App/], exclude: [/^Connect/] });
}

// Disable console logs in production
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.error = () => {};
}

// App registration
AppRegistry.registerComponent(appName, () => App);

// Handle app launch
console.log('SubTrack App Started - Version 1.0.0');