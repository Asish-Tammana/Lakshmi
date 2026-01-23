import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'transactions',
            columns: [
                { name: 'amount', type: 'number' },
                { name: 'type', type: 'string' }, // 'debit' | 'credit' | 'transfer'
                { name: 'category_id', type: 'string', isIndexed: true },
                { name: 'friend_id', type: 'string', isIndexed: true, isOptional: true },
                { name: 'merchant_name', type: 'string' },
                { name: 'raw_sms_body', type: 'string', isOptional: true },
                { name: 'date', type: 'number', isIndexed: true },
                { name: 'status', type: 'string' }, // 'categorized' | 'uncategorized' | 'ignored'
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'categories',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'icon', type: 'string' },
                { name: 'is_expense', type: 'boolean' },
                { name: 'is_default', type: 'boolean' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'friends',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'vpa_patterns', type: 'string' }, // JSON stringified array of VPA patterns
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
    ],
});
