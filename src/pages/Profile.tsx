import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Award, Sparkles, Flame, Trophy, Star, Medal } from "lucide-react";
import { getLevel } from "@/lib/gamification";
import { toast } from "sonner";

const ICONS: Record<string, any> = { sparkles: Sparkles, flame: Flame, trophy: Trophy, star: Star, medal: Medal, award: Award };

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [weakTopics, setWeakTopics] = useState<{ tag: string; pct: number }[]>([]);

  useEffect(() => { document.title = "Profile · SpeakUp"; }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: bs }, { data: mine }, { data: attempts }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("badges").select("*"),
        supabase.from("user_badges").select("badge_id").eq("user_id", user.id),
        supabase.from("quiz_attempts").select("answers").eq("user_id", user.id).not("finished_at", "is", null),
      ]);
      setProfile(p);
      setName(p?.display_name || "");
      setAllBadges(bs || []);
      setOwned(new Set((mine ?? []).map((b) => b.badge_id)));

      // Aggregate weak topics across all attempts
      const totals: Record<string, { c: number; t: number }> = {};
      (attempts ?? []).forEach((a: any) => {
        (a.answers || []).forEach((ans: any) => {
          totals[ans.topic_tag] = totals[ans.topic_tag] || { c: 0, t: 0 };
          totals[ans.topic_tag].t++;
          if (ans.picked === ans.correct_index) totals[ans.topic_tag].c++;
        });
      });
      const weak = Object.entries(totals)
        .filter(([, v]) => v.t >= 2)
        .map(([tag, v]) => ({ tag, pct: Math.round((v.c / v.t) * 100) }))
        .sort((a, b) => a.pct - b.pct)
        .slice(0, 3);
      setWeakTopics(weak);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ display_name: name.trim().slice(0, 50) }).eq("id", user.id);
    if (error) toast.error(error.message); else toast.success("Saved!");
  };

  if (!profile) return <AppLayout><div className="container py-12 text-slate-400">Loading…</div></AppLayout>;

  const lvl = getLevel(profile.xp);

  return (
    <AppLayout>
      <div className="container max-w-3xl space-y-6 py-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Profile</h1>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                {(profile.display_name || "L")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{profile.display_name || "Learner"}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{lvl.title} · {profile.xp} XP</div>
                <Progress value={lvl.progress} className="mt-2" />
                <div className="mt-1 text-xs text-slate-400">{lvl.progress}% to {lvl.nextMin} XP</div>
              </div>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Display name</Label>
                <div className="mt-1 flex gap-2">
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
                  <Button onClick={save}>Save</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Streak" value={`${profile.current_streak}🔥`} />
                <Stat label="Longest" value={profile.longest_streak} />
                <Stat label="Daily goal" value={`${profile.daily_goal_minutes}m`} />
                <Stat label="Level" value={profile.level} cap />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Award className="h-5 w-5 text-amber-500" /> Badges</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {allBadges.map((b) => {
                const has = owned.has(b.id);
                const Icon = ICONS[b.icon] || Award;
                return (
                  <div key={b.id} className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center ${has ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" : "border-slate-100 dark:border-slate-800 opacity-35"}`} title={b.description}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${has ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-xs font-medium leading-tight text-slate-700 dark:text-slate-300">{b.title}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {weakTopics.length > 0 && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Focus areas</h2>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Topics with the lowest accuracy across your quiz attempts.</p>
              <ul className="space-y-2">
                {weakTopics.map((w) => (
                  <li key={w.tag} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <span className="font-medium capitalize text-slate-900 dark:text-white">{w.tag.replace(/_/g, " ")}</span>
                    <span className={`text-sm font-bold ${w.pct < 50 ? "text-red-500" : "text-amber-600"}`}>{w.pct}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function Stat({ label, value, cap }: { label: string; value: any; cap?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`font-bold text-slate-900 dark:text-white ${cap ? "capitalize" : ""}`}>{value}</div>
    </div>
  );
}
