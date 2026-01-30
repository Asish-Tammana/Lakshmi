/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { TransactionEngine } from './src/services/TransactionEngine';
import { SmsParser } from './src/utils/SmsParser';

const SmsHandlingTask = async (taskData) => {
    try {
        const { message, sender } = taskData;
        console.log('[SMS START] New Message from:', sender);
        console.log('[SMS BODY]:', message);

        if (!message) return;

        await TransactionEngine.processIncomingSms(message);
    } catch (error) {
        console.error('[SMS ERROR]:', error);
    }
};

AppRegistry.registerHeadlessTask('SmsHandlingTask', () => SmsHandlingTask);
AppRegistry.registerComponent(appName, () => App);
