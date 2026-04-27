
-- Enums
create type public.app_role as enum ('admin', 'student');
create type public.course_level as enum ('beginner', 'intermediate', 'advanced');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  level course_level not null default 'beginner',
  daily_goal_minutes integer not null default 15,
  xp integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone (leaderboard)"
  on public.profiles for select using (true);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can view their own roles"
  on public.user_roles for select using (auth.uid() = user_id);

-- Updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile + student role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Courses / Modules / Lessons
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  level course_level not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.courses enable row level security;
create policy "Courses are readable by all" on public.courses for select using (true);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  position integer not null default 0
);
alter table public.modules enable row level security;
create policy "Modules are readable by all" on public.modules for select using (true);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  body_md text not null default '',
  position integer not null default 0,
  xp_reward integer not null default 10,
  est_minutes integer not null default 5
);
alter table public.lessons enable row level security;
create policy "Lessons are readable by all" on public.lessons for select using (true);

-- Quizzes
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  time_limit_seconds integer not null default 600,
  pass_score integer not null default 70,
  question_count integer not null default 10
);
alter table public.quizzes enable row level security;
create policy "Quizzes are readable by all" on public.quizzes for select using (true);

-- Questions (linked to either lesson or quiz)
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  quiz_id uuid references public.quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  correct_index integer not null,
  explanation text not null default '',
  topic_tag text not null default 'general',
  position integer not null default 0,
  check ((lesson_id is not null) or (quiz_id is not null))
);
alter table public.questions enable row level security;
create policy "Questions are readable by authenticated users"
  on public.questions for select to authenticated using (true);

-- Lesson progress
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  time_spent_seconds integer not null default 0,
  correct_count integer not null default 0,
  total_count integer not null default 0,
  unique (user_id, lesson_id)
);
alter table public.lesson_progress enable row level security;
create policy "Users view own lesson progress" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "Users insert own lesson progress" on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users update own lesson progress" on public.lesson_progress for update using (auth.uid() = user_id);

-- Quiz attempts
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null default 0,
  total integer not null default 0,
  passed boolean not null default false,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  answers jsonb not null default '[]'::jsonb
);
alter table public.quiz_attempts enable row level security;
create policy "Users view own attempts" on public.quiz_attempts for select using (auth.uid() = user_id);
create policy "Users insert own attempts" on public.quiz_attempts for insert with check (auth.uid() = user_id);
create policy "Users update own attempts" on public.quiz_attempts for update using (auth.uid() = user_id);

-- Badges
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  icon text not null default 'award'
);
alter table public.badges enable row level security;
create policy "Badges are readable by all" on public.badges for select using (true);

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_id)
);
alter table public.user_badges enable row level security;
create policy "User badges visible to all (profile display)" on public.user_badges for select using (true);
create policy "Users insert own badges" on public.user_badges for insert with check (auth.uid() = user_id);

-- Daily activity (for charts + streaks)
create table public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  minutes integer not null default 0,
  xp_earned integer not null default 0,
  unique (user_id, activity_date)
);
alter table public.daily_activity enable row level security;
create policy "Users view own activity" on public.daily_activity for select using (auth.uid() = user_id);
create policy "Users insert own activity" on public.daily_activity for insert with check (auth.uid() = user_id);
create policy "Users update own activity" on public.daily_activity for update using (auth.uid() = user_id);

-- Indexes
create index on public.modules(course_id, position);
create index on public.lessons(module_id, position);
create index on public.questions(lesson_id);
create index on public.questions(quiz_id);
create index on public.lesson_progress(user_id);
create index on public.quiz_attempts(user_id);
create index on public.daily_activity(user_id, activity_date);
