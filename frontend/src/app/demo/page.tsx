"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Play, Terminal, ExternalLink, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';

const API = 'http://localhost:3001';

interface LogEntry {
  emoji: string;
  message: string;
  data: Record<string, unknown> | null;
  timestamp: string;
}

interface StepResult {
  success: boolean;
  logs: LogEntry[];
  summary: string;
  paymentLink?: string;
}

const STEPS = [
  {
    id: 'seed',
    title: '1. Create Test Data',
    description: 'Creates a real order + invoice in your Razorpay account via API. You can verify these exist in your Razorpay Dashboard.',
    buttonText: 'Create in Razorpay',
  },
  {
    id: 'detect',
    title: '2. Detect Failures',
    description: 'Scans your Razorpay account using the Orders API and Invoices API to find abandoned checkouts and overdue invoices.',
    buttonText: 'Scan Razorpay',
  },
  {
    id: 'analyze',
    title: '3. AI Root-Cause Analysis',
    description: 'Sends the failure data to Groq LLM (compound-mini) for real-time diagnosis. You will see the raw AI response.',
    buttonText: 'Run AI Analysis',
  },
  {
    id: 'recover',
    title: '4. Generate Recovery Link',
    description: 'Creates a real Razorpay Payment Link using the AI strategy. You can click it, pay it, then verify recovery on the dashboard.',
    buttonText: 'Create Payment Link',
  },
];

export default function DemoPage() {
  const [results, setResults] = useState<Record<string, StepResult>>({});
  const [running, setRunning] = useState<string | null>(null);

  const runStep = async (stepId: string) => {
    setRunning(stepId);
    try {
      const res = await fetch(`${API}/api/demo/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepId }),
      });
      const data: StepResult = await res.json();
      setResults(prev => ({ ...prev, [stepId]: data }));
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [stepId]: {
          success: false,
          logs: [{ emoji: '❌', message: 'Failed to connect to backend', data: null, timestamp: new Date().toISOString() }],
          summary: 'Backend connection failed',
        },
      }));
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="min-h-screen dark:bg-[#0A0A0A] bg-gray-50 dark:text-white text-gray-900 font-sans">
      {/* Header */}
      <header className="border-b dark:border-gray-800 border-gray-200 dark:bg-[#0A0A0A] bg-gray-50/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="dark:text-gray-400 text-gray-600 hover:dark:text-white text-gray-900"><ArrowLeft className="w-5 h-5" /></Link>
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg">Live Demo</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Real APIs</span>
          </div>
          <Link href="/dashboard" className="text-sm dark:text-gray-400 text-gray-600 hover:dark:text-white text-gray-900 flex items-center gap-1">
            Dashboard <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Step-by-Step Proof of Work</h1>
          <p className="dark:text-gray-400 text-gray-600 text-sm">Run each step below and see every real Razorpay API call and Groq AI response. Nothing is faked.</p>
        </div>

        {STEPS.map((step) => {
          const result = results[step.id];
          const isRunning = running === step.id;
          const isDone = !!result;

          return (
            <div key={step.id} className={`border rounded-xl overflow-hidden transition-colors ${isDone ? (result.success ? 'border-emerald-800/50 bg-emerald-900/5' : 'border-red-800/50 bg-red-900/5') : 'dark:border-gray-800 border-gray-200 dark:bg-[#111] bg-white'}`}>
              {/* Step Header */}
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isDone && result.success && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    <h3 className="font-bold text-lg">{step.title}</h3>
                  </div>
                  <p className="text-sm dark:text-gray-400 text-gray-600">{step.description}</p>
                  {isDone && (
                    <p className="text-sm mt-2 font-medium text-emerald-400">{result.summary}</p>
                  )}
                  {result?.paymentLink && (
                    <a href={result.paymentLink} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 dark:text-white text-gray-900 text-sm rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" /> Open Payment Link to Test
                    </a>
                  )}
                </div>
                <button
                  onClick={() => runStep(step.id)}
                  disabled={isRunning}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 shrink-0 transition-colors
                    ${isRunning ? 'bg-gray-800 dark:text-gray-400 text-gray-600' : 'bg-blue-600 hover:bg-blue-500 dark:text-white text-gray-900'}`}
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Running...' : step.buttonText}
                </button>
              </div>

              {/* Logs Panel */}
              {isDone && result.logs.length > 0 && (
                <div className="border-t dark:border-gray-800 border-gray-200 bg-[#0D0D0D]">
                  <div className="px-5 py-2 flex items-center gap-2 text-xs dark:text-gray-500 text-gray-500 border-b dark:border-gray-800 border-gray-200/50">
                    <Terminal className="w-3 h-3" />
                    Execution Log ({result.logs.length} events)
                  </div>
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto font-mono text-xs">
                    {result.logs.map((log, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-600 shrink-0 w-20">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span>{log.emoji} {log.message}</span>
                        </div>
                        {log.data && (
                          <pre className="ml-[88px] p-2 bg-gray-800/50 rounded text-gray-300 overflow-x-auto text-[11px] leading-relaxed">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Verification Note */}
        <div className="border dark:border-gray-800 border-gray-200 rounded-xl p-5 dark:bg-[#111] bg-white">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-blue-400" />
            How to Verify This is Real
          </h3>
          <div className="space-y-2 text-sm dark:text-gray-400 text-gray-600">
            <p>1. Open <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">dashboard.razorpay.com</a> → Orders tab → You will see the orders created in Step 1.</p>
            <p>2. The Order IDs shown in the logs above (like <code className="text-gray-300">order_XXXXX</code>) match exactly with your Razorpay Dashboard.</p>
            <p>3. The Payment Link in Step 4 is a real <code className="text-gray-300">rzp.io</code> URL. Click it, pay with UPI (<code className="text-gray-300">success@razorpay</code>), then click &quot;Verify Payments&quot; on the Dashboard.</p>
            <p>4. Check the <Link href="/audit" className="text-blue-400 underline">Audit Trail</Link> to see every AI decision logged with timestamps.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
