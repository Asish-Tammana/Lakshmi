import { database } from '../database/database';
import Category from '../database/Category';

const defaultCategories = [
    { name: 'Food', icon: 'food', isExpense: true, isDefault: true },
    { name: 'Travel', icon: 'train', isExpense: true, isDefault: true },
    { name: 'Shopping', icon: 'cart', isExpense: true, isDefault: true },
    { name: 'Health', icon: 'medical-bag', isExpense: true, isDefault: true },
    { name: 'Utilities', icon: 'flash', isExpense: true, isDefault: true },
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
        const existingCount = await categoriesCollection.query().fetchCount();

        if (existingCount === 0) {
            await database.write(async () => {
                const batch = defaultCategories.map(cat =>
                    categoriesCollection.prepareCreate(category => {
                        category.name = cat.name;
                        category.icon = cat.icon;
                        category.isExpense = cat.isExpense;
                        category.isDefault = cat.isDefault;
                    })
                );
                await database.batch(...batch);
            });
            console.log('Default categories seeded.');
        }
    },

    async getAllCategories() {
        return await database.get<Category>('categories').query().fetch();
    },

    async getCategoryByName(name: string) {
        const categories = await database.get<Category>('categories')
            .query()
            .fetch();
        return categories.find(c => c.name === name);
    }
};
