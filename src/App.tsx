import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { DoodleTable } from './components/DoodleTable';
import { VoteModal } from './components/VoteModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { Participant } from './types';
import { getDefaultYear, generatePollDates } from './lib/dates';
import { getSupabase, getSupabaseConfig } from './lib/supabase';
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
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
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
    const config = getSupabaseConfig();
    if (!config) {
      setIsConnected(false);
      setIsLoading(false);
      // If not configured, auto open setup guide on first visit
      setIsSetupOpen(true);
      return;
    }

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
      setError('Supabase is not configured. Please open Setup to configure credentials.');
      setIsSetupOpen(true);
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
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar
        isConnected={isConnected}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenVote={() => {
          setEditingParticipant(null);
          setIsVoteOpen(true);
        }}
        year={year}
        onYearChange={(newYear) => setYear(newYear)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Supabase Not Configured Banner */}
        {!isConnected && !isLoading && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm">Supabase connection not configured yet</h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Follow our step-by-step guidelines to set up your free Supabase database or paste your credentials to test immediately.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSetupOpen(true)}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-xs"
            >
              Configure Database
            </button>
          </div>
        )}

        {/* Database Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{error}</p>
                {error.includes('Invalid path specified') && (
                  <p className="text-red-700 mt-1">
                    💡 <strong>Diagnosis:</strong> This occurs when the Supabase URL includes <code>/rest/v1</code> or a trailing slash <code>/</code>.
                    Your GitHub Secret <code>VITE_SUPABASE_URL</code> should be just <code>https://&lt;project-ref&gt;.supabase.co</code>.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsSetupOpen(true)}
                className="px-2.5 py-1 bg-white border border-red-200 text-red-800 hover:bg-red-50 rounded-lg font-semibold transition"
              >
                Review Connection
              </button>
              <button
                onClick={loadParticipants}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Padel Poll &bull; {year} Season
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              November &ndash; Christmas Availability
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Vote for any Friday or Saturday you can play. Anyone can modify selections in this trust-based poll.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Poll</span>
            </button>
            <button
              onClick={loadParticipants}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition shadow-xs"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
            <button
              onClick={() => {
                setEditingParticipant(null);
                setIsVoteOpen(true);
              }}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 transition active:scale-95"
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
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p>
            🎾 <strong>PadelDoodle</strong> &bull; Free open-source match polling built with React, Vite, Supabase &amp; GitHub Pages.
          </p>
          <p className="text-slate-400">
            Trust-based participation &bull; No authentication required &bull; Live Realtime sync
          </p>
        </div>
      </footer>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
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

      {/* Setup Guide Modal */}
      <SetupGuideModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onConfigUpdated={() => {
          loadParticipants();
        }}
      />
    </div>
  );
};

export default App;
