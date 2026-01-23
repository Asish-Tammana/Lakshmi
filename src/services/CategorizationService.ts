import { database } from '../database/database';
import Category from '../database/Category';
import Friend from '../database/Friend';
import MerchantMapping from '../database/MerchantMapping';
import { CategoryService } from './CategoryService';
import { Q } from '@nozbe/watermelondb';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Food': ['zomato', 'swiggy', 'restaurant', 'hotel', 'bake', 'cake', 'pizza', 'burger', 'eats', 'blinkit', 'zepto'],
    'Travel': ['uber', 'ola', 'rapido', 'irctc', 'rail', 'metro', 'petrol', 'fuel', 'hpcl', 'bpcl', 'shell'],
    'Shopping': ['amazon', 'flipkart', 'meesho', 'myntra', 'nykaa', 'retail', 'mart', 'store'],
    'Utilities': ['jio', 'airtel', 'vi', 'bescom', 'recharge', 'bill', 'electricity', 'water'],
    'Entertainment': ['pvr', 'inox', 'bookmyshow', 'netflix', 'spotify', 'movie', 'cinema'],
    'Health': ['apollo', 'pharmacy', 'medplus', 'hospital', 'clinic', 'doctor'],
};

export const CategorizationService = {
    async predictCategory(merchantName: string): Promise<Category | null> {
        const name = merchantName.toLowerCase();

        // 1. Check learned mappings first
        const mappings = await database.get<MerchantMapping>('merchant_mappings')
            .query(Q.where('merchant_name', Q.eq(merchantName)))
            .fetch();

        if (mappings.length > 0) {
            const category = await database.get<Category>('categories').find(mappings[0].categoryId);
            if (category) return category;
        }

        // 2. Check Friends list (if needed)
        // Note: For now, if it's a friend, we might return a specific category or null to trigger friend dialog
        const friends = await database.get<Friend>('friends').query().fetch();
        for (const friend of friends) {
            try {
                const patterns: string[] = JSON.parse(friend.vpaPatterns);
                if (patterns.some(p => name.includes(p.toLowerCase()))) {
                    // It's a friend transaction
                    // For now, let's treat it as a special case or return a 'Friends' category if exists
                    const friendCategory = await CategoryService.getCategoryByName('Friends');
                    if (friendCategory) return friendCategory;
                }
            } catch (e) {
                console.error('Error parsing friend patterns', e);
            }
        }

        // 3. Check expanded keywords
        for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(keyword => name.includes(keyword.toLowerCase()))) {
                const category = await CategoryService.getCategoryByName(categoryName);
                if (category) return category;
            }
        }

        // Default to Uncategorized if no match
        const fallback = await CategoryService.getCategoryByName('Uncategorized');
        return fallback || null;
    }
};
