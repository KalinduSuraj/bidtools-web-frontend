'use client';

import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Moon, Sun, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-base text-main relative overflow-hidden flex flex-col transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-glow blur-[120px] opacity-70" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent-success/10 blur-[100px] opacity-60" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 w-full border-b border-subtle bg-surface/80 backdrop-blur-md z-50 transition-colors duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-danger shadow-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">BidTools</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-surface-hover transition-colors text-muted hover:text-main"
              suppressHydrationWarning
            >
              {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </button>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-medium transition-all shadow-theme-sm hover:shadow-theme-lg transform hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center mt-20">
        <section className="container mx-auto px-6 py-12 lg:py-24 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 flex flex-col items-start z-10 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-subtle shadow-theme-sm text-sm font-medium text-primary"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-success"></span>
              </span>
              Live Equipment Auctions
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight"
            >
              Rent Equipment <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-danger">
                Smarter & Faster
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted max-w-xl leading-relaxed"
            >
              The premier bidding platform for contractors and suppliers. Watch live auctions, manage inventory, and secure the best rates in real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <Link
                href="/login"
                className="px-8 py-4 rounded-full bg-primary text-white font-semibold text-lg hover:bg-primary-hover shadow-theme-lg hover:shadow-xl transition-all flex items-center gap-2 group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 w-full max-w-2xl relative"
          >
            {/* Minimalist UI Graphic / Dashboard Mockup */}
            <div className="relative rounded-2xl border border-subtle bg-surface/50 backdrop-blur-xl shadow-theme-lg p-6 lg:p-8 overflow-hidden aspect-video flex flex-col gap-6">

              {/* Header Mock */}
              <div className="flex justify-between items-center pb-4 border-b border-subtle">
                <div className="h-6 w-32 bg-subtle rounded-md"></div>
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-accent-danger shadow-[0_0_10px_var(--color-accent-danger)]"></div>
                  <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]"></div>
                  <div className="h-3 w-3 rounded-full bg-accent-success shadow-[0_0_10px_var(--color-accent-success)]"></div>
                </div>
              </div>

              {/* Chart Mock */}
              <div className="flex-1 flex items-end gap-3 pb-2 justify-between">
                {[40, 65, 30, 85, 50, 95, 75].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: "0%" }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    className="w-full bg-gradient-to-t from-primary-glow to-primary rounded-t-sm"
                  />
                ))}
              </div>

              {/* Floating Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-0 -bottom-6 w-64 p-5 rounded-xl border border-subtle bg-surface shadow-theme-lg flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted">Winning Bid</span>
                  <span className="px-2 py-1 rounded bg-accent-success/10 text-accent-success text-xs font-bold">Live</span>
                </div>
                <div className="text-2xl font-bold font-mono">$450.00/day</div>
                <div className="h-1.5 w-full bg-subtle rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-full bg-primary"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
