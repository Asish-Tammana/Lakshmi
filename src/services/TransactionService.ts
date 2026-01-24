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

    async getNetSpend(startDate: number, endDate: number) {
        const txns = await database.get<Transaction>('transactions')
            .query(
                Q.where('date', Q.between(startDate, endDate)),
                Q.where('type', Q.notEq('transfer'))
            )
            .fetch();

        return txns.reduce((acc, curr) => {
            if (curr.type === 'debit') return acc + curr.amount;
            if (curr.type === 'credit') return acc - curr.amount;
            return acc;
        }, 0);
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

    async deleteAllTransactions() {
        await database.write(async () => {
            const txns = await database.get<Transaction>('transactions').query().fetch();
            const batch = txns.map(t => t.prepareDestroyPermanently());
            await database.batch(...batch);
        });
    }
};
