"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, FlaskConical, CheckCircle, AlertTriangle, XCircle,
  Loader2, Copy, Check, Terminal, Smartphone, ShieldCheck, Database,
  Cpu, Send, ExternalLink, Sparkles, CreditCard, Zap, Activity,
  ChevronRight, Lock, RefreshCw
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const FAILURE_SCENARIOS = [
  { id: 'checkout_dropoff', label: 'Checkout Drop-off', description: 'User abandoned at UPI / OTP confirmation screen.', defaultAmount: 2499, channel: 'SMS', category: 'Drop-off', color: 'blue', icon: '🛒' },
  { id: 'insufficient_funds', label: 'Insufficient Funds', description: 'Bank returned INSUF_FUNDS during auto-debit processing.', defaultAmount: 4999, channel: 'Telegram', category: 'Soft Decline', color: 'yellow', icon: '💰' },
  { id: 'card_expired', label: 'Card Expired', description: 'Mandate card validity lapsed before recurring billing cycle.', defaultAmount: 1299, channel: 'SMS', category: 'Mandate', color: 'purple', icon: '💳' },
  { id: 'bank_outage', label: 'Bank Gateway Outage', description: 'Acquiring bank returned HTTP 503 gateway timeout error.', defaultAmount: 8999, channel: 'Voice', category: 'Degradation', color: 'red', icon: '⚡' },
];

interface Step { phase: string; status: string; detail: string; payload?: any; }
interface Result { caseId: string; steps: Step[]; channel: string | null; diagnosis: any; paymentLink?: string; }

