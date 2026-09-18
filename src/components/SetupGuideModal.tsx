import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Key,
  Save,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_SQL_SCHEMA,
  getSupabaseConfigWithSource,
  saveLocalSupabaseConfig,
  clearLocalSupabaseConfig,
  sanitizeSupabaseUrl,
  sanitizeSupabaseKey,
  maskSupabaseUrl,
  maskSupabaseKey,
  isLikelyPAT,
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
  const { config: currentConfig, source, hasEnv } = getSupabaseConfigWithSource();

  // For localStorage or manual testing override only - never prefilled from env secrets!
  const [overrideUrl, setOverrideUrl] = useState(source === 'localStorage' ? currentConfig?.url || '' : '');
  const [overrideKey, setOverrideKey] = useState(source === 'localStorage' ? currentConfig?.anonKey || '' : '');
  const [showOverrideSection, setShowOverrideSection] = useState(source !== 'env');
  const [showOverrideKey, setShowOverrideKey] = useState(false);

  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'guide'>('status');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestConnection = async () => {
    let testUrl = '';
    let testKey = '';

    // If using environment secrets and not overriding, test in-memory config directly
    if (source === 'env' && !showOverrideSection) {
      testUrl = currentConfig?.url || '';
      testKey = currentConfig?.anonKey || '';
    } else {
      testUrl = sanitizeSupabaseUrl(overrideUrl);
      testKey = sanitizeSupabaseKey(overrideKey);
    }

    if (!testUrl || !testKey) {
      setTestResult({
        success: false,
        message: 'Please provide both Supabase URL and Key to test.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const client = createClient(testUrl, testKey, {
        auth: { persistSession: false },
      });
      const { error } = await client.from('participants').select('id').limit(1);

      if (error) {
        setTestResult({ success: false, message: error.message });
      } else {
        setTestResult({
          success: true,
          message: 'Connected successfully! The "participants" table responded properly.',
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideUrl && overrideKey) {
      const cleanUrl = sanitizeSupabaseUrl(overrideUrl);
      const cleanKey = sanitizeSupabaseKey(overrideKey);
      setOverrideUrl(cleanUrl);
      setOverrideKey(cleanKey);
      saveLocalSupabaseConfig(cleanUrl, cleanKey);
      setSaveSuccess(true);
      onConfigUpdated();
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleClearLocal = () => {
    clearLocalSupabaseConfig();
    const refreshed = getSupabaseConfigWithSource();
    setOverrideUrl('');
    setOverrideKey('');
    setShowOverrideSection(refreshed.source !== 'env');
    setTestResult(null);
    onConfigUpdated();
  };

  const patDetected =
    Boolean(currentConfig?.anonKey && isLikelyPAT(currentConfig.anonKey)) ||
    Boolean(overrideKey && isLikelyPAT(overrideKey));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center">
              🎾
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Supabase Connection &amp; Security</h2>
              <p className="text-xs text-slate-400">Database status, client security, and configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Connection &amp; Security</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Setup Guide &amp; SQL Schema
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {activeTab === 'status' ? (
            <div className="space-y-5">
              {/* PAT Warning Banner if a Personal Access Token was used */}
              {patDetected && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-red-800">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>Supabase Personal Access Token (PAT) Detected</span>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    The configured key starts with <code>sbp_</code>, which indicates a <strong>Personal Access Token (PAT)</strong>.
                    PATs grant root administrative control over your entire Supabase account (including creating and deleting databases).
                  </p>
                  <p className="text-xs text-red-700 font-medium">
                    👉 <strong>Recommended Action:</strong> In your GitHub Repository Secrets, replace <code>VITE_SUPABASE_ANON_KEY</code> with
                    the safe <strong>anon public key</strong> found under <em>Project Settings &rarr; API &rarr; Project API keys &rarr; anon public</em>.
                  </p>
                </div>
              )}

              {/* View 1: Using Production Environment Secrets (GitHub Actions / Build) */}
              {source === 'env' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-emerald-900 text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Protected Environment Secrets</span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      This application is securely connected via <strong>GitHub Actions Secrets</strong>.
                      Database URL and credentials are automatically masked to prevent outside visitors from viewing or extracting them.
                    </p>
                  </div>

                  {/* Masked Credentials Summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Connection Status
                      </span>
                      <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Active &amp; Synced</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <span className="text-xs font-medium text-slate-600">Supabase Project URL</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 select-all">
                          {maskSupabaseUrl(currentConfig?.url)}
                        </span>
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                          <Lock className="w-3 h-3" />
                          <span>Masked</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <span className="text-xs font-medium text-slate-600">Anon Public Key / PAT</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 tracking-widest select-none">
                          {maskSupabaseKey(currentConfig?.anonKey)}
                        </span>
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Secured</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-medium text-slate-600">Realtime Channel</span>
                      <span className="text-xs font-semibold text-slate-800">
                        public:participants
                      </span>
                    </div>
                  </div>

                  {/* Test Connection Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isTesting ? 'Testing Connection...' : 'Test Active Connection'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowOverrideSection(!showOverrideSection)}
                      className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 font-medium py-1 px-2 rounded-lg hover:bg-slate-100 transition"
                    >
                      <span>Custom Browser Override</span>
                      {showOverrideSection ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* View 2: Browser Local Storage Override */}
              {source === 'localStorage' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <div className="flex items-center space-x-2 font-bold text-amber-800">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>Browser Local Storage Override Active</span>
                  </div>
                  <p>
                    This browser is using custom credentials saved in localStorage.
                    {hasEnv && ' You can clear them anytime to revert to the GitHub Secrets configuration.'}
                  </p>
                </div>
              )}

              {/* View 3: Not configured yet */}
              {source === 'none' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <div className="flex items-center space-x-2 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>No Supabase Configuration Found</span>
                  </div>
                  <p>
                    Please configure repository secrets in GitHub Actions, or paste your credentials below to test immediately in this browser.
                  </p>
                </div>
              )}

              {/* Optional / Override Form (Only shown when not using env, or when expanded) */}
              {(showOverrideSection || source !== 'env') && (
                <form
                  onSubmit={handleSaveOverride}
                  className="space-y-4 pt-2 border-t border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {source === 'env' ? 'Manual Browser Override' : 'Configure Supabase Credentials'}
                    </h4>
                    {source === 'env' && (
                      <span className="text-[11px] text-slate-400">
                        Affects this browser only
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="text"
                      required
                      value={overrideUrl}
                      onChange={(e) => setOverrideUrl(e.target.value)}
                      placeholder="https://xyzabcdefg.supabase.co"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Root domain only (e.g. <code>https://xyz.supabase.co</code>). Do not include <code>/rest/v1</code>.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Supabase Anon Public Key
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowOverrideKey(!showOverrideKey)}
                        className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800"
                      >
                        {showOverrideKey ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hide Key</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Show Key</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showOverrideKey ? 'text' : 'password'}
                        required
                        value={overrideKey}
                        onChange={(e) => setOverrideKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Must be the <strong>anon public</strong> key from Project Settings &rarr; API. Never use a Personal Access Token (PAT).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex items-center space-x-2">
                      {source === 'localStorage' && (
                        <button
                          type="button"
                          onClick={handleClearLocal}
                          className="inline-flex items-center space-x-1.5 text-xs text-red-600 hover:text-red-800 transition font-medium px-2 py-1.5 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear Local Override</span>
                        </button>
                      )}

                      {source !== 'env' && (
                        <button
                          type="button"
                          onClick={handleTestConnection}
                          disabled={isTesting}
                          className="inline-flex items-center space-x-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 transition font-medium px-3 py-1.5 rounded-lg shadow-xs disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saveSuccess ? 'Saved!' : 'Save to Browser'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
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
                    <p className="font-bold">{testResult.success ? 'Connection Success' : 'Connection Error'}</p>
                    <p className="text-[11px] mt-0.5">{testResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Setup Guidelines & SQL Schema Tab */
            <div className="space-y-6">
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

              {/* Step 3: Key Security & Best Practices */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 font-bold">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                    3
                  </span>
                  <h3>Obtain safe public client credentials</h3>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  In Supabase, navigate to <strong>Project Settings &rarr; API</strong> (or Settings &rarr; Data API):
                </p>
                <div className="pl-8 space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <p className="font-semibold text-slate-900">Required credentials:</p>
                    <ul className="list-disc pl-4 text-slate-600 space-y-1">
                      <li>
                        <strong>Project URL:</strong> e.g. <code>https://your-project-id.supabase.co</code> (root domain only).
                      </li>
                      <li>
                        <strong>anon public key:</strong> e.g. <code>eyJhbGciOi...</code>. Designed specifically for browser queries and guarded by Row Level Security (RLS).
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Important: Do NOT use Personal Access Tokens (PATs)</span>
                    </div>
                    <p className="text-amber-800">
                      Never paste an account Personal Access Token (starts with <code>sbp_</code>) or a <code>service_role</code> secret key.
                      Only the <strong>anon public key</strong> should be configured for client applications.
                    </p>
                  </div>
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
                        Value: <code>https://your-project-id.supabase.co</code> <span className="text-slate-400">(root domain only)</span>
                      </div>
                      <div>
                        Name: <strong className="text-emerald-700">VITE_SUPABASE_ANON_KEY</strong><br />
                        Value: <code>eyJhbGciOi...</code> <span className="text-slate-400">(your anon public key)</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    Go to <strong>Settings</strong> &rarr; <strong>Pages</strong>. Under <strong>Build and deployment &rarr; Source</strong>, select <strong>GitHub Actions</strong>.
                  </li>
                  <li>
                    Push any commit to <code>main</code> to deploy securely!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>PadelDoodle &bull; Client-Side Security Enforced</span>
          </div>
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
