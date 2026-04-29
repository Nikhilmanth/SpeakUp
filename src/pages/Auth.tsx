import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, Github } from "lucide-react";
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

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-background px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" disabled={busy} onClick={() => handleOAuthSignIn("google")} className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </Button>
            <Button variant="outline" type="button" disabled={busy} onClick={() => handleOAuthSignIn("github")} className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

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
