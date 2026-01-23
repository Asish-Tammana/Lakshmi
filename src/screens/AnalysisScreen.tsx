import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Screen from '../components/Screen';

const AnalysisScreen = () => {
    return (
        <Screen>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>Analysis</Text>
            </View>
            <View style={styles.container}>
                <Text>Charts and insights coming soon...</Text>
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 16,
    },
    title: {
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AnalysisScreen;
