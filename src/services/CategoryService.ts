import { database } from '../database/database';
import Category from '../database/Category';
import { Q } from '@nozbe/watermelondb';

const defaultCategories = [
    { name: 'Food', icon: 'food', isExpense: true, isDefault: true },
    { name: 'Travel', icon: 'train', isExpense: true, isDefault: true },
    { name: 'Shopping', icon: 'cart', isExpense: true, isDefault: true },
    { name: 'Health', icon: 'medical-bag', isExpense: true, isDefault: true },
    { name: 'Utilities', icon: 'flash', isExpense: true, isDefault: true },
    { name: 'Groceries', icon: 'basket', isExpense: true, isDefault: true },
    { name: 'Badminton', icon: 'badminton', isExpense: true, isDefault: true },
    { name: 'Salary', icon: 'cash', isExpense: false, isDefault: true },
    { name: 'Entertainment', icon: 'movie', isExpense: true, isDefault: true },
    { name: 'Friends', icon: 'account-group', isExpense: true, isDefault: true },
    { name: 'Transfer', icon: 'swap-horizontal', isExpense: false, isDefault: true },
    { name: 'Refund', icon: 'undo', isExpense: false, isDefault: true },
    { name: 'Uncategorized', icon: 'help-circle', isExpense: true, isDefault: true },
];

export const CategoryService = {
    async seedDefaultCategories() {
        const categoriesCollection = database.get<Category>('categories');

        await database.write(async () => {
            // Remove 'Etc' if it exists from previous seed
            const etc = await categoriesCollection.query(Q.where('name', 'Etc')).fetch();
            if (etc.length > 0) {
                await etc[0].destroyPermanently();
            }

            for (const cat of defaultCategories) {
                const existing = await categoriesCollection.query(Q.where('name', cat.name)).fetch();
                if (existing.length === 0) {
                    await categoriesCollection.create(category => {
                        category.name = cat.name;
                        category.icon = cat.icon;
                        category.isExpense = cat.isExpense;
                        category.isDefault = cat.isDefault;
                    });
                }
            }
        });
        console.log('Default categories synced.');
    },

    async getAllCategories() {
        return await database.get<Category>('categories')
            .query(Q.sortBy('name', Q.asc))
            .fetch();
    },

    async getCategoryByName(name: string) {
        const categories = await database.get<Category>('categories')
            .query()
            .fetch();
        return categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    },

    async addCategory(name: string, icon: string, isExpense: boolean = true) {
        return await database.write(async () => {
            return await database.get<Category>('categories').create(category => {
                category.name = name;
                category.icon = icon;
                category.isExpense = isExpense;
                category.isDefault = false;
            });
        });
    },

    async deleteCategory(category: Category) {
        if (category.isDefault) {
            throw new Error("Cannot delete default categories");
        }
        return await database.write(async () => {
            await category.destroyPermanently();
        });
    }
};
