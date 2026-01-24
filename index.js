/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { TransactionEngine } from './src/services/TransactionEngine';

const SmsHandlingTask = async (taskData) => {
    try {
        console.log('[HeadlessTask] Signal received! Data:', JSON.stringify(taskData));
        const { message } = taskData;
        if (!message) {
            console.warn('[HeadlessTask] No message content found in taskData!');
            return;
        }
        console.log('[HeadlessTask] Message content:', message);
        await TransactionEngine.processIncomingSms(message);
        console.log('[HeadlessTask] Task completed successfully');
    } catch (error) {
        console.error('[HeadlessTask] CRITICAL ERROR:', error);
    }
};

AppRegistry.registerHeadlessTask('SmsHandlingTask', () => SmsHandlingTask);
AppRegistry.registerComponent(appName, () => App);
