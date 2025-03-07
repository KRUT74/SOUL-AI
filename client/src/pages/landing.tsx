import { Link } from "wouter";

export default function Landing() {
  console.log("Landing page rendering..."); 

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-500 to-blue-600">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-[0.3em] mb-8">
          SOULMATE AI
        </h1>
        <Link href="/auth">
          <a className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 text-xl rounded-lg cursor-pointer">
            Get Started
          </a>
        </Link>
      </div>
    </div>
  );
}