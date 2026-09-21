import React from 'react';
import { Check, Minus, Edit2, Trash2, Trophy, Plus, UserPlus } from 'lucide-react';
import { Participant, PollDate } from '../types';

interface DoodleTableProps {
  participants: Participant[];
  dates: PollDate[];
  onEditParticipant: (participant: Participant) => void;
  onDeleteParticipant: (participantId: string, name: string) => void;
  onOpenVote: () => void;
}

export const DoodleTable: React.FC<DoodleTableProps> = ({
  participants,
  dates,
  onEditParticipant,
  onDeleteParticipant,
  onOpenVote,
}) => {
  // Counts per date
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

  // Max vote count to highlight best date(s)
  const maxVotes = React.useMemo(() => {
    let max = 0;
    Object.values(countsByDate).forEach((v) => {
      if (v > max) max = v;
    });
    return max;
  }, [countsByDate]);

  // Group dates by month for header
  const novemberDates = dates.filter((d) => d.monthName === 'November');
  const decemberDates = dates.filter((d) => d.monthName === 'December');

  if (participants.length === 0) {
    return (
      <div className="bg-court-900/80 rounded-3xl border border-court-700/60 p-12 text-center shadow-lg shadow-black/30">
        <div className="w-16 h-16 rounded-2xl bg-ball/10 text-ball border border-ball/20 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-100 mb-1">Empty court &mdash; no votes yet</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Be the first player to add your availability! You can choose as many Friday and Saturday dates as you want.
        </p>
        <button
          onClick={onOpenVote}
          className="inline-flex items-center space-x-2 bg-ball hover:bg-ball-400 text-court-950 px-5 py-2.5 rounded-xl text-sm font-bold shadow-glow transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your Availability</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-court-900/80 rounded-3xl border border-court-700/60 shadow-lg shadow-black/30 overflow-hidden flex flex-col">
      <div className="court-net p-3 sm:p-4 border-b border-court-700/60 bg-court-850/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-slate-100">Court Availability Grid</span>
          <span className="text-xs text-slate-400">
            ({participants.length} {participants.length === 1 ? 'player' : 'players'} responded)
          </span>
        </div>
        <div className="text-[11px] sm:text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-ball inline-block"></span>
            <span>Available</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-court-600 inline-block"></span>
            <span>Unavailable</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="text-sky-300 font-bold">★</span>
            <span>Top Pick</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto overscroll-x-contain">
        <div className="px-3 py-2 text-[11px] text-slate-500 sm:hidden border-b border-court-800">
          Swipe sideways to see every match date.
        </div>
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* Table Header */}
          <thead>
            {/* Month Span Row */}
            <tr className="border-b border-court-700/60 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 bg-court-850">
              <th className="p-2.5 sm:p-3 sticky left-0 z-20 bg-court-850 min-w-[160px] sm:min-w-[200px] border-r border-court-700/60">
                Player
              </th>
              {novemberDates.length > 0 && (
                <th
                  colSpan={novemberDates.length}
                  className="p-2 text-center border-r border-court-700/60 bg-court-700/40 text-ball-400"
                >
                  November
                </th>
              )}
              {decemberDates.length > 0 && (
                <th
                  colSpan={decemberDates.length}
                  className="p-2 text-center bg-turf-700/25 text-turf-400"
                >
                  December (until Christmas)
                </th>
              )}
            </tr>

            {/* Date Details Row */}
            <tr className="border-b border-court-700/60 bg-court-850/60 text-slate-300 text-xs">
              <th className="p-2.5 sm:p-3 sticky left-0 z-20 bg-court-850 border-r border-court-700/60">
                <span className="text-slate-500 font-normal">Click pencil to modify</span>
              </th>
              {dates.map((d) => {
                const isTop = maxVotes > 0 && countsByDate[d.id] === maxVotes;
                return (
                  <th
                    key={d.id}
                    className={`p-1.5 sm:p-2 text-center min-w-[58px] sm:min-w-[62px] border-r border-court-800 ${
                      isTop ? 'bg-ball/10 font-bold' : ''
                    }`}
                  >
                    <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase">
                      {d.weekday}
                    </div>
                    <div className={`text-sm font-bold ${isTop ? 'text-ball' : 'text-slate-200'}`}>
                      {d.dayNumber}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body (Participants) */}
          <tbody className="divide-y divide-court-800 text-sm">
            {participants.map((p) => {
              const selectedSet = new Set(p.selected_dates || []);
              return (
                <tr key={p.id} className="hover:bg-court-800/60 transition-colors group">
                  {/* Sticky Participant Name Column */}
                  <td className="p-3 sticky left-0 z-10 bg-court-900 group-hover:bg-court-800 border-r border-court-700/60 font-medium text-slate-100 transition-colors">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-ball-600 to-ball-400 text-court-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate font-semibold text-slate-100" title={p.name}>
                          {p.name}
                        </span>
                      </div>

                      {/* Edit & Delete Action Buttons (trust-based system) */}
                      <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => onEditParticipant(p)}
                          className="p-1.5 text-slate-500 hover:text-ball hover:bg-ball/10 rounded-lg transition"
                          title={`Edit ${p.name}'s votes`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteParticipant(p.id, p.name)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title={`Delete ${p.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Date Availability Cells */}
                  {dates.map((d) => {
                    const isAvailable = selectedSet.has(d.id);
                    const isTop = maxVotes > 0 && countsByDate[d.id] === maxVotes;
                    return (
                      <td
                        key={d.id}
                        className={`p-2 text-center border-r border-court-800 ${
                          isTop ? 'bg-ball/5' : ''
                        }`}
                      >
                        {isAvailable ? (
                          <div className="w-7 h-7 mx-auto rounded-lg bg-ball text-court-950 flex items-center justify-center shadow-glow">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 mx-auto rounded-lg text-court-600 flex items-center justify-center">
                            <Minus className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer / Summary Row */}
          <tfoot>
            <tr className="bg-court-850 border-t-2 border-court-700 font-bold text-slate-200">
              <td className="p-3 sticky left-0 z-10 bg-court-850 border-r border-court-700/60 text-xs uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <span>Total Players Available</span>
                  <span className="text-slate-500 font-normal">({participants.length})</span>
                </div>
              </td>
              {dates.map((d) => {
                const count = countsByDate[d.id] || 0;
                const isTop = maxVotes > 0 && count === maxVotes;
                return (
                  <td
                    key={d.id}
                    className={`p-2.5 text-center border-r border-court-700/60 ${
                      isTop ? 'bg-ball/15 text-ball font-extrabold' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-sm">{count}</span>
                      {isTop && count > 0 && (
                        <div className="flex items-center text-[10px] text-sky-300 font-bold mt-0.5">
                          <Trophy className="w-3 h-3 inline mr-0.5" />
                          <span>Top</span>
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
