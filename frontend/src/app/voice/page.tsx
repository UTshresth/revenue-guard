"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mic, PhoneCall, Volume2, PhoneOff, Phone, Activity, Send, Moon, Sun } from 'lucide-react';



const API = 'http://localhost:3001';

interface VoiceScript {
  script: string;
  english_translation: string;
  tone: string;
}

import { Sidebar } from '@/components/Sidebar';
export default function VoiceAgentPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [loadingCases, setLoadingCases] = useState(true);
  
  const [generating, setGenerating] = useState(false);
  const [scriptData, setScriptData] = useState<VoiceScript | null>(null);
  
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [callContext, setCallContext] = useState('');
  const [language, setLanguage] = useState('Hinglish');

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

  const generateScript = async () => {
    if (!selectedCase) return;
    setGenerating(true);
    setScriptData(null);
    setCallState('idle');
    
    try {
      const res = await fetch(`${API}/api/voice/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: selectedCase, callContext, language })
      });
      const data = await res.json();
      setScriptData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const startCall = () => {
    if (!scriptData) return;
    setCallState('dialing');
    
    // Simulate dialing delay
    setTimeout(() => {
      setCallState('connected');
      speakScript(scriptData.script);
    }, 2000);
  };

  const speakScript = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      setCallState('ended');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a Hindi or Indian English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('hi-IN') || v.lang.includes('en-IN')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setTimeout(() => setCallState('ended'), 1000);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCallState('ended');
    };

    window.speechSynthesis.speak(utterance);
  };

  const endCall = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCallState('ended');
  };

  // Ensure voices are loaded (Chrome quirk)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <div className="flex min-h-screen font-sans transition-colors duration-300 dark:bg-[#0A0A0A] bg-gray-50 text-gray-900 dark:text-white"><Sidebar/><div className="flex-1 w-full overflow-hidden">
      <header className="border-b dark:border-gray-800 border-gray-200 dark:dark:bg-[#0A0A0A] bg-gray-50/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="dark:dark:text-gray-400 text-gray-600 dark:text-gray-500 text-gray-500 hover:text-blue-500 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span className="font-semibold text-lg">Voice Recovery Agent</span>
          </div>
          <div className="flex items-center gap-4">
            
            <Link href="/dashboard" className="text-sm dark:dark:text-gray-400 text-gray-600 dark:text-gray-500 text-gray-500 dark:hover:dark:text-white text-gray-900 hover:text-gray-900 font-medium">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4 border border-emerald-500/20 shadow-sm">
            <Mic className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3 dark:text-white text-gray-900">AI Outbound Voice Recovery</h1>
          <p className="dark:text-gray-400 text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select a failed payment case below. The AI will generate a personalized, culturally-aware script and perform an outbound call to help recover the payment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Configuration Panel */}
          <div className="dark:bg-[#111] bg-white border dark:border-gray-800 border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-gray-100 text-gray-800">
              <Activity className="w-5 h-5 text-blue-500" /> Target Selection
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium dark:text-gray-400 text-gray-600 mb-2">Select Target Case</label>
              {loadingCases ? (
                <div className="p-3 dark:bg-gray-900 bg-gray-50 rounded-lg border dark:border-gray-800 border-gray-200 text-sm dark:dark:text-gray-500 text-gray-500 dark:text-gray-400 text-gray-600">Loading cases...</div>
              ) : (
                <select 
                  className="w-full dark:bg-gray-900 bg-gray-50 border dark:border-gray-700 border-gray-300 dark:text-white text-gray-900 text-sm rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-4 transition-all shadow-sm"
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.type.replace(/_/g, ' ')} ({c.amountFormatted})
                    </option>
                  ))}
                </select>
              )}

              <label className="block text-sm font-medium dark:text-gray-400 text-gray-600 mb-2 mt-4">Select Language</label>
              <select 
                className="w-full dark:bg-gray-900 bg-gray-50 border dark:border-gray-700 border-gray-300 dark:text-white text-gray-900 text-sm rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-4 transition-all shadow-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="Hinglish">Hinglish</option>
                <option value="English">English</option>
              </select>

              <label className="block text-sm font-medium dark:text-gray-400 text-gray-600 mb-2">Additional Context / Instructions (Optional)</label>
              <textarea
                className="w-full dark:bg-gray-900 bg-gray-50 border dark:border-gray-700 border-gray-300 dark:text-white text-gray-900 text-sm rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24 resize-none shadow-sm transition-all"
                placeholder="e.g. Offer them a 20% discount if they pay today, or mention their card expired."
                value={callContext}
                onChange={(e) => setCallContext(e.target.value)}
              />
            </div>

            <button
              onClick={generateScript}
              disabled={generating || !selectedCase}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                generating ? 'dark:bg-gray-800 bg-gray-200 dark:dark:text-gray-500 text-gray-500 dark:text-gray-400 text-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 dark:text-white text-gray-900 hover:shadow-md'
              }`}
            >
              {generating ? (
                <><Activity className="w-4 h-4 animate-spin" /> Generating Script...</>
              ) : (
                <><FileText className="w-4 h-4" /> Generate Script</>
              )}
            </button>

            {scriptData && (
              <div className="mt-6 pt-6 border-t dark:border-gray-800 border-gray-200 space-y-4">
                <div>
                  <div className="text-[10px] dark:dark:text-gray-500 text-gray-500 dark:text-gray-400 text-gray-600 font-bold uppercase tracking-wider mb-1">Tone</div>
                  <div className="text-sm text-emerald-500 capitalize font-medium">{scriptData.tone}</div>
                </div>
                <div>
                  <div className="text-[10px] dark:dark:text-gray-500 text-gray-500 dark:text-gray-400 text-gray-600 font-bold uppercase tracking-wider mb-1">English Translation</div>
                  <div className="text-sm dark:text-gray-300 text-gray-600 italic dark:bg-gray-900/50 bg-gray-50 p-4 rounded-xl border dark:border-gray-800 border-gray-200">
                    "{scriptData.english_translation}"
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Call Simulation Panel */}
          <div className="dark:bg-[#111] bg-white border dark:border-gray-800 border-gray-200 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] shadow-sm">
            {/* Background Glow based on call state */}
            {callState === 'connected' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
            )}
            
            <div className="relative z-10 w-full max-w-sm">
              {!scriptData ? (
                <div className="text-center dark:dark:text-gray-500 text-gray-500 dark:text-gray-400 text-gray-600 p-8 border dark:border-gray-800 border-gray-200 border-dashed rounded-2xl bg-gray-50 dark:bg-transparent">
                  Generate a script to start the call simulation.
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  
                  {/* Phone UI */}
                  <div className="w-full dark:bg-gray-900 bg-gray-50 border dark:border-gray-700 border-gray-200 rounded-3xl p-6 shadow-xl flex flex-col items-center mb-8 relative">
                    <div className="w-16 h-16 rounded-full dark:bg-gray-800 bg-gray-200 flex items-center justify-center mb-4 shadow-inner">
                      <Phone className="w-7 h-7 dark:dark:text-gray-400 text-gray-600 dark:text-gray-500 text-gray-500" />
                    </div>
                    <div className="text-lg font-semibold mb-1 dark:text-white text-gray-900">Customer</div>
                    
                    <div className="text-sm text-emerald-500 mb-8 font-mono h-6 flex items-center justify-center font-medium">
                      {callState === 'idle' && 'Ready to call'}
                      {callState === 'dialing' && 'Dialing...'}
                      {callState === 'connected' && (
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          00:00 Connected
                        </span>
                      )}
                      {callState === 'ended' && <span className="text-red-500">Call Ended</span>}
                    </div>

                    {/* Action Buttons Layout (Modern Control Center style) */}
                    <div className="grid grid-cols-1 gap-3 w-full">
                      
                      {callState === 'idle' || callState === 'ended' ? (
                        <button onClick={startCall} className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 dark:text-white text-gray-900 font-medium shadow-md transition-transform hover:scale-[1.02]">
                          <PhoneCall className="w-5 h-5" /> Listen Script
                        </button>
                      ) : (
                        <button onClick={endCall} className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-400 dark:text-white text-gray-900 font-medium shadow-md transition-transform hover:scale-[1.02]">
                          <PhoneOff className="w-5 h-5" /> Stop Listening
                        </button>
                      )}
                      
                      {(callState === 'idle' || callState === 'ended') && (
                        <div className="grid grid-cols-2 gap-3 w-full">
                          <button 
                            onClick={async () => {
                              setCallState('dialing');
                              try {
                                await fetch(`${API}/api/voice/call`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ scriptText: scriptData.script })
                                });
                                setCallState('connected');
                                setTimeout(() => setCallState('ended'), 5000);
                              } catch (e) {
                                setCallState('ended');
                              }
                            }} 
                            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-[#0F9D58] hover:bg-[#0b8043] dark:text-white text-gray-900 shadow-md transition-transform hover:scale-[1.03]"
                          >
                            <Phone className="w-5 h-5" />
                            <span className="text-xs font-semibold">Call</span>
                          </button>
                          
                          <button 
                            onClick={async () => {
                              try {
                                const res = await fetch(`${API}/api/voice/telegram`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ caseId: selectedCase, scriptText: scriptData.script })
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error || 'Failed to send Telegram message');
                                alert(`Success! Telegram message sent with Razorpay link:\n${data.link}`);
                              } catch (e: any) {
                                alert(`Failed: ${e.message}`);
                              }
                            }} 
                            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-[#0088CC] hover:bg-[#0077b5] dark:text-white text-gray-900 shadow-md transition-transform hover:scale-[1.03]"
                          >
                            <Send className="w-5 h-5" />
                            <span className="text-xs font-semibold">Telegram</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transcript visualization */}
                  {callState === 'connected' && (
                    <div className="w-full p-5 dark:bg-gray-800/40 bg-gray-100 border dark:border-gray-700/50 border-gray-200 rounded-2xl relative shadow-sm">
                      <div className="absolute -top-3 left-4 dark:bg-[#111] bg-white px-2 text-[10px] dark:dark:text-gray-400 text-gray-600 dark:text-gray-500 text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 rounded-full border dark:border-gray-800 border-gray-200">
                        <Volume2 className={`w-3 h-3 ${isSpeaking ? 'text-emerald-500 animate-pulse' : 'dark:text-gray-400 text-gray-600'}`} />
                        Live Transcript
                      </div>
                      <p className="text-sm leading-relaxed dark:text-gray-200 text-gray-700 mt-2">
                        "{scriptData.script}"
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
</div>
  );
}

function FileText(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>; }
