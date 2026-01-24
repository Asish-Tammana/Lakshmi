import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, List, FAB, Dialog, Portal, TextInput, Button, useTheme, IconButton, Card, Avatar } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Screen from '../components/Screen';
import { CategoryService } from '../services/CategoryService';
import Category from '../database/Category';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// A curated list of common icons for budgeting/expenses
const ICON_OPTIONS = [
    'tag', 'cart', 'food', 'basket', 'train', 'bus', 'gas-station', 'medical-bag',
    'flash', 'water', 'cellphone-cog', 'home', 'account-group', 'badminton', 'dumbbell',
    'movie', 'gamepad-variant', 'book-open-variant', 'cash', 'bank', 'credit-card',
    'gift', 'heart', 'star', 'dots-horizontal'
];

const CategoryManagementScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [visible, setVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('tag');

    const fetchCategories = useCallback(async () => {
        const data = await CategoryService.getAllCategories();
        setCategories(data);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [fetchCategories])
    );

    const showDialog = () => setVisible(true);
    const hideDialog = () => {
        setVisible(false);
        setNewCategoryName('');
        setSelectedIcon('tag');
    };

    const handleAddCategory = async () => {
        if (newCategoryName.trim()) {
            await CategoryService.addCategory(newCategoryName.trim(), selectedIcon);
            hideDialog();
            fetchCategories();
        }
    };

    const handleDeleteCategory = (category: Category) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${category.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await CategoryService.deleteCategory(category);
                        fetchCategories();
                    }
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: Category }) => (
        <List.Item
            title={item.name}
            description={item.isExpense ? 'Expense' : 'Income'}
            left={props => <List.Icon {...props} icon={item.icon} />}
            right={props => (
                <View style={styles.rightActions}>
                    {item.isDefault ? (
                        <Text style={styles.defaultLabel}>Default</Text>
                    ) : (
                        <IconButton
                            icon="delete-outline"
                            iconColor={theme.colors.error}
                            size={20}
                            onPress={() => handleDeleteCategory(item)}
                        />
                    )}
                </View>
            )}
            style={styles.listItem}
        />
    );

    return (
        <Screen>
            <FlatList
                data={categories}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <View style={styles.headerInfo}>
                        <Text variant="bodySmall" style={styles.infoText}>
                            Default categories cannot be deleted. Custom categories can be removed anytime.
                        </Text>
                    </View>
                )}
            />

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
                    <Dialog.Title>Add New Category</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Category Name"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            mode="outlined"
                            style={styles.input}
                            placeholder="e.g. Badminton"
                        />

                        <Text variant="titleSmall" style={styles.iconLabel}>Select Icon</Text>
                        <View style={styles.iconPicker}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {ICON_OPTIONS.map(iconName => (
                                    <TouchableOpacity
                                        key={iconName}
                                        onPress={() => setSelectedIcon(iconName)}
                                        style={[
                                            styles.iconOption,
                                            selectedIcon === iconName && { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary }
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name={iconName}
                                            size={24}
                                            color={selectedIcon === iconName ? theme.colors.primary : theme.colors.outline}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <View style={styles.previewContainer}>
                            <Text variant="bodySmall">Preview: </Text>
                            <Avatar.Icon size={32} icon={selectedIcon} />
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Cancel</Button>
                        <Button mode="contained" onPress={handleAddCategory} disabled={!newCategoryName.trim()}>Add</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <FAB
                icon="plus"
                label="New Category"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                onPress={showDialog}
            />
        </Screen>
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 100,
    },
    listItem: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        paddingVertical: 4,
    },
    headerInfo: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    infoText: {
        opacity: 0.6,
        textAlign: 'center',
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    defaultLabel: {
        fontSize: 10,
        opacity: 0.4,
        textTransform: 'uppercase',
        marginRight: 12,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    dialog: {
        borderRadius: 20,
    },
    input: {
        marginBottom: 20,
    },
    iconLabel: {
        marginBottom: 12,
    },
    iconPicker: {
        height: 60,
        marginBottom: 16,
    },
    iconOption: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    previewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 8,
        borderRadius: 8,
    }
});

export default CategoryManagementScreen;
