import { SmsParser } from '../utils/SmsParser';
import { CategorizationService } from './CategorizationService';
import { TransactionService } from './TransactionService';
import { CategoryService } from './CategoryService';
import { NotificationService } from './NotificationService';

export const TransactionEngine = {
    async processIncomingSms(message: string) {
        console.log('[TransactionEngine] Processing message:', message);

        if (message.trim().toUpperCase() === 'DELETE TESTING DATA') {
            console.log('[TransactionEngine] Delete command detected. Clearing all transactions...');
            await TransactionService.deleteAllTransactions();
            return null;
        }

        const parsed = SmsParser.parse(message);
        if (!parsed) {
            console.log('[TransactionEngine] Message not recognized as a transaction.');
            return null;
        }

        console.log('[TransactionEngine] Parsed transaction:', parsed);

        let categoryId = '';
        let categoryName = 'Uncategorized';

        if (parsed.type === 'transfer' || parsed.merchant === 'Self') {
            const transferCategory = await CategoryService.getCategoryByName('Transfer');
            categoryId = transferCategory?.id || '';
            categoryName = transferCategory?.name || 'Transfer';
        } else if (parsed.isReversal) {
            const refundCategory = await CategoryService.getCategoryByName('Refund');
            categoryId = refundCategory?.id || '';
            categoryName = refundCategory?.name || 'Refund';
        } else {
            const category = await CategorizationService.predictCategory(parsed.merchant);
            categoryId = category?.id || (await CategoryService.getCategoryByName('Uncategorized'))?.id || '';
            categoryName = category?.name || 'Uncategorized';
        }

        const transaction = await TransactionService.addTransaction({
            amount: parsed.amount,
            type: parsed.type,
            categoryId,
            merchantName: parsed.merchant,
            rawSmsBody: message,
            date: parsed.date,
            status: 'uncategorized',
        });

        console.log('[TransactionEngine] Transaction saved to DB (uncategorized):', transaction.id);

        // Alert user
        await NotificationService.displayTransactionAlert(
            parsed.amount.toString(),
            parsed.merchant,
            true // Always treat as uncategorized for notification purposes
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
