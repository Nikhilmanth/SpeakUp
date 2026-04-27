import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ArrowRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  totalLessons: number;
  doneLessons: number;
}

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => { document.title = "Courses · SpeakUp"; }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: rows } = await supabase
        .from("courses")
        .select("id, title, description, level, position, modules(id, lessons(id))")
        .order("position");
      const { data: progress } = await supabase
        .from("lesson_progress").select("lesson_id").eq("user_id", user.id);
      const done = new Set((progress ?? []).map((p) => p.lesson_id));
      const out: Course[] = (rows ?? []).map((c: any) => {
        const lessonIds = c.modules.flatMap((m: any) => m.lessons.map((l: any) => l.id));
        const doneCount = lessonIds.filter((id: string) => done.has(id)).length;
        return { id: c.id, title: c.title, description: c.description, level: c.level, totalLessons: lessonIds.length, doneLessons: doneCount };
      });
      setCourses(out);
    })();
  }, [user]);

  const tones = ["from-violet-500 to-fuchsia-500", "from-sky-500 to-indigo-500", "from-emerald-500 to-teal-500", "from-amber-400 to-orange-500"];

  return (
    <AppLayout>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-mesh opacity-50" aria-hidden />
        <div className="container relative py-8">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold">Courses</h1>
            <p className="text-muted-foreground">Pick a course and start learning.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {courses.map((c, i) => {
              const pct = c.totalLessons ? Math.round((c.doneLessons / c.totalLessons) * 100) : 0;
              const tone = tones[i % tones.length];
              return (
                <Link key={c.id} to={`/courses/${c.id}`} className="group">
                  <Card className="relative h-full overflow-hidden bg-gradient-card transition-bounce hover:-translate-y-1 hover:shadow-elevated">
                    <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${tone} opacity-15 blur-3xl transition-smooth group-hover:opacity-35`} aria-hidden />
                    <CardContent className="relative p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-soft transition-bounce group-hover:scale-110 group-hover:rotate-6`}>
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="capitalize">{c.level}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold">{c.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                      <div className="mt-5 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{c.doneLessons} / {c.totalLessons} lessons</span>
                          <span className="font-bold text-gradient">{pct}%</span>
                        </div>
                        <Progress value={pct} />
                      </div>
                      <div className="mt-4 flex items-center text-sm font-semibold text-primary opacity-0 transition-smooth group-hover:opacity-100">
                        Start learning <ArrowRight className="ml-1 h-4 w-4 transition-smooth group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
