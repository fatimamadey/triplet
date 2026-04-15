"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Map, PlusCircle, Sun, Moon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-cork/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Map size={24} className="text-teal" />
            <span className="text-2xl font-handwritten font-bold text-foreground">Triplet</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-teal/10 text-teal"
                  : "text-muted hover:text-foreground hover:bg-cream-dark"
              }`}
            >
              My Trips
            </Link>
            <Link
              href="/trips/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <PlusCircle size={15} />
              New Trip
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-cream-dark transition-colors"
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {/* User */}
            <UserButton />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-2 rounded-lg text-muted hover:text-foreground"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <nav className="sm:hidden pb-3 border-t border-cork/20 mt-1 pt-3 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-teal/10 text-teal"
                  : "text-muted hover:text-foreground hover:bg-cream-dark"
              }`}
            >
              My Trips
            </Link>
            <Link
              href="/trips/new"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-cream-dark"
            >
              + New Trip
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
