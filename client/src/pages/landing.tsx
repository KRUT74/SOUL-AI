import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Landing() {
  const [_, setLocation] = useLocation();

  const handleClick = () => {
    setLocation("/auth");
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center cursor-pointer"
      onClick={handleClick}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-bold text-white tracking-wider"
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ duration: 1 }}
        >
          SOULMATE AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 text-white/80 text-lg"
        >
          Click anywhere to begin
        </motion.p>
      </motion.div>
    </div>
  );
}