import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Trophy, BarChart3, Flame, CheckCircle2, Sparkles, ArrowRight, Star } from "lucide-react";
import hero from "@/assets/hero-learning.jpg";

const features = [
  { icon: BookOpen, title: "Structured courses", desc: "Beginner to Advanced English organized into bite-size lessons.", tone: "from-violet-500 to-fuchsia-500" },
  { icon: Sparkles, title: "Instant feedback", desc: "Practice multiple-choice questions with explanations after every lesson.", tone: "from-pink-500 to-rose-500" },
  { icon: Trophy, title: "XP & badges", desc: "Earn experience, unlock achievements, and climb the weekly leaderboard.", tone: "from-amber-400 to-orange-500" },
  { icon: Flame, title: "Daily streaks", desc: "Build a learning habit. Miss a day, lose your streak — keep showing up.", tone: "from-orange-500 to-red-500" },
  { icon: BarChart3, title: "Progress dashboard", desc: "Visualize minutes learned, accuracy, and weak areas at a glance.", tone: "from-sky-500 to-indigo-500" },
  { icon: CheckCircle2, title: "Module quizzes", desc: "Timed assessments with auto-grading and detailed review screens.", tone: "from-emerald-500 to-teal-500" },
];

export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background border-b">
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:[mask-image:linear-gradient(0deg,rgba(0,0,0,1),rgba(0,0,0,0.5))]" />

        <div className="container relative grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div className="space-y-7 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              Trusted by professionals
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl text-slate-900 dark:text-white">
              Practice More.<br/>
              <span className="text-primary">Speak Better.</span>
            </h1>
            <p className="max-w-lg text-lg text-slate-600 dark:text-slate-400 md:text-xl font-medium">
              SpeakUp turns English practice into a daily habit — bite-size lessons, instant feedback, and a structured curriculum that keeps you talking.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" asChild className="shadow-md hover:shadow-lg transition-all text-base px-8">
                <Link to="/auth?mode=signup">Start learning free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-white/50 dark:bg-slate-900/50 backdrop-blur text-base px-8 border-slate-200 dark:border-slate-800">
                <Link to="/auth">I have an account</Link>
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex flex-col"><span className="text-2xl font-bold text-slate-900 dark:text-white">12+</span><span className="font-medium">lessons</span></div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col"><span className="text-2xl font-bold text-slate-900 dark:text-white">60+</span><span className="font-medium">exercises</span></div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col"><span className="text-2xl font-bold text-slate-900 dark:text-white">4</span><span className="font-medium">quizzes</span></div>
            </div>
          </div>

          <div className="relative animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900">
              <img
                src={hero}
                alt="SpeakUp Platform Interface"
                width={1536}
                height={1024}
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
            </div>
            {/* Floating badges - refined */}
            <div className="absolute -left-6 top-12 hidden md:flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 shadow-xl animate-float">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Streak</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">7 days</div>
              </div>
            </div>
            <div className="absolute -right-6 bottom-12 hidden md:flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 shadow-xl animate-float" style={{ animationDelay: "1.2s" }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Earned</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">120 XP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-24 bg-white dark:bg-background">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-slate-50 dark:bg-slate-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm">
            <Sparkles className="h-4 w-4" /> Why SpeakUp
          </div>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl text-slate-900 dark:text-white">
            Everything you need to <span className="text-primary">actually learn</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">A complete English learning experience designed around how people stick with new habits.</p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${f.tone} text-white shadow-md transition-transform group-hover:scale-110`}>
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-primary dark:bg-slate-900 p-12 text-center shadow-2xl md:p-20 border dark:border-slate-800">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" aria-hidden />
          <div className="relative z-10">
            <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-inner">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-white md:text-5xl tracking-tight">Ready to start your streak?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/90 font-medium">Sign up in seconds and complete your first lesson today.</p>
            <Button size="lg" variant="secondary" className="mt-8 shadow-xl text-primary font-semibold px-8 text-lg" asChild>
              <Link to="/auth?mode=signup">Create your free account <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 text-center text-slate-500 dark:text-slate-400 font-medium">
        © {new Date().getFullYear()} SpeakUp. Practice More. Speak Better.
      </footer>
    </div>
  );
}
