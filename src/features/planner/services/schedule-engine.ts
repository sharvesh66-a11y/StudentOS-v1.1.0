/**
 * StudentOS Planner — Schedule Engine
 *
 * A pure function that takes raw plan data + constraints and produces a
 * time-tabled schedule. No Firestore, no React — pure logic.
 *
 * The engine:
 * 1. Iterates over each available day in the date range
 * 2. For each day, distributes study topics across the available time
 * 3. Inserts breaks at the specified frequency
 * 4. Balances subjects intelligently (rotates subjects to prevent overload)
 * 5. Schedules harder topics earlier in the day (when energy is higher)
 * 6. Includes revision sessions based on priority
 *
 * @see src/features/planner/types.ts — ScheduleEngineInput, ScheduleEngineOutput
 */

import type { ScheduleEngineInput, ScheduleEngineOutput } from '../types';

/** Parse a time string (HH:mm) into minutes since midnight. */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Format minutes since midnight into HH:mm. */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** Format a Date object to ISO date string (yyyy-mm-dd). */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate a schedule from the input constraints + topics.
 *
 * @returns ScheduleEngineOutput — a list of sessions + totals
 */
export function generateSchedule(input: ScheduleEngineInput): ScheduleEngineOutput {
  const {
    startDate,
    endDate,
    dailyAvailableMinutes,
    preferredStartTime,
    preferredEndTime,
    breakFrequencyMinutes,
    breakDurationMinutes,
    topics,
    availableDays,
  } = input;

  const sessions: ScheduleEngineOutput['sessions'] = [];
  let totalMinutes = 0;

  // Sort topics by priority (1=highest), then by difficulty (hard first)
  const sortedTopics = [...topics].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });

  // Parse start/end times
  const dayStart = timeToMinutes(preferredStartTime);
  const dayEnd = timeToMinutes(preferredEndTime);
  const maxDayMinutes = dayEnd - dayStart;
  const effectiveDailyMinutes = Math.min(dailyAvailableMinutes, maxDayMinutes);

  // Iterate over each day in the range
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const topicQueue = [...sortedTopics];
  let subjectRotation = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();

    // Skip days that aren't available
    if (!availableDays.includes(dayOfWeek)) continue;

    const dateStr = formatDate(d);
    let remainingMinutes = effectiveDailyMinutes;
    let currentTime = dayStart;
    let minutesSinceBreak = 0;

    // Schedule sessions for this day
    while (remainingMinutes > 0 && topicQueue.length > 0) {
      // Check if we need a break
      if (minutesSinceBreak >= breakFrequencyMinutes && remainingMinutes > breakDurationMinutes) {
        sessions.push({
          title: 'Break',
          subject: 'Break',
          topic: 'Take a break',
          date: dateStr,
          startTime: minutesToTime(currentTime),
          endTime: minutesToTime(currentTime + breakDurationMinutes),
          durationMinutes: breakDurationMinutes,
          difficulty: 'easy',
          isRevision: false,
          isBreak: true,
        });
        currentTime += breakDurationMinutes;
        remainingMinutes -= breakDurationMinutes;
        minutesSinceBreak = 0;
        continue;
      }

      // Get the next topic — rotate subjects to balance
      let topicIndex = topicQueue.findIndex((t, i) => i >= subjectRotation % topicQueue.length);
      if (topicIndex === -1) topicIndex = 0;
      const topic = topicQueue[topicIndex];
      subjectRotation++;

      // Determine session length (max 90 min per session, min 25 min)
      const maxSessionLength = Math.min(90, remainingMinutes, topic.estimatedMinutes);
      const minSessionLength = 25;
      const sessionLength = Math.max(
        minSessionLength,
        Math.min(maxSessionLength, topic.estimatedMinutes),
      );

      if (sessionLength > remainingMinutes) break;

      // Create the session
      sessions.push({
        title: `${topic.topic}${topic.isRevision ? ' (Revision)' : ''}`,
        subject: topic.subject,
        topic: topic.topic,
        date: dateStr,
        startTime: minutesToTime(currentTime),
        endTime: minutesToTime(currentTime + sessionLength),
        durationMinutes: sessionLength,
        difficulty: topic.difficulty,
        isRevision: topic.isRevision,
        isBreak: false,
      });

      currentTime += sessionLength;
      remainingMinutes -= sessionLength;
      minutesSinceBreak += sessionLength;
      totalMinutes += sessionLength;

      // Reduce the topic's remaining estimated minutes
      topic.estimatedMinutes -= sessionLength;
      if (topic.estimatedMinutes <= 0) {
        topicQueue.splice(topicIndex, 1);
      }
    }
  }

  return {
    sessions,
    totalMinutes,
    sessionCount: sessions.filter((s) => !s.isBreak).length,
  };
}
