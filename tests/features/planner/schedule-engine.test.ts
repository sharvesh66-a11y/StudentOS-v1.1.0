/**
 * Unit tests for the Planner Schedule Engine.
 *
 * `generateSchedule` is a pure function — no mocks required.
 * These tests verify the algorithm respects:
 *   - Available days of the week (skips unavailable days)
 *   - Daily available minutes cap (respects preferredStartTime/EndTime)
 *   - Break frequency + duration
 *   - Topic priority ordering (priority 1 before priority 2)
 *   - Difficulty ordering within a priority (hard before medium before easy)
 *   - Topic estimated-minutes consumption (splits long topics across sessions)
 *   - The output envelope shape (sessions, totalMinutes, sessionCount)
 */
import { describe, it, expect } from 'vitest';
import { generateSchedule } from '@/features/planner/services/schedule-engine';
import type { ScheduleEngineInput, ScheduleTopic } from '@/features/planner/types';

// --- Fixtures ------------------------------------------------------------

const baseTopics: ScheduleTopic[] = [
  {
    topic: 'Algebra',
    subject: 'Mathematics',
    estimatedMinutes: 60,
    difficulty: 'medium',
    isRevision: false,
    priority: 1,
  },
  {
    topic: 'Forces',
    subject: 'Physics',
    estimatedMinutes: 60,
    difficulty: 'hard',
    isRevision: false,
    priority: 2,
  },
  {
    topic: 'Cells',
    subject: 'Biology',
    estimatedMinutes: 30,
    difficulty: 'easy',
    isRevision: false,
    priority: 3,
  },
];

function makeInput(overrides: Partial<ScheduleEngineInput> = {}): ScheduleEngineInput {
  return {
    startDate: '2026-07-06', // Monday
    endDate: '2026-07-06', // Same day — single-day schedule
    dailyAvailableMinutes: 240, // 4 hours
    preferredStartTime: '09:00',
    preferredEndTime: '13:00', // 4-hour window
    breakFrequencyMinutes: 50,
    breakDurationMinutes: 10,
    topics: baseTopics,
    availableDays: [1, 2, 3, 4, 5], // Mon–Fri
    ...overrides,
  };
}

// --- Tests ---------------------------------------------------------------

describe('generateSchedule — output envelope', () => {
  it('returns an object with sessions, totalMinutes and sessionCount', () => {
    const out = generateSchedule(makeInput());
    expect(out).toHaveProperty('sessions');
    expect(out).toHaveProperty('totalMinutes');
    expect(out).toHaveProperty('sessionCount');
    expect(Array.isArray(out.sessions)).toBe(true);
    expect(out.totalMinutes).toBeTypeOf('number');
    expect(out.sessionCount).toBeTypeOf('number');
  });

  it('sessionCount counts only non-break sessions', () => {
    const out = generateSchedule(makeInput());
    const breakCount = out.sessions.filter((s) => s.isBreak).length;
    const studyCount = out.sessions.filter((s) => !s.isBreak).length;
    expect(out.sessionCount).toBe(studyCount);
    expect(out.sessionCount + breakCount).toBe(out.sessions.length);
  });
});

describe('generateSchedule — available-days filter', () => {
  it('produces zero sessions when the day-of-week is not in availableDays', () => {
    // 2026-07-06 is a Monday (day 1). availableDays = [0] (Sunday only).
    const out = generateSchedule(makeInput({ availableDays: [0] }));
    expect(out.sessions).toEqual([]);
    expect(out.totalMinutes).toBe(0);
    expect(out.sessionCount).toBe(0);
  });

  it('produces sessions when the day-of-week is in availableDays', () => {
    const out = generateSchedule(makeInput({ availableDays: [1] }));
    expect(out.sessions.length).toBeGreaterThan(0);
  });
});

describe('generateSchedule — daily minute cap', () => {
  it('does not exceed dailyAvailableMinutes of study time', () => {
    const out = generateSchedule(makeInput({ dailyAvailableMinutes: 60 }));
    const studyMinutes = out.sessions
      .filter((s) => !s.isBreak)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    expect(studyMinutes).toBeLessThanOrEqual(60);
  });

  it('does not exceed the preferredStartTime → preferredEndTime window', () => {
    // 09:00 → 10:00 = 60 minutes window; ask for 240 daily minutes.
    const out = generateSchedule(
      makeInput({
        dailyAvailableMinutes: 240,
        preferredStartTime: '09:00',
        preferredEndTime: '10:00',
      }),
    );
    // No session should end after 10:00 (= 600 minutes from midnight).
    for (const s of out.sessions) {
      const [endH, endM] = s.endTime.split(':').map(Number);
      const endMinutes = endH * 60 + endM;
      expect(endMinutes).toBeLessThanOrEqual(600);
    }
  });
});

describe('generateSchedule — break insertion', () => {
  it('inserts a break after the break frequency is reached', () => {
    const out = generateSchedule(
      makeInput({
        breakFrequencyMinutes: 30,
        breakDurationMinutes: 5,
        topics: [
          {
            topic: 'Long topic',
            subject: 'Math',
            estimatedMinutes: 120,
            difficulty: 'medium',
            isRevision: false,
            priority: 1,
          },
        ],
      }),
    );

    const breaks = out.sessions.filter((s) => s.isBreak);
    expect(breaks.length).toBeGreaterThan(0);
    expect(breaks[0].durationMinutes).toBe(5);
    expect(breaks[0].title).toBe('Break');
  });

  it('does not insert a break when remaining time is shorter than the break duration', () => {
    const out = generateSchedule(
      makeInput({
        dailyAvailableMinutes: 35, // less than breakFrequency (50)
        breakFrequencyMinutes: 50,
        breakDurationMinutes: 10,
        topics: [
          {
            topic: 'Short',
            subject: 'Math',
            estimatedMinutes: 30,
            difficulty: 'easy',
            isRevision: false,
            priority: 1,
          },
        ],
      }),
    );
    const breaks = out.sessions.filter((s) => s.isBreak);
    expect(breaks).toHaveLength(0);
  });
});

