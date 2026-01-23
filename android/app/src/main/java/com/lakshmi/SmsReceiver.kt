package com.lakshmi

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (message in messages) {
                val messageBody = message.messageBody
                val sender = message.displayOriginatingAddress
                
                Log.d("SmsReceiver", "SMS received from $sender: $messageBody")
                
                // Start Headless JS Task
                val serviceIntent = Intent(context, LakshmiHeadlessTaskService::class.java)
                serviceIntent.putExtra("message", messageBody)
                serviceIntent.putExtra("sender", sender)
                context.startService(serviceIntent)
            }
        }
    }
}
