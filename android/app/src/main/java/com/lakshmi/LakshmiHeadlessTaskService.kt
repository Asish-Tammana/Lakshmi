package com.lakshmi

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.bridge.Arguments

class LakshmiHeadlessTaskService : HeadlessJsTaskService() {

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val data = Arguments.createMap()

        return HeadlessJsTaskConfig(
            "LakshmiHeadlessTask",
            data,
            5000,
            true
        )
    }
}
