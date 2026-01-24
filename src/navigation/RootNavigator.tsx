import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../theme/ThemeContext';

import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CategoryManagementScreen from '../screens/CategoryManagementScreen';
import FriendManagementScreen from '../screens/FriendManagementScreen';
import TransactionDetailsScreen from '../screens/TransactionDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
    const { theme } = useAppTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }: any) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }: any) => {
                    let iconName = 'help-circle';

                    if (route.name === 'Dashboard') iconName = 'view-dashboard';
                    else if (route.name === 'Transactions') iconName = 'format-list-bulleted';
                    else if (route.name === 'Analysis') iconName = 'chart-pie';
                    else if (route.name === 'Settings') iconName = 'cog';

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.outline,
                tabBarStyle: {
                    backgroundColor: theme.colors.elevation.level2,
                    borderTopColor: theme.colors.outlineVariant,
                    borderTopWidth: 1,
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Transactions" component={TransactionsScreen} />
            <Tab.Screen name="Analysis" component={AnalysisScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

const RootNavigator = () => {
    const { theme, isDark } = useAppTheme();

    // Map Paper theme to React Navigation theme
    const baseTheme = isDark ? DarkTheme : DefaultTheme;
    const navTheme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.elevation.level2,
            text: theme.colors.onSurface,
            border: theme.colors.outlineVariant,
            notification: theme.colors.error,
        },
    };

    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen
                    name="CategoryManagement"
                    component={CategoryManagementScreen}
                    options={{
                        headerShown: true,
                        title: 'Manage Categories'
                    }}
                />
                <Stack.Screen
                    name="FriendManagement"
                    component={FriendManagementScreen}
                    options={{
                        headerShown: true,
                        title: 'Manage Friends'
                    }}
                />
                <Stack.Screen
                    name="TransactionDetails"
                    component={TransactionDetailsScreen}
                    options={{
                        headerShown: true,
                        title: 'Transaction Details'
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
