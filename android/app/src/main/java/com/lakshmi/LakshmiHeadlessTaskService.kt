package com.lakshmi

import android.content.Intent
import android.util.Log
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.bridge.Arguments

class LakshmiHeadlessTaskService : HeadlessJsTaskService() {

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val extras = intent?.extras
        Log.d("LakshmiSms", "getTaskConfig called. Has extras: ${extras != null}")

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
}
