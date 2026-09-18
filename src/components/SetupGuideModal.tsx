import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Key, Save, Trash2, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_SQL_SCHEMA,
  getSupabaseConfigWithSource,
  saveLocalSupabaseConfig,
  clearLocalSupabaseConfig,
  sanitizeSupabaseUrl,
  sanitizeSupabaseKey,
} from '../lib/supabase';

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
  const { config: currentConfig, source } = getSupabaseConfigWithSource();
  const [url, setUrl] = useState(currentConfig?.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig?.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'test'>('guide');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestConnection = async () => {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = sanitizeSupabaseKey(anonKey);

    if (!cleanUrl || !cleanKey) {
      setTestResult({ success: false, message: 'Please enter both Supabase URL and Anon Key to test.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const client = createClient(cleanUrl, cleanKey, {
        auth: { persistSession: false },
      });
      const { error } = await client.from('participants').select('id').limit(1);

      if (error) {
        setTestResult({ success: false, message: error.message });
      } else {
        setTestResult({
          success: true,
          message: 'Connected successfully! The "participants" table is responding properly.',
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && anonKey) {
      const cleanUrl = sanitizeSupabaseUrl(url);
      const cleanKey = sanitizeSupabaseKey(anonKey);
      setUrl(cleanUrl);
      setAnonKey(cleanKey);
      saveLocalSupabaseConfig(cleanUrl, cleanKey);
      setSaveSuccess(true);
      onConfigUpdated();
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleClearLocal = () => {
    clearLocalSupabaseConfig();
    const refreshed = getSupabaseConfigWithSource();
    setUrl(refreshed.config?.url || '');
    setAnonKey(refreshed.config?.anonKey || '');
    setTestResult(null);
    onConfigUpdated();
  };

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

                {/* Important Callout regarding Invalid path specified in request URL */}
                <div className="ml-8 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Avoid "Invalid path specified in request URL":</span>
                  </div>
                  <p className="text-amber-800">
                    Make sure the URL is <strong>only</strong> the root domain: <code>https://your-ref.supabase.co</code>.
                  </p>
                  <ul className="list-disc pl-4 text-amber-700 space-y-0.5">
                    <li>❌ Do <strong>NOT</strong> copy the REST URL (<code>.../rest/v1</code>).</li>
                    <li>❌ Do <strong>NOT</strong> include a trailing slash (<code>https://your-ref.supabase.co/</code>).</li>
                    <li>❌ Do <strong>NOT</strong> wrap the value in quotes.</li>
                  </ul>
                  <p className="text-[11px] text-amber-600 italic">
                    (Our client now auto-cleans and sanitizes these formats automatically, but your GitHub Secret should ideally match the root URL).
                  </p>
                </div>
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
                    <div className="my-1.5 p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] space-y-1.5">
                      <div>
                        Name: <strong className="text-emerald-700">VITE_SUPABASE_URL</strong><br />
                        Value: <code>https://your-project-id.supabase.co</code> <span className="text-slate-400">(no /rest/v1, no trailing slash)</span>
                      </div>
                      <div>
                        Name: <strong className="text-emerald-700">VITE_SUPABASE_ANON_KEY</strong><br />
                        Value: <code>eyJhbGciOi...</code> <span className="text-slate-400">(your anon public key)</span>
                      </div>
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
                <p className="font-semibold mb-1">Live Browser Configuration &amp; Diagnostics</p>
                <p>
                  You can paste your Supabase URL and Anon Key right here to test or override settings in real time.
                  Any trailing slash or <code>/rest/v1</code> will be automatically stripped.
                </p>
              </div>

              {source === 'env' && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>Using credentials baked into GitHub Actions build (<code>VITE_SUPABASE_URL</code>).</span>
                </div>
              )}

              {source === 'localStorage' && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center space-x-2">
                  <Key className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Using browser local storage override. Click "Clear Local Keys" to revert to GitHub build secrets.</span>
                </div>
              )}

              <form onSubmit={handleSaveLocal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzabcdefg.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Must be root domain only (e.g. <code>https://xyz.supabase.co</code>). Do not include <code>/rest/v1</code>.
                  </p>
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

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{testResult.success ? 'Connection Success' : 'Connection Failed'}</p>
                      <p className="text-[11px] mt-0.5">{testResult.message}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleClearLocal}
                      className="inline-flex items-center space-x-1.5 text-xs text-red-600 hover:text-red-800 transition font-medium px-2 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Local Keys</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="inline-flex items-center space-x-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 transition font-medium px-3 py-1.5 rounded-lg shadow-xs disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saveSuccess ? 'Saved!' : 'Save Credentials'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            PadelDoodle &bull; 100% Client-Side &amp; Serverless
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
