import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Lock, Unlock, Eye, RefreshCw } from 'lucide-react';

export default function SecurityHub() {
  const securityStats = [
    { label: 'Total Vulnerabilities', value: '12', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Secure Repos', value: '8', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Dependency Risks', value: '5', icon: Lock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Monitoring Active', value: '100%', icon: Eye, color: 'text-brand-400', bg: 'bg-brand-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" /> Security Center
          </h1>
          <p className="text-gray-500 mt-1">Federated security auditing across your entire repository fleet.</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} /> Rescan All Repos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {securityStats.map((stat, i) => (
              <div key={i} className="glass-card p-5 border-surface-300/50">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon size={20} />
                  </div>
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-0 border-brand-500/15 overflow-hidden">
              <div className="p-4 border-b border-surface-300 bg-surface-200/50 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Critical Alerts // Active</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-[10px] text-red-400 font-bold">URGENT</span>
              </div>
              <div className="divide-y divide-surface-300">
                  {[
                      { repo: "gitlytics-backend", vulnerability: "CVE-2023-1234 (Critical)", severity: "high" },
                      { repo: "api-gateway", vulnerability: "Outdated pyjwt requirement", severity: "medium" },
                      { repo: "enterprise-dashboard", vulnerability: "Sensitive secret exposure", severity: "high" },
                  ].map((alert, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                          <div className="flex gap-3 items-center">
                              <div className={`w-2 h-2 rounded-full ${alert.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                              <div>
                                  <p className="text-sm font-bold text-white">{alert.repo}</p>
                                  <p className="text-xs text-gray-500">{alert.vulnerability}</p>
                              </div>
                          </div>
                          <button className="text-[10px] text-brand-400 font-bold hover:underline">VIEW FIX</button>
                      </div>
                  ))}
              </div>
          </div>

          <div className="glass-card p-6 border-emerald-500/10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={40} />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-white">Security Health: EXCELLENT</h3>
                  <p className="text-gray-500 text-sm mt-1 px-8">Your overall security posture is higher than 85% of managed organizations.</p>
              </div>
              <div className="w-full bg-surface-300 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%]" />
              </div>
          </div>
      </div>
    </div>
  );
}
