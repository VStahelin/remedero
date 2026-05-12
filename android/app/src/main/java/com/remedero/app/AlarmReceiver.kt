package com.remedero.app

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.os.SystemClock

class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val planId = intent.getStringExtra("planId") ?: return
    val scheduledTime = intent.getStringExtra("scheduledTime") ?: return
    val weekday = intent.getIntExtra("weekday", 0)
    val hour = intent.getIntExtra("hour", 0)
    val minute = intent.getIntExtra("minute", 0)
    val retryIndex = intent.getIntExtra("retryIndex", 0)
    val snoozeMinutes = intent.getIntExtra("snoozeMinutes", 10)
    val planName = intent.getStringExtra("planName") ?: "Medicamento"

    // Store pending alarm in SharedPreferences
    val alarmPrefs = context.getSharedPreferences("remedero_alarms", Context.MODE_PRIVATE)
    alarmPrefs.edit()
      .putString("pending_planId", planId)
      .putString("pending_scheduledTime", scheduledTime)
      .putInt("pending_weekday", weekday)
      .putBoolean("has_pending_alarm", true)
      .apply()

    // Reschedule for next week
    val nextWeekTrigger = System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000
    val nextIntent = Intent(context, AlarmReceiver::class.java).apply {
      putExtra("planId", planId)
      putExtra("scheduledTime", scheduledTime)
      putExtra("weekday", weekday)
      putExtra("hour", hour)
      putExtra("minute", minute)
      putExtra("retryIndex", retryIndex)
      putExtra("snoozeMinutes", snoozeMinutes)
      putExtra("planName", planName)
    }
    val alarmId = if (retryIndex == 0) {
      val hhmm = String.format("%02d%02d", hour, minute)
      "alarm-$planId-$weekday-$hhmm"
    } else {
      val hhmm = String.format("%02d%02d", hour, minute)
      "alarm-$planId-$weekday-$hhmm-retry-$retryIndex"
    }
    val nextPendingIntent = PendingIntent.getBroadcast(
      context,
      alarmId.hashCode(),
      nextIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextWeekTrigger, nextPendingIntent)
    } else {
      alarmManager.setExact(AlarmManager.RTC_WAKEUP, nextWeekTrigger, nextPendingIntent)
    }

    // Build notification
    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val channelId = "medication-alarm"
    val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val existingChannel = notificationManager.getNotificationChannel(channelId)
      if (existingChannel == null) {
        val channel = NotificationChannel(channelId, "Alarme de medicamentos", NotificationManager.IMPORTANCE_HIGH).apply {
          setBypassDnd(true)
          enableVibration(true)
          vibrationPattern = longArrayOf(0, 500, 250, 500)
          lockscreenVisibility = Notification.VISIBILITY_PUBLIC
          val audioAttributes = AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .setUsage(AudioAttributes.USAGE_ALARM)
            .build()
          setSound(alarmUri, audioAttributes)
        }
        notificationManager.createNotificationChannel(channel)
      }
    }

    val notifId = ("alarm_$planId$scheduledTime").hashCode()
    val notifTag = "alarm_$planId"

    // Full-screen / content intent: opens MainActivity with alarm extras
    val mainActivityIntent = Intent(context, MainActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
      putExtra("alarmPlanId", planId)
      putExtra("alarmScheduledTime", scheduledTime)
      putExtra("alarmWeekday", weekday)
      putExtra("alarmPlanName", planName)
    }
    val fullScreenPendingIntent = PendingIntent.getActivity(
      context,
      notifId,
      mainActivityIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    // Snooze action
    val snoozeIntent = Intent(context, SnoozeReceiver::class.java).apply {
      putExtra("planId", planId)
      putExtra("scheduledTime", scheduledTime)
      putExtra("weekday", weekday)
      putExtra("hour", hour)
      putExtra("minute", minute)
      putExtra("snoozeMinutes", snoozeMinutes)
      putExtra("notifId", notifId)
    }
    val snoozePendingIntent = PendingIntent.getBroadcast(
      context,
      ("snooze_$planId$scheduledTime").hashCode(),
      snoozeIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val notificationBuilder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(context, channelId)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(context)
    }

    notificationBuilder.apply {
      setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      setContentTitle("Check-in $scheduledTime — $planName")
      setContentText("Hora de registrar seu medicamento.")
      setFullScreenIntent(fullScreenPendingIntent, true)
      setContentIntent(fullScreenPendingIntent)
      setOngoing(true)
      setAutoCancel(false)
      setCategory(Notification.CATEGORY_ALARM)
      setVisibility(Notification.VISIBILITY_PUBLIC)
      addAction(
        Notification.Action.Builder(
          null,
          "Snooze ${snoozeMinutes}min",
          snoozePendingIntent,
        ).build(),
      )
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
        @Suppress("DEPRECATION")
        setSound(alarmUri)
        @Suppress("DEPRECATION")
        setVibrate(longArrayOf(0, 500, 250, 500))
        @Suppress("DEPRECATION")
        setPriority(Notification.PRIORITY_MAX)
      }
    }

    notificationManager.notify(notifTag, notifId, notificationBuilder.build())

    // Emit to JS via event bus
    AlarmEventBus.emit(planId, scheduledTime, weekday)
  }
}
