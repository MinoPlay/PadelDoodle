import React from 'react';
import { Users, Trophy, ShieldCheck } from 'lucide-react';
import { Participant, PollDate } from '../types';

interface StatsCardsProps {
  participants: Participant[];
  dates: PollDate[];
  onOpenVote: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  participants,
  dates,
  onOpenVote,
}) => {
  // Compute counts per date
  const countsByDate = React.useMemo(() => {
    const map: Record<string, number> = {};
    dates.forEach((d) => (map[d.id] = 0));
    participants.forEach((p) => {
      p.selected_dates?.forEach((dateId) => {
        if (map[dateId] !== undefined) {
          map[dateId] += 1;
        }
      });
    });
    return map;
  }, [participants, dates]);

  // Find best date(s)
  const bestDateInfo = React.useMemo(() => {
    if (participants.length === 0) return null;

    let maxVotes = 0;
    let topDates: PollDate[] = [];

    dates.forEach((d) => {
      const count = countsByDate[d.id] || 0;
      if (count > maxVotes) {
        maxVotes = count;
        topDates = [d];
      } else if (count === maxVotes && count > 0) {
        topDates.push(d);
      }
    });

    if (maxVotes === 0) return null;
    return {
      maxVotes,
      dates: topDates,
    };
  }, [dates, countsByDate, participants.length]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Card 1: Total Participants */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Players Voted</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{participants.length}</span>
            <span className="text-xs text-slate-500">participants</span>
          </div>
        </div>
      </div>

      {/* Card 2: Leading Match Date */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Leading Match Day</p>
          {bestDateInfo ? (
            <div className="truncate">
              <span className="text-base sm:text-lg font-bold text-slate-900 block truncate">
                {bestDateInfo.dates.map((d) => d.displayLabel).join(', ')}
              </span>
              <p className="text-xs text-emerald-600 font-semibold">
                {bestDateInfo.maxVotes} {bestDateInfo.maxVotes === 1 ? 'player' : 'players'} available ({Math.round((bestDateInfo.maxVotes / participants.length) * 100)}%)
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-400">Waiting for votes...</p>
          )}
        </div>
      </div>

      {/* Card 3: Trust-based & Dates info */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-1.5 text-emerald-100 text-xs font-medium mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Trust-Based Polling</span>
          </div>
          <p className="text-sm font-semibold text-white">
            Anyone can add or edit selections
          </p>
          <p className="text-xs text-emerald-100 mt-1">
            Pick any Friday/Saturday from Nov until Christmas.
          </p>
        </div>
        <button
          onClick={onOpenVote}
          className="shrink-0 bg-white hover:bg-slate-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
        >
          Vote
        </button>
      </div>
    </div>
  );
};
