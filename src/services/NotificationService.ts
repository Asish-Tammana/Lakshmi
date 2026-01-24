import notifee, { AndroidImportance, TriggerType, TimestampTrigger } from '@notifee/react-native';

export const NotificationService = {
    async displayTransactionAlert(amount: string, merchant: string, isUncategorized: boolean) {
        try {
            console.log(`[NotificationService] Displaying alert: ${merchant} - ₹${amount}`);

            // Create a channel (required for Android)
            const channelId = await notifee.createChannel({
                id: 'transaction_alerts',
                name: 'Transaction Alerts',
                importance: AndroidImportance.HIGH,
                vibration: true,
            });

            // Display the notification
            await notifee.displayNotification({
                title: isUncategorized ? '🔍 New Uncategorized Expense' : '💰 Transaction Recorded',
                body: `₹${amount} at ${merchant}. ${isUncategorized ? 'Tap to categorize.' : 'View details.'}`,
                android: {
                    channelId,
                    importance: AndroidImportance.HIGH,
                    smallIcon: 'ic_launcher', // Standard android icon
                    color: '#4CAF50',
                    pressAction: {
                        id: 'default',
                    },
                },
            });
            console.log('[NotificationService] Notification triggered successfully');
        } catch (error) {
            console.error('[NotificationService] Failed to display notification:', error);
        }
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
