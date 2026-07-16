# StudentOS — DATABASE

**Version:** 1.0.0 — Production-Ready (2026-07-13)

> **Status:** All 60+ Firestore collections are wired up to security rules in
> `firestore.rules` (392 lines). Composite indexes are declared in
> `firestore.indexes.json`. Storage rules are in `storage.rules`. Connect a
> real Firebase project by filling in `.env.local` (see
> `docs/DEPLOYMENT.md`).

---

## 1. Database Choice

**Cloud Firestore** (Native mode) is the production database.

### Why Firestore?

- **Real-time by default** — perfect for Junova AI streaming chat, live quiz
  progress, study-group realtime chat, and community feed.
- **Serverless & autoscaling** — no capacity planning required through millions
  of users.
- **Offline persistence** — students can keep working without internet (critical
  for mobile / low-connectivity scenarios).
- **Per-document security rules** — fine-grained access control enforced at the
  database layer, not just the application layer.
- **Composite indexes** — efficient querying at scale.

### Why NOT a SQL database?

- Schema evolves rapidly during early startup phase — Firestore's flexible
  document model fits better than migrations.
- Real-time listeners are first-class, not an afterthought.
- No ops burden — Firebase manages everything.

### Prisma (local dev only)

The repo includes Prisma + SQLite for **local experimentation and seeding**
during development. **It is NOT used in production.** Think of it as a scratch
DB. All production data flows through Firestore.

---

## 2. Collections (60+)

All collection paths are defined as constants in
`src/firebase/constants.ts` (`COLLECTIONS.*`). **Never hardcode collection
strings** — import from `COLLECTIONS`. The `firestore.rules` file mirrors
these names exactly.

Collections are organized by feature module below. Each table shows the doc
ID strategy, key fields, and the security-rule pattern.

### Security-rule patterns (3 patterns from `firestore.rules`)

| Pattern      | Rule                                                                                                                                                    | Used for                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Owner-scoped | `allow read, write: if ownsResource();` (where `ownsResource()` checks `request.auth.uid == resource.data.uid`)                                         | Most user-private collections                           |
| Public-feed  | `allow read: if isSignedIn(); allow create: if isSignedIn() && request.resource.data.uid == request.auth.uid; allow update, delete: if ownsResource();` | Community posts, comments, study groups, freelance jobs |
| Library      | `allow read: if isSignedIn(); allow write: if isAdmin();`                                                                                               | `career_profiles`, `scholarships`, `communities`        |

---

### 2.1 System collections (8)

| Collection           | Doc ID | Key fields                                                                    | Rule pattern                     |
| -------------------- | ------ | ----------------------------------------------------------------------------- | -------------------------------- |
| `users`              | uid    | email, displayName, photoURL, role, level, xp, streak, lastLogin              | Owner-scoped (`ownsDoc(userId)`) |
| `user_settings`      | uid    | accentColor, density, animations, notification prefs, AI prefs, accessibility | Owner-scoped                     |
| `subscriptions`      | uid    | tier (`free` / `pro` / `premium`), status, startedAt, renewsAt                | Owner-scoped                     |
| `tool_usage`         | auto   | uid, toolType, date, count, monthlyCount                                      | Owner-scoped                     |
| `user_preferences`   | uid    | dashboard layout, default views, sidebar collapsed                            | Owner-scoped                     |
| `user_notifications` | auto   | uid, type, title, body, read, createdAt                                       | Owner-scoped                     |
| `user_privacy`       | uid    | profileVisibility, showXP, showStreak, dataSharing                            | Owner-scoped                     |
| `user_devices`       | auto   | uid, deviceName, lastSeen, platform                                           | Owner-scoped                     |

### 2.2 Junova AI collections (6 + 1 subcollection)

| Collection                                           | Doc ID | Key fields                                                                                                                 | Rule pattern                  |
| ---------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `junova_teachers`                                    | auto   | uid, name, subject, preset, teachingStyle, dna (11 traits), avatarURL                                                      | Owner-scoped                  |
| `junova_conversations`                               | auto   | uid, teacherId, title, lastMessagePreview, messageCount, pinned                                                            | Owner-scoped                  |
| `junova_conversations/{id}/messages` (subcollection) | auto   | role, content, attachments, suggestions, isStreaming                                                                       | Owner-scoped (parent-checked) |
| `junova_memory`                                      | uid    | displayName, grade, learningStyle, weakTopics, strongTopics, examGoals, recentTopics, revisionHistory, conversationSummary | Owner-scoped                  |
| `junova_recommendations`                             | uid    | nextChapter, revisionTopics, dailyGoals, studyPath, examReadinessScore, recommendedTeacherId, motivationalInsight          | Owner-scoped                  |
| `junova_voice_preferences`                           | uid    | enabled, voiceURI, rate, pitch, volume, language, autoSpeak                                                                | Owner-scoped                  |
| `junova_live_sessions`                               | uid    | avatarStyle, expressionIntensity, animationSpeed, fullscreenMode, whiteboardEnabled, eyeContactEnabled, gesturesEnabled    | Owner-scoped                  |

