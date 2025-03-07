import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Landing() {
  const [location, navigate] = useLocation();

  console.log("Current location:", location);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600 flex flex-col items-center justify-center">
      <h1 className="text-6xl md:text-8xl font-bold text-white tracking-[0.3em] mb-8">
        SOULMATE AI
      </h1>
      <Button 
        onClick={() => {
          console.log("Button clicked, navigating to /auth");
          navigate("/auth");
        }}
        className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-4 text-xl"
      >
        Get Started
      </Button>
    </div>
  );
}