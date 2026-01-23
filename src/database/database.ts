import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import Transaction from './Transaction';
import Category from './Category';
import Friend from './Friend';
import MerchantMapping from './MerchantMapping';

const adapter = new SQLiteAdapter({
    schema,
    // (Optional) Database file name. Default is 'watermelon'
    dbName: 'LakshmiDB',
    // (Optional) JSI (high-performance) indicator.
    // Note: JSI is standard on modern React Native.
    jsi: true,
    onSetUpError: error => {
        // Database failed to load -- help the user!
        console.error('Database setup error:', error);
    }
});

export const database = new Database({
    adapter,
    modelClasses: [
        Transaction,
        Category,
        Friend,
        MerchantMapping,
    ],
});
