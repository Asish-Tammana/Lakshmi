import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, Card, Avatar, useTheme, ActivityIndicator, Portal, Dialog, List, RadioButton, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import { TransactionService } from '../services/TransactionService';
import { TransactionEngine } from '../services/TransactionEngine';
import { CategoryService } from '../services/CategoryService';
import Transaction from '../database/Transaction';
import Category from '../database/Category';

const TransactionsScreen = () => {
    const theme = useTheme();

    // Core State
    const [searchQuery, setSearchQuery] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Record<string, Category>>({});
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    const [uiState, setUiState] = useState({
        loading: true,
        refreshing: false,
        categorizeVisible: false,
    });
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

    const fetchData = useCallback(async () => {
        setUiState(prev => ({ ...prev, loading: true }));
        try {
            const [txns, cats] = await Promise.all([
                TransactionService.getRecentTransactions(30),
                CategoryService.getAllCategories()
            ]);

            const catMap = cats.reduce((acc, cat) => {
                acc[cat.id] = cat;
                return acc;
            }, {} as Record<string, Category>);

            setTransactions(txns);
            setCategories(catMap);
            setCategoriesList(cats);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setUiState(prev => ({ ...prev, loading: false, refreshing: false }));
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const filteredTransactions = useMemo(() => {
        if (!searchQuery.trim()) return transactions;

        const query = searchQuery.toLowerCase();
        return transactions.filter(t =>
            t.merchantName.toLowerCase().includes(query) ||
            (t.rawSmsBody && t.rawSmsBody.toLowerCase().includes(query)) ||
            (categories[t.categoryId]?.name.toLowerCase().includes(query))
        );
    }, [searchQuery, transactions, categories]);

    const onRefresh = useCallback(() => {
        setUiState(prev => ({ ...prev, refreshing: true }));
        fetchData();
    }, [fetchData]);

    const handleUpdateCategory = async (categoryId: string) => {
        if (selectedTxn) {
            await TransactionService.updateTransactionCategory(selectedTxn, categoryId);
            setUiState(prev => ({ ...prev, categorizeVisible: false }));
            setSelectedTxn(null);
            fetchData();
        }
    };

    const renderTransaction = ({ item }: { item: Transaction }) => {
        const isDebit = item.type === 'debit';
        const isTransfer = item.type === 'transfer';
        const category = categories[item.categoryId];
        const color = isDebit ? theme.colors.error : (item.type === 'credit' ? '#388E3C' : theme.colors.primary);

        return (
            <Card
                style={styles.card}
                mode="contained"
                onPress={() => {
                    setSelectedTxn(item);
                    setUiState(prev => ({ ...prev, categorizeVisible: true }));
                }}
            >
                <Card.Title
                    title={item.merchantName}
                    subtitle={`${new Date(item.date).toLocaleDateString()} • ${category?.name || 'Uncategorized'}`}
                    left={(props) => (
                        <Avatar.Icon
                            {...props}
                            icon={category?.icon || (isDebit ? 'arrow-up' : 'arrow-down')}
                            style={{ backgroundColor: isDebit ? theme.colors.errorContainer : theme.colors.primaryContainer }}
                            color={color}
                        />
                    )}
                    right={() => (
                        <View style={styles.amountContainer}>
                            <Text style={[styles.amount, { color }]}>
                                {isDebit ? '-' : isTransfer ? '' : '+'} {TransactionEngine.formatCurrency(item.amount)}
                            </Text>
                            <Text variant="labelSmall" style={styles.tapToEdit}>Tap to categorize</Text>
                        </View>
                    )}
                />
            </Card>
        );
    };

    return (
        <Screen>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>Recent Activity</Text>
                <Text variant="bodySmall" style={styles.subtitle}>Past 30 days • Tap to edit category</Text>
            </View>

            <Searchbar
                placeholder="Search merchants, categories..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                mode="view"
            />

            {uiState.loading && !uiState.refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <FlatList
                    data={filteredTransactions}
                    keyExtractor={item => item.id}
                    renderItem={renderTransaction}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={uiState.refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.center}>
                            <Text variant="bodyLarge" style={styles.emptyText}>
                                {searchQuery ? 'No matching transactions' : 'No transactions in the last 30 days'}
                            </Text>
                        </View>
                    )}
                />
            )}

            <Portal>
                <Dialog
                    visible={uiState.categorizeVisible}
                    onDismiss={() => setUiState(prev => ({ ...prev, categorizeVisible: false }))}
                >
                    <Dialog.Title>Update Category</Dialog.Title>
                    <Dialog.ScrollArea style={styles.dialogScrollArea}>
                        <FlatList
                            data={categoriesList}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <List.Item
                                    title={item.name}
                                    left={props => <List.Icon {...props} icon={item.icon} />}
                                    right={() => (
                                        <RadioButton
                                            value={item.id}
                                            status={selectedTxn?.categoryId === item.id ? 'checked' : 'unchecked'}
                                            onPress={() => handleUpdateCategory(item.id)}
                                        />
                                    )}
                                    onPress={() => handleUpdateCategory(item.id)}
                                />
                            )}
                        />
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button onPress={() => setUiState(prev => ({ ...prev, categorizeVisible: false }))}>Cancel</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: { padding: 16, paddingBottom: 8 },
    title: { fontWeight: 'bold' },
    subtitle: { opacity: 0.6 },
    searchBar: { margin: 16, marginBottom: 8, elevation: 0, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 12 },
    list: { padding: 16, paddingTop: 8, paddingBottom: 80 },
    card: { marginBottom: 12 },
    amountContainer: { alignItems: 'flex-end', marginRight: 16 },
    amount: { fontWeight: 'bold', fontSize: 16 },
    tapToEdit: { opacity: 0.4, fontSize: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { opacity: 0.5 },
    dialogScrollArea: { paddingHorizontal: 0, maxHeight: 400 },
});

export default TransactionsScreen;
