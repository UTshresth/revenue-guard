"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, MessageSquare, Send, Zap, Bot, User, CheckCircle, ExternalLink } from 'lucide-react';

const API = 'http://localhost:3001';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isLink?: boolean;
  linkUrl?: string;
}

import { Sidebar } from "@/components/Sidebar";
export default function NegotiatePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [loadingCases, setLoadingCases] = useState(true);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch cases to select from
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch(`${API}/api/dashboard/stats`);
        const data = await res.json();
        setCases(data.recentCases || []);
        if (data.recentCases?.length > 0) {
          setSelectedCase(data.recentCases[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCases(false);
      }
    };
    fetchCases();
  }, []);
  const [constraints, setConstraints] = useState('');

  // Reset chat when case or constraints change
  const resetChat = () => {
    if (!selectedCase) return;
    setMessages([
      { role: 'assistant', content: 'Hi there! I am the RevenueGuard AI Assistant. I see you had trouble with your recent Razorpay transaction. How can I help you resolve this today?' }
    ]);
    fetch(`${API}/api/negotiate/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId: selectedCase, constraints })
    });
  };

  useEffect(() => {
    resetChat();
  }, [selectedCase]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedCase) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API}/api/negotiate/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: selectedCase, message: userText, constraints })
      });
      const data = await res.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: data.message || 'Error parsing response',
            isLink: data.toolUsed,
            linkUrl: data.link
          }
        ]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error connecting to my server.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans transition-colors duration-300 dark:bg-[#0A0A0A] bg-gray-50 text-gray-900 dark:text-white"><Sidebar/><div className="flex-1 w-full overflow-hidden">
      <header className="border-b dark:border-gray-800 border-gray-200 dark:bg-[#0A0A0A] bg-gray-50/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="dark:text-gray-400 text-gray-600 hover:dark:text-white text-gray-900"><ArrowLeft className="w-5 h-5" /></Link>
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg">Autonomous AI Negotiator</span>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> Tool Calling Enabled
            </span>
          </div>
          <Link href="/dashboard" className="text-sm dark:text-gray-400 text-gray-600 hover:dark:text-white text-gray-900">Dashboard</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
        
        {/* Left Panel: Context */}
        <div className="md:w-1/3 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Live AI Negotiation</h1>
            <p className="dark:text-gray-400 text-gray-600 text-sm leading-relaxed">
              Experience a true Agentic workflow. The AI talks to the customer, understands their financial constraints, negotiates a settlement, and <strong>autonomously calls Razorpay APIs</strong> to generate a custom payment link mid-conversation.
            </p>
          </div>

          <div className="dark:bg-[#111] bg-white border dark:border-gray-800 border-gray-200 rounded-xl p-5">
            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Select Target Case</label>
            {loadingCases ? (
              <div className="text-sm dark:text-gray-500 text-gray-500">Loading cases...</div>
            ) : (
              <select 
                className="w-full bg-gray-900 border border-gray-700 dark:text-white text-gray-900 text-sm rounded-lg p-3 outline-none focus:border-blue-500"
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.amountFormatted}
                  </option>
                ))}
              </select>
            )}
            
            {selectedCase && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Negotiation Constraints</label>
                <textarea 
                  className="w-full bg-gray-900 border border-gray-700 dark:text-white text-gray-900 text-sm rounded-lg p-3 outline-none focus:border-blue-500 h-24 resize-none mb-3"
                  placeholder="e.g. You have authority to offer up to 30% discount or EMI."
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                />
                <button 
                  onClick={resetChat}
                  className="w-full bg-blue-600 hover:bg-blue-500 dark:text-white text-gray-900 rounded-lg py-2.5 text-sm font-medium transition-colors"
                >
                  Apply Constraints & Reset Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Chat Interface */}
        <div className="md:w-2/3 dark:bg-[#111] bg-white border dark:border-gray-800 border-gray-200 rounded-xl flex flex-col overflow-hidden h-[600px] shadow-2xl relative">
          
          {/* Chat Header */}
          <div className="bg-gray-900/50 border-b dark:border-gray-800 border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="font-bold text-sm">RevenueGuard AI Agent</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Online & Ready
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 dark:text-white text-gray-900 rounded-br-none' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  
                  {/* Tool execution result / Payment Link Card */}
                  {msg.isLink && msg.linkUrl && (
                    <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-emerald-500/30">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                        <CheckCircle className="w-4 h-4" /> Tool Executed Successfully
                      </div>
                      <p className="text-xs dark:text-gray-400 text-gray-600 mb-3">
                        The AI autonomously called the Razorpay API and generated this custom link based on your negotiation.
                      </p>
                      <a 
                        href={msg.linkUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 dark:text-white text-gray-900 px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Pay Custom Amount <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl rounded-bl-none p-4 text-sm dark:text-gray-400 text-gray-600 flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-900 border-t dark:border-gray-800 border-gray-200">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Chat as a customer (e.g. 'I don't have that much money right now...')"
                className="flex-1 dark:bg-[#111] bg-white border border-gray-700 dark:text-white text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 dark:text-white text-gray-900 rounded-xl p-3 transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
</div>
  );
}
