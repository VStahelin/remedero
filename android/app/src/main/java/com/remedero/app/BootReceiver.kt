package com.remedero.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import org.json.JSONObject
import java.util.Calendar

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED &&
      intent.action != "android.intent.action.QUICKBOOT_POWERON"
    ) return

    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
      return
    }

    val planPrefs = context.getSharedPreferences("remedero_plan_alarms", Context.MODE_PRIVATE)
    val dataPrefs = context.getSharedPreferences("remedero_alarm_data", Context.MODE_PRIVATE)

    for (key in planPrefs.all.keys) {
      if (!key.startsWith("plan_alarms_")) continue
      @Suppress("UNCHECKED_CAST")
      val alarmIds = planPrefs.getStringSet(key, emptySet()) ?: continue
      for (alarmId in alarmIds) {
        val dataStr = dataPrefs.getString("alarm_data_$alarmId", null) ?: continue
        try {
          rescheduleAlarm(context, alarmManager, alarmId, JSONObject(dataStr))
        } catch (_: Exception) {}
      }
    }
  }

  private fun rescheduleAlarm(context: Context, alarmManager: AlarmManager, alarmId: String, data: JSONObject) {
    val planId = data.getString("planId")
    val weekday = data.getInt("weekday")
    val hour = data.getInt("hour")
    val minute = data.getInt("minute")
    val retryIndex = data.getInt("retryIndex")
    val snoozeMinutes = data.getInt("snoozeMinutes")
    val planName = data.getString("planName")

    val retryOffsetMinutes = retryIndex * snoozeMinutes
    val totalMinutes = hour * 60 + minute + retryOffsetMinutes
    val effectiveHour = (totalMinutes / 60) % 24
    val effectiveMinute = totalMinutes % 60
    val effectiveWeekday = (weekday + totalMinutes / 1440) % 7

    val triggerTime = nextOccurrence(effectiveWeekday, effectiveHour, effectiveMinute)

    val intent = Intent(context, AlarmReceiver::class.java).apply {
      putExtra("planId", planId)
      putExtra("alarmId", alarmId)
      putExtra("scheduledTime", String.format("%02d:%02d", hour, minute))
      putExtra("weekday", weekday)
      putExtra("hour", effectiveHour)
      putExtra("minute", effectiveMinute)
      putExtra("retryIndex", retryIndex)
      putExtra("snoozeMinutes", snoozeMinutes)
      putExtra("planName", planName)
    }

    val pendingIntent = PendingIntent.getBroadcast(
      context,
      alarmId.hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    alarmManager.setAlarmClock(
      AlarmManager.AlarmClockInfo(triggerTime, pendingIntent),
      pendingIntent,
    )
  }

  private fun nextOccurrence(weekday: Int, hour: Int, minute: Int): Long {
    val now = Calendar.getInstance()
    val target = Calendar.getInstance().apply {
      set(Calendar.DAY_OF_WEEK, weekday + 1)
      set(Calendar.HOUR_OF_DAY, hour)
      set(Calendar.MINUTE, minute)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }
    if (target.timeInMillis <= now.timeInMillis) {
      target.add(Calendar.WEEK_OF_YEAR, 1)
    }
    return target.timeInMillis
  }
}
