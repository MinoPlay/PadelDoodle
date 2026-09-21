import React from 'react';
import { Database, Plus } from 'lucide-react';

interface NavbarProps {
  isConnected: boolean;
  onOpenVote: () => void;
  year: number;
  onYearChange: (year: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isConnected,
  onOpenVote,
  year,
  onYearChange,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-court-950/90 backdrop-blur-md border-b border-court-700/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-16 py-2 sm:py-0 flex items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-ball-500 to-ball-700 flex items-center justify-center text-court-950 shadow-glow shrink-0">
            <span className="text-xl">🎾</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base sm:text-xl text-slate-100 tracking-tight whitespace-nowrap">
                Padel<span className="text-ball">Doodle</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-ball/10 text-ball-400 border border-ball/25">
                Fridays &amp; Saturdays
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Find the perfect match day from November to Christmas
            </p>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center space-x-1.5 sm:space-x-4 shrink-0">
          {/* Year selector */}
          <div className="flex items-center bg-court-850 rounded-lg p-0.5 border border-court-700 text-xs font-medium text-slate-400">
            <button
              onClick={() => onYearChange(year - 1)}
              className="px-2 py-1 hover:text-ball transition"
              title="Previous year"
            >
              &larr;
            </button>
            <span className="px-1.5 py-0.5 font-semibold text-slate-100 tabular-nums">{year}</span>
            <button
              onClick={() => onYearChange(year + 1)}
              className="px-2 py-1 hover:text-ball transition"
              title="Next year"
            >
              &rarr;
            </button>
          </div>

          {/* Database connection badge */}
          {isConnected ? (
            <div
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-turf-500/10 text-turf-400 border-turf-500/30 select-none"
              title="Database connected and live syncing"
            >
              <span className="w-2 h-2 rounded-full bg-turf-400 ring-2 ring-turf-400/30" />
              <Database className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="hidden sm:inline">Connected</span>
            </div>
          ) : (
            <div
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-amber-500/10 text-amber-300 border-amber-500/30 select-none"
              title="Database not configured"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
              <Database className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="hidden sm:inline">Not Connected</span>
            </div>
          )}

          {/* Vote CTA */}
          <button
            onClick={onOpenVote}
            className="inline-flex items-center space-x-1.5 bg-ball hover:bg-ball-400 text-court-950 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-glow transition active:scale-95"
            aria-label="Add vote"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Vote</span>
          </button>
        </div>
      </div>
    </header>
  );
};
