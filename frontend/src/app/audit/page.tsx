"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, ScrollText, RefreshCw, ExternalLink } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AuditEntry {
  id: number;
  case_id: string;
  action: string;
  channel: string | null;
  message_sent: string | null;
  llm_reasoning: string | null;
  payment_link_id: string | null;
  payment_link_url: string | null;
  is_violation: boolean;
  cryptographic_signature: string | null;
  createdAt: string;
}

import { Sidebar } from '@/components/Sidebar';
export default function AuditPage() {
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudits = async () => {
    try {
      const res = await fetch(`${API}/api/audit-trail`);
      const data = await res.json();
      setAudits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudits(); }, []);

  const actionColors: Record<string, string> = {
    'payment_link_created': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'payment_recovered': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'ai_diagnosis': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'save_ladder_generated': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'ptp_recorded': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    'ptp_broken_escalation': 'text-red-400 bg-red-500/10 border-red-500/20',
    'npci_block': 'text-red-400 bg-red-500/10 border-red-500/20',
    'compliance_block': 'text-red-400 bg-red-500/10 border-red-500/20',
    'mandate_retry': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  };

  return (
    <div className="flex min-h-screen font-sans transition-colors duration-300 dark:bg-[#0A0A0A] bg-gray-50 text-gray-900 dark:text-white"><Sidebar/><div className="flex-1 w-full overflow-hidden">
      <header className="border-b dark:border-gray-800 border-gray-200 dark:bg-[#0A0A0A] bg-gray-50/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="dark:text-gray-400 text-gray-600 hover:dark:text-white text-gray-900"><ArrowLeft className="w-5 h-5" /></Link>
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg">Audit Trail</span>
            <span className="text-xs dark:text-gray-500 text-gray-500">{audits.length} entries</span>
          </div>
          <button onClick={fetchAudits} className="text-sm dark:text-gray-400 text-gray-600 hover:dark:text-white text-gray-900 flex items-center gap-1">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-sm dark:text-gray-400 text-gray-600 mb-6">Every action the AI agent takes is logged here with timestamps, Razorpay entity IDs, and AI reasoning. This is your proof of work.</p>

        {loading ? (
          <div className="text-center dark:text-gray-500 text-gray-500 py-12">Loading audit trail...</div>
        ) : audits.length === 0 ? (
          <div className="text-center dark:text-gray-500 text-gray-500 py-12">No audit entries yet. Run the <Link href="/demo" className="text-blue-400 underline">Demo</Link> first.</div>
        ) : (
          <div className="space-y-3">
            {audits.map((a) => (
              <div key={a.id} className="border dark:border-gray-800 border-gray-200 rounded-xl dark:bg-[#111] bg-white p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${actionColors[a.action] || 'dark:text-gray-400 text-gray-600 bg-gray-500/10 border-gray-500/20'}`}>
                      {a.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono dark:text-gray-500 text-gray-500">{a.case_id}</span>
                    {a.channel && <span className="text-xs text-gray-600">via {a.channel}</span>}
                    {a.is_violation && <span className="text-xs text-red-400 font-medium">⚠ VIOLATION</span>}
                  </div>
                  <span className="text-xs text-gray-600 shrink-0">{new Date(a.createdAt).toLocaleString()}</span>
                </div>

                {a.message_sent && (
                  <div className="mt-2 text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3">
                    <span className="text-xs dark:text-gray-500 text-gray-500 block mb-1">Message / Action:</span>
                    {a.message_sent}
                  </div>
                )}

                {a.llm_reasoning && (
                  <div className="mt-2 text-xs dark:text-gray-400 text-gray-600 bg-purple-900/10 rounded-lg p-3 border border-purple-800/20">
                    <span className="text-purple-400 block mb-1">🤖 AI Reasoning:</span>
                    {a.llm_reasoning.length > 200 ? a.llm_reasoning.substring(0, 200) + '...' : a.llm_reasoning}
                  </div>
                )}

                {a.payment_link_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs dark:text-gray-500 text-gray-500">Payment Link:</span>
                    <a href={a.payment_link_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      {a.payment_link_url} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                
                {a.cryptographic_signature && (
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t dark:border-white/[0.05] border-gray-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 opacity-70" />
                    <span className="text-[10px] font-mono text-emerald-500/70 tracking-widest uppercase">SHA-256 SEAL</span>
                    <span className="text-[10px] font-mono dark:text-gray-600 text-gray-400 truncate max-w-md">{a.cryptographic_signature}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div></div>
  );
}
