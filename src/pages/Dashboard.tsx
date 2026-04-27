import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, Clock, Zap, ArrowRight } from "lucide-react";
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

  if (!profile) return <AppLayout><div className="container py-12 text-muted-foreground">Loading…</div></AppLayout>;

  const lvl = getLevel(profile.xp);
  const todayMinutes = activity[activity.length - 1]?.minutes ?? 0;

  return (
    <AppLayout>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-mesh opacity-60" aria-hidden />
        <div className="container relative space-y-6 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h1 className="text-4xl font-bold">
                {profile.display_name || "Learner"} <span className="inline-block animate-float">👋</span>
              </h1>
            </div>
            {continueLesson && (
              <Button asChild className="bg-gradient-hero animate-gradient-x text-primary-foreground shadow-elevated hover:opacity-95">
                <Link to={`/lessons/${continueLesson.id}`}>
                  Continue learning <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard icon={Zap} label="Total XP" value={profile.xp} sub={lvl.title} tone="from-violet-500 to-fuchsia-500" />
            <StatCard icon={Flame} label="Current streak" value={`${profile.current_streak} ${profile.current_streak === 1 ? "day" : "days"}`} sub={`Longest ${profile.longest_streak}`} tone="from-orange-500 to-red-500" />
            <StatCard icon={Clock} label="Today" value={`${todayMinutes} min`} sub={`Goal ${profile.daily_goal_minutes} min`} tone="from-sky-500 to-indigo-500" />
            <StatCard icon={Trophy} label="Level" value={lvl.title} sub={`${lvl.progress}% to ${lvl.nextMin} XP`} tone="from-amber-400 to-orange-500" />
          </div>

          {/* Continue learning card */}
          {continueLesson && (
            <Card className="relative overflow-hidden bg-gradient-card shadow-soft">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-hero opacity-20 blur-3xl" aria-hidden />
              <CardContent className="relative flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pick up where you left off</p>
                  <h3 className="mt-1 text-xl font-semibold">{continueLesson.title}</h3>
                </div>
                <Button asChild>
                  <Link to={`/lessons/${continueLesson.id}`}>Resume <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-gradient-card shadow-soft">
              <CardHeader><CardTitle className="text-base">Minutes learned (last 14 days)</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activity}>
                    <defs>
                      <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                    <Bar dataKey="minutes" fill="url(#barFill)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-soft">
              <CardHeader><CardTitle className="text-base">XP earned</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activity}>
                    <defs>
                      <linearGradient id="lineFill" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="xp" stroke="url(#lineFill)" strokeWidth={3} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent attempts + leaderboard */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-gradient-card shadow-soft">
              <CardHeader><CardTitle className="text-base">Recent quiz attempts</CardTitle></CardHeader>
              <CardContent>
                {recentAttempts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No quiz attempts yet — finish a module to unlock its quiz.</p>
                ) : (
                  <ul className="space-y-2">
                    {recentAttempts.map((a) => {
                      const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
                      return (
                        <li key={a.id} className="flex items-center justify-between rounded-xl border bg-card p-3 transition-smooth hover:shadow-soft">
                          <div>
                            <div className="font-medium">{a.quizzes?.title || "Quiz"}</div>
                            <div className="text-xs text-muted-foreground">{new Date(a.finished_at).toLocaleDateString()}</div>
                          </div>
                          <div className={`text-lg font-bold ${pct >= 70 ? "text-success" : "text-destructive"}`}>{pct}%</div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-soft">
              <CardHeader><CardTitle className="text-base">Top learners</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {leaderboard.map((u, i) => {
                    const medal = i === 0 ? "bg-gradient-warm text-white" : i === 1 ? "bg-gradient-cool text-white" : i === 2 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground";
                    return (
                      <li key={i} className="flex items-center justify-between rounded-xl border bg-card p-3 transition-smooth hover:shadow-soft">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-soft ${medal}`}>{i + 1}</span>
                          <span className="font-medium">{u.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gradient">{u.xp} XP</span>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone }: { icon: any; label: string; value: any; sub: string; tone: string }) {
  return (
    <Card className="group relative overflow-hidden bg-gradient-card shadow-soft transition-bounce hover:-translate-y-1 hover:shadow-elevated">
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${tone} opacity-20 blur-2xl transition-smooth group-hover:opacity-40`} aria-hidden />
      <CardContent className="relative p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-soft transition-bounce group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}
