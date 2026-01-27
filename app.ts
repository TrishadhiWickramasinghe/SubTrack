// App.js
import { AppProvider } from './src/context/AppContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { ThemeProvider } from './src/context/ThemeContext';

const App = () => {
  return (
    <AppProvider>
      <ThemeProvider>
        <SubscriptionProvider>
          {/* Your navigation and main app components */}
        </SubscriptionProvider>
      </ThemeProvider>
    </AppProvider>
  );
};

export default App;