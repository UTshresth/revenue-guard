import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Activity, Cpu, Lock, PhoneCall, BarChart3, FlaskConical, Webhook, Server, BrainCircuit, Globe, MessageSquare, Shield, Database } from 'lucide-react';


export default function ExplorePage() {
  return (
    <div className="min-h-screen font-sans transition-colors duration-300 dark:bg-[#0A0A0A] bg-gray-50 text-gray-900 dark:text-gray-200">
      
      {/* Navigation */}
      <nav className="border-b dark:border-gray-900 border-gray-200 dark:dark:bg-[#0A0A0A] bg-gray-50/90 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-blue-500" />
            <span className="font-semibold text-xl tracking-tight dark:text-white text-gray-900">RevenueGuard</span>
          </Link>
          <div className="flex gap-6 items-center">
            
            <Link href="/" className="text-sm font-medium dark:dark:text-gray-400 text-gray-600 dark:text-gray-500 text-gray-500 hover:text-blue-500 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Modules Section */}
      <section className="py-20 border-b dark:border-gray-900 border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">Explore Modules</h1>
            <p className="dark:text-gray-400 text-gray-600 max-w-2xl text-lg">Select a component of the RevenueGuard ecosystem to see it in action.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard" className="group p-6 rounded-xl dark:bg-[#111] bg-white border dark:border-gray-800 border-gray-200 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all flex flex-col h-full shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-200 text-gray-800 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Live Dashboard</h3>
              <p className="text-sm dark:dark:text-gray-500 text-gray-500 text-gray-600 leading-relaxed flex-1">Monitor failed payments in real time. Track recovery rates, revenue at risk, and agent activity.</p>
            </Link>

            <Link href="/negotiate" className="group p-6 rounded-xl dark:bg-[#111] bg-white border dark:border-gray-800 border-gray-200 hover:border-emerald-500/50 transition-all flex flex-col h-full shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-200 text-gray-800 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">AI Negotiator</h3>
              <p className="text-sm dark:dark:text-gray-500 text-gray-500 text-gray-600 leading-relaxed flex-1">Interactive AI agent that chats with customers to negotiate settlements and securely generates Razorpay payment links on the fly.</p>
            </Link>

            <Link href="/lab" className="group p-6 rounded-xl dark:bg-[#111] bg-white border dark:border-gray-800 border-gray-200 hover:border-blue-400/50 transition-all flex flex-col h-full shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-5">
                <FlaskConical className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-200 text-gray-800 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Demonstration</h3>
              <p className="text-sm dark:dark:text-gray-500 text-gray-500 text-gray-600 leading-relaxed flex-1">Inject a synthetic payment failure and watch the AI pipeline diagnose, decide, and act — step by step.</p>
            </Link>

            <Link href="/voice" className="group p-6 rounded-xl dark:bg-[#111] bg-white border dark:border-gray-800 border-gray-200 hover:border-purple-500/50 transition-all flex flex-col h-full shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-5">
                <PhoneCall className="w-6 h-6 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-200 text-gray-800 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">Voice Recovery Agent</h3>
              <p className="text-sm dark:dark:text-gray-500 text-gray-500 text-gray-600 leading-relaxed flex-1">AI-generated voice scripts in English or Hinglish, delivered as outbound calls to customers with overdue payments.</p>
            </Link>
            
            <Link href="/audit" className="group p-6 rounded-xl dark:bg-[#111] bg-white border dark:border-gray-800 border-gray-200 hover:border-amber-500/50 transition-all flex flex-col h-full shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-200 text-gray-800 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">Compliance & Audit</h3>
              <p className="text-sm dark:dark:text-gray-500 text-gray-500 text-gray-600 leading-relaxed flex-1">Every action passes through hard-coded retry limits and DND rules before execution.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Flowchart Section */}
      <section className="py-20 dark:bg-[#0A0A0A] bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4 dark:text-white text-gray-900">System Architecture</h2>
            <p className="dark:text-gray-400 text-gray-600 max-w-3xl text-lg">A detailed view of how RevenueGuard processes payment failures, utilizes AI for intelligent decision-making, enforces compliance, and executes multi-channel recovery.</p>
          </div>

          <div className="dark:bg-[#111] bg-white border dark:border-gray-800 border-gray-200 rounded-2xl p-8 md:p-12 overflow-x-auto shadow-sm">
            {/* Diagram Container */}
            <div className="min-w-[800px] flex flex-col items-center gap-6">
              
              {/* Row 1: Trigger */}
              <div className="flex flex-col items-center">
                <div className="w-64 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/40 rounded-lg p-4 text-center shadow-sm relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 dark:bg-[#111] bg-white px-2 text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">Live Integration</div>
                  <Webhook className="w-6 h-6 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold dark:text-gray-200 text-gray-800">Razorpay Webhooks</h4>
                  <p className="text-[10px] dark:text-gray-500 text-gray-500 mt-1">payment.failed, invoice.expired</p>
                </div>
                <div className="h-6 border-l-2 border-dashed dark:border-gray-600 border-gray-300 my-1 relative">
                  <div className="absolute -bottom-2 left-[-6px] border-solid border-t-8 dark:border-t-gray-600 border-t-gray-300 border-x-4 border-x-transparent"></div>
                </div>
              </div>

              {/* Row 2: Orchestration (Groq AI) */}
              <div className="flex flex-col items-center w-full relative">
                <div className="w-[450px] bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-500/50 rounded-xl p-5 text-center shadow-md relative z-10">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 dark:bg-[#111] bg-white px-2 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">AI Brain</div>
                  <BrainCircuit className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold dark:text-gray-200 text-gray-800">Groq LLM (Compound-Mini)</h4>
                  <p className="text-[11px] dark:text-gray-400 text-gray-600 mt-1.5 leading-relaxed">
                    Diagnoses failure root-cause and selects optimal recovery channel (Voice, SMS, Telegram). Generates dynamic discount incentives if needed.
                  </p>
                </div>
                <div className="h-6 border-l-2 border-solid border-indigo-500/50 my-1 relative">
                  <div className="absolute -bottom-2 left-[-6px] border-solid border-t-8 border-t-indigo-500/50 border-x-4 border-x-transparent"></div>
                </div>
              </div>

              {/* Row 3: Compliance Gate */}
              <div className="flex flex-col items-center w-[600px]">
                <div className="w-full bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/50 rounded-lg py-4 px-6 text-center text-sm font-medium flex flex-col items-center gap-2 relative">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 dark:bg-[#111] bg-white px-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest">Guardrails</div>
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold mb-1">
                    <Lock className="w-4 h-4" /> Compliance & EV Gate
                  </div>
                  <div className="flex gap-4 text-[11px] font-mono text-gray-600 dark:text-gray-400">
                    <span>1. Margin-Aware Check (EV &gt; Cost)</span>
                    <span>2. TRAI DND</span>
                    <span>3. Frequency Cap</span>
                  </div>
                </div>
                <div className="h-6 border-l-2 border-solid border-amber-500/50 my-1 relative">
                  <div className="absolute -bottom-2 left-[-6px] border-solid border-t-8 border-t-amber-500/50 border-x-4 border-x-transparent"></div>
                </div>
              </div>

              {/* Row 4: Outbox */}
              <div className="flex flex-col items-center w-full">
                <div className="w-80 dark:bg-emerald-900/10 bg-emerald-50 border dark:border-emerald-700/50 border-emerald-200 rounded-lg p-3 text-center shadow-sm relative">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                    <Database className="w-4 h-4" /> Fault-Tolerant Outbox
                  </div>
                  <p className="text-[10px] dark:text-gray-500 text-gray-500 mt-1">Crash-safe dispatch with idempotency key</p>
                </div>
                {/* Split Arrows */}
                <div className="w-[500px] h-6 border-t-2 border-l-2 border-r-2 border-solid dark:border-gray-600 border-gray-300 mt-1 relative rounded-t-lg">
                  {/* Left Arrow */}
                  <div className="absolute -bottom-2 -left-[6px] border-solid border-t-8 dark:border-t-gray-600 border-t-gray-300 border-x-4 border-x-transparent"></div>
                  {/* Right Arrow */}
                  <div className="absolute -bottom-2 -right-[6px] border-solid border-t-8 dark:border-t-gray-600 border-t-gray-300 border-x-4 border-x-transparent"></div>
                </div>
              </div>

              {/* Row 5: Execution Channels */}
              <div className="flex justify-between w-[600px] mt-2">
                {/* Channel 1 */}
                <div className="w-48 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/40 rounded-lg p-4 text-center">
                  <PhoneCall className="w-5 h-5 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                  <h4 className="text-xs font-semibold dark:text-gray-200 text-gray-800">Voice Negotiation</h4>
                  <p className="text-[10px] dark:text-gray-500 text-gray-500 mt-1">Twilio TTS API</p>
                </div>
                {/* Channel 2 */}
                <div className="w-48 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-500/40 rounded-lg p-4 text-center">
                  <MessageSquare className="w-5 h-5 text-cyan-500 dark:text-cyan-400 mx-auto mb-2" />
                  <h4 className="text-xs font-semibold dark:text-gray-200 text-gray-800">Telegram Bot</h4>
                  <p className="text-[10px] dark:text-gray-500 text-gray-500 mt-1">Interactive PTP Ledger</p>
                </div>
              </div>

              {/* Row 6: Audit Seal */}
              <div className="flex flex-col items-center w-full mt-2">
                <div className="h-6 border-l-2 border-dashed border-gray-500 relative">
                  <div className="absolute -bottom-2 left-[-6px] border-solid border-t-8 border-t-gray-500 border-x-4 border-x-transparent"></div>
                </div>
                <div className="w-[500px] dark:bg-[#0A0A0A] bg-gray-100 border dark:border-[#222] border-gray-300 rounded-lg p-4 text-center mt-1 relative">
                  <div className="flex items-center justify-center gap-2 text-gray-800 dark:text-gray-300 font-semibold text-sm">
                    <Shield className="w-4 h-4 text-emerald-400" /> Tamper-Evident Ledger
                  </div>
                  <p className="text-[10px] dark:text-gray-500 text-gray-500 mt-1 font-mono text-emerald-500/70">SHA-256 Cryptographic Seal (AuditTrail table)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
