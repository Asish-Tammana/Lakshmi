import { SmsParser } from '../utils/SmsParser';
import { CategorizationService } from './CategorizationService';
import { TransactionService } from './TransactionService';
import { CategoryService } from './CategoryService';
import { NotificationService } from './NotificationService';

export const TransactionEngine = {
    async processIncomingSms(message: string) {
        const parsed = SmsParser.parse(message);
        if (!parsed) return null;

        const category = await CategorizationService.predictCategory(parsed.merchant);
        const categoryId = category?.id || (await CategoryService.getCategoryByName('Uncategorized'))?.id || '';

        const transaction = await TransactionService.addTransaction({
            amount: parsed.amount,
            type: parsed.type,
            categoryId,
            merchantName: parsed.merchant,
            rawSmsBody: message,
            date: parsed.date,
            status: category?.name === 'Uncategorized' ? 'uncategorized' : 'categorized',
        });

        // Alert user
        await NotificationService.displayTransactionAlert(
            parsed.amount.toString(),
            parsed.merchant,
            category?.name === 'Uncategorized'
        );

        return transaction;
    },

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(amount);
    }
};
