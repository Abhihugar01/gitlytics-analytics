import { motion } from 'framer-motion';
import { BarChart3, Clock, Zap, ArrowRight, Gauge, Layers } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const scatterData = [
  { x: 10, y: 30, z: 20 },
  { x: 20, y: 50, z: 260 },
  { x: 45, y: 25, z: 400 },
  { x: 65, y: 85, z: 120 },
  { x: 85, y: 45, z: 50 },
  { x: 35, y: 15, z: 200 },
];

export default function FlowMetrics() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-brand-400" /> Advanced Flow
          </h1>
          <p className="text-gray-500 mt-1">Deep metrics on PR review speed, issue cycle times, and process bottlenecks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
              { label: 'PR Lead Time', value: '18h', icon: Clock, color: 'text-brand-400' },
              { label: 'Review Capacity', value: '85%', icon: Gauge, color: 'text-emerald-400' },
              { label: 'Deployment Freq', value: '4.2/d', icon: Zap, color: 'text-yellow-400' },
          ].map((stat, i) => (
              <div key={i} className="stat-card">
                  <div className="flex items-center gap-3 mb-4">
                    <stat.icon className={stat.color} size={20} />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <div className="text-4xl font-bold text-white tracking-tight">{stat.value}</div>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 border-brand-500/10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Review Thermal Map // Cycle Times</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                        <XAxis type="number" dataKey="x" name="Complexity" unit="pt" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                        <YAxis type="number" dataKey="y" name="Review Time" unit="h" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                        <ZAxis type="number" dataKey="z" range={[50, 400]} name="Lines Changed" />
                        <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px' }}
                        />
                        <Scatter name="PRs" data={scatterData} fill="#6366f1" />
                    </ScatterChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="glass-card p-6 border-brand-500/10 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={16} /> Bottleneck Detection
              </h3>
              <div className="space-y-3">
                  {[
                      { title: "PR Review Stagnation", impact: "High", desc: "4 PRs pending > 48h in repo 'gitlytics-analytics'" },
                      { title: "Reviewer Overload", impact: "Medium", desc: "2 developers handling 80% of all reviews" },
                      { title: "Test Suite Latency", impact: "Low", desc: "CI pipeline average duration increased by 12% this week" },
                  ].map((item, i) => (
                      <div key={i} className="p-4 rounded-xl bg-surface-200 border border-surface-300">
                          <div className="flex justify-between items-start mb-1">
                              <p className="text-sm font-bold text-white">{item.title}</p>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                  {item.impact} IMPACT
                              </span>
                          </div>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}
