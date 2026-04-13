import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, TrendingUp, MessageSquare, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockData = [
  { name: 'Mon', insightCount: 12, impact: 85 },
  { name: 'Tue', insightCount: 19, impact: 92 },
  { name: 'Wed', insightCount: 15, impact: 78 },
  { name: 'Thu', insightCount: 22, impact: 95 },
  { name: 'Fri', insightCount: 30, impact: 88 },
];

export default function AIPulse() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-brand-400" /> AI Pulse Hub
          </h1>
          <p className="text-gray-500 mt-1">Generative intelligence synthesized across all connected repositories.</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-bold uppercase tracking-widest">Enterprise AI</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
              { label: 'Total Insights', value: '142', icon: Brain, color: 'text-purple-400' },
              { label: 'Impact Factor', value: '94%', icon: Zap, color: 'text-yellow-400' },
              { label: 'Active Suggestions', value: '12', icon: Target, color: 'text-emerald-400' },
          ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="stat-card"
              >
                  <div className="flex justify-between items-start">
                    <div>
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                        <h2 className="text-3xl font-bold text-white mt-1">{stat.value}</h2>
                    </div>
                    <stat.icon className={stat.color} size={24} />
                  </div>
              </motion.div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 border-brand-500/10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp size={16} /> Intelligence Velocity
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockData}>
                        <defs>
                            <linearGradient id="colorInsight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="insightCount" stroke="#6366f1" fillOpacity={1} fill="url(#colorInsight)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="glass-card p-6 border-brand-500/10 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Priority AI Insights</h3>
              {[
                  "Team velocity dropped on Wednesdays, likely due to heavy sync meetings.",
                  "Code churn in 'gitlytics-backend' suggests an imminent architectural shift.",
                  "Potential developer burnout detected in 'v-3110' based on late-night activity logs.",
              ].map((text, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 5 }}
                    className="p-4 rounded-xl bg-surface-200 border border-surface-300 flex gap-4 items-start"
                  >
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 flex-shrink-0">
                        <MessageSquare size={16} />
                      </div>
                      <p className="text-sm text-gray-300">{text}</p>
                  </motion.div>
              ))}
          </div>
      </div>
    </div>
  );
}
