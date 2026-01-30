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

            val sender = messages[0].displayOriginatingAddress
            val fullBody = messages.joinToString("") { it.messageBody ?: "" }

            Log.d("LakshmiSms", "SMS RECEIVED | Sender: $sender | Body: $fullBody")
            
            val serviceIntent = Intent(context, LakshmiHeadlessTaskService::class.java)
            serviceIntent.putExtra("message", fullBody)
            serviceIntent.putExtra("sender", sender)
            serviceIntent.putExtra("timestamp", System.currentTimeMillis())
            
            try {
                HeadlessJsTaskService.acquireWakeLockNow(context)
                
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            } catch (e: Exception) {
                Log.e("LakshmiSms", "Headless Start Failed: ${e.message}")
            }
        }
    }
}
