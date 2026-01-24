import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { Text, List, FAB, Dialog, Portal, TextInput, Button, useTheme, IconButton, Card, Avatar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import { FriendService } from '../services/FriendService';
import Friend from '../database/Friend';

const FriendManagementScreen = () => {
    const theme = useTheme();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [visible, setVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

    const [friendName, setFriendName] = useState('');
    const [friendVpa, setFriendVpa] = useState('');

    const fetchFriends = useCallback(async () => {
        const data = await FriendService.getAllFriends();
        setFriends(data);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchFriends();
        }, [fetchFriends])
    );

    const showAddDialog = () => {
        setIsEditing(false);
        setSelectedFriend(null);
        setFriendName('');
        setFriendVpa('');
        setVisible(true);
    };

    const showEditDialog = (friend: Friend) => {
        setIsEditing(true);
        setSelectedFriend(friend);
        setFriendName(friend.name);
        try {
            const patterns = JSON.parse(friend.vpaPatterns);
            setFriendVpa(patterns[0] || '');
        } catch (e) {
            setFriendVpa('');
        }
        setVisible(true);
    };

    const hideDialog = () => {
        setVisible(false);
        setFriendName('');
        setFriendVpa('');
    };

    const handleSaveFriend = async () => {
        if (!friendName.trim() || !friendVpa.trim()) return;

        if (isEditing && selectedFriend) {
            await FriendService.updateFriend(selectedFriend, friendName.trim(), friendVpa.trim());
        } else {
            await FriendService.addFriend(friendName.trim(), friendVpa.trim());
        }

        hideDialog();
        fetchFriends();
    };

    const handleDeleteFriend = (friend: Friend) => {
        Alert.alert(
            'Delete Friend',
            `Are you sure you want to delete "${friend.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await FriendService.deleteFriend(friend);
                        fetchFriends();
                    }
                },
            ]
        );
    };

    const renderFriend = ({ item }: { item: Friend }) => {
        let vpa = '';
        try {
            const patterns = JSON.parse(item.vpaPatterns);
            vpa = patterns[0] || '';
        } catch (e) { }

        return (
            <Card style={styles.card} mode="contained" onPress={() => showEditDialog(item)}>
                <Card.Title
                    title={item.name}
                    subtitle={vpa}
                    left={(props) => <Avatar.Text {...props} label={item.name.substring(0, 2).toUpperCase()} />}
                    right={(props) => (
                        <IconButton
                            {...props}
                            icon="delete-outline"
                            iconColor={theme.colors.error}
                            onPress={() => handleDeleteFriend(item)}
                        />
                    )}
                />
            </Card>
        );
    };

    return (
        <Screen>
            <View style={styles.headerInfo}>
                <Text variant="bodySmall" style={styles.infoText}>
                    Link UPI IDs (VPA) to names to automatically identify peer-to-peer transactions.
                </Text>
            </View>

            <FlatList
                data={friends}
                keyExtractor={item => item.id}
                renderItem={renderFriend}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <View style={styles.center}>
                        <Text variant="bodyLarge" style={styles.emptyText}>No friends added yet</Text>
                    </View>
                )}
            />

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>{isEditing ? 'Edit Friend' : 'Add Friend'}</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Name"
                            value={friendName}
                            onChangeText={setFriendName}
                            mode="outlined"
                            style={styles.input}
                            placeholder="e.g. Asish"
                        />
                        <TextInput
                            label="UPI ID / VPA Pattern"
                            value={friendVpa}
                            onChangeText={setFriendVpa}
                            mode="outlined"
                            style={styles.input}
                            placeholder="e.g. asish@okaxis"
                            autoCapitalize="none"
                        />
                        <Text variant="bodySmall" style={styles.hint}>
                            Transactions matching this UPI ID will be linked to this friend.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Cancel</Button>
                        <Button mode="contained" onPress={handleSaveFriend} disabled={!friendName.trim() || !friendVpa.trim()}>
                            Save
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <FAB
                icon="plus"
                label="Add Friend"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                onPress={showAddDialog}
            />
        </Screen>
    );
};

const styles = StyleSheet.create({
    headerInfo: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    infoText: {
        opacity: 0.6,
        textAlign: 'center',
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        marginBottom: 12,
    },
    input: {
        marginBottom: 12,
    },
    hint: {
        opacity: 0.6,
        fontSize: 12,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        opacity: 0.5,
    },
});

export default FriendManagementScreen;
