import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const [_, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // Check if user has configured preferences
  const { data: preferences } = useQuery({
    queryKey: ["/api/preferences", user?.id],
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      // If user has no preferences, send to settings page
      if (!preferences?.settings) {
        console.log("User has no companion configured, redirecting to /settings");
        setLocation("/settings");
      } else {
        console.log("User has companion configured, redirecting to /home");
        setLocation("/home");
      }
    }
  }, [user, preferences, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-[0.3em] mb-8">
          SOULMATE AI
        </h1>
        <Link href="/auth">
          <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 text-xl rounded-lg cursor-pointer">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
}