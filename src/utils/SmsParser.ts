export interface ParsedTransaction {
    amount: number;
    type: 'debit' | 'credit';
    merchant: string;
    vpa?: string;
    date: number;
}

const BANK_PATTERNS = [
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
                const merchant = match[pattern.merchantIdx].trim();

                return {
                    amount,
                    type: pattern.type as 'debit' | 'credit',
                    merchant,
                    date: Date.now(),
                };
            }
        }
        return null;
    }
};
