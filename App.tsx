import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import { CategoryService } from './src/services/CategoryService';
import { NotificationService } from './src/services/NotificationService';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';

const AppContent = () => {
  const { theme } = useAppTheme();

  React.useEffect(() => {
    CategoryService.seedDefaultCategories();
    NotificationService.scheduleDailyReminder();
  }, []);

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
