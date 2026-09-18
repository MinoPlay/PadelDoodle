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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <span className="text-xl">🎾</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                Padel<span className="text-emerald-600">Doodle</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Fridays & Saturdays
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Find the perfect match day from November to Christmas
            </p>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Year selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-medium text-slate-600">
            <button
              onClick={() => onYearChange(year - 1)}
              className="px-2 py-1 hover:text-slate-900 transition"
              title="Previous year"
            >
              &larr;
            </button>
            <span className="px-1.5 py-0.5 font-semibold text-slate-800">{year}</span>
            <button
              onClick={() => onYearChange(year + 1)}
              className="px-2 py-1 hover:text-slate-900 transition"
              title="Next year"
            >
              &rarr;
            </button>
          </div>

          {/* Database connection badge */}
          {isConnected ? (
            <div
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 select-none"
              title="Database connected and live syncing"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300" />
              <Database className="w-3.5 h-3.5 hidden sm:inline" />
              <span>Connected</span>
            </div>
          ) : (
            <div
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-amber-50 text-amber-800 border-amber-200 select-none"
              title="Database not configured"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-300" />
              <Database className="w-3.5 h-3.5 hidden sm:inline" />
              <span>Not Connected</span>
            </div>
          )}

          {/* Vote CTA */}
          <button
            onClick={onOpenVote}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vote</span>
          </button>
        </div>
      </div>
    </header>
  );
};
