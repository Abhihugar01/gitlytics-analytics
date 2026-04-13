import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Skull, Clock, BarChart3, TrendingDown } from 'lucide-react';

export default function RiskAudit() {
  const risks = [
    { name: 'Bus Factor Risk', score: 85, color: 'text-red-400', desc: 'Critical knowledge silo in 2 repos' },
    { name: 'Churn Rate', score: 42, color: 'text-yellow-400', desc: 'Higher than normal refactoring activity' },
    { name: 'Maintenance Gap', score: 12, color: 'text-emerald-400', desc: 'Active contribution in all core repos' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-brand-400" /> Health Fleet
          </h1>
          <p className="text-gray-500 mt-1">Real-time risk scoring and maintenance monitoring for your repository fleet.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {risks.map((risk, i) => (
              <div key={i} className="glass-card p-6 border-surface-300/50">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{risk.name}</h3>
                      <span className={`text-xl font-bold ${risk.color}`}>{risk.score}</span>
                  </div>
                  <div className="w-full bg-surface-300 rounded-full h-1.5 mb-4">
                      <div className={`h-full rounded-full bg-current ${risk.color}`} style={{ width: `${risk.score}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 italic">"{risk.desc}"</p>
              </div>
          ))}
      </div>

      <div className="glass-card p-0 border-brand-500/10 overflow-hidden">
          <div className="p-4 border-b border-surface-300 bg-surface-200/50 flex items-center gap-2">
              <TrendingDown className="text-orange-400" size={16} />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Low Activity / Maintenance Risks</span>
          </div>
          <div className="p-4">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="text-gray-500 border-b border-surface-300">
                        <th className="pb-3 font-medium">Repository</th>
                        <th className="pb-3 font-medium text-center">Last Activity</th>
                        <th className="pb-3 font-medium text-center">Risk Score</th>
                        <th className="pb-3 font-medium text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-300">
                    {[
                        { name: "legacy-parser", last: "3 months ago", score: 92, status: "Dormant", sColor: "text-red-400" },
                        { name: "internal-tools", last: "2 weeks ago", score: 45, status: "Active", sColor: "text-emerald-400" },
                        { name: "experimental-ai", last: "8 months ago", score: 98, status: "Risky", sColor: "text-red-400" },
                    ].map((row, i) => (
                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                            <td className="py-4 font-bold text-white">{row.name}</td>
                            <td className="py-4 text-center text-gray-500">{row.last}</td>
                            <td className="py-4 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.score > 80 ? 'border-red-500/30 text-red-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                                    {row.score}/100
                                </span>
                            </td>
                            <td className={`py-4 text-right font-bold ${row.sColor}`}>{row.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
