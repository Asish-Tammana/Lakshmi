package com.lakshmi

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Log.d("LakshmiSms", "onReceive triggered with action: ${intent.action}")

        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            Log.d("LakshmiSms", "Number of messages: ${messages.size}")
            
            for (message in messages) {
                val messageBody = message.messageBody
                val sender = message.displayOriginatingAddress
                
                Log.d("LakshmiSms", "SMS received from $sender: $messageBody")
                
                val serviceIntent = Intent(context, LakshmiHeadlessTaskService::class.java)
                serviceIntent.putExtra("message", messageBody)
                serviceIntent.putExtra("sender", sender)
                
                try {
                    context.startService(serviceIntent)
                    Log.d("LakshmiSms", "Headless service start signal sent")
                } catch (e: Exception) {
                    Log.e("LakshmiSms", "Critical: Failed to start Headless task: ${e.message}")
                }
            }
        }
    }
}
