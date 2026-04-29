import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Trophy, BarChart3, Flame, CheckCircle2, MessageCircle, ArrowRight, Star } from "lucide-react";
import hero from "@/assets/hero-learning.png";

const features = [
  { icon: BookOpen, title: "Structured courses", desc: "Beginner to Advanced English organized into bite-size lessons.", bg: "bg-indigo-50 dark:bg-indigo-950/40", color: "text-indigo-600 dark:text-indigo-400" },
  { icon: MessageCircle, title: "Instant feedback", desc: "Practice multiple-choice questions with explanations after every lesson.", bg: "bg-emerald-50 dark:bg-emerald-950/40", color: "text-emerald-600 dark:text-emerald-400" },
  { icon: Trophy, title: "XP & badges", desc: "Earn experience, unlock achievements, and climb the weekly leaderboard.", bg: "bg-amber-50 dark:bg-amber-950/40", color: "text-amber-600 dark:text-amber-400" },
  { icon: Flame, title: "Daily streaks", desc: "Build a learning habit. Miss a day, lose your streak — keep showing up.", bg: "bg-orange-50 dark:bg-orange-950/40", color: "text-orange-600 dark:text-orange-400" },
  { icon: BarChart3, title: "Progress dashboard", desc: "Visualize minutes learned, accuracy, and weak areas at a glance.", bg: "bg-sky-50 dark:bg-sky-950/40", color: "text-sky-600 dark:text-sky-400" },
  { icon: CheckCircle2, title: "Module quizzes", desc: "Timed assessments with auto-grading and detailed review screens.", bg: "bg-violet-50 dark:bg-violet-950/40", color: "text-violet-600 dark:text-violet-400" },
];

export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background">
        <div className="container relative grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div className="space-y-7 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              Free to start · No credit card
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl text-slate-900 dark:text-white">
              Practice More.<br />
              <span className="text-primary">Speak Better.</span>
            </h1>
            <p className="max-w-lg text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
              SpeakUp turns English practice into a daily habit — structured lessons, instant feedback, and a curriculum that keeps you speaking confidently.
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <Button size="lg" asChild className="shadow-sm hover:shadow-md transition-shadow text-base px-8 h-12">
                <Link to="/auth?mode=signup">Start learning free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 h-12 border-slate-200 dark:border-slate-700">
                <Link to="/auth">I have an account</Link>
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-4 text-sm text-slate-400 dark:text-slate-500">
              <div className="flex flex-col"><span className="text-2xl font-bold text-slate-900 dark:text-white">12+</span><span className="font-medium">lessons</span></div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col"><span className="text-2xl font-bold text-slate-900 dark:text-white">60+</span><span className="font-medium">exercises</span></div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col"><span className="text-2xl font-bold text-slate-900 dark:text-white">4</span><span className="font-medium">quizzes</span></div>
            </div>
          </div>

          <div className="relative animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <div className="relative rounded-2xl overflow-hidden shadow-elevated border border-slate-200 dark:border-slate-800">
              <img
                src={hero}
                alt="SpeakUp — English Learning Platform"
                width={1536}
                height={1024}
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Floating badges */}
            <div className="absolute -left-4 top-12 hidden md:flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-elevated animate-float">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-500">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400">Current Streak</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">7 days</div>
              </div>
            </div>
            <div className="absolute -right-4 bottom-12 hidden md:flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-elevated animate-float" style={{ animationDelay: "1.5s" }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400">Total Earned</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">120 XP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-background">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Why SpeakUp</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl text-slate-900 dark:text-white">
              Everything you need to <span className="text-primary">actually learn</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">A complete English learning experience designed around how people build lasting habits.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-7 transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg} ${f.color} transition-transform group-hover:scale-105`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="rounded-3xl bg-primary p-12 text-center shadow-elevated md:p-20">
          <h2 className="text-4xl font-extrabold text-white md:text-5xl tracking-tight">Ready to start your streak?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80 font-medium">Sign up in seconds and complete your first lesson today.</p>
          <Button size="lg" variant="secondary" className="mt-8 shadow-lg text-primary font-semibold px-8 text-base h-12" asChild>
            <Link to="/auth?mode=signup">Create your free account <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
        © {new Date().getFullYear()} SpeakUp. Practice More. Speak Better.
      </footer>
    </div>
  );
}
