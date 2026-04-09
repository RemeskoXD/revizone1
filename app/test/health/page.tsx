'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, Database, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

type CheckResult = {
  name: string;
  status: 'ok' | 'error' | 'missing';
  message: string;
  details?: string;
};

export default function HealthCheckPage() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [summary, setSummary] = useState<{ ok: number; error: number; missing: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const runCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setResults(data.results);
      setSummary(data.summary);
      setLastCheck(new Date().toLocaleString('cs-CZ'));
    } catch (e) {
      setResults([{ name: 'API Health', status: 'error', message: 'Nepodařilo se spojit s API', details: String(e) }]);
      setSummary({ ok: 0, error: 1, missing: 0 });
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'ok') return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />;
  };

  return (
    <div className="min-h-screen bg-[#111] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-brand-yellow" />
            <div>
              <h1 className="text-2xl font-bold">Diagnostika databáze</h1>
              <p className="text-gray-400 text-sm">Kontrola všech tabulek, sloupců, indexů a proměnných prostředí</p>
            </div>
          </div>
          <button
            onClick={runCheck}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-brand-yellow-hover transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            {loading ? 'Kontroluji...' : 'Spustit kontrolu'}
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-500">{summary.ok}</p>
              <p className="text-xs text-gray-400">V pořádku</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-500">{summary.error}</p>
              <p className="text-xs text-gray-400">Chyby</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-yellow-500">{summary.missing}</p>
              <p className="text-xs text-gray-400">Chybějící</p>
            </div>
          </div>
        )}

        {summary && summary.error === 0 && summary.missing === 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-green-400">Vše v pořádku!</h2>
            <p className="text-gray-400 text-sm mt-1">Databáze je kompletní a připravená k použití.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {lastCheck && <p className="text-xs text-gray-500 mb-2">Poslední kontrola: {lastCheck}</p>}

            {/* Errors first */}
            {results.filter(r => r.status === 'error').length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2">Chyby (nutno opravit)</h3>
                {results.filter(r => r.status === 'error').map((r, i) => (
                  <div key={`e-${i}`} className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-2">
                    <div className="flex items-start gap-3">
                      {statusIcon(r.status)}
                      <div className="flex-1">
                        <p className="font-medium text-white">{r.name}</p>
                        <p className="text-sm text-red-400">{r.message}</p>
                        {r.details && (
                          <pre className="mt-2 text-xs text-red-300 bg-red-500/10 rounded p-3 overflow-x-auto whitespace-pre-wrap font-mono">{r.details}</pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Missing */}
            {results.filter(r => r.status === 'missing').length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-2">Chybějící (volitelné)</h3>
                {results.filter(r => r.status === 'missing').map((r, i) => (
                  <div key={`m-${i}`} className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 mb-2">
                    <div className="flex items-start gap-3">
                      {statusIcon(r.status)}
                      <div className="flex-1">
                        <p className="font-medium text-white">{r.name}</p>
                        <p className="text-sm text-yellow-400">{r.message}</p>
                        {r.details && (
                          <pre className="mt-2 text-xs text-yellow-300 bg-yellow-500/10 rounded p-3 overflow-x-auto whitespace-pre-wrap font-mono">{r.details}</pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* OK */}
            <div>
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-2">V pořádku</h3>
              {results.filter(r => r.status === 'ok').map((r, i) => (
                <div key={`o-${i}`} className="bg-[#1A1A1A] border border-white/5 rounded-lg p-3 mb-1 flex items-center gap-3">
                  {statusIcon(r.status)}
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-white">{r.name}</span>
                    <span className="text-xs text-gray-500">{r.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-12 text-center">
            <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Klikněte na "Spustit kontrolu"</h3>
            <p className="text-gray-500 text-sm">Zkontroluje se připojení k databázi, všech 17 tabulek, sloupce, indexy a proměnné prostředí.</p>
          </div>
        )}
      </div>
    </div>
  );
}
