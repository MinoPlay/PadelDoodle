import React from 'react';
import { ShieldCheck } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
      {/* Card 1: Total Participants */}
      <div className="bg-court-900/80 rounded-2xl p-5 border border-court-700/60 shadow-lg shadow-black/30 flex items-center space-x-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-ball/10 text-ball border border-ball/20 flex items-center justify-center shrink-0">
          <img src="/padel-assets/asset-demant-mascot.svg" alt="" className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Players Voted</p>
          <div className="flex items-baseline space-x-1.5 sm:space-x-2">
            <span className="text-2xl font-bold text-slate-100">{participants.length}</span>
            <span className="text-xs text-slate-500">on the court</span>
          </div>
        </div>
      </div>

      {/* Card 2: Leading Match Date */}
      <div className="bg-court-900/80 rounded-2xl p-5 border border-court-700/60 shadow-lg shadow-black/30 flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-blue-400/10 text-blue-300 border border-blue-400/20 flex items-center justify-center shrink-0">
          <img src="/padel-assets/asset-demant-trophy.svg" alt="" className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Leading Match Day</p>
          {bestDateInfo ? (
            <div className="truncate">
              <span className="text-base sm:text-lg font-bold text-slate-100 block truncate">
                {bestDateInfo.dates.map((d) => d.displayLabel).join(', ')}
              </span>
              <p className="text-xs text-ball font-semibold">
                {bestDateInfo.maxVotes} {bestDateInfo.maxVotes === 1 ? 'player' : 'players'} available ({Math.round((bestDateInfo.maxVotes / participants.length) * 100)}%)
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-500">Waiting for the first serve...</p>
          )}
        </div>
      </div>

      {/* Card 3: Trust-based & Dates info */}
      <div className="court-net bg-gradient-to-br from-court-700 to-court-850 rounded-2xl p-4 sm:p-5 text-white border border-court-600/60 shadow-lg shadow-black/30 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-1.5 text-ball text-xs font-medium mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Trust-Based Polling</span>
          </div>
          <p className="text-sm font-semibold text-slate-100 leading-snug">
            Anyone can add or edit selections
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Pick any Friday/Saturday from Nov until Christmas.
          </p>
        </div>
        <button
          onClick={onOpenVote}
          className="shrink-0 bg-ball hover:bg-ball-400 text-court-950 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-glow"
        >
          Vote
        </button>
      </div>
    </div>
  );
};
