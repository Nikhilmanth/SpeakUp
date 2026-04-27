import { supabase } from "@/integrations/supabase/client";

const today = () => new Date().toISOString().slice(0, 10);

/** Award XP & minutes; update streak; check for new badges. */
export async function recordActivity(opts: {
  userId: string;
  xp: number;
  minutes: number;
}) {
  const { userId, xp, minutes } = opts;
  const date = today();

  // Upsert daily_activity (manual: select existing then insert/update since unique constraint exists)
  const { data: existing } = await supabase
    .from("daily_activity")
    .select("*")
    .eq("user_id", userId)
    .eq("activity_date", date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("daily_activity")
      .update({ xp_earned: existing.xp_earned + xp, minutes: existing.minutes + minutes })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("daily_activity")
      .insert({ user_id: userId, activity_date: date, xp_earned: xp, minutes });
  }

  // Update profile xp + streak
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, current_streak, longest_streak, last_active_date")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return;

  let streak = profile.current_streak;
  if (profile.last_active_date !== date) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = profile.last_active_date === yesterday ? streak + 1 : 1;
  } else if (streak === 0) {
    streak = 1;
  }
  const newXp = profile.xp + xp;
  const longest = Math.max(profile.longest_streak, streak);

  await supabase
    .from("profiles")
    .update({
      xp: newXp,
      current_streak: streak,
      longest_streak: longest,
      last_active_date: date,
    })
    .eq("id", userId);

  // Award badges
  await checkBadges(userId, { xp: newXp, streak });
}

async function checkBadges(userId: string, stats: { xp: number; streak: number }) {
  const { data: all } = await supabase.from("badges").select("id, code");
  const { data: have } = await supabase.from("user_badges").select("badge_id").eq("user_id", userId);
  const owned = new Set((have ?? []).map((b) => b.badge_id));
  const toAward: string[] = [];
  const map = new Map((all ?? []).map((b) => [b.code, b.id]));

  const award = (code: string, ok: boolean) => {
    const id = map.get(code);
    if (id && ok && !owned.has(id)) toAward.push(id);
  };

  award("first_lesson", true); // any activity counts as first lesson
  award("xp_100", stats.xp >= 100);
  award("xp_500", stats.xp >= 500);
  award("streak_7", stats.streak >= 7);
  award("streak_30", stats.streak >= 30);

  if (toAward.length) {
    await supabase
      .from("user_badges")
      .insert(toAward.map((badge_id) => ({ user_id: userId, badge_id })));
  }
}

export async function awardModuleMaster(userId: string) {
  const { data: badge } = await supabase.from("badges").select("id").eq("code", "module_master").maybeSingle();
  if (!badge) return;
  const { data: have } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badge.id)
    .maybeSingle();
  if (!have) {
    await supabase.from("user_badges").insert({ user_id: userId, badge_id: badge.id });
  }
}
