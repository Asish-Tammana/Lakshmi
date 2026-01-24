import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { List, Switch, Text, Divider, useTheme, Portal, Dialog, Button } from 'react-native-paper';
import Screen from '../components/Screen';
import { useAppTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { SecurityService } from '../services/SecurityService';
import { TransactionService } from '../services/TransactionService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingsScreen = () => {
    const theme = useTheme();
    const { themeMode, setThemeMode, isDark } = useAppTheme();
    const navigation = useNavigation<any>();

    const [isSecurityEnabled, setIsSecurityEnabled] = useState(false);
    const [biometricsAvailable, setBiometricsAvailable] = useState(false);
    const [resetDialogVisible, setResetDialogVisible] = useState(false);

    useEffect(() => {
        const checkSecurity = async () => {
            const enabled = await SecurityService.isSecurityEnabled();
            const available = await SecurityService.isBiometricsAvailable();
            setIsSecurityEnabled(enabled);
            setBiometricsAvailable(available);
        };
        checkSecurity();
    }, []);

    const toggleSecurity = async (value: boolean) => {
        if (value && !biometricsAvailable) {
            Alert.alert('Not Available', 'Your device does not support biometric authentication.');
            return;
        }

        if (value) {
            // Re-authenticate to enable? Or just set it. 
            // Setting it without auth is fine, but disabling should ideally check.
            const success = await SecurityService.authenticate();
            if (success) {
                await SecurityService.setSecurityEnabled(true);
                setIsSecurityEnabled(true);
            }
        } else {
            // Disabling security should definitely require authentication
            const success = await SecurityService.authenticate();
            if (success) {
                await SecurityService.setSecurityEnabled(false);
                setIsSecurityEnabled(false);
            }
        }
    };

    const handleResetData = async () => {
        try {
            await TransactionService.resetAllData();
            setResetDialogVisible(false);
            Alert.alert('Success', 'All data has been reset and default categories seeded.');
        } catch (error) {
            Alert.alert('Error', 'Failed to reset data.');
        }
    };

    return (
        <Screen>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>Settings</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Personalize your Lakshmi experience
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Appearance */}
                <List.Section>
                    <List.Subheader style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Appearance</List.Subheader>
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
                    <List.Item
                        title="Use System Setting"
                        description="Match app appearance to phone settings"
                        left={props => <List.Icon {...props} icon="cellphone-cog" />}
                        right={() => (
                            <Switch
                                value={themeMode === 'system'}
                                onValueChange={(val) => setThemeMode(val ? 'system' : isDark ? 'dark' : 'light')}
                            />
                        )}
                    />
                </List.Section>

                <Divider style={styles.divider} />

                {/* Security */}
                <List.Section>
                    <List.Subheader style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Security</List.Subheader>
                    <List.Item
                        title="App Lock"
                        description={biometricsAvailable ? 'Secure with Biometrics' : 'Not available on this device'}
                        left={props => <List.Icon {...props} icon="shield-lock" />}
                        right={() => (
                            <Switch
                                disabled={!biometricsAvailable}
                                value={isSecurityEnabled}
                                onValueChange={toggleSecurity}
                            />
                        )}
                    />
                </List.Section>

                <Divider style={styles.divider} />

                {/* Data Management */}
                <List.Section>
                    <List.Subheader style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Data Management</List.Subheader>
                    <List.Item
                        title="Manage Categories"
                        description="Add, edit or reorganize categories"
                        left={props => <List.Icon {...props} icon="tag-multiple" />}
                        onPress={() => navigation.navigate('CategoryManagement')}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                    />
                    <List.Item
                        title="Manage Friends"
                        description="Link UPI IDs to names"
                        left={props => <List.Icon {...props} icon="account-multiple-plus" />}
                        onPress={() => navigation.navigate('FriendManagement')}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                    />
                </List.Section>

                <Divider style={styles.divider} />

                {/* Danger Zone */}
                <List.Section>
                    <List.Subheader style={{ color: theme.colors.error, fontWeight: 'bold' }}>Danger Zone</List.Subheader>
                    <List.Item
                        title="Reset All Data"
                        titleStyle={{ color: theme.colors.error }}
                        description="Wipe everything and restore defaults"
                        left={props => <List.Icon {...props} icon="delete-forever" color={theme.colors.error} />}
                        onPress={() => setResetDialogVisible(true)}
                    />
                </List.Section>

                <View style={styles.footer}>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Lakshmi v1.0.0</Text>
                </View>
            </ScrollView>

            {/* Reset Confirmation Dialog */}
            <Portal>
                <Dialog visible={resetDialogVisible} onDismiss={() => setResetDialogVisible(false)}>
                    <Dialog.Icon icon="alert-triangle" color={theme.colors.error} />
                    <Dialog.Title style={{ textAlign: 'center' }}>Reset all data?</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            This will permanently delete all transactions, friend mappings, and custom category links. Default categories will be re-seeded. This action cannot be undone.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setResetDialogVisible(false)}>Cancel</Button>
                        <Button
                            mode="contained"
                            buttonColor={theme.colors.error}
                            onPress={handleResetData}
                        >
                            Reset Everything
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    divider: {
        marginHorizontal: 16,
        opacity: 0.5,
    },
    footer: {
        alignItems: 'center',
        marginTop: 24,
    }
});

export default SettingsScreen;
