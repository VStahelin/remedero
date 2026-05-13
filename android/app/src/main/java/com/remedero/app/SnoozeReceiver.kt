package com.remedero.app

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.widget.Toast

class SnoozeReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val planId = intent.getStringExtra("planId") ?: return
    val scheduledTime = intent.getStringExtra("scheduledTime") ?: return
    val weekday = intent.getIntExtra("weekday", 0)
    val hour = intent.getIntExtra("hour", 0)
    val minute = intent.getIntExtra("minute", 0)
    val snoozeMinutes = intent.getIntExtra("snoozeMinutes", 10)
    val planName = intent.getStringExtra("planName") ?: ""
    val notifId = intent.getIntExtra("notifId", 0)

    // Cancel existing notification
    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val notifTag = "alarm_$planId"
    notificationManager.cancel(notifTag, notifId)

    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
      AlarmEventBus.emit(planId, scheduledTime, -1)
      return
    }

    // Schedule one-time snooze alarm (retryIndex=99 marks it as snooze in AlarmReceiver)
    val triggerTime = System.currentTimeMillis() + snoozeMinutes * 60 * 1000L
    val snoozeAlarmIntent = Intent(context, AlarmReceiver::class.java).apply {
      putExtra("planId", planId)
      putExtra("scheduledTime", scheduledTime)
      putExtra("weekday", weekday)
      putExtra("hour", hour)
      putExtra("minute", minute)
      putExtra("retryIndex", 99)
      putExtra("snoozeMinutes", snoozeMinutes)
      putExtra("planName", planName)
    }
    val requestCode = ("snooze_alarm_$planId$scheduledTime").hashCode()
    val snoozePendingIntent = PendingIntent.getBroadcast(
      context,
      requestCode,
      snoozeAlarmIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    alarmManager.setAlarmClock(
      AlarmManager.AlarmClockInfo(triggerTime, snoozePendingIntent),
      snoozePendingIntent,
    )

    Toast.makeText(
      context.applicationContext,
      "Lembrete adiado por ${snoozeMinutes} min",
      Toast.LENGTH_LONG,
    ).show()

    // Notify JS: weekday=-1 signals snooze was pressed
    AlarmEventBus.emit(planId, scheduledTime, -1)
  }
}
