export interface ParsedTransaction {
    amount: number;
    type: 'debit' | 'credit' | 'transfer';
    merchant: string;
    vpa?: string;
    date: number;
    isReversal?: boolean;
}

const BANK_PATTERNS = [
    // Reversals/Refunds: "Rs. 100 reversed/refunded to Ac 1234 from Merchant"
    {
        regex: /(?:Rs\.?|INR)\s*([\d,.]+)\s+(?:reversed|refunded|returned)\s+.*from\s+([^.\n]+)/i,
        amountIdx: 1,
        merchantIdx: 2,
        type: 'credit',
        isReversal: true,
    },
    // Self-Transfers: "Transferred Rs. 500 to self" or "A/c Transfer Rs. 500 to Ac X1234"
    {
        regex: /(?:Transferred|Transfer|A\/c\s+transfer)\s+(?:Rs\.?|INR)\s*([\d,.]+)\s+(?:to|from)\s+(?:self|A\/c.*)/i,
        amountIdx: 1,
        merchantIdx: -1, // No merchant for self-transfer
        type: 'transfer',
    },
    // KVB Credit: "Your a/c ... is credited Rs. 100 from Person Name on Date.info :..."
    {
        regex: /is\s+credited\s+Rs\.\s*([\d,.]+)\s+from\s+([^.\n]+?)\s+on/i,
        amountIdx: 1,
        merchantIdx: 2,
        type: 'credit',
    },
    // KVB Debit: "Your a/c ... is debited Rs. 100 on Date to Merchant info :..."
    {
        regex: /is\s+debited\s+Rs\.\s*([\d,.]+)\s+on\s+.*?\s+to\s+([^.\n]+?)\s+info/i,
        amountIdx: 1,
        merchantIdx: 2,
        type: 'debit',
    },
    // HDFC: "Paid Rs. 500 to Merchant via UPI..."
    {
        regex: /(?:Paid|Sent|Debited|Spent)\s+(?:Rs\.?|INR)\s*([\d,.]+)\s+(?:to|at)\s+([^.\n]+)/i,
        amountIdx: 1,
        merchantIdx: 2,
        type: 'debit',
    },
    // SBI: "Your a/c X1234 debited by 500.00 on 24Jan26 by UPI Ref 12345 to Zomato"
    {
        regex: /debited\s+by\s+([\d,.]+)\s+on\s+.*by\s+UPI\s+Ref\s+\d+\s+to\s+([^.\n]+)/i,
        amountIdx: 1,
        merchantIdx: 2,
        type: 'debit',
    },
    // General: "Rs. 100.00 debited from Ac 1234 to Merchant"
    {
        regex: /(?:Rs\.?|INR)\s*([\d,.]+)\s+debited\s+.*to\s+([^.\n]+)/i,
        amountIdx: 1,
        merchantIdx: 2,
        type: 'debit',
    },
    // Credits: "Rs. 500.00 credited to Ac 1234 from Merchant"
    {
        regex: /(?:Rs\.?|INR)\s*([\d,.]+)\s+credited\s+.*from\s+([^.\n]+)/i,
        amountIdx: 1,
        merchantIdx: 2,
        type: 'credit',
    },
];

export const SmsParser = {
    parse(message: string): ParsedTransaction | null {
        for (const pattern of BANK_PATTERNS) {
            const match = message.match(pattern.regex);
            if (match) {
                const amount = parseFloat(match[pattern.amountIdx].replace(/,/g, ''));
                const merchant = pattern.merchantIdx === -1 ? 'Self' : (match[pattern.merchantIdx] || 'Unknown').trim();

                return {
                    amount,
                    type: pattern.type as 'debit' | 'credit' | 'transfer',
                    merchant,
                    date: Date.now(),
                    isReversal: (pattern as any).isReversal || false,
                };
            }
        }
        return null;
    }
};