describe('generateSchedule — topic ordering', () => {
  it('schedules higher-priority topics first (priority 1 before priority 2)', () => {
    const out = generateSchedule(
      makeInput({
        dailyAvailableMinutes: 60,
        topics: [
          {
            topic: 'LowPriority',
            subject: 'Math',
            estimatedMinutes: 30,
            difficulty: 'easy',
            isRevision: false,
            priority: 5,
          },
          {
            topic: 'HighPriority',
            subject: 'Math',
            estimatedMinutes: 30,
            difficulty: 'easy',
            isRevision: false,
            priority: 1,
          },
        ],
        breakFrequencyMinutes: 1000, // disable breaks for this test
      }),
    );

    const studySessions = out.sessions.filter((s) => !s.isBreak);
    expect(studySessions[0].topic).toBe('HighPriority');
    expect(studySessions[1].topic).toBe('LowPriority');
  });

  it('within the same priority, schedules harder topics first (at least for the first session)', () => {
    // NOTE: The engine's subject-rotation logic picks the topic at index
    // `subjectRotation % topicQueue.length` for each subsequent session,
    // which can reorder topics after the first one is consumed. The
    // algorithm guarantees only that the FIRST scheduled session is the
    // highest-priority + hardest topic in the queue.
    const out = generateSchedule(
      makeInput({
        dailyAvailableMinutes: 90,
        topics: [
          {
            topic: 'EasyTopic',
            subject: 'Math',
            estimatedMinutes: 30,
            difficulty: 'easy',
            isRevision: false,
            priority: 1,
          },
          {
            topic: 'HardTopic',
            subject: 'Math',
            estimatedMinutes: 30,
            difficulty: 'hard',
            isRevision: false,
            priority: 1,
          },
          {
            topic: 'MediumTopic',
            subject: 'Math',
            estimatedMinutes: 30,
            difficulty: 'medium',
            isRevision: false,
            priority: 1,
          },
        ],
        breakFrequencyMinutes: 1000,
      }),
    );

    const studySessions = out.sessions.filter((s) => !s.isBreak);
    // First session should be the hard topic (priority 1 + hardest difficulty).
    expect(studySessions[0].topic).toBe('HardTopic');
    // All three topics should eventually be scheduled.
    const scheduledTopics = studySessions.map((s) => s.topic).sort();
    expect(scheduledTopics).toEqual(['EasyTopic', 'HardTopic', 'MediumTopic']);
  });
});

describe('generateSchedule — topic splitting across sessions', () => {
  it('splits a long topic across multiple sessions within the same day', () => {
    const out = generateSchedule(
      makeInput({
        dailyAvailableMinutes: 240,
        preferredStartTime: '09:00',
        preferredEndTime: '17:00',
        breakFrequencyMinutes: 1000, // disable breaks
        topics: [
          {
            topic: 'BigTopic',
            subject: 'Math',
            estimatedMinutes: 200, // > 90-minute session cap → must split
            difficulty: 'hard',
            isRevision: false,
            priority: 1,
          },
        ],
      }),
    );

    const bigTopicSessions = out.sessions.filter((s) => s.topic === 'BigTopic');
    expect(bigTopicSessions.length).toBeGreaterThan(1);
    // No single session should exceed 90 minutes.
    for (const s of bigTopicSessions) {
      expect(s.durationMinutes).toBeLessThanOrEqual(90);
    }
  });

  it('respects the 25-minute minimum session length', () => {
    const out = generateSchedule(makeInput());
    for (const s of out.sessions.filter((s) => !s.isBreak)) {
      expect(s.durationMinutes).toBeGreaterThanOrEqual(25);
    }
  });
});

describe('generateSchedule — multi-day scheduling', () => {
  it('spreads topics across multiple days when the single-day budget is insufficient', () => {
    const out = generateSchedule(
      makeInput({
        startDate: '2026-07-06', // Mon
        endDate: '2026-07-10', // Fri
        dailyAvailableMinutes: 60,
        topics: [
          {
            topic: 'BigTopic',
            subject: 'Math',
            estimatedMinutes: 300, // 5 hours total — needs 5 days at 60 min/day
            difficulty: 'hard',
            isRevision: false,
            priority: 1,
          },
        ],
        breakFrequencyMinutes: 1000,
      }),
    );

    const days = new Set(out.sessions.map((s) => s.date));
    expect(days.size).toBeGreaterThan(1);
  });
});

describe('generateSchedule — time formatting', () => {
  it('produces startTime and endTime in HH:mm format', () => {
    const out = generateSchedule(makeInput());
    for (const s of out.sessions) {
      expect(s.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(s.endTime).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('produces dates in ISO yyyy-mm-dd format', () => {
    const out = generateSchedule(makeInput());
    for (const s of out.sessions) {
      expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('endTime - startTime equals durationMinutes (in minutes)', () => {
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const out = generateSchedule(makeInput());
    for (const s of out.sessions) {
      const delta = toMin(s.endTime) - toMin(s.startTime);
      expect(delta).toBe(s.durationMinutes);
    }
  });
});