#### Teacher DNA sub-document (`junova_teachers.dna`)

| Trait              | Type        | Range                              |
| ------------------ | ----------- | ---------------------------------- |
| `friendliness`     | number      | 0–100                              |
| `strictness`       | number      | 0–100                              |
| `humor`            | number      | 0–100                              |
| `explanationDepth` | number      | 0–100                              |
| `patience`         | number      | 0–100                              |
| `motivation`       | number      | 0–100                              |
| `emojiUsage`       | number      | 0–100                              |
| `storytelling`     | number      | 0–100                              |
| `realLifeExamples` | number      | 0–100                              |
| `examFocused`      | boolean     | —                                  |
| `difficulty`       | string enum | beginner / intermediate / advanced |

### 2.3 Exam Center collections (6)

| Collection          | Doc ID | Key fields                                                                               | Rule pattern |
| ------------------- | ------ | ---------------------------------------------------------------------------------------- | ------------ |
| `exam_quizzes`      | auto   | uid, title, subject, difficulty, questionCount, sourceNoteId, questions (embedded array) | Owner-scoped |
| `quiz_attempts`     | auto   | uid, quizId, score, startedAt, completedAt, answers                                      | Owner-scoped |
| `question_bank`     | auto   | uid, subject, topic, type, question, options, correctAnswer, explanation                 | Owner-scoped |
| `practice_sessions` | auto   | uid, subject, mode, startedAt, completedAt, score                                        | Owner-scoped |
| `mistake_analysis`  | uid    | uid, weakTopics, commonMistakes, subjectStats                                            | Owner-scoped |
| `daily_practice`    | uid    | uid, date, questionsAnswered, correctCount, streak                                       | Owner-scoped |

### 2.4 Notes Hub collections (3)

| Collection      | Doc ID | Key fields                                                                                     | Rule pattern |
| --------------- | ------ | ---------------------------------------------------------------------------------------------- | ------------ |
| `notes`         | auto   | uid, title, content (markdown), folderId, tags, aiSummary, isPinned, isFavourite, isBookmarked | Owner-scoped |
| `note_folders`  | auto   | uid, name, parentId (nesting), createdAt                                                       | Owner-scoped |
| `doubt_history` | auto   | uid, subject, topic, question, answer, askedAt                                                 | Owner-scoped |

### 2.5 Planner collections (6)

| Collection       | Doc ID | Key fields                                                                                                                                      | Rule pattern                                  |
| ---------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `study_plans`    | auto   | uid, title, type (daily/weekly/monthly/custom), startDate, endDate, subjects, difficulty, aiGenerated, isActive, totalMinutes, completedMinutes | Owner-scoped                                  |
| `study_sessions` | auto   | uid, planId, title, subject, topic, date, startTime, endTime, durationMinutes, status, difficulty, isRevision, isBreak, focusModeUsed           | Owner-scoped                                  |
| `reminders`      | auto   | uid, title, message, type, scheduledAt, dismissed, completed, sessionId                                                                         | Owner-scoped                                  |
| `goals`          | auto   | uid, title, description, type, status, progress, target, subject, targetDate, aiSuggested, milestones[]                                         | Owner-scoped                                  |
| `revisions`      | auto   | uid, topic, subject, lastReviewed, nextReviewDate, intervalDays, reviewCount, confidence                                                        | Owner-scoped                                  |
| `plans`          | auto   | uid, title, startDate, endDate, aiGenerated                                                                                                     | Owner-scoped (dead-code path; see note below) |

> **Note on `plans`:** Sprint 4.6 introduced `study_plans` as the canonical
> planner collection. The `plans` constant remains in `constants.ts` for the
> unused `planItems(planId)` subcollection helper. No application code writes
> to `plans` directly.

### 2.6 Study Groups collections (6)

