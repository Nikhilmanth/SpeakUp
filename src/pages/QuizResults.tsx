import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Trophy, Target, RotateCcw, LayoutDashboard } from "lucide-react";

export default function QuizResults() {
  const { quizId } = useParams();
  const [params] = useSearchParams();
  const attemptId = params.get("attempt");
  const [attempt, setAttempt] = useState<any>(null);

  useEffect(() => { document.title = "Quiz results · SpeakUp"; }, []);

  useEffect(() => {
    if (!attemptId) return;
    supabase.from("quiz_attempts").select("*, quizzes(title, pass_score)").eq("id", attemptId).maybeSingle()
      .then(({ data }) => setAttempt(data));
  }, [attemptId]);

  if (!attempt) return <AppLayout><div className="container py-12 text-muted-foreground">Loading…</div></AppLayout>;

  const pct = Math.round((attempt.score / attempt.total) * 100);
  const passed = attempt.passed;
  const answers: any[] = attempt.answers || [];

  // Weak topics
  const byTopic: Record<string, { c: number; t: number }> = {};
  answers.forEach((a) => {
    byTopic[a.topic_tag] = byTopic[a.topic_tag] || { c: 0, t: 0 };
    byTopic[a.topic_tag].t++;
    if (a.picked === a.correct_index) byTopic[a.topic_tag].c++;
  });
  const weak = Object.entries(byTopic).filter(([, v]) => v.c / v.t < 0.6).map(([k, v]) => ({ tag: k, pct: Math.round((v.c / v.t) * 100) }));

  return (
    <AppLayout>
      <div className="container max-w-3xl py-8">
        <Card className={`overflow-hidden ${passed ? "bg-gradient-primary" : "bg-gradient-warm"}`}>
          <CardContent className="p-8 text-center text-primary-foreground">
            {passed ? <Trophy className="mx-auto mb-3 h-12 w-12" /> : <Target className="mx-auto mb-3 h-12 w-12" />}
            <h1 className="text-3xl font-bold">{passed ? "You passed!" : "Keep going!"}</h1>
            <p className="mt-2 opacity-90">{attempt.quizzes?.title}</p>
            <div className="mt-6 text-6xl font-extrabold">{pct}%</div>
            <p className="mt-1 opacity-90">{attempt.score} of {attempt.total} correct</p>
          </CardContent>
        </Card>

        {weak.length > 0 && (
          <Card className="mt-6 border-accent/40 bg-accent/5">
            <CardContent className="p-5">
              <h2 className="mb-2 flex items-center gap-2 font-semibold"><Target className="h-4 w-4 text-accent-foreground" /> Focus areas</h2>
              <p className="text-sm text-muted-foreground">Topics where you scored below 60%:</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {weak.map((w) => (
                  <li key={w.tag} className="rounded-full bg-card px-3 py-1 text-xs font-medium capitalize">
                    {w.tag.replace(/_/g, " ")} — {w.pct}%
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <h2 className="mt-8 mb-3 text-xl font-bold">Review</h2>
        <div className="space-y-3">
          {answers.map((a, i) => {
            const correct = a.picked === a.correct_index;
            return (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {correct ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />}
                    <div className="flex-1">
                      <p className="font-medium">{a.prompt}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        {a.options.map((opt: string, oi: number) => (
                          <div key={oi} className={`rounded px-2 py-1 ${oi === a.correct_index ? "bg-success/10 text-success-foreground font-medium" : oi === a.picked && !correct ? "bg-destructive/10 text-destructive line-through" : "text-muted-foreground"}`}>
                            {String.fromCharCode(65 + oi)}. {opt}
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{a.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="outline" asChild>
            <Link to={`/quizzes/${quizId}`}><RotateCcw className="mr-2 h-4 w-4" /> Retake quiz</Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
