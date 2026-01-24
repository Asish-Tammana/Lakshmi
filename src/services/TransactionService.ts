import { database } from '../database/database';
import Transaction from '../database/Transaction';
import { Q } from '@nozbe/watermelondb';

export const TransactionService = {
    async addTransaction(data: {
        amount: number;
        type: 'debit' | 'credit' | 'transfer';
        categoryId: string;
        merchantName: string;
        rawSmsBody?: string;
        date: number;
        status: 'categorized' | 'uncategorized' | 'ignored';
    }) {
        return await database.write(async () => {
            return await database.get<Transaction>('transactions').create(transaction => {
                transaction.amount = data.amount;
                transaction.type = data.type;
                transaction.categoryId = data.categoryId;
                transaction.merchantName = data.merchantName;
                transaction.rawSmsBody = data.rawSmsBody;
                transaction.date = data.date;
                transaction.status = data.status;
            });
        });
    },

    async getAllTransactions() {
        return await database.get<Transaction>('transactions')
            .query(Q.sortBy('date', Q.desc))
            .fetch();
    },

    async getTransactionById(id: string) {
        return await database.get<Transaction>('transactions').find(id);
    },

    async getNetSpend(startDate: number, endDate: number) {
        const stats = await this.getStats(startDate, endDate);
        return stats.net;
    },

    async getStats(startDate: number, endDate: number) {
        const txns = await database.get<Transaction>('transactions')
            .query(
                Q.where('date', Q.between(startDate, endDate)),
                Q.where('type', Q.notEq('transfer'))
            )
            .fetch();

        return txns.reduce((acc, curr) => {
            if (curr.type === 'debit') {
                acc.expenses += curr.amount;
                acc.net += curr.amount;
            } else if (curr.type === 'credit') {
                acc.income += curr.amount;
                acc.net -= curr.amount;
            }
            return acc;
        }, { income: 0, expenses: 0, net: 0 });
    },

    async getTodayTransactions() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        return await database.get<Transaction>('transactions')
            .query(
                Q.where('date', Q.gte(startOfDay.getTime())),
                Q.sortBy('date', Q.desc)
            )
            .fetch();
    },

    async getRecentTransactions(days: number = 30) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        return await database.get<Transaction>('transactions')
            .query(
                Q.where('date', Q.gte(thirtyDaysAgo.getTime())),
                Q.sortBy('date', Q.desc)
            )
            .fetch();
    },

    async updateTransactionCategory(transaction: Transaction, categoryId: string) {
        await database.write(async () => {
            await transaction.update(record => {
                record.categoryId = categoryId;
                record.status = 'categorized';
            });
        });

        // Learn this mapping for future transactions
        const { MerchantMappingService } = require('./MerchantMappingService');
        await MerchantMappingService.setMapping(transaction.merchantName, categoryId);
    },

    async getAnalysisData(monthTimestamp: number) {
        const date = new Date(monthTimestamp);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).getTime();

        const txns = await database.get<Transaction>('transactions')
            .query(
                Q.where('date', Q.between(startOfMonth, endOfMonth)),
                Q.where('type', Q.notEq('transfer'))
            )
            .fetch();

        // 1. Pie Chart Data (Category-wise)
        const categoryMap: Record<string, number> = {};
        txns.forEach(t => {
            if (t.type === 'debit') {
                categoryMap[t.categoryId] = (categoryMap[t.categoryId] || 0) + t.amount;
            }
        });

        // 2. Line Chart Data (Daily cumulative net spend)
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const now = new Date();
        const isCurrentMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        const lastDayToShow = isCurrentMonth ? now.getDate() : daysInMonth;

        const dailySpend: Record<number, number> = {};
        txns.forEach(t => {
            const day = new Date(t.date).getDate();
            if (t.type === 'debit') {
                dailySpend[day] = (dailySpend[day] || 0) + t.amount;
            } else if (t.type === 'credit') {
                dailySpend[day] = (dailySpend[day] || 0) - t.amount;
            }
        });

        let cumulative = 0;
        const trend = [];
        for (let day = 1; day <= lastDayToShow; day++) {
            cumulative += (dailySpend[day] || 0);
            const label = (day === 1 || day === lastDayToShow || day % 5 === 0) ? day.toString() : '';
            trend.push({
                value: Math.max(0, Math.round(cumulative)),
                label: label
            });
        }

        return {
            categoryData: categoryMap,
            trendData: trend
        };
    },

    async resetAllData() {
        await database.write(async () => {
            const txns = await database.get<Transaction>('transactions').query().fetch();
            const mappings = await database.get('merchant_mappings').query().fetch();
            const friends = await database.get('friends').query().fetch();

            const batch = [
                ...txns.map(t => t.prepareDestroyPermanently()),
                ...mappings.map(m => m.prepareDestroyPermanently()),
                ...friends.map(f => f.prepareDestroyPermanently()),
            ];

            await database.batch(...batch);
        });

        // Re-seed categories
        const { CategoryService } = require('./CategoryService');
        await CategoryService.seedDefaultCategories();
    }
};
