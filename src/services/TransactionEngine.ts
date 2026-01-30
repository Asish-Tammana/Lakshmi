import { SmsParser } from '../utils/SmsParser';
import { CategorizationService } from './CategorizationService';
import { TransactionService } from './TransactionService';
import { CategoryService } from './CategoryService';
import { NotificationService } from './NotificationService';

export const TransactionEngine = {
    async processIncomingSms(message: string) {
        if (message.trim().toUpperCase() === 'DELETE TESTING DATA') {
            console.log('🗑️ CLEAR COMMAND DETECTED. Wiping DB...');
            await TransactionService.resetAllData();
            return null;
        }

        const parsed = SmsParser.parse(message);
        if (!parsed) {
            console.log('[SMS IGNORE] Not a transaction.');
            return null;
        }

        let categoryId = '';

        if (parsed.type === 'transfer' || parsed.merchant === 'Self') {
            const transferCategory = await CategoryService.getCategoryByName('Transfer');
            categoryId = transferCategory?.id || '';
        } else if (parsed.isReversal) {
            const refundCategory = await CategoryService.getCategoryByName('Refund');
            categoryId = refundCategory?.id || '';
        } else {
            const category = await CategorizationService.predictCategory(parsed.merchant);
            categoryId = category?.id || (await CategoryService.getCategoryByName('Uncategorized'))?.id || '';
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

        console.log(`✅ [SMS SAVED] ${parsed.merchant} | ₹${parsed.amount}`);

        // Alert user
        await NotificationService.displayTransactionAlert(
            parsed.amount.toString(),
            parsed.merchant,
            true
        );

        return transaction;
    },

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(amount);
    },

    formatCurrencySimple(amount: number): string {
        try {
            return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 }).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } catch (e) {
            return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    },

    formatTime(timestamp: number): string {
        try {
            return new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            const d = new Date(timestamp);
            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        }
    },

    formatDate(timestamp: number): string {
        try {
            return new Date(timestamp).toLocaleDateString();
        } catch (e) {
            const d = new Date(timestamp);
            return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        }
    }
};