| Collection            | Doc ID | Key fields                                                                                            | Rule pattern |
| --------------------- | ------ | ----------------------------------------------------------------------------------------------------- | ------------ |
| `study_groups`        | auto   | name, description, subject, classLevel, language, maxMembers, memberCount, ownerId, isPrivate, tags[] | Public-feed  |
| `group_members`       | auto   | groupId, uid, role (owner/admin/member), joinedAt                                                     | Public-feed  |
| `group_messages`      | auto   | groupId, uid, content, type (text/image/file/reply), replyTo, editedAt, reactions                     | Public-feed  |
| `group_sessions`      | auto   | groupId, title, scheduledAt, durationMinutes, hostUid, attendees[]                                    | Public-feed  |
| `group_files`         | auto   | groupId, uid, filename, url, size, contentType, uploadedAt                                            | Public-feed  |
| `group_notifications` | auto   | uid, groupId, type, title, body, read, createdAt                                                      | Owner-scoped |

### 2.7 Career Planner collections (6)

| Collection               | Doc ID | Key fields                                                                | Rule pattern |
| ------------------------ | ------ | ------------------------------------------------------------------------- | ------------ |
| `career_profiles`        | slug   | title, description, skills[], typicalPath, salaryRange, growthOutlook     | Library      |
| `career_goals`           | auto   | uid, title, description, type, status, progress, targetDate, milestones[] | Owner-scoped |
| `career_progress`        | uid    | uid, completedMilestones[], skillsImproved[], timeline[]                  | Owner-scoped |
| `career_recommendations` | uid    | uid, recommendedPaths[], skillGaps[], suggestedProjects[], generatedAt    | Owner-scoped |
| `career_skills`          | auto   | uid, skillName, category, currentLevel, targetLevel, evidence[]           | Owner-scoped |
| `career_colleges`        | auto   | uid, name, country, program, fees, deadline, exams[], status              | Owner-scoped |

### 2.8 Scholarship Finder collections (5)

| Collection                    | Doc ID | Key fields                                                                                | Rule pattern |
| ----------------------------- | ------ | ----------------------------------------------------------------------------------------- | ------------ |
| `scholarships`                | auto   | name, provider, amount, deadline, eligibility[], country, level, fields[]                 | Library      |
| `student_scholarships`        | auto   | uid, scholarshipId, status (saved/applied/in-progress/awarded/rejected), appliedAt, notes | Owner-scoped |
| `scholarship_profiles`        | uid    | uid, gpa, grade, country, course, skills[], achievements[], income                        | Owner-scoped |
| `scholarship_recommendations` | uid    | uid, recommended[], matchScores{}, generatedAt                                            | Owner-scoped |
| `scholarship_notifications`   | auto   | uid, scholarshipId, type (deadline/status), title, body, read                             | Owner-scoped |

### 2.9 Student Freelancing collections (8)

| Collection           | Doc ID | Key fields                                                                 | Rule pattern |
| -------------------- | ------ | -------------------------------------------------------------------------- | ------------ |
| `freelance_profiles` | uid    | uid, title, bio, skills[], hourlyRate, availability, rating                | Owner-scoped |
| `freelance_jobs`     | auto   | title, description, postedBy, category, budget, skills[], deadline, status | Public-feed  |
| `job_applications`   | auto   | uid, jobId, coverLetter, proposedBudget, estimatedDays, status             | Owner-scoped |
| `freelance_projects` | auto   | uid, jobId, title, status, startedAt, completedAt, milestones[]            | Owner-scoped |
| `freelance_messages` | auto   | projectId, fromUid, toUid, content, read, sentAt                           | Owner-scoped |
| `portfolios`         | auto   | uid, title, description, skills[], links[], images[]                       | Owner-scoped |
| `reviews`            | auto   | reviewerUid, reviewedUid, projectId, rating, comment, createdAt            | Owner-scoped |
| `earnings`           | auto   | uid, projectId, amount, status, paidAt                                     | Owner-scoped |

### 2.10 Student Community collections (8)

| Collection                | Doc ID | Key fields                                                                                                              | Rule pattern                   |
| ------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `community_posts`         | auto   | uid, authorName, authorAvatar, content, type (text/image/ai), tags[], reactions{}, commentCount, pinned, bookmarkedBy[] | Public-feed                    |
| `community_comments`      | auto   | postId, uid, content, parentCommentId, createdAt                                                                        | Public-feed                    |
| `communities`             | auto   | name, description, subject, ownerId, memberCount, isPrivate                                                             | Library (creator-scoped write) |
| `community_members`       | auto   | communityId, uid, role, joinedAt                                                                                        | Public-feed                    |
| `community_notifications` | auto   | uid, type, title, body, read, createdAt                                                                                 | Owner-scoped                   |
| `community_reports`       | auto   | reporterUid, targetId, targetType, reason, status, createdAt                                                            | Owner-scoped                   |
| `community_profiles`      | uid    | uid, displayName, bio, followersCount, followingCount, postsCount                                                       | Owner-scoped                   |
| `community_followers`     | auto   | followerUid, followingUid, createdAt                                                                                    | Public-feed                    |

