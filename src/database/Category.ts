import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Category extends Model {
    static table = 'categories';

    @field('name') name!: string;
    @field('icon') icon!: string;
    @field('is_expense') isExpense!: boolean;
    @field('is_default') isDefault!: boolean;
    @readonly @date('created_at') createdAt!: number;
    @readonly @date('updated_at') updatedAt!: number;
}
