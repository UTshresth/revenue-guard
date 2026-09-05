"use client";

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function PayRoute() {
  const params = useParams();
  const caseId = params.caseId as string;
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    // We would fetch order details from our backend based on the caseId.
    // For the hackathon demo, we'll just mock the Razorpay checkout popup.
    setTimeout(() => {
      setLoading(false);
      
      // Simulate Razorpay Standard Checkout Popup
      alert("Razorpay Standard Checkout would pop up here for Case: " + caseId + "!");
      
    }, 1500);
  }, [caseId]);

  return (
    <div className="min-h-screen dark:bg-[#0A0A0A] bg-gray-50 dark:text-white text-gray-900 flex flex-col items-center justify-center p-4">
      <div className="dark:bg-[#111] bg-white p-8 rounded-2xl border dark:border-gray-800 border-gray-200 shadow-2xl max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-blue-400" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Secure Checkout</h1>
        <p className="dark:text-gray-400 text-gray-600 text-sm mb-8">Case Reference: <span className="font-mono text-gray-300">{caseId}</span></p>

        {loading ? (
          <div className="flex items-center justify-center gap-3 text-blue-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Initializing Razorpay...</span>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-400">
            ✅ Payment Modal Triggered Successfully!
            <p className="text-xs mt-2 text-emerald-500/70">In a live environment, the Razorpay Standard Checkout overlay appears here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
