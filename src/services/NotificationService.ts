import notifee, { AndroidImportance, TriggerType, TimestampTrigger } from '@notifee/react-native';

export const NotificationService = {
    async displayTransactionAlert(amount: string, merchant: string, isUncategorized: boolean) {
        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
            id: 'transactions',
            name: 'Transactions',
            importance: AndroidImportance.HIGH,
        });

        await notifee.displayNotification({
            title: isUncategorized ? 'Uncategorized Transaction' : 'New Transaction',
            body: `₹${amount} spent at ${merchant}. ${isUncategorized ? 'Tap to categorize.' : 'Recorded in Lakshmi.'}`,
            android: {
                channelId,
                pressAction: {
                    id: 'default',
                },
            },
        });
    },

    async scheduleDailyReminder() {
        // Create a channel
        const channelId = await notifee.createChannel({
            id: 'reminders',
            name: 'Daily Reminders',
            importance: AndroidImportance.DEFAULT,
        });

        // Create a time-based trigger
        const now = new Date();
        const triggerDate = new Date();
        triggerDate.setHours(23, 0, 0, 0); // 11 PM

        // If 11 PM has already passed today, schedule for tomorrow
        if (triggerDate <= now) {
            triggerDate.setDate(triggerDate.getDate() + 1);
        }

        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: triggerDate.getTime(),
            repeatFrequency: 1, // Repeat daily
        };

        await notifee.createTriggerNotification(
            {
                title: 'Transaction Audit',
                body: 'You have uncategorized transactions. Review them now to keep your records accurate.',
                android: {
                    channelId,
                    pressAction: {
                        id: 'audit',
                    },
                },
            },
            trigger,
        );
    }
};
