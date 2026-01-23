import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Transaction extends Model {
    static table = 'transactions';

    @field('amount') amount!: number;
    @field('type') type!: string;
    @field('category_id') categoryId!: string;
    @field('friend_id') friendId?: string;
    @field('merchant_name') merchantName!: string;
    @field('raw_sms_body') rawSmsBody?: string;
    @date('date') date!: number;
    @field('status') status!: string;
    @readonly @date('created_at') createdAt!: number;
    @readonly @date('updated_at') updatedAt!: number;
}