### 2.11 Analytics & Gamification collections (5)

| Collection           | Doc ID | Key fields                                                                           | Rule pattern |
| -------------------- | ------ | ------------------------------------------------------------------------------------ | ------------ |
| `analytics`          | uid    | uid, date, studyMinutes, xpEarned, quizzesCompleted, notesCreated, subjectsStudied[] | Owner-scoped |
| `xp_history`         | auto   | uid, amount, source (quiz/note/streak/etc.), description, createdAt                  | Owner-scoped |
| `daily_streak`       | uid    | uid, current, longest, lastActiveDate, freezesLeft                                   | Owner-scoped |
| `challenges`         | auto   | uid (assigned-to), title, description, xpReward, progress, completedAt, expiresAt    | Owner-scoped |
| `badges`             | auto   | uid, badgeId, unlockedAt                                                             | Owner-scoped |
| `achievements`       | auto   | uid, achievementId, unlockedAt                                                       | Owner-scoped |
| `progress_snapshots` | auto   | uid, date, studyMinutes, xpEarned, quizzesCompleted, notesCreated, subjectsStudied[] | Owner-scoped |

### 2.12 Roles (string constants, not a collection)

Defined in `src/firebase/constants.ts` as `USER_ROLES`:

| Role    | String value | Notes                                 |
| ------- | ------------ | ------------------------------------- |
| Student | `'student'`  | Default role on sign-up               |
| Teacher | `'teacher'`  | Future — for educator dashboards      |
| Admin   | `'admin'`    | Library collection writes, moderation |

---

## 3. Indexes (declared in `firestore.indexes.json`)

Composite indexes are declared in **`firestore.indexes.json`** (project root).
They deploy automatically with `firebase deploy --only firestore:indexes`.

| Collection             | Indexed Fields                                | Use Case                           |
| ---------------------- | --------------------------------------------- | ---------------------------------- |
| `junova_conversations` | `uid` ASC + `updatedAt` DESC                  | Sidebar: list user's recent chats  |
| `junova_memory`        | `uid` ASC + `lastAccessedAt` DESC             | Memory retrieval ranked by recency |
| `notes`                | `uid` ASC + `folderId` ASC + `updatedAt` DESC | Folder view: notes within folder   |
| `notes`                | `uid` ASC + `updatedAt` DESC                  | All-notes view (recent first)      |
| `study_plans`          | `uid` ASC + `startDate` DESC                  | Planner: list user's plans         |
| `exam_quizzes`         | `uid` ASC + `createdAt` DESC                  | Quiz list (recent first)           |
| `quiz_attempts`        | `uid` ASC + `quizId` ASC + `completedAt` DESC | Per-quiz attempt history           |
| `quiz_attempts`        | `uid` ASC + `completedAt` DESC                | All-attempts view                  |
| `progress_snapshots`   | `uid` ASC + `date` DESC                       | Progress chart: most recent first  |
| `achievements`         | `uid` ASC + `unlockedAt` DESC                 | Achievement list (newest first)    |
| `community_posts`      | `createdAt` DESC                              | Community feed (recent first)      |
| `freelance_jobs`       | `createdAt` DESC                              | Job marketplace (recent first)     |
| `scholarships`         | `deadline` ASC                                | Scholarship deadline reminders     |

---

## 4. Security Rules

**Principle:** Users can ONLY read/write their own data. Cross-user reads are
denied at the database layer. Public-feed collections allow signed-in reads
but only owner-scoped writes. Library collections allow signed-in reads but
admin-only writes.

Rules are committed at **`firestore.rules`** (project root) and deploy with
`firebase deploy --only firestore:rules`. Storage rules live at
**`storage.rules`**.

### Helper functions

```javascript
function isSignedIn()   { return request.auth != null; }
function ownsDoc(uid)   { return isSignedIn() && request.auth.uid == uid; }
function ownsResource() { return isSignedIn() && request.auth.uid == resource.data.uid; }
function isAdmin()      { return isSignedIn()
                          && exists(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'; }
```

### Rule patterns

