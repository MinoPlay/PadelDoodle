import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { DoodleTable } from './components/DoodleTable';
import { VoteModal } from './components/VoteModal';
import { Participant } from './types';
import { getDefaultYear, generatePollDates } from './lib/dates';
import { getSupabase } from './lib/supabase';
import { AlertTriangle, RefreshCw, Sparkles, CheckCircle, Share2 } from 'lucide-react';

export const App: React.FC = () => {
  const [year, setYear] = useState<number>(getDefaultYear());
  const dates = useMemo(() => generatePollDates(year), [year]);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const [isVoteOpen, setIsVoteOpen] = useState<boolean>(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch participants from Supabase
  const loadParticipants = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsConnected(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchErr) {
        throw fetchErr;
      }

      setParticipants(data || []);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Error fetching participants:', err);
      setError(err.message || 'Failed to load votes from Supabase.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and Realtime listener
  useEffect(() => {
    loadParticipants();

    const supabase = getSupabase();
    if (!supabase) return;

    // Supabase Realtime channel
    const channel = supabase
      .channel('public:participants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadParticipants]);

  // Submit or update a vote
  const handleVoteSubmit = async (
    name: string,
    selectedDates: string[],
    existingId?: string
  ): Promise<boolean> => {
    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase is not configured.');
      return false;
    }

    try {
      if (existingId) {
        // Update existing participant
        const { error: updateErr } = await supabase
          .from('participants')
          .update({
            name,
            selected_dates: selectedDates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingId);

        if (updateErr) throw updateErr;
        showToast(`Updated availability for ${name}!`);
      } else {
        // Insert new participant
        const { error: insertErr } = await supabase
          .from('participants')
          .insert([
            {
              name,
              selected_dates: selectedDates,
            },
          ]);

        if (insertErr) throw insertErr;
        showToast(`Added availability for ${name}!`);
      }

      await loadParticipants();
      return true;
    } catch (err: any) {
      console.error('Error saving vote:', err);
      alert(`Could not save vote: ${err.message || 'Unknown error'}`);
      return false;
    }
  };

  // Edit existing participant
  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant);
    setIsVoteOpen(true);
  };

  // Delete participant
  const handleDeleteParticipant = async (participantId: string, name: string) => {
    const ok = window.confirm(`Are you sure you want to remove ${name}'s availability?`);
    if (!ok) return;

    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error: deleteErr } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantId);

      if (deleteErr) throw deleteErr;
      showToast(`Removed ${name}'s availability.`);
      await loadParticipants();
    } catch (err: any) {
      console.error('Error deleting participant:', err);
      alert(`Could not delete: ${err.message}`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'PadelDoodle - Match Poll',
        text: 'Vote on Friday and Saturday match dates from November until Christmas!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col court-bg text-slate-200">
      <Navbar
        isConnected={isConnected}
        onOpenVote={() => {
          setEditingParticipant(null);
          setIsVoteOpen(true);
        }}
        year={year}
        onYearChange={(newYear) => setYear(newYear)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">
        {/* Database Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{error}</p>
                {error.includes('Invalid path specified') && (
                  <p className="text-red-300 mt-1">
                    💡 <strong>Diagnosis:</strong> This occurs when the Supabase URL includes <code>/rest/v1</code> or a trailing slash <code>/</code>.
                    Your GitHub Secret <code>VITE_SUPABASE_URL</code> should be just <code>https://&lt;project-ref&gt;.supabase.co</code>.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={loadParticipants}
                className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header Hero Section */}
        <div className="overflow-hidden rounded-3xl border border-sky-400/25 bg-court-950 shadow-2xl shadow-blue-950/40">
          <img
            src="/padel-assets/onodpc-header-banner.svg"
            alt="Official Not Official Demant Padel Club — Padel, burgers, drinks"
            className="block w-full h-auto"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 sm:pb-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-widest text-ball bg-ball/10 px-2.5 py-1 rounded-lg border border-ball/25">
                Padel Poll &bull; {year} Season
              </span>
            </div>
            <h2 className="text-[1.65rem] leading-tight sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1.5 max-w-3xl">
              OfficialNotOffical Padel Club Outing - PART 3!
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Vote for any Friday or Saturday you can play. Anyone can modify selections in this trust-based poll.
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto] sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-court-700 bg-court-900 hover:bg-court-800 text-slate-300 text-xs sm:text-sm font-semibold transition"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share Poll</span>
            </button>
            <button
              onClick={loadParticipants}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-court-700 bg-court-900 hover:bg-court-800 text-slate-400 hover:text-slate-100 transition"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-ball' : ''}`} />
            </button>
            <button
              onClick={() => {
                setEditingParticipant(null);
                setIsVoteOpen(true);
              }}
              className="inline-flex items-center justify-center space-x-2 bg-ball hover:bg-ball-400 text-court-950 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-glow transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Add My Vote</span>
            </button>
          </div>
        </div>

        {/* Stats & Summary Cards */}
        <StatsCards
          participants={participants}
          dates={dates}
          onOpenVote={() => {
            setEditingParticipant(null);
            setIsVoteOpen(true);
          }}
        />

        {/* Main Doodle Grid Table */}
        <DoodleTable
          participants={participants}
          dates={dates}
          onEditParticipant={handleEditParticipant}
          onDeleteParticipant={handleDeleteParticipant}
          onOpenVote={() => {
            setEditingParticipant(null);
            setIsVoteOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-court-700/60 bg-court-950/70 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-sky-400/20 shadow-xl shadow-blue-950/30">
            <img
              src="/padel-assets/onodpc-footer-banner.svg"
              alt="Official Not Official Demant Padel Club — Play, Feast, Repeat"
              className="block w-full h-auto"
            />
          </div>
          <div className="text-center text-xs text-slate-400 space-y-1">
            <p>
              🎾 <strong className="text-slate-200">PadelDoodle</strong> &bull; Free open-source match polling built with React, Vite, Supabase &amp; GitHub Pages.
            </p>
            <p className="text-slate-500">
              Trust-based participation &bull; No authentication required &bull; Live Realtime sync
            </p>
          </div>
        </div>
      </footer>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-court-850 border border-ball/30 text-slate-100 px-4 py-3 rounded-2xl shadow-glow flex items-center space-x-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-ball" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Voting Modal */}
      <VoteModal
        isOpen={isVoteOpen}
        onClose={() => {
          setIsVoteOpen(false);
          setEditingParticipant(null);
        }}
        onSubmit={handleVoteSubmit}
        dates={dates}
        editingParticipant={editingParticipant}
      />
    </div>
  );
};

export default App;
