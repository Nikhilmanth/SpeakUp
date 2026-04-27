import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, ChevronRight, Trophy } from "lucide-react";

export default function CourseDetail() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [doneLessons, setDoneLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !courseId) return;
    (async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, title, description, level, modules(id, title, description, position, lessons(id, title, position, est_minutes), quizzes(id, title))")
        .eq("id", courseId)
        .maybeSingle();
      if (data) {
        // Sort modules and lessons
        data.modules?.sort((a: any, b: any) => a.position - b.position);
        data.modules?.forEach((m: any) => m.lessons?.sort((a: any, b: any) => a.position - b.position));
        setCourse(data);
        document.title = `${data.title} · SpeakUp`;
      }
      const { data: progress } = await supabase
        .from("lesson_progress").select("lesson_id").eq("user_id", user.id);
      setDoneLessons(new Set((progress ?? []).map((p) => p.lesson_id)));
    })();
  }, [user, courseId]);

  if (!course) return <AppLayout><div className="container py-12 text-muted-foreground">Loading…</div></AppLayout>;

  return (
    <AppLayout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <Badge variant="secondary" className="capitalize">{course.level}</Badge>
          <h1 className="mt-2 text-3xl font-bold">{course.title}</h1>
          <p className="mt-2 text-muted-foreground">{course.description}</p>
        </div>

        <div className="space-y-6">
          {course.modules?.map((m: any, idx: number) => {
            const allDone = m.lessons.every((l: any) => doneLessons.has(l.id));
            return (
              <Card key={m.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Module {idx + 1}</p>
                      <h2 className="text-xl font-semibold">{m.title}</h2>
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {m.lessons.map((l: any) => {
                      const done = doneLessons.has(l.id);
                      return (
                        <li key={l.id}>
                          <Link to={`/lessons/${l.id}`} className="flex items-center justify-between rounded-lg border bg-card p-3 transition-smooth hover:border-primary hover:shadow-soft">
                            <div className="flex items-center gap-3">
                              {done ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                              <span className={done ? "line-through text-muted-foreground" : "font-medium"}>{l.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{l.est_minutes}m</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {m.quizzes?.[0] && (
                    <div className="mt-4 rounded-lg border bg-gradient-soft p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-5 w-5 text-accent-foreground" />
                          <div>
                            <div className="font-semibold">{m.quizzes[0].title}</div>
                            <div className="text-xs text-muted-foreground">{allDone ? "Module complete — take the quiz!" : "Complete all lessons to unlock"}</div>
                          </div>
                        </div>
                        <Button asChild disabled={!allDone} variant={allDone ? "default" : "outline"} size="sm">
                          <Link to={allDone ? `/quizzes/${m.quizzes[0].id}` : "#"}>{allDone ? "Start quiz" : "Locked"}</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
