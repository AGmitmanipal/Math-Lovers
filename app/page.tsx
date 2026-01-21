import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="w-full max-w-5xl px-6 flex flex-col md:flex-row items-center justify-between gap-12">

        <div className="flex-1 space-y-8 text-center md:text-left">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
            MATH<br />
            LOVERS
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-500 max-w-md">
            A minimalist community for solving complex mathematical doubts. Share, Solve, Learn.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-transparent border-2 border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 min-w-[160px] text-center"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 bg-black text-white border-2 border-black font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 min-w-[160px] text-center"
            >
              Start Solving
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center relative">
          {/* Abstract Geometry Art */}
          <div className="relative w-80 h-80 md:w-96 md:h-96">
            <div className="absolute inset-0 border-4 border-black rounded-full mix-blend-multiply animate-blob"></div>
            <div className="absolute top-10 -right-4 w-72 h-72 border-4 border-gray-400 rounded-full mix-blend-multiply animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 border-4 border-gray-200 rounded-full mix-blend-multiply animate-blob animation-delay-4000"></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-9xl font-bold opacity-10">∫</span>
            </div>
          </div>
        </div>

      </div>

      <footer className="absolute bottom-6 text-xs font-mono text-gray-400">
        EST. 2026 • PURE MATHEMATICS
      </footer>
    </div>
  );
}
