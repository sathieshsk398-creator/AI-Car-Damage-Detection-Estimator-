import React, { useState, useEffect } from "react";
import { Wrench, Car, ShieldAlert, Globe, Sun, Moon } from "lucide-react";

interface HeaderProps {
  currency?: "INR" | "USD";
  onCurrencyChange?: (currency: "INR" | "USD") => void;
  authUser?: { email: string; role: string } | null;
  onLogout?: () => void;
}

export default function Header({ currency = "INR", onCurrencyChange, authUser, onLogout }: HeaderProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) {
        return stored === "dark";
      }
      return document.documentElement.classList.contains("dark") || true;
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white py-5 px-6 sticky top-0 z-50 shadow-md transition-colors duration-250">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/30 text-sky-400 relative overflow-hidden group">
            <div className="absolute inset-0 bg-sky-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Wrench className="w-6 h-6 relative z-10 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-sky-500 text-xs text-slate-950 font-extrabold px-2 py-0.5 rounded tracking-widest font-mono">
                AI COGNITIVE
              </span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                Insurance Certified
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <Car className="w-6 h-6 text-sky-400 inline" /> AutoGuard <span className="text-sky-400">Estimator</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
          {/* Dynamic Currency Selection Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300 shadow-inner hover:border-slate-300 dark:hover:border-slate-700 transition">
            <Globe className="w-3.5 h-3.5 text-sky-400 animate-spin-slow" />
            <select
              id="currency-converter-select"
              value={currency}
              onChange={(e) => onCurrencyChange?.(e.target.value as "INR" | "USD")}
              className="bg-transparent border-none text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-0 cursor-pointer pr-1"
            >
              <option value="INR" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-mono">INR (₹)</option>
              <option value="USD" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-mono">USD ($)</option>
            </select>
          </div>

          {/* Light/Dark mode toggle switch */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900/60 transition-all duration-200 cursor-pointer shadow-sm font-mono font-bold"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs">LIGHT MODE</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs">DARK MODE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
