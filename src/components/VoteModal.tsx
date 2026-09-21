import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, User, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Participant, PollDate } from '../types';

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, selectedDates: string[], existingId?: string) => Promise<boolean>;
  dates: PollDate[];
  editingParticipant?: Participant | null;
}

export const VoteModal: React.FC<VoteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  dates,
  editingParticipant,
}) => {
  const [name, setName] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when modal opens or editingParticipant changes
  useEffect(() => {
    if (editingParticipant) {
      setName(editingParticipant.name);
      setSelectedDates(editingParticipant.selected_dates || []);
    } else {
      setName('');
      setSelectedDates([]);
    }
    setError(null);
  }, [editingParticipant, isOpen]);

  if (!isOpen) return null;

  const toggleDate = (dateId: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateId) ? prev.filter((id) => id !== dateId) : [...prev, dateId]
    );
  };

  const selectAll = () => {
    setSelectedDates(dates.map((d) => d.id));
  };

  const clearAll = () => {
    setSelectedDates([]);
  };

  const selectFridays = () => {
    setSelectedDates(dates.filter((d) => d.weekday === 'Fri').map((d) => d.id));
  };

  const selectSaturdays = () => {
    setSelectedDates(dates.filter((d) => d.weekday === 'Sat').map((d) => d.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    if (selectedDates.length === 0) {
      setError('Please select at least one date.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const success = await onSubmit(trimmedName, selectedDates, editingParticipant?.id);
    setIsSubmitting(false);

    if (success) {
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7dd3fc', '#38bdf8', '#2563eb', '#1e4973'],
      });
      onClose();
    }
  };

  // Group dates by month
  const novemberDates = dates.filter((d) => d.monthName === 'November');
  const decemberDates = dates.filter((d) => d.monthName === 'December');

  const dateButtonClass = (isSelected: boolean) =>
    `p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
      isSelected
        ? 'bg-ball/15 border-ball text-ball font-semibold ring-1 ring-ball'
        : 'bg-court-850 hover:bg-court-800 border-court-700 text-slate-300'
    }`;

  const checkboxClass = (isSelected: boolean) =>
    `w-5 h-5 rounded-md flex items-center justify-center transition ${
      isSelected ? 'bg-ball text-court-950' : 'border border-court-600 bg-court-900'
    }`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-court-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-court-900 w-full max-w-2xl max-h-[95dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/50 border border-court-700/60 overflow-hidden animate-in fade-in slide-in-from-bottom-3 sm:zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="court-net px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-court-700 to-court-850 text-white flex items-center justify-between gap-3 border-b border-court-700">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-ball/15 border border-ball/30 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-ball" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
                {editingParticipant ? `Modify ${editingParticipant.name}'s Availability` : 'Add Your Match Availability'}
              </h2>
              <p className="text-xs text-slate-400">
                Choose all the dates you are available to play Padel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Player Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Carlos, Alex, Maria..."
                className="w-full pl-10 pr-4 py-2.5 bg-court-850 border border-court-700 text-slate-100 placeholder:text-slate-500 rounded-xl text-sm font-medium focus:ring-2 focus:ring-ball focus:border-ball focus:outline-none transition"
              />
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Dates ({selectedDates.length} of {dates.length} chosen)
              </label>
              <div className="flex flex-wrap justify-end gap-1.5">
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-2 py-1 bg-court-800 hover:bg-court-700 text-slate-200 text-xs font-semibold rounded-md transition"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={selectFridays}
                  className="px-2 py-1 bg-court-800 hover:bg-court-700 text-slate-200 text-xs font-semibold rounded-md transition"
                >
                  Fridays Only
                </button>
                <button
                  type="button"
                  onClick={selectSaturdays}
                  className="px-2 py-1 bg-court-800 hover:bg-court-700 text-slate-200 text-xs font-semibold rounded-md transition"
                >
                  Saturdays Only
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-2 py-1 bg-court-800 hover:bg-court-700 text-slate-400 text-xs font-medium rounded-md transition"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Date Grid */}
            <div className="space-y-4 max-h-[38vh] sm:max-h-72 overflow-y-auto pr-1">
              {/* November */}
              {novemberDates.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <span>November</span>
                    <span className="text-[10px] bg-court-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {novemberDates.length} dates
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {novemberDates.map((item) => {
                      const isSelected = selectedDates.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleDate(item.id)}
                          className={dateButtonClass(isSelected)}
                        >
                          <div>
                            <span className="text-[11px] uppercase font-bold text-slate-500 block">
                              {item.weekday}
                            </span>
                            <span className="text-sm">
                              Nov {item.dayNumber}
                            </span>
                          </div>
                          <div className={checkboxClass(isSelected)}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* December */}
              {decemberDates.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <span>December (until Christmas)</span>
                    <span className="text-[10px] bg-court-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {decemberDates.length} dates
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {decemberDates.map((item) => {
                      const isSelected = selectedDates.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleDate(item.id)}
                          className={dateButtonClass(isSelected)}
                        >
                          <div>
                            <span className="text-[11px] uppercase font-bold text-slate-500 block">
                              {item.weekday}
                            </span>
                            <span className="text-sm">
                              Dec {item.dayNumber}
                            </span>
                          </div>
                          <div className={checkboxClass(isSelected)}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-court-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 text-sm font-semibold text-slate-400 hover:text-slate-100 transition rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center space-x-2 bg-ball hover:bg-ball-400 disabled:opacity-50 text-court-950 px-5 py-2.5 rounded-xl text-sm font-bold shadow-glow transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : editingParticipant ? 'Save Changes' : 'Submit Availability'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
