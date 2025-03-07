import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Landing() {
  const [_, setLocation] = useLocation();
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // Redirect to auth page after animation completes
  useEffect(() => {
    if (isAnimationComplete) {
      const timer = setTimeout(() => {
        setLocation("/auth");
      }, 500); // Wait half a second after animation before redirecting
      return () => clearTimeout(timer);
    }
  }, [isAnimationComplete, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-center"
          onClick={() => setIsAnimationComplete(true)}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold text-white tracking-wider cursor-pointer"
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            SOULMATE AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-4 text-white/80 text-lg"
          >
            Click to begin
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
