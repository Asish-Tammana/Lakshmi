import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Friend extends Model {
    static table = 'friends';

    @field('name') name!: string;
    @field('vpa_patterns') vpaPatterns!: string; // JSON string
    @readonly @date('created_at') createdAt!: number;
    @readonly @date('updated_at') updatedAt!: number;
}
