import { Q } from '@nozbe/watermelondb';
import { database } from '../database/database';
import MerchantMapping from '../database/MerchantMapping';

export const MerchantMappingService = {
    async getMapping(merchantName: string): Promise<MerchantMapping | null> {
        const mappings = await database.get<MerchantMapping>('merchant_mappings')
            .query(Q.where('merchant_name', Q.eq(merchantName)))
            .fetch();
        return mappings.length > 0 ? mappings[0] : null;
    },

    async setMapping(merchantName: string, categoryId: string) {
        const existing = await this.getMapping(merchantName);

        if (existing) {
            await database.write(async () => {
                await existing.update(record => {
                    record.categoryId = categoryId;
                });
            });
            return existing;
        } else {
            return await database.write(async () => {
                return await database.get<MerchantMapping>('merchant_mappings').create(record => {
                    record.merchantName = merchantName;
                    record.categoryId = categoryId;
                });
            });
        }
    }
};
