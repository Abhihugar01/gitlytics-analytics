import { useEffect, useState } from 'react';
import { Award, Star, GitBranch, Terminal, Layout } from 'lucide-react';
import { analysisAPI } from '../services/api';
import useStore from '../store/useStore';
import LanguagePie from '../components/LanguagePie';

export default function Global() {
  const { userId } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analysisAPI.getGlobal(userId)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="text-gray-500">Calculating global metrics...</div>;
  if (!data) return <div className="text-red-400">Failed to load metrics.</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Global Impact</h1>
          <p className="text-gray-500 mt-1">Measuring your total influence across GitHub</p>
        </div>
        <div className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 px-4 py-2 rounded-xl">
          <Award className="text-brand-400" />
          <span className="text-lg font-bold text-brand-400 uppercase tracking-tighter">{data.rank}</span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Star, color: 'text-amber-400', label: 'Total Stars', val: data.total_stars },
          { icon: GitBranch, color: 'text-blue-400', label: 'Total Forks', val: data.total_forks },
          { icon: Layout, color: 'text-purple-400', label: 'Repositories', val: data.total_repos },
          { icon: Terminal, color: 'text-brand-400', label: 'Avg. Popularity', val: data.average_popularity },
        ].map((s, i) => (
          <div key={i} className="glass-card p-6 border-b-2 border-transparent hover:border-brand-500/30 transition-all group">
            <s.icon className={`${s.color} mb-3 group-hover:scale-110 transition-transform`} size={20} />
            <p className="text-2xl font-bold text-white">{s.val}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Language Aggregate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-white mb-6">Language Ecosystem</h2>
          <div className="h-[400px]">
            <LanguagePie data={data.global_languages} />
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col justify-center">
            <div className="space-y-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Developer Legacy</h3>
                <p className="text-gray-400 leading-relaxed">
                    Across your {data.total_repos} repositories, you have built an ecosystem favored by builders. 
                    Your code has generated {data.total_stars} stars and fueled {data.total_forks} forks, 
                    placing you in the <span className="text-brand-400 font-bold">{data.rank}</span> tier.
                </p>
                <div className="p-4 rounded-xl bg-surface-200/50 border border-surface-300">
                    <p className="text-sm text-gray-500 italic">"Good code creates value. Great code creates ecosystems."</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
