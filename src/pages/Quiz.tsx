import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { recordActivity, awardModuleMaster } from "@/lib/progress";

interface Q { id: string; prompt: string; options: string[]; correct_index: number; explanation: string; topic_tag: string; }

function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }

export default function Quiz() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId || !user) return;
    (async () => {
      const { data: q } = await supabase.from("quizzes").select("*").eq("id", quizId).maybeSingle();
      const { data: qs } = await supabase.from("questions").select("id, prompt, options, correct_index, explanation, topic_tag").eq("quiz_id", quizId);
      if (!q || !qs) return;
      setQuiz(q);
      document.title = `${q.title} · SpeakUp`;
      const picked = shuffle(qs).slice(0, q.question_count).map((x: any) => ({ ...x, options: x.options as string[] }));
      setQuestions(picked);
      setTimeLeft(q.time_limit_seconds);

      const { data: attempt } = await supabase.from("quiz_attempts").insert({
        user_id: user.id, quiz_id: q.id, total: picked.length,
      }).select("id").single();
      if (attempt) setAttemptId(attempt.id);
    })();
  }, [quizId, user]);

  useEffect(() => {
    if (!quiz) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [quiz]);

  const submit = async () => {
    if (!user || !quiz || submitting) return;
    setSubmitting(true);
    let correct = 0;
    const detail = questions.map((q) => {
      const picked = answers[q.id];
      const ok = picked === q.correct_index;
      if (ok) correct++;
      return { question_id: q.id, prompt: q.prompt, picked, correct_index: q.correct_index, options: q.options, explanation: q.explanation, topic_tag: q.topic_tag };
    });
    const score = correct;
    const passed = (score / questions.length) * 100 >= quiz.pass_score;
    if (attemptId) {
      await supabase.from("quiz_attempts").update({
        score, total: questions.length, passed, finished_at: new Date().toISOString(), answers: detail,
      }).eq("id", attemptId);
    }
    const xp = correct * 5 + (passed ? 30 : 0);
    if (xp > 0) await recordActivity({ userId: user.id, xp, minutes: Math.max(1, Math.round((quiz.time_limit_seconds - timeLeft) / 60)) });
    if (correct === questions.length) await awardModuleMaster(user.id);
    toast.success(passed ? `Passed! +${xp} XP` : `Score: ${correct}/${questions.length}. Keep practicing!`);
    navigate(`/quizzes/${quiz.id}/results?attempt=${attemptId}`);
  };

  useEffect(() => {
    if (timeLeft === 0 && quiz && !submitting && attemptId) {
      submit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, quiz, attemptId]);

  const minutes = useMemo(() => Math.floor(timeLeft / 60), [timeLeft]);
  const seconds = useMemo(() => String(timeLeft % 60).padStart(2, "0"), [timeLeft]);

  if (!quiz || questions.length === 0) {
    return <AppLayout><div className="container py-12 text-slate-400">Loading…</div></AppLayout>;
  }

  const q = questions[current];
  const picked = answers[q.id];
  const answeredCount = Object.keys(answers).length;
  const lowTime = timeLeft < 60;

  return (
    <AppLayout>
      <div className="container max-w-3xl py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{quiz.title}</h1>
          <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold", lowTime ? "border-red-300 text-red-600 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950/30" : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300")}>
            <Clock className="h-4 w-4" /> {minutes}:{seconds}
          </div>
        </div>
        <div className="mb-2 flex justify-between text-xs text-slate-400">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{answeredCount} answered</span>
        </div>
        <Progress value={((current + 1) / questions.length) * 100} className="mb-6" />

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <p className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{q.prompt}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left text-sm transition-colors",
                    picked === i ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary/50"
                  )}
                >
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold",
                    picked === i ? "border-primary bg-primary text-white" : "border-slate-300 dark:border-slate-600 text-slate-400")}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {current < questions.length - 1 ? (
            <Button onClick={() => setCurrent((c) => c + 1)}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <Button onClick={submit} disabled={submitting} className="shadow-sm">
              {submitting ? "Submitting…" : "Submit quiz"}
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
