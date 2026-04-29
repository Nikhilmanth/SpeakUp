-- SpeakUp Presentation Seed Data
-- Run this script in the Supabase SQL Editor to populate the database with professional content.
-- WARNING: This will delete existing courses and badges to ensure a clean slate.

BEGIN;

-- 1. Clean existing content
DELETE FROM public.badges;
DELETE FROM public.courses;
-- Deleting courses cascades and deletes modules, lessons, quizzes, questions, and lesson_progress/quiz_attempts linked to them.

-- 2. Badges
INSERT INTO public.badges (id, code, title, description, icon) VALUES
(gen_random_uuid(), 'first_steps', 'First Steps', 'Completed your first lesson. The journey begins!', 'medal'),
(gen_random_uuid(), 'grammar_guru', 'Grammar Guru', 'Aced a grammar module with 100% accuracy.', 'star'),
(gen_random_uuid(), 'vocab_master', 'Vocabulary Master', 'Learned over 50 new words.', 'award'),
(gen_random_uuid(), 'streak_3', '3-Day Streak', 'Practiced for 3 days in a row.', 'flame'),
(gen_random_uuid(), 'polyglot', 'Polyglot Potential', 'Completed an entire course.', 'crown');

-- 3. Courses
WITH c1 AS (
  INSERT INTO public.courses (id, title, description, level, position)
  VALUES (gen_random_uuid(), 'Business English Masterclass', 'Master professional communication, emails, and meetings in the corporate world.', 'advanced', 1)
  RETURNING id
),
c2 AS (
  INSERT INTO public.courses (id, title, description, level, position)
  VALUES (gen_random_uuid(), 'Travel Essentials', 'Practical vocabulary and phrases for navigating airports, hotels, and restaurants.', 'beginner', 2)
  RETURNING id
),

-- 4. Modules for Course 1
m1 AS (
  INSERT INTO public.modules (id, course_id, title, description, position)
  SELECT gen_random_uuid(), id, 'Effective Email Communication', 'Learn to write clear, professional emails that get results.', 1 FROM c1
  RETURNING id
),
m2 AS (
  INSERT INTO public.modules (id, course_id, title, description, position)
  SELECT gen_random_uuid(), id, 'Meetings & Negotiations', 'Speak confidently in cross-border meetings and formal settings.', 2 FROM c1
  RETURNING id
),

-- Modules for Course 2
m3 AS (
  INSERT INTO public.modules (id, course_id, title, description, position)
  SELECT gen_random_uuid(), id, 'At the Airport', 'Checking in, going through security, and finding your gate.', 1 FROM c2
  RETURNING id
),

-- 5. Lessons for Module 1 (Email)
l1 AS (
  INSERT INTO public.lessons (id, module_id, title, body_md, position, xp_reward, est_minutes)
  SELECT gen_random_uuid(), id, 'The Anatomy of a Professional Email', 
  '# Writing Professional Emails

A professional email should be clear, concise, and polite. 

## Key Components:
1. **Subject Line**: Must clearly state the purpose (e.g., "Action Required: Q3 Budget Review").
2. **Salutation**: "Dear [Name]" or "Hi [Name]" for slightly less formal contexts.
3. **The Hook**: State your purpose immediately. "I am writing to follow up on..."
4. **The Body**: Keep paragraphs short. Use bullet points for readability.
5. **Call to Action (CTA)**: Be clear about next steps. "Please let me know your thoughts by Friday."
6. **Sign-off**: "Best regards," or "Sincerely," followed by your name.

Always proofread before hitting send!', 1, 15, 5 FROM m1
  RETURNING id
),
l2 AS (
  INSERT INTO public.lessons (id, module_id, title, body_md, position, xp_reward, est_minutes)
  SELECT gen_random_uuid(), id, 'Tone and Formality', 
  '# Tone and Formality

Choosing the right tone is crucial in business English.

### Formal vs. Informal
- **Informal**: "Can you send me that file?"
- **Formal**: "Could you please provide the requested document?"
- **Informal**: "Sorry for the delay."
- **Formal**: "I apologize for the delay in my response."

When in doubt, default to a slightly more formal tone, especially with external clients or senior management.', 2, 15, 5 FROM m1
  RETURNING id
),

-- 6. Quizzes
q1 AS (
  INSERT INTO public.quizzes (id, module_id, title, time_limit_seconds, pass_score, question_count)
  SELECT gen_random_uuid(), id, 'Email Mastery Quiz', 300, 70, 3 FROM m1
  RETURNING id
)

-- 7. Questions for Quiz 1
INSERT INTO public.questions (quiz_id, prompt, options, correct_index, explanation, topic_tag, position)
SELECT id, 'Which of the following is the most appropriate subject line for an urgent meeting request?', '["Hey", "Urgent: Strategy Meeting Required for Q3", "Meeting", "Please read this email"]', 1, 'A subject line should be clear and specific about the email''s content.', 'business_writing', 1 FROM q1
UNION ALL
SELECT id, 'What is the best way to politely ask for a deadline extension?', '["I need more time.", "Give me until Friday.", "Would it be possible to extend the deadline to Friday?", "I am not finishing this today."]', 2, 'Using "Would it be possible..." is polite and professional.', 'formality', 2 FROM q1
UNION ALL
SELECT id, 'Which sign-off is most appropriate for a formal client email?', '["Cheers,", "Best regards,", "Talk soon,", "Later,"]', 1, '"Best regards" is the standard professional sign-off.', 'business_writing', 3 FROM q1;

-- Add some practice questions directly to Lesson 1
INSERT INTO public.questions (lesson_id, prompt, options, correct_index, explanation, topic_tag, position)
SELECT id, 'Identify the informal phrase:', '["I apologize", "Could you please", "Let me know", "I am writing to inquire"]', 2, '"Let me know" is common but informal compared to the others.', 'formality', 1 FROM (SELECT id FROM public.lessons WHERE title = 'The Anatomy of a Professional Email' LIMIT 1) as t;


COMMIT;
