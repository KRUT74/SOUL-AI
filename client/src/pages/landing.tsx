import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Landing() {
  const [_, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="text-center cursor-pointer hover:scale-105 transition-all"
        onClick={() => {
          console.log("Landing click – redirecting to /auth");
          setLocation("/auth");
        }}
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-bold text-white tracking-widest"
          initial={{ opacity: 0, y: 20, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.5em" }}
          transition={{ 
            duration: 2,
            ease: [0.43, 0.13, 0.23, 0.96],
            letterSpacing: { duration: 2.5, ease: "easeOut" }
          }}
        >
          SOULMATE AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-8 text-white/80 text-lg font-light tracking-wider"
        >
          Click to begin your journey
        </motion.p>
      </motion.div>
    </div>
  );
}