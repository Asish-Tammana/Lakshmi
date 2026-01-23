import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const Colors = {
    primary: '#2E7D32', // Deep Green
    secondary: '#FFD700', // Gold
    expense: '#D32F2F', // Red
    income: '#388E3C', // Green
    backgroundLight: '#FFFFFF',
    backgroundDark: '#121212',
    surfaceLight: '#F5F5F5',
    surfaceDark: '#1E1E1E',
};

export const AppLightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: Colors.primary,
        secondary: Colors.secondary,
        error: Colors.expense,
    },
};

export const AppDarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: Colors.primary,
        secondary: Colors.secondary,
        error: Colors.expense,
        background: Colors.backgroundDark,
        surface: Colors.surfaceDark,
    },
};
