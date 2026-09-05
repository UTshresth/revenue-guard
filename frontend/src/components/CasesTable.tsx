import React from 'react';

const MOCK_CASES = [
  {
    id: "RG-CHK-1724401200",
    customer: "Test Customer",
    type: "Checkout Drop-off",
    amount: "₹5,000",
    status: "Recovered",
    channel: "SMS (Discount)",
    time: "2m ago"
  },
  {
    id: "RG-PAY-1724401500",
    customer: "Rahul Sharma",
    type: "Insufficient Funds",
    amount: "₹1,500",
    status: "Pending",
    channel: "Wait 48hrs",
    time: "15m ago"
  },
  {
    id: "RG-SUB-1724402100",
    customer: "SaaS Corp",
    type: "Card Expired",
    amount: "₹9,990",
    status: "Payment Link Sent",
    channel: "Email",
    time: "1h ago"
  },
  {
    id: "RG-INV-1724402800",
    customer: "B2B Client",
    type: "Overdue Invoice",
    amount: "₹1,50,000",
    status: "Escalated",
    channel: "Human Review",
    time: "3h ago"
  }
];

export default function CasesTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="text-xs uppercase bg-gray-800/50 text-gray-500">
          <tr>
            <th className="px-6 py-4 font-medium">Case ID</th>
            <th className="px-6 py-4 font-medium">Type</th>
            <th className="px-6 py-4 font-medium">Amount</th>
            <th className="px-6 py-4 font-medium">Strategy</th>
            <th className="px-6 py-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {MOCK_CASES.map((c) => (
            <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
              <td className="px-6 py-4">
                <div className="font-mono text-gray-300">{c.id}</div>
                <div className="text-xs mt-1 text-gray-500">{c.time}</div>
              </td>
              <td className="px-6 py-4">{c.type}</td>
              <td className="px-6 py-4 font-mono">{c.amount}</td>
              <td className="px-6 py-4">{c.channel}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${c.status === 'Recovered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                  ${c.status === 'Pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : ''}
                  ${c.status === 'Payment Link Sent' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
                  ${c.status === 'Escalated' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                `}>
                  {c.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
