import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BookOpen, CheckCircle2 } from "lucide-react";
import splashImg from "@/assets/auth-splash.png";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  displayName: z.string().trim().min(1, "Name is required").max(50).optional(),
});

const features = [
  "Structured curriculum from beginner to advanced",
  "Instant feedback on your answers",
  "Build daily habits with streaks and goals",
];

export default function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = mode === "signup" ? "Sign up · SpeakUp" : "Sign in · SpeakUp";
  }, [mode]);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, displayName: mode === "signup" ? displayName : undefined });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        toast.success("Welcome! Let's set up your learning plan.");
        navigate("/onboarding");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel: Splash Image & Value Prop (hidden on small screens) */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between bg-slate-900 overflow-hidden">
        <img
          src={splashImg}
          alt="SpeakUp Presentation Splash"
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        
        <div className="relative z-10 p-12">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SpeakUp</span>
          </Link>
        </div>

        <div className="relative z-10 p-12 text-white">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Practice More.<br />
            <span className="text-primary-foreground/90">Speak Better.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md mb-8">
            The professional English learning platform designed for ambitious learners.
          </p>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="font-medium">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-white dark:bg-background p-6 md:p-12">
        <div className="w-full max-w-[420px] space-y-8">
          
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-flex lg:hidden mb-6 items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">SpeakUp</span>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {mode === "signup" ? "Create an account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {mode === "signup" ? "Enter your details to start your journey." : "Enter your details to sign in to your account."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Display name</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Alex" autoComplete="name" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="email" required className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "signup" ? "new-password" : "current-password"} required className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-sm" disabled={busy}>
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setEmail(""); setPassword(""); setDisplayName("");
              }}
              className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
