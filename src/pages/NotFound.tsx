import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    document.title = "Page not found · SpeakUp";
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-background p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mb-6">
        <BookOpen className="h-8 w-8" />
      </div>
      <h1 className="text-7xl font-extrabold text-slate-900 dark:text-white">404</h1>
      <p className="mt-3 text-xl text-slate-500 dark:text-slate-400 font-medium">Page not found</p>
      <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild className="mt-8">
        <Link to="/">Return to Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