```javascript
// Owner-scoped (most collections)
match /junova_teachers/{teacherId} {
  allow read, write: if ownsResource();
}

// Public-feed (community posts, study groups, freelance jobs)
match /community_posts/{postId} {
  allow read: if isSignedIn();
  allow create: if isSignedIn() && request.resource.data.uid == request.auth.uid;
  allow update, delete: if ownsResource();
}

// Library (career_profiles, scholarships, communities)
match /scholarships/{scholarshipId} {
  allow read: if isSignedIn();
  allow write: if isAdmin();
}

// Default deny
match /{document=**} { allow read, write: if false; }
```

### Subcollection rule (`junova_conversations/{id}/messages`)

The messages subcollection checks ownership of the **parent** conversation,
not the message doc itself:

```javascript
match /junova_conversations/{conversationId} {
  allow read, write: if ownsResource();
  match /messages/{messageId} {
    allow read: if isSignedIn()
      && request.auth.uid == get(/databases/$(database)/documents/junova_conversations/$(conversationId)).data.uid;
    allow create: if isSignedIn()
      && request.auth.uid == get(/databases/$(database)/documents/junova_conversations/$(conversationId)).data.uid
      && request.resource.data.uid == request.auth.uid;
  }
}
```

### Storage rules (`storage.rules`)

- Max file size: **10 MB**
- Allowed types: images (`image/.*`), PDF, plain text, markdown
- User-scoped path: `users/{uid}/*` — owner-only (read + write)
- Public path: `public/*` — readable by anyone, admin-writable only (via
  Admin SDK)
- Default deny

---

## 5. Storage Paths

```
users/{uid}/avatar                              # Profile pictures
users/{uid}/notes/{noteId}/{filename}           # Note attachments
users/{uid}/quizzes/{quizId}/{filename}         # Quiz media
users/{uid}/groups/{groupId}/{filename}         # Group file shares
users/{uid}/community/{postId}/{filename}       # Community post images
users/{uid}/freelance/{portfolioId}/{filename}  # Portfolio images
users/{uid}/teachers/{teacherId}/avatar         # AI Teacher avatars
public/{...}                                    # Public marketing assets (admin-only writes)
```

Storage path helpers live in `src/firebase/constants.ts` (`STORAGE_PATHS.*`)
and the upload/download primitives live in `src/firebase/storage-helpers.ts`.

---

## 6. Firebase SDK Configuration

```
src/firebase/
├── config.ts            # Pure config object from NEXT_PUBLIC_* env vars
├── app.ts               # initializeApp + getApps() HMR-safe guard
├── auth.ts              # getAuth(app) + emulator wiring
├── firestore.ts         # getFirestore(app) + emulator wiring
├── storage.ts           # getStorage(app) + emulator wiring
├── admin.ts             # Server-only Admin SDK (guarded by `server-only`)
├── constants.ts         # COLLECTIONS, STORAGE_PATHS, USER_ROLES, EMULATOR_CONFIG
├── error-handler.ts     # normalizeFirebaseError() — Auth + Firestore + Storage
├── firestore-helpers.ts # 8 CRUD primitives (see ARCHITECTURE.md §7)
├── storage-helpers.ts   # upload / download-URL / delete / validate helpers
├── types.ts             # UserProfile, FirestoreDocument, etc.
└── index.ts             # Barrel (admin intentionally NOT re-exported)
```

### Environment Variables

All env vars are documented in **`.env.local.example`** (project root). See
`docs/DEPLOYMENT.md` for the complete list.

### Using emulators locally

1. Install Firebase CLI: `npm i -g firebase-tools`
2. Start emulators: `firebase emulators:start`
3. Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` in `.env.local`
4. Run StudentOS dev server: `bun run dev`
5. Open emulator UI: <http://localhost:4000>

---

## 7. Data Migration & Versioning

- Firestore is schemaless — no formal migrations needed.
- **Schema versioning:** Each document includes an optional `_schemaVersion`
  field. Future migrations read this and transform documents lazily.
- **Backward compatibility:** New code must handle both old and new document
  shapes for at least one release cycle.
- **Single-document pattern:** Memory, settings, recommendations, and other
  per-user singleton docs use `{uid}` as the doc ID — writes are idempotent
  (set vs add) and reads are O(1).

---

## 8. Backup & Recovery

- Firestore automated backups configured via Cloud Scheduler + `gcloud
firestore export` (see `docs/DEPLOYMENT.md` §7.3).
- PITR (Point-in-Time Recovery) is recommended for production projects.
- Weekly export to Cloud Storage for disaster recovery.

---

_This schema is the canonical database reference for StudentOS v1.0.0. Update
this file BEFORE writing Firestore code in any new feature sprint._
