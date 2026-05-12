package com.remedero.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Calendar

object AlarmEventBus {
  var listener: ((String, String, Int) -> Unit)? = null

  fun emit(planId: String, scheduledTime: String, weekday: Int) {
    listener?.invoke(planId, scheduledTime, weekday)
  }
}

class AlarmManagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AlarmManagerModule")

    Events("onAlarmFired")

    OnStartObserving {
      AlarmEventBus.listener = { planId, scheduledTime, weekday ->
        sendEvent(
          "onAlarmFired",
          mapOf(
            "planId" to planId,
            "scheduledTime" to scheduledTime,
            "weekday" to weekday,
          ),
        )
      }
    }

    OnStopObserving {
      AlarmEventBus.listener = null
    }

    AsyncFunction("getAlarmSoundUri") {
      RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM).toString()
    }

    AsyncFunction("scheduleWeeklyAlarm") { planId: String, weekday: Int, hour: Int, minute: Int, retryIndex: Int, snoozeMinutes: Int, planName: String ->
      val context = appContext.reactContext ?: return@AsyncFunction null

      val retryOffsetMinutes = retryIndex * snoozeMinutes
      val totalMinutes = hour * 60 + minute + retryOffsetMinutes
      val effectiveHour = (totalMinutes / 60) % 24
      val effectiveMinute = totalMinutes % 60
      val effectiveWeekday = ((weekday + totalMinutes / 1440) % 7)

      val alarmId = if (retryIndex == 0) {
        val hhmm = String.format("%02d%02d", hour, minute)
        "alarm-$planId-$weekday-$hhmm"
      } else {
        val hhmm = String.format("%02d%02d", hour, minute)
        "alarm-$planId-$weekday-$hhmm-retry-$retryIndex"
      }

      val triggerTime = nextOccurrence(effectiveWeekday, effectiveHour, effectiveMinute)

      val intent = Intent(context, AlarmReceiver::class.java).apply {
        putExtra("planId", planId)
        putExtra("scheduledTime", String.format("%02d:%02d", hour, minute))
        putExtra("weekday", weekday)
        putExtra("hour", effectiveHour)
        putExtra("minute", effectiveMinute)
        putExtra("retryIndex", retryIndex)
        putExtra("snoozeMinutes", snoozeMinutes)
        putExtra("planName", planName)
      }

      val requestCode = alarmId.hashCode()
      val pendingIntent = PendingIntent.getBroadcast(
        context,
        requestCode,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )

      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
      } else {
        alarmManager.setAlarmClock(
          AlarmManager.AlarmClockInfo(triggerTime, pendingIntent),
          pendingIntent,
        )
      }

      val prefs = context.getSharedPreferences("remedero_plan_alarms", Context.MODE_PRIVATE)
      val key = "plan_alarms_$planId"
      val existing = prefs.getStringSet(key, mutableSetOf()) ?: mutableSetOf()
      val updated = LinkedHashSet(existing)
      updated.add(alarmId)
      prefs.edit().putStringSet(key, updated).apply()
    }

    AsyncFunction("cancelAlarm") { planId: String, weekday: Int, hhmm: String, retryIndex: Int ->
      val context = appContext.reactContext ?: return@AsyncFunction null

      val alarmId = if (retryIndex == 0) {
        "alarm-$planId-$weekday-$hhmm"
      } else {
        "alarm-$planId-$weekday-$hhmm-retry-$retryIndex"
      }

      cancelAlarmById(context, alarmId)
    }

    AsyncFunction("cancelAllAlarmsForPlan") { planId: String ->
      val context = appContext.reactContext ?: return@AsyncFunction null

      val prefs = context.getSharedPreferences("remedero_plan_alarms", Context.MODE_PRIVATE)
      val key = "plan_alarms_$planId"
      val alarmIds = prefs.getStringSet(key, emptySet()) ?: emptySet()

      alarmIds.forEach { alarmId -> cancelAlarmById(context, alarmId) }
      prefs.edit().remove(key).apply()
    }

    AsyncFunction("cancelAlarmsForSlot") { planId: String, weekday: Int, hhmm: String, maxRetryCount: Int ->
      val context = appContext.reactContext ?: return@AsyncFunction null

      cancelAlarmById(context, "alarm-$planId-$weekday-$hhmm")
      for (i in 1..maxRetryCount) {
        cancelAlarmById(context, "alarm-$planId-$weekday-$hhmm-retry-$i")
      }
    }

    AsyncFunction("getPendingAlarm") {
      val context = appContext.reactContext ?: return@AsyncFunction null null

      val prefs = context.getSharedPreferences("remedero_alarms", Context.MODE_PRIVATE)
      val hasPending = prefs.getBoolean("has_pending_alarm", false)

      if (!hasPending) {
        return@AsyncFunction null
      }

      val planId = prefs.getString("pending_planId", null) ?: return@AsyncFunction null
      val scheduledTime = prefs.getString("pending_scheduledTime", null) ?: return@AsyncFunction null
      val weekday = prefs.getInt("pending_weekday", -1)

      mapOf(
        "planId" to planId,
        "scheduledTime" to scheduledTime,
        "weekday" to weekday,
      )
    }

    AsyncFunction("clearPendingAlarm") {
      val context = appContext.reactContext ?: return@AsyncFunction null

      val prefs = context.getSharedPreferences("remedero_alarms", Context.MODE_PRIVATE)
      prefs.edit()
        .remove("has_pending_alarm")
        .remove("pending_planId")
        .remove("pending_scheduledTime")
        .remove("pending_weekday")
        .apply()
    }
  }

  private fun cancelAlarmById(context: Context, alarmId: String) {
    val intent = Intent(context, AlarmReceiver::class.java)
    val requestCode = alarmId.hashCode()
    val pendingIntent = PendingIntent.getBroadcast(
      context,
      requestCode,
      intent,
      PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE,
    )

    if (pendingIntent != null) {
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      alarmManager.cancel(pendingIntent)
      pendingIntent.cancel()
    }
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
