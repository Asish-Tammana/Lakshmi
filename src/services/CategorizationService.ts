import { CategoryService } from '../services/CategoryService';
import Category from '../database/Category';

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

        for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                const category = await CategoryService.getCategoryByName(categoryName);
                if (category) return category;
            }
        }

        // Default to Uncategorized if no match
        const fallback = await CategoryService.getCategoryByName('Uncategorized');
        return fallback || null;
    }
};
