import React from 'react';
import { LogBox, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

LogBox.ignoreAllLogs(); // Ignore all log notifications
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import { CategoryService } from './src/services/CategoryService';
import { NotificationService } from './src/services/NotificationService';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { SecurityService } from './src/services/SecurityService';
import LockScreen from './src/components/LockScreen';

const AppContent = () => {
  const { theme } = useAppTheme();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleUnlock = async () => {
    const success = await SecurityService.authenticate();
    if (success) {
      setIsAuthenticated(true);
    }
  };

  React.useEffect(() => {
    const initApp = async () => {
      // Check permissions
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        ]);
      }

      // Seed data
      await CategoryService.seedDefaultCategories();
      await NotificationService.scheduleDailyReminder();

      // Trigger biometrics automatically if enabled and available
      const enabled = await SecurityService.isSecurityEnabled();
      if (enabled) {
        const available = await SecurityService.isBiometricsAvailable();
        if (available) {
          const success = await SecurityService.authenticate();
          if (success) {
            setIsAuthenticated(true);
          }
        } else {
          // If enabled but hardware missing, we let them in for now
          // (User might have disabled sensor or similar)
          setIsAuthenticated(true);
        }
      } else {
        // Security is explicitly disabled
        setIsAuthenticated(true);
      }
    };

    initApp();
  }, []);

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <LockScreen onUnlock={handleUnlock} />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <RootNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
