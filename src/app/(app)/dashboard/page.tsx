'use client';

/**
 * StudentOS Dashboard Page (v1.1 redesign)
 *
 * Premium dashboard with 10 cards inspired by Notion, Linear, Vercel,
 * Raycast, and Cursor AI. Responsive grid layout.
 *
 * Cards:
 *   1. Welcome Header (full width)
 *   2. Study Progress
 *   3. Today's Tasks
 *   4. Upcoming Exams
 *   5. Recent Notes
 *   6. AI Teacher (Junova AI preview)
 *   7. Study Planner
 *   8. Revision Timer (Pomodoro)
 *   9. Exam Countdown
 *  10. Achievements
 *  11. Quick Actions (full width)
 *
 * Protected by <ProtectedRoute>.
 */

import { motion, type Variants } from 'framer-motion';
import { ProtectedRoute } from '@/features/auth';
import {
  WelcomeHeader,
  UserProfileCard,
  TodayOverview,
  TodaysTasks,
  QuickActions,
  RecentActivity,
  UpcomingExams,
  NotesPreview,
  StudyProgress,
  AIAssistantPreview,
  RevisionTimer,
  ExamCountdown,
  Achievements,
} from '@/features/dashboard';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function DashboardContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Welcome header — full width */}
      <motion.div initial="hidden" animate="visible" variants={cardVariants}>
        <WelcomeHeader />
      </motion.div>

      {/* Row 1: Profile + Today Overview + Study Progress */}
      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        <motion.div
          className="lg:col-span-3"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <UserProfileCard />
        </motion.div>
        <motion.div
          className="lg:col-span-6"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.05 }}
        >
          <TodayOverview />
        </motion.div>
        <motion.div
          className="lg:col-span-3"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.1 }}
        >
          <StudyProgress />
        </motion.div>
      </div>

      {/* Row 2: Today's Tasks + Upcoming Exams + Exam Countdown */}
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <motion.div
          className="lg:col-span-4"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <TodaysTasks />
        </motion.div>
        <motion.div
          className="lg:col-span-4"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.05 }}
        >
          <UpcomingExams />
        </motion.div>
        <motion.div
          className="lg:col-span-4"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.1 }}
        >
          <ExamCountdown />
        </motion.div>
      </div>

      {/* Row 3: Quick Actions — full width */}
      <motion.div className="mt-4" initial="hidden" animate="visible" variants={cardVariants}>
        <QuickActions />
      </motion.div>

      {/* Row 4: AI Teacher + Revision Timer + Achievements */}
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <motion.div
          className="lg:col-span-4"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <AIAssistantPreview />
        </motion.div>
        <motion.div
          className="lg:col-span-4"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.05 }}
        >
          <RevisionTimer />
        </motion.div>
        <motion.div
          className="lg:col-span-4"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.1 }}
        >
          <Achievements />
        </motion.div>
      </div>

      {/* Row 5: Recent Notes + Recent Activity */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <motion.div initial="hidden" animate="visible" variants={cardVariants}>
          <NotesPreview />
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.05 }}
        >
          <RecentActivity />
        </motion.div>
      </div>

      {/* Footer spacer */}
      <div className="h-8" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
