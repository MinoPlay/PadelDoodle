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
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No match votes yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Be the first player to add your availability! You can choose as many Friday and Saturday dates as you want.
        </p>
        <button
          onClick={onOpenVote}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your Availability</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-slate-800">Availability Grid</span>
          <span className="text-xs text-slate-500">
            ({participants.length} {participants.length === 1 ? 'person' : 'people'} responded)
          </span>
        </div>
        <div className="text-xs text-slate-500 flex items-center space-x-3">
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Available</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
            <span>Unavailable</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <span className="text-amber-500 font-bold">★</span>
            <span>Top Pick</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* Table Header */}
          <thead>
            {/* Month Span Row */}
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100/70">
              <th className="p-3 sticky left-0 z-20 bg-slate-100 min-w-[200px] border-r border-slate-200">
                Participant
              </th>
              {novemberDates.length > 0 && (
                <th
                  colSpan={novemberDates.length}
                  className="p-2 text-center border-r border-slate-200 bg-emerald-50/60 text-emerald-800"
                >
                  November
                </th>
              )}
              {decemberDates.length > 0 && (
                <th
                  colSpan={decemberDates.length}
                  className="p-2 text-center bg-teal-50/60 text-teal-800"
                >
                  December (until Christmas)
                </th>
              )}
            </tr>

            {/* Date Details Row */}
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-xs">
              <th className="p-3 sticky left-0 z-20 bg-slate-50 border-r border-slate-200">
                <span className="text-slate-400 font-normal">Click pencil to modify</span>
              </th>
              {dates.map((d) => {
                const isTop = maxVotes > 0 && countsByDate[d.id] === maxVotes;
                return (
                  <th
                    key={d.id}
                    className={`p-2 text-center min-w-[62px] border-r border-slate-100 ${
                      isTop ? 'bg-amber-50/70 text-amber-950 font-bold' : ''
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">
                      {d.weekday}
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {d.dayNumber}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body (Participants) */}
          <tbody className="divide-y divide-slate-100 text-sm">
            {participants.map((p) => {
              const selectedSet = new Set(p.selected_dates || []);
              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Sticky Participant Name Column */}
                  <td className="p-3 sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 border-r border-slate-200 font-medium text-slate-900 transition-colors">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate font-semibold text-slate-800" title={p.name}>
                          {p.name}
                        </span>
                      </div>

                      {/* Edit & Delete Action Buttons (trust-based system) */}
                      <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => onEditParticipant(p)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title={`Edit ${p.name}'s votes`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteParticipant(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
                        className={`p-2 text-center border-r border-slate-100 ${
                          isTop ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {isAvailable ? (
                          <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 mx-auto rounded-lg text-slate-300 flex items-center justify-center">
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
            <tr className="bg-slate-100/80 border-t-2 border-slate-200 font-bold text-slate-800">
              <td className="p-3 sticky left-0 z-10 bg-slate-100 border-r border-slate-200 text-xs uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <span>Total Players Available</span>
                  <span className="text-slate-400 font-normal">({participants.length})</span>
                </div>
              </td>
              {dates.map((d) => {
                const count = countsByDate[d.id] || 0;
                const isTop = maxVotes > 0 && count === maxVotes;
                return (
                  <td
                    key={d.id}
                    className={`p-2.5 text-center border-r border-slate-200 ${
                      isTop ? 'bg-amber-100 text-amber-900 font-extrabold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-sm">{count}</span>
                      {isTop && count > 0 && (
                        <div className="flex items-center text-[10px] text-amber-600 font-bold mt-0.5">
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
