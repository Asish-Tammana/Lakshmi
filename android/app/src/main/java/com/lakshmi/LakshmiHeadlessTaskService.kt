package com.lakshmi

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.util.Log
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.bridge.Arguments

class LakshmiHeadlessTaskService : HeadlessJsTaskService() {

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val extras = intent?.extras
        return if (extras != null) {
            HeadlessJsTaskConfig(
                "SmsHandlingTask",
                Arguments.fromBundle(extras),
                5000,
                true
            )
        } else {
            null
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        try {
            createNotificationChannel()
            val notification = createNotification()
            
            if (Build.VERSION.SDK_INT >= 34) {
                // API 34+ requires specifying the service type for data consistency
                startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SHORT_SERVICE)
            } else {
                startForeground(1, notification)
            }
        } catch (e: Exception) {
            Log.e("LakshmiSms", "Error starting foreground service: ${e.message}")
        }
        return super.onStartCommand(intent, flags, startId)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelId = "SMS_PROCESSING_CHANNEL"
            val channelName = "SMS Processing"
            val channel = NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_LOW)
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val channelId = "SMS_PROCESSING_CHANNEL"
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
             Notification.Builder(this, channelId)
        } else {
             Notification.Builder(this)
        }
        
        return builder
            .setContentTitle("Lakshmi")
            .setContentText("Processing new transaction...")
            .setSmallIcon(R.mipmap.ic_launcher)
            .build()
    }
}
