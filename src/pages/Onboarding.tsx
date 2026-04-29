import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const goals = [
  { id: 5, title: "Casual", desc: "5 min/day", icon: Coffee },
  { id: 15, title: "Regular", desc: "15 min/day", icon: Zap },
  { id: 30, title: "Serious", desc: "30 min/day", icon: Flame },
];

const levels = [
  { id: "beginner", title: "Beginner", desc: "I'm just starting out" },
  { id: "intermediate", title: "Intermediate", desc: "I know the basics" },
  { id: "advanced", title: "Advanced", desc: "I want to refine my skills" },
] as const;

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<number>(15);
  const [level, setLevel] = useState<typeof levels[number]["id"]>("beginner");
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "Onboarding · SpeakUp"; }, []);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const finish = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ daily_goal_minutes: goal, level, onboarded: true })
      .eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("You're all set!");
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-background p-4">
      <Card className="w-full max-w-2xl shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-white">Let's personalize your journey</CardTitle>
          <CardDescription>This helps us tailor your daily goal and recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">Daily Goal</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {goals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={cn(
                    "rounded-2xl border-2 p-5 text-left transition-all hover:shadow-sm",
                    goal === g.id ? "border-primary bg-primary/5 shadow-sm" : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  <g.icon className={cn("mb-2 h-6 w-6", goal === g.id ? "text-primary" : "text-slate-400")} />
                  <div className="font-bold text-slate-900 dark:text-white">{g.title}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">Your English Level</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {levels.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(l.id)}
                  className={cn(
                    "rounded-2xl border-2 p-5 text-left transition-all hover:shadow-sm",
                    level === l.id ? "border-primary bg-primary/5 shadow-sm" : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  <div className="font-bold text-slate-900 dark:text-white">{l.title}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={finish} disabled={busy} size="lg" className="w-full h-12 text-base">
            {busy ? "Saving…" : "Start learning"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
