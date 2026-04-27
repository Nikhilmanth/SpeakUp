import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { recordActivity } from "@/lib/progress";

interface Question { id: string; prompt: string; options: string[]; correct_index: number; explanation: string; }

export default function Lesson() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [startedAt] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    (async () => {
      const { data: l } = await supabase
        .from("lessons")
        .select("id, title, body_md, position, xp_reward, module_id, modules(id, course_id, position, lessons(id, position))")
        .eq("id", lessonId)
        .maybeSingle();
      setLesson(l);
      if (l) document.title = `${l.title} · SpeakUp`;
      const { data: qs } = await supabase
        .from("questions").select("id, prompt, options, correct_index, explanation, position").eq("lesson_id", lessonId).order("position");
      setQuestions((qs ?? []).map((q: any) => ({ ...q, options: q.options as string[] })));

      // Determine next lesson within same module
      if (l) {
        const sib = (l as any).modules.lessons.sort((a: any, b: any) => a.position - b.position);
        const idx = sib.findIndex((x: any) => x.id === l.id);
        setNextLessonId(sib[idx + 1]?.id ?? null);
      }
    })();
  }, [lessonId]);

  if (!lesson) return <AppLayout><div className="container py-12 text-muted-foreground">Loading…</div></AppLayout>;

  const answerQuestion = (qid: string, idx: number) => {
    if (revealed[qid]) return;
    setAnswers((a) => ({ ...a, [qid]: idx }));
    setRevealed((r) => ({ ...r, [qid]: true }));
  };

  const allAnswered = questions.length > 0 && questions.every((q) => revealed[q.id]);
  const correctCount = questions.filter((q) => answers[q.id] === q.correct_index).length;

  const completeLesson = async () => {
    if (!user) return;
    setSubmitting(true);
    const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const xp = lesson.xp_reward + correctCount * 2;

    // Upsert lesson_progress
    const { data: existing } = await supabase
      .from("lesson_progress").select("id").eq("user_id", user.id).eq("lesson_id", lesson.id).maybeSingle();
    if (existing) {
      await supabase.from("lesson_progress").update({
        completed_at: new Date().toISOString(),
        time_spent_seconds: minutes * 60,
        correct_count: correctCount,
        total_count: questions.length,
      }).eq("id", existing.id);
    } else {
      await supabase.from("lesson_progress").insert({
        user_id: user.id, lesson_id: lesson.id,
        time_spent_seconds: minutes * 60,
        correct_count: correctCount, total_count: questions.length,
      });
    }

    await recordActivity({ userId: user.id, xp, minutes });
    toast.success(`+${xp} XP earned!`);
    setSubmitting(false);
    if (nextLessonId) navigate(`/lessons/${nextLessonId}`);
    else navigate(`/courses/${(lesson as any).modules.course_id}`);
  };

  return (
    <AppLayout>
      <div className="container max-w-3xl py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>

        <Card className="mt-6 bg-gradient-card">
          <CardContent className="prose prose-slate max-w-none p-6 dark:prose-invert prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-2 prose-h3:text-base prose-h3:mt-4 prose-p:leading-relaxed prose-table:my-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.body_md}</ReactMarkdown>
          </CardContent>
        </Card>

        {questions.length > 0 && (
          <>
            <h2 className="mt-10 flex items-center gap-2 text-xl font-bold">
              <Sparkles className="h-5 w-5 text-primary" /> Practice
            </h2>
            <p className="text-sm text-muted-foreground">Answer to see immediate feedback.</p>

            <div className="mt-4 space-y-4">
              {questions.map((q, qi) => {
                const picked = answers[q.id];
                const wasRevealed = revealed[q.id];
                const correct = wasRevealed && picked === q.correct_index;
                return (
                  <Card key={q.id}>
                    <CardContent className="p-5">
                      <p className="mb-3 font-medium">
                        <span className="mr-2 text-muted-foreground">Q{qi + 1}.</span>{q.prompt}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, i) => {
                          const isPicked = picked === i;
                          const isAnswer = q.correct_index === i;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => answerQuestion(q.id, i)}
                              disabled={wasRevealed}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg border-2 p-3 text-left text-sm transition-smooth",
                                !wasRevealed && "hover:border-primary hover:bg-primary/5",
                                wasRevealed && isAnswer && "border-success bg-success/10",
                                wasRevealed && isPicked && !isAnswer && "border-destructive bg-destructive/10",
                                wasRevealed && !isAnswer && !isPicked && "opacity-60"
                              )}
                            >
                              <span>{opt}</span>
                              {wasRevealed && isAnswer && <CheckCircle2 className="h-5 w-5 text-success" />}
                              {wasRevealed && isPicked && !isAnswer && <XCircle className="h-5 w-5 text-destructive" />}
                            </button>
                          );
                        })}
                      </div>
                      {wasRevealed && (
                        <div className={cn("mt-3 rounded-lg p-3 text-sm", correct ? "bg-success/10 text-success-foreground" : "bg-muted")}>
                          <span className="font-semibold">{correct ? "Correct!" : "Not quite."}</span> {q.explanation}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border bg-gradient-soft p-5">
          <div>
            <div className="font-semibold">Ready to finish?</div>
            <div className="text-sm text-muted-foreground">
              {questions.length > 0 ? `${correctCount} / ${questions.length} correct so far · +${lesson.xp_reward + correctCount * 2} XP` : `Earn ${lesson.xp_reward} XP`}
            </div>
          </div>
          <Button onClick={completeLesson} disabled={submitting || (questions.length > 0 && !allAnswered)}>
            {submitting ? "Saving…" : nextLessonId ? "Complete & continue" : "Complete lesson"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
