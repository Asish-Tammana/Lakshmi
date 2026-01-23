import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Switch, Text, Divider } from 'react-native-paper';
import Screen from '../components/Screen';
import { useAppTheme } from '../theme/ThemeContext';

const SettingsScreen = () => {
    const { themeMode, setThemeMode, isDark } = useAppTheme();

    return (
        <Screen>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>Settings</Text>
            </View>

            <List.Section>
                <List.Subheader>Appearance</List.Subheader>
                <List.Item
                    title="Dark Mode"
                    description={themeMode === 'system' ? 'Following system' : isDark ? 'On' : 'Off'}
                    left={props => <List.Icon {...props} icon="brightness-6" />}
                    right={() => (
                        <View style={styles.row}>
                            <Switch
                                value={isDark}
                                onValueChange={() => setThemeMode(isDark ? 'light' : 'dark')}
                            />
                        </View>
                    )}
                />
                <Divider />
                <List.Item
                    title="Use System Setting"
                    description="Match app appearance to your phone settings"
                    left={props => <List.Icon {...props} icon="cellphone-cog" />}
                    right={() => (
                        <Switch
                            value={themeMode === 'system'}
                            onValueChange={(val) => setThemeMode(val ? 'system' : isDark ? 'dark' : 'light')}
                        />
                    )}
                />
            </List.Section>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 16,
        marginBottom: 8,
    },
    title: {
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});

export default SettingsScreen;
