import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class MerchantMapping extends Model {
    static table = 'merchant_mappings';

    @field('merchant_name') merchantName!: string;
    @field('category_id') categoryId!: string;

    @readonly @date('created_at') createdAt!: number;
    @readonly @date('updated_at') updatedAt!: number;
}
