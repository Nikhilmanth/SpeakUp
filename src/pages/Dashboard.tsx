import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getLevel } from "@/lib/gamification";

interface Profile {
  display_name: string;
  xp: number;
  current_streak: number;
  longest_streak: number;
  daily_goal_minutes: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activity, setActivity] = useState<{ date: string; minutes: number; xp: number }[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [continueLesson, setContinueLesson] = useState<{ id: string; title: string; courseId: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ name: string; xp: number }[]>([]);

  useEffect(() => { document.title = "Dashboard · SpeakUp"; }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: a }, { data: q }, { data: lb }] = await Promise.all([
        supabase.from("profiles").select("display_name, xp, current_streak, longest_streak, daily_goal_minutes").eq("id", user.id).maybeSingle(),
        supabase.from("daily_activity").select("activity_date, minutes, xp_earned").eq("user_id", user.id).order("activity_date", { ascending: false }).limit(14),
        supabase.from("quiz_attempts").select("id, score, total, finished_at, quiz_id, quizzes(title)").eq("user_id", user.id).not("finished_at", "is", null).order("finished_at", { ascending: false }).limit(5),
        supabase.from("profiles").select("display_name, xp").order("xp", { ascending: false }).limit(5),
      ]);
      setProfile(p);
      const map = new Map((a ?? []).map((d) => [d.activity_date, d]));
      const arr: { date: string; minutes: number; xp: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const row = map.get(d);
        arr.push({ date: d.slice(5), minutes: row?.minutes ?? 0, xp: row?.xp_earned ?? 0 });
      }
      setActivity(arr);
      setRecentAttempts(q ?? []);
      setLeaderboard((lb ?? []).map((r) => ({ name: r.display_name || "Learner", xp: r.xp })));

      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, position, modules!inner(id, position, course_id, courses!inner(id, position))")
        .order("position", { ascending: true });
      const { data: done } = await supabase
        .from("lesson_progress").select("lesson_id").eq("user_id", user.id);
      const doneSet = new Set((done ?? []).map((x) => x.lesson_id));
      const sorted = (lessons ?? []).sort((a: any, b: any) => {
        const ca = a.modules.courses.position - b.modules.courses.position;
        if (ca !== 0) return ca;
        const ma = a.modules.position - b.modules.position;
        if (ma !== 0) return ma;
        return a.position - b.position;
      });
      const next = sorted.find((l: any) => !doneSet.has(l.id));
      if (next) setContinueLesson({ id: next.id, title: next.title, courseId: (next as any).modules.courses.id });
    })();
  }, [user]);

  if (!profile) return <AppLayout><div className="container py-12 text-slate-400">Loading…</div></AppLayout>;

  const lvl = getLevel(profile.xp);
  const todayMinutes = activity[activity.length - 1]?.minutes ?? 0;

  return (
    <AppLayout>
      <div className="container space-y-6 py-8">
        {/* Welcome header */}
        <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up">
          <div>
            <p className="text-sm text-slate-400 font-medium">Welcome back,</p>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {profile.display_name || "Learner"} 👋
            </h1>
          </div>
          {continueLesson && (
            <Button asChild className="shadow-sm">
              <Link to={`/lessons/${continueLesson.id}`}>
                Continue learning <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={TrendingUp} label="Total XP" value={profile.xp} sub={lvl.title} bg="bg-indigo-50 dark:bg-indigo-950/40" color="text-indigo-600 dark:text-indigo-400" />
          <StatCard icon={Flame} label="Current streak" value={`${profile.current_streak} ${profile.current_streak === 1 ? "day" : "days"}`} sub={`Longest ${profile.longest_streak}`} bg="bg-orange-50 dark:bg-orange-950/40" color="text-orange-600 dark:text-orange-400" />
          <StatCard icon={Clock} label="Today" value={`${todayMinutes} min`} sub={`Goal ${profile.daily_goal_minutes} min`} bg="bg-sky-50 dark:bg-sky-950/40" color="text-sky-600 dark:text-sky-400" />
          <StatCard icon={Trophy} label="Level" value={lvl.title} sub={`${lvl.progress}% to ${lvl.nextMin} XP`} bg="bg-amber-50 dark:bg-amber-950/40" color="text-amber-600 dark:text-amber-400" />
        </div>

        {/* Continue learning card */}
        {continueLesson && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pick up where you left off</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{continueLesson.title}</h3>
              </div>
              <Button asChild>
                <Link to={`/lessons/${continueLesson.id}`}>Resume <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader><CardTitle className="text-base font-bold text-slate-900 dark:text-white">Minutes learned (last 14 days)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader><CardTitle className="text-base font-bold text-slate-900 dark:text-white">XP earned</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="xp" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent attempts + leaderboard */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader><CardTitle className="text-base font-bold text-slate-900 dark:text-white">Recent quiz attempts</CardTitle></CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <p className="text-sm text-slate-400">No quiz attempts yet — finish a module to unlock its quiz.</p>
              ) : (
                <ul className="space-y-2">
                  {recentAttempts.map((a) => {
                    const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
                    return (
                      <li key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{a.quizzes?.title || "Quiz"}</div>
                          <div className="text-xs text-slate-400">{new Date(a.finished_at).toLocaleDateString()}</div>
                        </div>
                        <div className={`text-lg font-bold ${pct >= 70 ? "text-emerald-600" : "text-red-500"}`}>{pct}%</div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader><CardTitle className="text-base font-bold text-slate-900 dark:text-white">Top learners</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {leaderboard.map((u, i) => {
                  const medalBg = i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : i === 1 ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300" : i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
                  return (
                    <li key={i} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${medalBg}`}>{i + 1}</span>
                        <span className="font-medium text-slate-900 dark:text-white">{u.name}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{u.xp} XP</span>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, label, value, sub, bg, color }: { icon: any; label: string; value: any; sub: string; bg: string; color: string }) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</span>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
        <div className="text-xs text-slate-400 font-medium">{sub}</div>
      </CardContent>
    </Card>
  );
}
