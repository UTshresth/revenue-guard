import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Activity, Cpu, Lock, PhoneCall, BarChart3, FlaskConical, Webhook, Server, BrainCircuit, Globe, MessageSquare } from 'lucide-react';


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
            <div className="min-w-[800px] flex flex-col items-center gap-8">
              
              {/* Row 1: Trigger */}
              <div className="flex flex-col items-center">
                <div className="w-64 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/40 rounded-lg p-4 text-center shadow-sm relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 dark:bg-[#111] bg-white px-2 text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">Trigger</div>
                  <Webhook className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                  <h4 className="font-semibold dark:text-gray-200 text-gray-800">Razorpay Webhooks</h4>
                  <p className="text-xs dark:dark:text-gray-400 text-gray-600 dark:text-gray-500 text-gray-500 mt-1">payment.failed, invoice.expired</p>
                </div>
                {/* Arrow Down */}
                <div className="h-10 border-l-2 border-dashed dark:border-gray-600 border-gray-300 my-2 relative">
                  <div className="absolute -bottom-2 left-[-6px] border-solid border-t-8 dark:border-t-gray-600 border-t-gray-300 border-x-4 border-x-transparent"></div>
                </div>
              </div>

              {/* Row 2: Core Processing */}
              <div className="flex flex-col items-center w-full">
                <div className="w-[600px] dark:bg-gray-900 bg-gray-50 border dark:border-gray-700 border-gray-200 rounded-lg p-6 text-center shadow-md relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 dark:bg-[#111] bg-white px-2 text-xs font-bold dark:dark:text-gray-400 text-gray-600 dark:text-gray-500 text-gray-500 uppercase tracking-widest">Backend Processing</div>
                  <div className="flex justify-around items-center">
                    <div className="flex flex-col items-center">
                      <Server className="w-6 h-6 dark:text-gray-300 text-gray-600 mb-2" />
                      <span className="text-sm font-medium">Node.js Server</span>
                    </div>
                    <div className="dark:dark:text-gray-500 text-gray-500 dark:text-gray-400 text-gray-600 font-mono text-sm">→ Validates & stores →</div>
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 dark:text-gray-300 text-gray-600 mb-2 flex items-center justify-center font-bold font-serif">SQL</div>
                      <span className="text-sm font-medium">SQLite Database</span>
                    </div>
                  </div>
                </div>
                {/* Arrow Down */}
                <div className="h-10 border-l-2 border-solid border-blue-500 my-2 relative">
                  <div className="absolute -bottom-2 left-[-6px] border-solid border-t-8 border-t-blue-500 border-x-4 border-x-transparent"></div>
                </div>
              </div>

              {/* Row 3: AI Brain (Diamond-ish) */}
              <div className="flex flex-col items-center w-full relative">
                <div className="w-[400px] bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-500/50 rounded-xl p-6 text-center shadow-md relative z-10">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 dark:bg-[#111] bg-white px-2 text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Orchestration</div>
                  <BrainCircuit className="w-10 h-10 text-indigo-500 dark:text-indigo-400 mx-auto mb-3" />
                  <h4 className="font-bold dark:text-gray-200 text-gray-800 text-lg">AI Decision Engine (Groq)</h4>
                  <p className="text-xs dark:text-gray-400 text-gray-600 mt-2 leading-relaxed">
                    Analyzes customer history and payment context to select the optimal recovery channel and generate personalized scripts/messages.
                  </p>
                </div>
                {/* Split Arrows */}
                <div className="w-[500px] h-12 border-t-2 border-l-2 border-r-2 border-solid dark:border-gray-600 border-gray-300 mt-2 relative rounded-t-lg">
                  {/* Left Arrow */}
                  <div className="absolute -bottom-2 -left-[6px] border-solid border-t-8 dark:border-t-gray-600 border-t-gray-300 border-x-4 border-x-transparent"></div>
                  {/* Middle Arrow */}
                  <div className="absolute h-12 border-l-2 border-solid dark:border-gray-600 border-gray-300 left-1/2 top-0">
                    <div className="absolute -bottom-2 left-[-6px] border-solid border-t-8 dark:border-t-gray-600 border-t-gray-300 border-x-4 border-x-transparent"></div>
                  </div>
                  {/* Right Arrow */}
                  <div className="absolute -bottom-2 -right-[6px] border-solid border-t-8 dark:border-t-gray-600 border-t-gray-300 border-x-4 border-x-transparent"></div>
                </div>
              </div>

              {/* Row 4: Compliance Layer */}
              <div className="flex justify-between w-[700px] mt-2">
                <div className="w-full bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/30 rounded-lg py-3 px-6 text-center text-sm font-medium text-amber-600 dark:text-amber-300 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Compliance Layer: Checks DND hours, retry limits, and active opt-outs before execution
                </div>
              </div>
              
              <div className="w-[500px] h-6 border-l-2 border-r-2 border-solid dark:border-gray-600 border-gray-300 relative">
                 <div className="absolute h-6 border-l-2 border-solid dark:border-gray-600 border-gray-300 left-1/2 top-0"></div>
              </div>

              {/* Row 5: Execution Channels */}
              <div className="flex justify-between w-[600px]">
                {/* Channel 1 */}
                <div className="w-40 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/40 rounded-lg p-4 text-center">
                  <PhoneCall className="w-6 h-6 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold dark:text-gray-200 text-gray-800">Voice Calling</h4>
                  <p className="text-[10px] dark:dark:text-gray-500 text-gray-500 dark:text-gray-500 text-gray-500 mt-1">Twilio TTS API</p>
                </div>
                {/* Channel 2 */}
                <div className="w-40 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/40 rounded-lg p-4 text-center">
                  <MessageSquare className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold dark:text-gray-200 text-gray-800">AI Chat Bot</h4>
                  <p className="text-[10px] dark:dark:text-gray-500 text-gray-500 dark:text-gray-500 text-gray-500 mt-1">Interactive Negotiator</p>
                </div>
                {/* Channel 3 */}
                <div className="w-40 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-500/40 rounded-lg p-4 text-center">
                  <Globe className="w-6 h-6 text-cyan-500 dark:text-cyan-400 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold dark:text-gray-200 text-gray-800">Async Messaging</h4>
                  <p className="text-[10px] dark:dark:text-gray-500 text-gray-500 dark:text-gray-500 text-gray-500 mt-1">Telegram & SMS</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
