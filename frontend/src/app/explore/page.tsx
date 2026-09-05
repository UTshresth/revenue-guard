"use client";
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Activity, Cpu, Lock, PhoneCall, BarChart3, FlaskConical, Webhook, Server, BrainCircuit, Globe, MessageSquare, Shield, Database } from 'lucide-react';
import dynamic from 'next/dynamic';

const Mermaid = dynamic(() => import('@/components/Mermaid'), { ssr: false });

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
            <div className="w-full flex justify-center">
              <Mermaid chart={`flowchart TD
    A[Live Razorpay Webhooks\\n& API Sync] --> B[Event Triage Router]
    
    B --> B1[Checkout Drop-off Engine]
    B --> B2[Overdue Invoice Engine]
    B --> B3[Mandate & Subscription Engine]
    
    B1 & B2 & B3 --> C{Groq LLM Agent\\nCompound-Mini}
    
    C -->|Diagnoses Failure & Generates Strategy| D[Channel Selector]
    
    D -->|Low Value / Standard| E1[SMS Dispatcher]
    D -->|High Value / Complex| E2[Telegram Bot\\nInteractive Negotiation]
    D -->|Critical / B2B| E3[Twilio Voice Agent\\nHinglish Live Call]
    
    E1 & E2 & E3 --> F{Compliance & EV Gate}
    
    F -->|Cost > Expected Value\\nOr TRAI DND Active| G[REJECTED\\nNegative Margin Block]
    F -->|Passes Math & Rules| H[Fault-Tolerant Outbox\\nIdempotency Key]
    
    H --> I[Dispatcher Worker]
    I --> J[Razorpay API\\nGenerate Payment Link]
    
    J --> K[Customer Receives Link]
    
    %% Interactive Feedback Loop
    E2 & E3 -.->|Customer Requests Time| L[Promise-To-Pay Ledger\\nTime-locked Grace Period]
    L -.->|Broken Promise| B
    
    K -->|Payment Captured| M[State Machine\\nStatus: RECOVERED]
    
    G & J & L & M --> N[(Cryptographic Audit Trail\\nSHA-256 Tamper-Evident Seal)]

    style A fill:#1a1a2e,stroke:#3b82f6,stroke-width:2px,color:#fff
    style C fill:#2d1b4e,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style F fill:#4a1c1c,stroke:#ef4444,stroke-width:2px,color:#fff
    style H fill:#113220,stroke:#10b981,stroke-width:2px,color:#fff
    style N fill:#1a202c,stroke:#10b981,stroke-width:2px,color:#fff
    style L fill:#4a3f1c,stroke:#eab308,stroke-width:2px,color:#fff`} />
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