const STAGE_META: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
  'Detection':       { icon: <Zap className="w-4 h-4" />,        color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Failure Signal Ingested' },
  'Case Stored':     { icon: <Database className="w-4 h-4" />,   color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   label: 'Ledger Record Persisted' },
  'AI Diagnosis':    { icon: <Cpu className="w-4 h-4" />,         color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'LLM Root Cause Analysis' },
  'Compliance Gate': { icon: <ShieldCheck className="w-4 h-4" />, color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',label: 'Deterministic Guard Check' },
  'Action Dispatched':{ icon: <Send className="w-4 h-4" />,       color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   label: 'Recovery Channel Fired' },
};

const statusBadge = (status: string) => {
  if (status === 'ok')       return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">PASS</span>;
  if (status === 'blocked')  return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">BLOCK</span>;
  if (status === 'warn')     return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">WARN</span>;
  if (status === 'fallback') return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">FALLBACK</span>;
  return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">ERROR</span>;
};

import { Sidebar } from "@/components/Sidebar";
export default function RecoveryLabPage() {
  const [selected, setSelected] = useState(FAILURE_SCENARIOS[0]);
  const [amount, setAmount]     = useState(FAILURE_SCENARIOS[0].defaultAmount);
  const [name, setName]         = useState('Test Customer');
  const [phone, setPhone]       = useState('+91 99999 00000');
  const [running, setRunning]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [jsonTab, setJsonTab]   = useState<'all'|'ai'|'compliance'|'dispatch'>('all');
  const [activeVStep, setActiveVStep] = useState<number | null>(null);
  const [result, setResult]     = useState<Result | null>(null);
  const [steps, setSteps]       = useState<Step[]>([]);
  const [elapsed, setElapsed]   = useState(0);
  const timerRef                = useRef<any>(null);

  const ALL_STAGES = ['Detection', 'Case Stored', 'AI Diagnosis', 'Compliance Gate', 'Action Dispatched'];

  const selectScenario = (s: typeof FAILURE_SCENARIOS[0]) => {
    setSelected(s); setAmount(s.defaultAmount); setResult(null); setSteps([]); setActiveVStep(null);
  };

  const run = async () => {
    setRunning(true); setResult(null); setSteps([]); setActiveVStep(null); setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    try {
      const res  = await fetch(`${API}/api/lab/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ failureType: selected.id, amount, customerName: name }) });
      const data = await res.json();
      setResult(data);
      for (let i = 0; i < (data.steps || []).length; i++) {
        await new Promise(r => setTimeout(r, 480));
        setSteps(prev => [...prev, data.steps[i]]);
        setActiveVStep(i);
      }
    } catch {
      const err: Step = { phase: 'Error', status: 'error', detail: 'Backend unreachable. Is the server running on :3001?', payload: { code: 'ECONNREFUSED' } };
      setResult({ caseId: 'ERR', steps: [err], channel: null, diagnosis: null });
      setSteps([err]);
    } finally {
      setRunning(false);
      clearInterval(timerRef.current);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const filteredSteps = steps.filter(s => {
    if (jsonTab === 'ai')         return s.phase === 'AI Diagnosis';
    if (jsonTab === 'compliance') return s.phase === 'Compliance Gate';
    if (jsonTab === 'dispatch')   return s.phase === 'Action Dispatched';
    return true;
  });

  const diag       = result?.diagnosis;
  const dispatchSt = steps.find(s => s.phase === 'Action Dispatched');
  const aiSt       = steps.find(s => s.phase === 'AI Diagnosis');
  const compliSt   = steps.find(s => s.phase === 'Compliance Gate');

  return (
    <div className="flex min-h-screen font-sans transition-colors duration-300 dark:bg-[#0A0A0A] bg-gray-50 text-gray-900 dark:text-white"><Sidebar/><div className="flex-1 w-full overflow-hidden">

      {/* ─── Nav ─── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] dark:bg-[#070709] bg-gray-50/90 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-1.5 rounded-lg dark:text-gray-500 text-gray-500 hover:dark:text-white text-gray-900 hover:bg-white/5 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <FlaskConical className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-sm tracking-tight">Demonstration</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
              Simulator v2
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs dark:text-gray-500 text-gray-500">
            {running && (
              <span className="flex items-center gap-1.5 text-yellow-400 font-mono animate-pulse">
                <Activity className="w-3 h-3" /> {elapsed}s elapsed
              </span>
            )}
            <Link href="/dashboard" className="dark:text-gray-500 text-gray-500 hover:dark:text-white text-gray-900 transition-colors">Dashboard →</Link>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* ─── Scenario Selector + Controls ─── */}
        <section className="rounded-2xl border border-white/[0.07] dark:bg-[#0d0d11] bg-white overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-white/[0.05] flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm dark:text-white text-gray-900">Select Failure Vector</h2>
              <p className="text-xs dark:text-gray-500 text-gray-500 mt-0.5">Choose a realistic payment failure to trigger the full autonomous recovery orchestrator</p>
            </div>
            <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-2.5 py-1 rounded border border-white/[0.06]">
              Target: Razorpay Test API
            </span>
          </div>

          {/* Scenario cards */}
          <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {FAILURE_SCENARIOS.map(s => {
              const active = selected.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => selectScenario(s)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                    active
                      ? 'bg-blue-600/10 border-blue-500/60 ring-1 ring-blue-500/30 shadow-[0_0_24px_rgba(59,130,246,0.12)]'
                      : 'dark:bg-[#111116] bg-white border-white/[0.06] hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="text-2xl mb-2 leading-none">{s.icon}</div>
                  <div className={`text-[10px] font-mono uppercase tracking-widest mb-1.5 ${active ? 'text-blue-400' : 'dark:text-gray-500 text-gray-500'}`}>
                    {s.category}
                  </div>
                  <div className={`text-sm font-semibold mb-1.5 leading-tight ${active ? 'dark:text-white text-gray-900' : 'dark:text-gray-300 text-gray-700'}`}>
                    {s.label}
                  </div>
                  <p className="text-[11px] dark:text-gray-500 text-gray-500 leading-relaxed">{s.description}</p>
                </button>
              );
            })}
          </div>

          {/* Parameters + Trigger */}
          <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium dark:text-gray-500 text-gray-500 mb-1.5 uppercase tracking-wider">Customer Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full dark:bg-[#111116] bg-white border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm dark:text-white text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 transition-colors" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium dark:text-gray-500 text-gray-500 mb-1.5 uppercase tracking-wider">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full dark:bg-[#111116] bg-white border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm dark:text-white text-gray-900 font-mono focus:outline-none focus:border-blue-500/60 transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium dark:text-gray-500 text-gray-500 mb-1.5 uppercase tracking-wider">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(+e.target.value)}
                className="w-full dark:bg-[#111116] bg-white border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm dark:text-white text-gray-900 font-mono focus:outline-none focus:border-blue-500/60 transition-colors" />
            </div>
            <div className="sm:col-span-3">
              <button onClick={run} disabled={running}
                className={`w-full h-[42px] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  running
                    ? 'bg-gray-800/60 dark:text-gray-500 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 dark:text-white text-gray-900 shadow-lg shadow-blue-600/20 active:scale-[0.98]'
                }`}
              >
                {running ? <><Loader2 className="w-4 h-4 animate-spin" />Running...</> : <><Sparkles className="w-4 h-4" />Inject & Observe</>}
              </button>
            </div>
          </div>
        </section>

        {/* ─── Dual Screen Pipeline ─── */}
        {(!result && !running) ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] dark:bg-[#0d0d11] bg-white/50 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold dark:text-white text-gray-900 mb-1.5">Ready to inject a synthetic failure</h3>
            <p className="text-sm dark:text-gray-500 text-gray-500 max-w-sm mx-auto mb-6">
              Configure a scenario above and click <strong className="dark:text-gray-300 text-gray-700">"Inject & Observe"</strong> — you'll see the full pipeline broken into a human-readable view on the left and raw telemetry JSON on the right simultaneously.
            </p>
            <button onClick={run} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 dark:text-white text-gray-900 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20">
              <Sparkles className="w-4 h-4" /> Launch Simulation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

            {/* ──────── LEFT: Visual Process Stream ──────── */}
            <div className="rounded-2xl border border-white/[0.07] dark:bg-[#0d0d11] bg-white overflow-hidden">
              {/* Panel header */}
              <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${running ? 'bg-yellow-400 animate-pulse' : result?.channel ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className="text-xs font-semibold uppercase tracking-widest dark:text-gray-300 text-gray-700">Human-Readable Process</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono dark:text-gray-500 text-gray-500">
                  {result?.caseId && <span className="bg-white/5 px-2 py-0.5 rounded border border-white/[0.08]">{result.caseId}</span>}
                  {running && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
                </div>
              </div>

              {/* Stage progress bar */}
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-0">
                  {ALL_STAGES.map((stage, i) => {
                    const done = steps.some(s => s.phase === stage);
                    const active = i === (activeVStep ?? -1) && running;
                    return (
                      <React.Fragment key={stage}>
                        <div className={`flex flex-col items-center gap-1 ${i === 0 ? '' : ''}`} style={{flex: 1}}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500 ${
                            done ? 'bg-emerald-500 border-emerald-500 dark:text-white text-gray-900' :
                            active ? 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse' :
                            'bg-transparent border-white/10 text-gray-600'
                          }`}>
                            {done ? '✓' : i + 1}
                          </div>
                          <span className={`text-[9px] font-mono uppercase tracking-wide text-center leading-tight ${done ? 'text-emerald-400' : active ? 'text-blue-400' : 'text-gray-600'}`}>
                            {stage.split(' ')[0]}
                          </span>
                        </div>
                        {i < ALL_STAGES.length - 1 && (
                          <div className={`h-px flex-1 mt-[-14px] mb-auto transition-all duration-700 ${
                            steps.some(s => s.phase === ALL_STAGES[i + 1]) ? 'bg-emerald-500/40' : 'bg-white/[0.06]'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Stage detail cards */}
              <div className="px-5 pb-5 space-y-2.5 mt-4">
                {ALL_STAGES.map((stageName, i) => {
                  const step  = steps.find(s => s.phase === stageName);
                  const meta  = STAGE_META[stageName];
                  const done  = !!step;
                  const isCurr = i === (activeVStep ?? -1) && running;

                  return (
                    <div key={stageName}
                      className={`rounded-xl border p-4 transition-all duration-500 ${
                        done
                          ? `${meta.bg} ${meta.border}`
                          : isCurr
                          ? 'bg-blue-500/5 border-blue-500/30 animate-pulse'
                          : 'dark:bg-[#111116] bg-white border-white/[0.05] opacity-40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color} border ${meta.border}`}>
                            {isCurr && !done ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : meta.icon}
                          </div>
                          <div>
                            <div className="text-xs font-semibold dark:text-white text-gray-900 leading-tight">{stageName}</div>
                            <div className={`text-[10px] font-mono ${meta.color} opacity-80`}>{meta.label}</div>
                          </div>
                        </div>
                        {done && statusBadge(step!.status)}
                      </div>

                      {/* Stage-specific content */}
                      {done && stageName === 'Detection' && (
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                          <div className="dark:bg-black/20 bg-gray-100 rounded-lg p-2.5">
                            <div className="dark:text-gray-500 text-gray-500 text-[10px] mb-0.5">Customer</div>
                            <div className="font-semibold dark:text-white text-gray-900 truncate">{name}</div>
                          </div>
                          <div className="dark:bg-black/20 bg-gray-100 rounded-lg p-2.5">
                            <div className="dark:text-gray-500 text-gray-500 text-[10px] mb-0.5">Error Code</div>
                            <div className="font-mono font-semibold text-orange-400 text-[11px]">{selected.id}</div>
                          </div>
                          <div className="dark:bg-black/20 bg-gray-100 rounded-lg p-2.5">
                            <div className="dark:text-gray-500 text-gray-500 text-[10px] mb-0.5">Amount</div>
                            <div className="font-mono font-semibold text-yellow-400">₹{amount.toLocaleString()}</div>
                          </div>
                        </div>
                      )}

                      {done && stageName === 'Case Stored' && (
                        <div className="mt-3 flex items-center gap-2 text-xs">
                          <span className="dark:bg-black/20 bg-gray-100 rounded-lg px-3 py-2 font-mono text-blue-300 text-[11px]">
                            ID: <strong>{result?.caseId}</strong>
                          </span>
                          <span className="dark:bg-black/20 bg-gray-100 rounded-lg px-3 py-2 font-mono text-[11px] text-emerald-400">
                            STATUS: OPEN
                          </span>
                        </div>
                      )}

                      {done && stageName === 'AI Diagnosis' && diag && (
                        <div className="mt-3 space-y-2 text-xs">
                          <div className="dark:bg-black/20 bg-gray-100 rounded-lg p-2.5">
                            <div className="dark:text-gray-500 text-gray-500 text-[10px] mb-1">Root Cause (Groq Compound Mini)</div>
                            <div className="dark:text-gray-200 text-gray-800 font-medium">{diag.root_cause}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="dark:bg-black/20 bg-gray-100 rounded-lg p-2.5">
                              <div className="dark:text-gray-500 text-gray-500 text-[10px] mb-1">Recommended Channel</div>
                              <div className="font-mono font-bold text-purple-400 uppercase">{diag.recommended_channel}</div>
                            </div>
                            <div className="dark:bg-black/20 bg-gray-100 rounded-lg p-2.5">
                              <div className="dark:text-gray-500 text-gray-500 text-[10px] mb-1.5">Confidence</div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 dark:bg-black/30 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{width:`${Math.round((diag.confidence||0.88)*100)}%`}} />
                                </div>
                                <span className="font-mono font-bold dark:text-white text-gray-900 text-xs">{Math.round((diag.confidence||0.88)*100)}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-xs font-semibold dark:text-white text-gray-900">{name}</span>
                                <span className="text-[10px] dark:text-gray-500 text-gray-500 font-mono">{phone}</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                via {result.channel}
                              </span>
                            </div>
                            <div className="dark:bg-[#1a1a22] bg-gray-100 rounded-xl rounded-tl-sm p-3.5 text-sm dark:text-gray-200 text-gray-800 leading-relaxed mb-3 shadow-inner">
                              <p className="mb-2">{diag.message}</p>
                              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 break-all">
                                {result.paymentLink}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <a href={result.paymentLink} target="_blank" rel="noreferrer"
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 dark:text-white text-gray-900 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                                <CreditCard className="w-3.5 h-3.5" />
                                Simulate Pay — ₹{amount.toLocaleString()}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <Link href="/dashboard" className="px-3 py-2 bg-white/5 hover:bg-white/10 dark:text-gray-300 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors">
                                Dashboard ↗
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}


                    </div>
                  );
                })}

                {/* Compliance Blocked state */}
                {result && !running && !result.channel && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center">
                    <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-red-400">Outreach Blocked</div>
                    <div className="text-xs dark:text-gray-500 text-gray-500 mt-1">Compliance gate prevented outreach — no customer contact attempted.</div>
                  </div>
                )}
              </div>
            </div>

            {/* ──────── RIGHT: Raw Telemetry JSON ──────── */}
            <div className="rounded-2xl border border-white/[0.07] dark:bg-[#0d0d11] bg-white overflow-hidden sticky top-20">
              {/* Panel header */}
              <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest dark:text-gray-300 text-gray-700">Raw Telemetry · JSON Payloads</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyJson} disabled={!result}
                    className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.08] dark:text-gray-400 text-gray-600 hover:dark:text-white text-gray-900 transition-all disabled:opacity-30">
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Export'}
                  </button>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="px-5 pt-3 pb-0 flex gap-1">
                {(['all','ai','compliance','dispatch'] as const).map(tab => (
                  <button key={tab} onClick={() => setJsonTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono capitalize transition-all ${
                      jsonTab === tab ? 'bg-white/10 dark:text-white text-gray-900 font-bold' : 'dark:text-gray-500 text-gray-500 hover:dark:text-gray-300 text-gray-700 hover:bg-white/5'
                    }`}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* JSON packet stream */}
              <div className="p-5 space-y-3 max-h-[680px] overflow-y-auto">
                {filteredSteps.length === 0 ? (
                  <div className="py-12 text-center text-[11px] font-mono text-gray-700 border border-dashed border-white/[0.05] rounded-xl">
                    {running ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        <span className="text-gray-600">Awaiting dispatch packets...</span>
                      </div>
                    ) : 'No packets yet — run a simulation to see telemetry'}
                  </div>
                ) : filteredSteps.map((step, i) => {
                  const meta = STAGE_META[step.phase] || STAGE_META['Detection'];
                  return (
                    <div key={i} className={`rounded-xl border ${meta.border} ${meta.bg} overflow-hidden`}>
                      {/* Packet header */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] dark:bg-black/20 bg-gray-100">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.bg.replace('bg-','bg-').replace('/10','')}`} />
                          <span className={`text-[11px] font-mono font-bold ${meta.color}`}>{step.phase}</span>
                          <span className="text-[10px] font-mono text-gray-600">.payload</span>
                        </div>
                        {statusBadge(step.status)}
                      </div>
                      {/* Detail line */}
                      <div className="px-4 py-2 text-[11px] dark:text-gray-500 text-gray-500 font-mono bg-black/10 border-b border-white/[0.03] truncate">
                        {step.detail}
                      </div>
                      {/* JSON */}
                      {step.payload && (
                        <pre className="px-4 py-3 text-[11px] font-mono text-emerald-400/80 overflow-x-auto leading-5 max-h-52 dark:bg-black/20 bg-gray-100">
                          {JSON.stringify(step.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-white/[0.05] flex justify-between items-center text-[10px] font-mono text-gray-700">
                <span>RGUARD-TELEMETRY/v2 · JSON Schema Draft-07</span>
                <span>{steps.length} / 5 packets</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
</div>

  );
}
