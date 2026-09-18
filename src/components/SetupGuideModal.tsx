import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Key, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, getSupabaseConfig, saveLocalSupabaseConfig, clearLocalSupabaseConfig } from '../lib/supabase';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig?.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig?.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'test'>('guide');

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSaveLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && anonKey) {
      saveLocalSupabaseConfig(url, anonKey);
      setSaveSuccess(true);
      onConfigUpdated();
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleClearLocal = () => {
    clearLocalSupabaseConfig();
    setUrl('');
    setAnonKey('');
    onConfigUpdated();
  };

  const isEnvConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center">
              ⚡
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Supabase & GitHub Pages Setup Guide</h2>
              <p className="text-xs text-slate-400">Everything is 100% free with no credit card required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Setup Guidelines & SQL
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'test'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Browser Keys / Instant Preview</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {activeTab === 'guide' ? (
            <>
              {/* Step 1: Supabase Free Project */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 font-bold">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                    1
                  </span>
                  <h3>Create your free Supabase project</h3>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Sign in or create an account at{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 underline font-semibold inline-flex items-center space-x-1"
                  >
                    <span>supabase.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  . Click <strong>"New Project"</strong>, give it a name (e.g. <code>PadelDoodle</code>) and choose a free database password.
                </p>
              </div>

              {/* Step 2: Run SQL Schema */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 font-bold">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                    2
                  </span>
                  <h3>Run the Database Schema in SQL Editor</h3>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  In your Supabase dashboard, click <strong>SQL Editor</strong> on the left sidebar, paste the code below, and click <strong>Run</strong>.
                </p>

                <div className="pl-8">
                  <div className="relative rounded-2xl bg-slate-900 text-slate-200 p-4 font-mono text-xs overflow-x-auto">
                    <button
                      onClick={handleCopySql}
                      className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 transition text-[11px]"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                    </button>
                    <pre className="pr-20 text-[11px] leading-relaxed">{SUPABASE_SQL_SCHEMA}</pre>
                  </div>
                </div>
              </div>

              {/* Step 3: Get Supabase Keys */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 font-bold">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                    3
                  </span>
                  <h3>Obtain your Project URL and Anon Public Key</h3>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  In Supabase, go to <strong>Project Settings &rarr; API</strong> (or Settings &rarr; Data API):
                </p>
                <ul className="text-xs text-slate-600 pl-12 list-disc space-y-1">
                  <li>
                    <strong>Project URL:</strong> e.g. <code>https://your-project-id.supabase.co</code>
                  </li>
                  <li>
                    <strong>anon / public key:</strong> the safe public client key (e.g. <code>eyJhbGciOi...</code>)
                  </li>
                </ul>
              </div>

              {/* Step 4: GitHub Actions & Secrets */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 font-bold">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                    4
                  </span>
                  <h3>Add GitHub Actions Secrets</h3>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  In your GitHub repository (<code>PadelDoodle</code>):
                </p>
                <ol className="text-xs text-slate-600 pl-12 list-decimal space-y-1">
                  <li>Go to <strong>Settings</strong> &rarr; <strong>Secrets and variables</strong> &rarr; <strong>Actions</strong>.</li>
                  <li>Click <strong>New repository secret</strong> and add:
                    <div className="my-1.5 p-2 bg-slate-100 rounded-lg font-mono text-[11px] space-y-1">
                      <div>Name: <strong className="text-emerald-700">VITE_SUPABASE_URL</strong> &nbsp;|&nbsp; Value: your project URL</div>
                      <div>Name: <strong className="text-emerald-700">VITE_SUPABASE_ANON_KEY</strong> &nbsp;|&nbsp; Value: your anon public key</div>
                    </div>
                  </li>
                  <li>
                    Go to <strong>Settings</strong> &rarr; <strong>Pages</strong>. Under <strong>Build and deployment &rarr; Source</strong>, choose <strong>GitHub Actions</strong>.
                  </li>
                  <li>
                    Push any commit to the <code>main</code> branch or trigger the workflow under the <strong>Actions</strong> tab to deploy automatically!
                  </li>
                </ol>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                <p className="font-semibold mb-1">Instant Browser Preview</p>
                <p>
                  You can paste your Supabase URL and Anon Public Key right here to test your doodle poll immediately without waiting for GitHub deployment!
                  Values are stored only in your local browser storage.
                </p>
              </div>

              {isEnvConfigured && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>Vite environment variables are active in this build.</span>
                </div>
              )}

              <form onSubmit={handleSaveLocal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzabcdefg.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="text"
                    required
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleClearLocal}
                    className="inline-flex items-center space-x-1.5 text-xs text-red-600 hover:text-red-800 transition font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Local Keys</span>
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saveSuccess ? 'Saved!' : 'Save & Test Connection'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            PadelDoodle &bull; 100% Client-Side & Serverless
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
