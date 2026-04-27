# Online English Learning Platform — V1 Plan

A focused first version: one language (English), one exercise type (multiple choice), with a polished student learning flow, progress dashboard, and gamification. Admin panel and other languages/exercise types are deferred.

## What users get

### 1. Auth & onboarding
- Email/password sign-up & sign-in (Lovable Cloud).
- First-time onboarding: pick a learning goal (Casual / Regular / Serious = 5/15/30 min per day) and self-rated level (Beginner / Intermediate / Advanced).
- Profile page: name, goal, level, total XP, current streak, badges.

### 2. Course catalog
- Courses grouped by level: Beginner, Intermediate, Advanced.
- Each course = Modules → Lessons → Topics.
- Course card shows progress %, lesson count, and estimated time.

### 3. Lesson experience
- Text lesson content (rich text with examples, vocabulary tables, tips).
- "Mark as complete" advances to the next topic.
- Inline practice: 3–5 MCQ questions per lesson with **immediate feedback** (correct ✓ / explanation on wrong).
- Optional hint button reveals a tip (small XP penalty).

### 4. Quizzes
- One timed quiz per module (e.g., 10 MCQs, randomized from a pool, 10-min timer).
- Auto-grading, score + pass/fail, review screen showing every question with the correct answer and explanation.
- Retake allowed; best score stored.

### 5. Progress dashboard
- Top stats: XP, level, current streak, longest streak, total minutes learned.
- Charts:
  - Weekly activity (bar chart: minutes/day for last 14 days).
  - XP over time (line chart).
  - Accuracy by module (so weak areas surface).
- "Continue learning" card jumps back to the last in-progress lesson.
- Recent quiz history table with scores.

### 6. Gamification
- **XP:** earned per lesson completed, per correct answer, and per quiz passed.
- **Levels:** XP thresholds (Novice → Apprentice → Fluent Learner → …).
- **Streak:** consecutive days with at least one completed lesson; streak freeze grace of 1 missed day per week.
- **Badges:** First Lesson, 7-Day Streak, 30-Day Streak, Module Master (100% on a quiz), Vocab Vault (50 correct in a row), etc.
- **Leaderboard:** weekly top XP earners (opt-in, shows display name only).

### 7. Feedback & weak-area detection
- After each quiz: a short summary highlighting topics where accuracy < 60%, with links back to the relevant lessons.
- Profile shows a "Focus areas" panel listing the user's three weakest topics.

## Pages / routes

- `/` — Landing (marketing-style hero, features, CTA to sign up). Auto-redirects logged-in users to dashboard.
- `/auth` — Sign in / sign up.
- `/onboarding` — One-time goal & level setup.
- `/dashboard` — Stats, charts, continue learning, leaderboard widget.
- `/courses` — Catalog filtered by level.
- `/courses/:courseId` — Module/lesson outline with progress.
- `/lessons/:lessonId` — Lesson content + inline MCQ practice.
- `/quizzes/:quizId` — Timed quiz runner.
- `/quizzes/:quizId/results` — Review screen.
- `/profile` — Profile, badges, streak calendar, settings.

## Technical notes (for reference)

- **Stack:** React + Vite + Tailwind + shadcn/ui (already in project), React Router, TanStack Query, Recharts for charts.
- **Backend:** Lovable Cloud (Supabase) for auth, database, RLS.
- **Roles:** v1 only has `student`; we will still set up the standard `user_roles` table + `has_role()` security-definer function so an admin role can be added later without refactor.
- **Tables (high level):**
  - `profiles` (id → auth.users, display_name, level, daily_goal_minutes, xp, current_streak, longest_streak, last_active_date)
  - `user_roles` (user_id, role)
  - `courses` (id, title, level, description, order)
  - `modules` (id, course_id, title, order)
  - `lessons` (id, module_id, title, body_md, order, xp_reward)
  - `questions` (id, lesson_id nullable, quiz_id nullable, prompt, options jsonb, correct_index, explanation, topic_tag)
  - `quizzes` (id, module_id, title, time_limit_seconds, pass_score)
  - `lesson_progress` (user_id, lesson_id, completed_at, time_spent_seconds)
  - `quiz_attempts` (user_id, quiz_id, score, total, started_at, finished_at, answers jsonb)
  - `badges` + `user_badges`
  - `daily_activity` (user_id, date, minutes, xp_earned) — powers charts & streaks
- **RLS:** users read/write only their own progress rows; courses/lessons/questions/quizzes are read-only for authenticated users.
- **Seed content:** ~2 sample English courses (Beginner + Intermediate), each with 2 modules × 3 lessons × 5 MCQs, plus a module quiz, so the app feels real on first load.
- **Design system:** clean, friendly, education-oriented theme defined in `index.css` + `tailwind.config.ts` (HSL tokens, semantic colors, gradients for hero/badges). No hard-coded colors in components.

## Out of scope for v1 (planned for later)
- Admin panel (content edited via DB / migrations for now).
- Other languages, fill-in-the-blank, matching, listening exercises.
- Audio / TTS / speech recognition.
- AI tutor / personalized recommendations.
- Social login.

## Build order
1. Cloud setup, schema, RLS, seed content.
2. Auth + onboarding + profile.
3. Course catalog + lesson viewer + inline MCQs (XP awarded).
4. Quiz runner + results/review + weak-area detection.
5. Dashboard with charts, streak logic, leaderboard, badges.
6. Landing page polish & responsive QA.
