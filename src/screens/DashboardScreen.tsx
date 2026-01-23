import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import Screen from '../components/Screen';
import StatCard from '../components/StatCard';

const DashboardScreen = () => {
    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text variant="headlineMedium" style={styles.title}>Lakshmi Tracker</Text>
                </View>

                <View style={styles.statsContainer}>
                    <StatCard
                        title="Net Spending"
                        value="₹0.00"
                        style={styles.mainStat}
                    />
                    <View style={styles.row}>
                        <StatCard
                            title="Income"
                            value="₹0.00"
                            color="#388E3C"
                            style={styles.halfStat}
                        />
                        <StatCard
                            title="Expenses"
                            value="₹0.00"
                            color="#D32F2F"
                            style={styles.halfStat}
                        />
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontWeight: 'bold',
    },
    statsContainer: {
        gap: 8,
    },
    mainStat: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfStat: {
        flex: 1,
    },
});

export default DashboardScreen;
