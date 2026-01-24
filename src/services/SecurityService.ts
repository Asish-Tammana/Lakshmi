import ReactNativeBiometrics from 'react-native-biometrics';
import { Alert } from 'react-native';

const rnBiometrics = new ReactNativeBiometrics();
const SECURITY_PREF_KEY = '@lakshmi_security_enabled';

// Helper to safely get AsyncStorage without crashing at import time
const getAsyncStorage = () => {
    try {
        return require('@react-native-async-storage/async-storage').default;
    } catch (e) {
        return null;
    }
};

export const SecurityService = {
    async isBiometricsAvailable(): Promise<boolean> {
        try {
            const { available } = await rnBiometrics.isSensorAvailable();
            return available;
        } catch (error) {
            console.error('Error checking biometrics availability:', error);
            return false;
        }
    },

    async isSecurityEnabled(): Promise<boolean> {
        try {
            const Storage = getAsyncStorage();
            if (!Storage) return await this.isBiometricsAvailable();

            const value = await Storage.getItem(SECURITY_PREF_KEY);
            // Default to true if biometrics are available
            if (value === null) {
                return await this.isBiometricsAvailable();
            }
            return value === 'true';
        } catch (error) {
            return false;
        }
    },

    async setSecurityEnabled(enabled: boolean): Promise<void> {
        try {
            const Storage = getAsyncStorage();
            if (!Storage) return;
            await Storage.setItem(SECURITY_PREF_KEY, enabled.toString());
        } catch (error) {
            console.error('Error saving security preference:', error);
        }
    },

    async authenticate(): Promise<boolean> {
        try {
            const { available } = await rnBiometrics.isSensorAvailable();

            if (!available) {
                console.warn('Biometric sensor not available');
                return true;
            }

            const { success } = await rnBiometrics.simplePrompt({
                promptMessage: 'Authenticate to access Lakshmi',
                cancelButtonText: 'Cancel',
            });

            return success;
        } catch (error) {
            console.error('Biometric authentication error:', error);
            Alert.alert('Error', 'Authentication failed. Please try again.');
            return false;
        }
    }
};
