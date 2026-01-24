import { database } from '../database/database';
import Friend from '../database/Friend';
import { Q } from '@nozbe/watermelondb';

export const FriendService = {
    async getAllFriends() {
        return await database.get<Friend>('friends').query().fetch();
    },

    async addFriend(name: string, vpaPattern: string) {
        return await database.write(async () => {
            return await database.get<Friend>('friends').create(friend => {
                friend.name = name;
                friend.vpaPatterns = JSON.stringify([vpaPattern.toLowerCase().trim()]);
            });
        });
    },

    async updateFriend(friend: Friend, name: string, vpaPattern: string) {
        return await database.write(async () => {
            await friend.update(f => {
                f.name = name;
                f.vpaPatterns = JSON.stringify([vpaPattern.toLowerCase().trim()]);
            });
        });
    },

    async deleteFriend(friend: Friend) {
        return await database.write(async () => {
            await friend.destroyPermanently();
        });
    },

    async findFriendByVpa(vpa: string) {
        const friends = await this.getAllFriends();
        const normalizedVpa = vpa.toLowerCase().trim();

        return friends.find(f => {
            try {
                const patterns: string[] = JSON.parse(f.vpaPatterns);
                return patterns.some(p => normalizedVpa.includes(p));
            } catch (e) {
                return false;
            }
        });
    }
};
