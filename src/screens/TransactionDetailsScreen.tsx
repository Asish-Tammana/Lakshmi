import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, useTheme, Button, Portal, Dialog, List, RadioButton, Switch, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import Screen from '../components/Screen';
import { TransactionService } from '../services/TransactionService';
import { TransactionEngine } from '../services/TransactionEngine';
import { CategoryService } from '../services/CategoryService';
import { FriendService } from '../services/FriendService';
import Transaction from '../database/Transaction';
import Category from '../database/Category';
import Friend from '../database/Friend';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TransactionDetailsScreen = () => {
    const theme = useTheme();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { transactionId } = route.params;

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isFriend, setIsFriend] = useState(false);
    const [currentFriend, setCurrentFriend] = useState<Friend | null>(null);
    const [loading, setLoading] = useState(true);

    // Dialog state
    const [catDialogVisible, setCatDialogVisible] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [txn, cats] = await Promise.all([
                TransactionService.getTransactionById(transactionId),
                CategoryService.getAllCategories()
            ]);

            if (txn) {
                setTransaction(txn);
                const cat = cats.find(c => c.id === txn.categoryId);
                setSelectedCategory(cat || null);
                setCategoriesList(cats);

                // Check friend status
                const friend = await FriendService.findFriendByVpa(txn.merchantName);
                setIsFriend(!!friend);
                setCurrentFriend(friend || null);
            }
        } catch (error) {
            console.error('Error loading transaction details:', error);
            Alert.alert('Error', 'Failed to load transaction details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    }, [transactionId, navigation]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateCategory = async (categoryId: string) => {
        if (transaction) {
            await TransactionService.updateTransactionCategory(transaction, categoryId);
            setCatDialogVisible(false);
            loadData();
        }
    };

    const toggleFriend = async (value: boolean) => {
        if (!transaction) return;

        try {
            if (value) {
                // Add to friends
                await FriendService.addFriend(transaction.merchantName, transaction.merchantName);
                Alert.alert('Success', `${transaction.merchantName} added to friends.`);
            } else if (currentFriend) {
                // Remove from friends
                await FriendService.deleteFriend(currentFriend);
                Alert.alert('Success', `${transaction.merchantName} removed from friends.`);
            }
            loadData();
        } catch (error) {
            console.error('Error toggling friend status:', error);
            Alert.alert('Error', 'Failed to update friend status');
        }
    };

    if (loading || !transaction) {
        return (
            <Screen>
                <View style={styles.center}><Text>Loading...</Text></View>
            </Screen>
        );
    }

    const isDebit = transaction.type === 'debit';

    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Avatar.Icon
                        size={80}
                        icon={selectedCategory?.icon || (isDebit ? 'arrow-up' : 'arrow-down')}
                        style={{ backgroundColor: isDebit ? theme.colors.errorContainer : theme.colors.primaryContainer }}
                        color={isDebit ? theme.colors.error : theme.colors.primary}
                    />
                    <Text variant="headlineSmall" style={styles.merchantName}>{transaction.merchantName}</Text>
                    <Text
                        variant="displaySmall"
                        style={[styles.amount, { color: isDebit ? theme.colors.error : '#388E3C' }]}
                    >
                        {isDebit ? '-' : '+'} {TransactionEngine.formatCurrency(transaction.amount)}
                    </Text>
                    {transaction.status === 'uncategorized' && (
                        <View style={[styles.badge, { backgroundColor: theme.colors.tertiaryContainer }]}>
                            <Text style={{ color: theme.colors.onTertiaryContainer, fontSize: 10, fontWeight: 'bold' }}>UNCATEGORIZED</Text>
                        </View>
                    )}
                </View>

                <Card style={styles.detailsCard} mode="contained">
                    <Card.Content>
                        <List.Item
                            title="Date"
                            description={TransactionEngine.formatDate(transaction.date)}
                            left={props => <List.Icon {...props} icon="calendar" />}
                        />
                        <Divider />
                        <List.Item
                            title="Time"
                            description={TransactionEngine.formatTime(transaction.date)}
                            left={props => <List.Icon {...props} icon="clock-outline" />}
                        />
                        <Divider />
                        <TouchableOpacity onPress={() => setCatDialogVisible(true)}>
                            <List.Item
                                title="Category"
                                description={selectedCategory?.name || 'Uncategorized'}
                                left={props => <List.Icon {...props} icon={selectedCategory?.icon || 'help-circle'} />}
                                right={props => <List.Icon {...props} icon="chevron-right" />}
                            />
                        </TouchableOpacity>
                    </Card.Content>
                </Card>

                <Card style={styles.actionCard} mode="contained">
                    <Card.Content>
                        <View style={styles.friendRow}>
                            <View style={{ flex: 1 }}>
                                <Text variant="titleMedium">Link to Friends</Text>
                                <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                                    Add this merchant/UPI ID to your friends list.
                                </Text>
                            </View>
                            <Switch value={isFriend} onValueChange={toggleFriend} />
                        </View>
                    </Card.Content>
                </Card>

                {transaction.rawSmsBody && (
                    <Card style={styles.smsCard} mode="contained">
                        <Card.Content>
                            <Text variant="titleSmall" style={{ marginBottom: 8, opacity: 0.6 }}>Original SMS</Text>
                            <Text variant="bodyMedium" style={styles.smsText}>{transaction.rawSmsBody}</Text>
                        </Card.Content>
                    </Card>
                )}

                <Button
                    mode="outlined"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    Close
                </Button>
            </ScrollView>

            <Portal>
                <Dialog visible={catDialogVisible} onDismiss={() => setCatDialogVisible(false)}>
                    <Dialog.Title>Select Category</Dialog.Title>
                    <Dialog.ScrollArea style={{ paddingHorizontal: 0, maxHeight: 400 }}>
                        <FlatList
                            data={categoriesList}
                            keyExtractor={item => item.id}
                            renderItem={({ item }: { item: Category }) => (
                                <List.Item
                                    title={item.name}
                                    left={props => <List.Icon {...props} icon={item.icon} />}
                                    onPress={() => handleUpdateCategory(item.id)}
                                    right={() => (
                                        <RadioButton
                                            value={item.id}
                                            status={transaction.categoryId === item.id ? 'checked' : 'unchecked'}
                                            onPress={() => handleUpdateCategory(item.id)}
                                        />
                                    )}
                                />
                            )}
                        />
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button onPress={() => setCatDialogVisible(false)}>Cancel</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginVertical: 24,
    },
    merchantName: {
        fontWeight: 'bold',
        marginTop: 16,
        textAlign: 'center',
    },
    amount: {
        fontWeight: 'bold',
        marginTop: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 12,
    },
    detailsCard: {
        marginBottom: 16,
    },
    actionCard: {
        marginBottom: 16,
    },
    friendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    smsCard: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        marginBottom: 24,
    },
    smsText: {
        fontStyle: 'italic',
        opacity: 0.8,
    },
    backButton: {
        marginBottom: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default TransactionDetailsScreen;
