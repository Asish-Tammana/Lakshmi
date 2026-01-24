package com.lakshmi

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import com.facebook.react.HeadlessJsTaskService

class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d("LakshmiSms", "onReceive triggered with action: $action")

        if (action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            if (messages.isEmpty()) return

            // We only need to start the task once for a group of messages in the intent
            // Usually, getMessagesFromIntent reconstruction handles multi-part SMS.
            val sender = messages[0].displayOriginatingAddress
            val fullBody = messages.joinToString("") { it.messageBody ?: "" }

            Log.d("LakshmiSms", "SMS received from $sender. Length: ${fullBody.length}")
            
            val serviceIntent = Intent(context, LakshmiHeadlessTaskService::class.java)
            serviceIntent.putExtra("message", fullBody)
            serviceIntent.putExtra("sender", sender)
            serviceIntent.putExtra("timestamp", System.currentTimeMillis())
            
            try {
                // Ensure the CPU stays on for the Headless task
                HeadlessJsTaskService.acquireWakeLockNow(context)
                
                // On Android 8.0+, startService might throw if not in foreground.
                // However, receivers for high-priority broadcasts like SMS are allowed 
                // a small window to start services.
                context.startService(serviceIntent)
                Log.d("LakshmiSms", "Headless service start successful")
            } catch (e: Exception) {
                Log.e("LakshmiSms", "Critical: Failed to start Headless service: ${e.message}")
                // Fallback for newer Android versions if needed
                try {
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                        context.startForegroundService(serviceIntent)
                        Log.d("LakshmiSms", "Attempted startForegroundService as fallback")
                    }
                } catch (e2: Exception) {
                    Log.e("LakshmiSms", "Total failure starting service: ${e2.message}")
                }
            }
        }
    }
}
