/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { TransactionEngine } from './src/services/TransactionEngine';

const SmsHandlingTask = async (taskData) => {
    const { message } = taskData;
    console.log('Background SMS received:', message);
    await TransactionEngine.processIncomingSms(message);
};

AppRegistry.registerHeadlessTask('SmsHandlingTask', () => SmsHandlingTask);
AppRegistry.registerComponent(appName, () => App);
