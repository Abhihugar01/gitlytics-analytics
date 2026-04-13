import { motion } from 'framer-motion';
import { Users, UserCheck, Timer, GitPullRequest, Code2, Coffee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const teamData = [
  { name: 'Abhishek', commits: 145, prs: 24, churn: 1200 },
  { name: 'Veekshith', commits: 88, prs: 18, churn: 850 },
  { name: 'John.D', commits: 65, prs: 12, churn: 2400 },
  { name: 'Sarah.L', commits: 110, prs: 20, churn: 500 },
];

export default function DevActivity() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-brand-400" /> Dev Velocity
          </h1>
          <p className="text-gray-500 mt-1">Cross-repository contributor performance and team distribution.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
              { label: 'Active DEVs', value: '4', icon: UserCheck, color: 'text-brand-400' },
              { label: 'Avg Merge Time', value: '3.4h', icon: Timer, color: 'text-emerald-400' },
              { label: 'Total PRs', value: '74', icon: GitPullRequest, color: 'text-blue-400' },
              { label: 'Code Churn', value: '4.9k', icon: Code2, color: 'text-orange-400' },
          ].map((stat, i) => (
              <div key={i} className="stat-card">
                  <stat.icon className={`${stat.color} mb-2`} size={18} />
                  <span className="text-2xl font-bold text-white leading-tight">{stat.value}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</span>
              </div>
          ))}
      </div>

      <div className="glass-card p-6 border-brand-500/10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Github className="text-gray-600" size={16} /> Contributor Impact // Global
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                        cursor={{ fill: '#30363d55' }}
                        contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px' }}
                    />
                    <Bar dataKey="commits" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                    <Bar dataKey="prs" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-surface-200 border border-surface-300 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">A</div>
            <div>
                <p className="text-sm font-bold text-white">Top Contributor of the Week</p>
                <p className="text-xs text-emerald-400">+145 Commits | 24 PRs Merged</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.01 }} className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-4">
            <Coffee className="text-orange-400" size={24} />
            <div>
                <p className="text-sm font-bold text-white">Health Warning: Peak Workload</p>
                <p className="text-xs text-orange-300">3 devs exceeding typical commit density (potential burnout).</p>
            </div>
          </motion.div>
      </div>
    </div>
  );
}
import { Github } from 'lucide-react';
