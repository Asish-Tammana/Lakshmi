import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface LockScreenProps {
    onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                    <MaterialCommunityIcons name="lock-outline" size={80} color={theme.colors.primary} />
                </View>
                <Text variant="headlineMedium" style={styles.title}>Lakshmi is Locked</Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    Please authenticate to view your transactions
                </Text>
            </View>
            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={onUnlock}
                    style={styles.button}
                    icon="fingerprint"
                >
                    Unlock App
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        opacity: 0.7,
        paddingHorizontal: 32,
    },
    footer: {
        marginBottom: 48,
    },
    button: {
        paddingVertical: 8,
        borderRadius: 12,
    },
});

export default LockScreen;
