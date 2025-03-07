import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Landing() {
  const [_, navigate] = useLocation();

  const handleNavigation = () => {
    console.log("Navigation triggered");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-[0.3em] mb-8">
          SOULMATE AI
        </h1>
        <Button 
          onClick={handleNavigation}
          variant="outline"
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        >
          Get Started
        </Button>
      </motion.div>
    </div>
  );
}