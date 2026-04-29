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

const iconColors = [
  { bg: "bg-indigo-50 dark:bg-indigo-950/40", color: "text-indigo-600 dark:text-indigo-400" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/40", color: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-amber-50 dark:bg-amber-950/40", color: "text-amber-600 dark:text-amber-400" },
  { bg: "bg-sky-50 dark:bg-sky-950/40", color: "text-sky-600 dark:text-sky-400" },
];

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

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Courses</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Pick a course and start learning.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((c, i) => {
            const pct = c.totalLessons ? Math.round((c.doneLessons / c.totalLessons) * 100) : 0;
            const tone = iconColors[i % iconColors.length];
            return (
              <Link key={c.id} to={`/courses/${c.id}`} className="group">
                <Card className="h-full border-slate-200 dark:border-slate-800 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone.bg} ${tone.color} transition-transform group-hover:scale-105`}>
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="capitalize">{c.level}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{c.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.description}</p>
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{c.doneLessons} / {c.totalLessons} lessons</span>
                        <span className="font-bold text-primary">{pct}%</span>
                      </div>
                      <Progress value={pct} />
                    </div>
                    <div className="mt-4 flex items-center text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Start learning <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
