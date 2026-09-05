import React from 'react';
import { IndianRupee } from 'lucide-react';

export default function RecoveryCounter() {
  return (
    <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      
      <h3 className="text-gray-400 text-sm font-medium flex items-center gap-2">
        <IndianRupee className="w-4 h-4 text-emerald-400" />
        Total Revenue Recovered
      </h3>
      
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-black tracking-tight text-white">₹9,47,200</span>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Recovery Rate: 59.9%</span>
          <span className="text-gray-500">Target: 60%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full" style={{ width: '59.9%' }}></div>
        </div>
      </div>
    </div>
  );
}
