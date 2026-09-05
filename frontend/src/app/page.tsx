import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Activity, Lock, Layers, Play } from 'lucide-react';


export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans transition-colors duration-300 dark:bg-[#0A0A0A] bg-gray-50 text-gray-900 dark:text-gray-200">
      
      {/* Navigation */}
      <nav className="border-b dark:border-gray-900 border-gray-200 dark:dark:bg-[#0A0A0A] bg-gray-50/90 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-blue-500" />
            <span className="font-semibold text-xl tracking-tight dark:text-white text-gray-900">RevenueGuard</span>
          </div>
          <div className="flex gap-6 items-center">
            
            <Link href="/audit" className="text-sm font-medium dark:dark:text-gray-400 text-gray-600 dark:text-gray-500 text-gray-500 hover:text-blue-500 transition-colors">
              Audit Logs
            </Link>
            <Link href="/lab" className="text-sm font-medium dark:dark:text-gray-400 text-gray-600 dark:text-gray-500 text-gray-500 hover:text-blue-500 transition-colors">
              Demonstration
            </Link>
            <Link href="/dashboard" className="px-5 py-2 text-sm font-medium bg-blue-600 dark:text-white text-gray-900 hover:bg-blue-500 transition-colors rounded-md flex items-center gap-2">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live · Connected to Razorpay
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 dark:text-white text-gray-900">
          AI-Powered Payment Recovery <br className="hidden md:block"/>
          <span className="text-blue-500 dark:text-blue-400">for Razorpay Merchants</span>
        </h1>
        
        <p className="text-lg dark:text-gray-400 text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          RevenueGuard automatically detects failed payments, diagnoses root causes, and recovers lost revenue via SMS, Telegram, and AI voice calls — all within strict compliance boundaries.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/explore" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 dark:text-white text-gray-900 font-medium rounded-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] dark:shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]">
            <Play className="w-5 h-5" />
            Get Started
          </Link>
        </div>
      </main>

      {/* Core Principles */}
      <section className="py-20 border-t dark:border-gray-900 border-gray-200 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold mb-3 dark:text-white text-gray-900">How it works</h2>
            <p className="dark:dark:text-gray-500 text-gray-500 dark:text-gray-500 text-gray-500 max-w-xl mx-auto">A three-layer system that detects, decides, and recovers — with compliance built into every step.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <Layers className="w-5 h-5 text-blue-500 dark:text-blue-400 mb-4" />
              <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-2">Causal Measurement</h4>
              <p className="text-sm dark:dark:text-gray-500 text-gray-500 text-gray-600 leading-relaxed">We hold out 15% of cases as a no-intervention control group. This means our recovery rate is measured against actual counterfactual, not a naive baseline.</p>
            </div>
            <div>
              <Lock className="w-5 h-5 text-blue-500 dark:text-blue-400 mb-4" />
              <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-2">Guardrails Before Execution</h4>
              <p className="text-sm dark:dark:text-gray-500 text-gray-500 text-gray-600 leading-relaxed">The AI proposes. The compliance layer decides. Retry caps, DND windows, and customer opt-out flags are hard filters — not guidelines the agent can override.</p>
            </div>
            <div>
              <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400 mb-4" />
              <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-2">Learning Recovery Channels</h4>
              <p className="text-sm dark:dark:text-gray-500 text-gray-500 text-gray-600 leading-relaxed">The system tracks which channel — SMS, Telegram, or voice — worked best per customer segment, and shifts allocation accordingly over time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
