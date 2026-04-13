import { Star, GitFork, BookOpen, Code2 } from 'lucide-react';

export default function StatsOverview({ repos, totalStars, totalForks, topLangs }) {
  const topLanguage = Object.entries(topLangs).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    { icon: BookOpen, label: 'Repositories', value: repos.length, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { icon: Star, label: 'Total Stars', value: totalStars, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { icon: GitFork, label: 'Total Forks', value: totalForks, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Code2, label: 'Top Language', value: topLanguage ? topLanguage[0] : '—', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="stat-card">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon size={20} className={color} />
          </div>
          <span className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          <span className="text-xs text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  );
}
