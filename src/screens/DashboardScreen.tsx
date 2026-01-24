import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Text, Divider, useTheme, Card, Avatar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import StatCard from '../components/StatCard';
import { TransactionService } from '../services/TransactionService';
import { TransactionEngine } from '../services/TransactionEngine';
import Transaction from '../database/Transaction';

const DashboardScreen = () => {
    const theme = useTheme();
    const [stats, setStats] = useState({ income: 0, expenses: 0, net: 0 });
    const [todayStats, setTodayStats] = useState({ income: 0, expenses: 0, net: 0 });
    const [todayTransactions, setTodayTransactions] = useState<Transaction[]>([]);

    const fetchData = useCallback(async () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const endOfMonth = now.getTime();

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [monthStats, dayStats, todayTxns] = await Promise.all([
            TransactionService.getStats(startOfMonth, endOfMonth),
            TransactionService.getStats(startOfDay.getTime(), endOfMonth),
            TransactionService.getTodayTransactions()
        ]);

        setStats(monthStats);
        setTodayStats(dayStats);
        setTodayTransactions(todayTxns);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const renderTransaction = ({ item }: { item: Transaction }) => {
        const isDebit = item.type === 'debit';
        return (
            <Card style={styles.transactionCard} mode="contained">
                <Card.Title
                    title={item.merchantName}
                    subtitle={new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    left={(props) => (
                        <Avatar.Icon
                            {...props}
                            icon={isDebit ? 'arrow-up' : 'arrow-down'}
                            style={{ backgroundColor: isDebit ? theme.colors.errorContainer : theme.colors.primaryContainer }}
                            color={isDebit ? theme.colors.error : theme.colors.primary}
                        />
                    )}
                    right={() => (
                        <Text
                            style={[
                                styles.amount,
                                { color: isDebit ? theme.colors.error : theme.colors.primary }
                            ]}
                        >
                            {isDebit ? '-' : '+'} {TransactionEngine.formatCurrency(item.amount)}
                        </Text>
                    )}
                />
            </Card>
        );
    };

    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text variant="headlineMedium" style={styles.title}>Lakshmi Dashboard</Text>
                </View>

                {/* Row 1: Final Net spent of this month */}
                <View style={styles.statsSection}>
                    <StatCard
                        title="Net Spent (This Month)"
                        value={TransactionEngine.formatCurrency(stats.net)}
                        style={styles.mainStat}
                        color={theme.colors.primary}
                    />
                </View>

                {/* Row 2: Monthly Reversals & Spend */}
                <View style={styles.statsSection}>
                    <Text variant="titleSmall" style={styles.sectionLabel}>Month Summary</Text>
                    <View style={styles.row}>
                        <StatCard
                            title="Total Reversals"
                            value={TransactionEngine.formatCurrency(stats.income)}
                            color="#388E3C"
                            style={styles.halfStat}
                        />
                        <StatCard
                            title="Total Spend"
                            value={TransactionEngine.formatCurrency(stats.expenses)}
                            color="#D32F2F"
                            style={styles.halfStat}
                        />
                    </View>
                </View>

                {/* Row 3: Today's Reversals & Spend */}
                <View style={styles.statsSection}>
                    <Text variant="titleSmall" style={styles.sectionLabel}>Today's Summary</Text>
                    <View style={styles.row}>
                        <StatCard
                            title="Today's Reversals"
                            value={TransactionEngine.formatCurrency(todayStats.income)}
                            color="#2E7D32"
                            style={styles.halfStat}
                        />
                        <StatCard
                            title="Today's Spend"
                            value={TransactionEngine.formatCurrency(todayStats.expenses)}
                            color="#C62828"
                            style={styles.halfStat}
                        />
                    </View>
                </View>

                {/* Row 4: Today's activity list */}
                <View style={styles.listSection}>
                    <Text variant="titleMedium" style={styles.sectionLabel}>Today's Activity</Text>
                    {todayTransactions.length > 0 ? (
                        todayTransactions.map(item => (
                            <View key={item.id}>
                                {renderTransaction({ item })}
                            </View>
                        ))
                    ) : (
                        <Card style={styles.emptyCard} mode="contained">
                            <Card.Content>
                                <Text variant="bodyMedium" style={styles.emptyText}>No transactions recorded today</Text>
                            </Card.Content>
                        </Card>
                    )}
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
        marginBottom: 16,
    },
    title: {
        fontWeight: 'bold',
    },
    statsSection: {
        marginBottom: 12,
    },
    mainStat: {
        width: '100%',
    },
    sectionLabel: {
        marginBottom: 6,
        opacity: 0.6,
        fontWeight: '600',
        textTransform: 'uppercase',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    halfStat: {
        flex: 1,
    },
    listSection: {
        marginTop: 8,
    },
    transactionCard: {
        marginBottom: 8,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 16,
    },
    emptyCard: {
        padding: 16,
        alignItems: 'center',
    },
    emptyText: {
        opacity: 0.5,
    }
});

export default DashboardScreen;
