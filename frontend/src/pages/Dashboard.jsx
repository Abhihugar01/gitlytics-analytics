import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, GitFork, Eye, AlertCircle, Search, RefreshCw, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { reposAPI } from '../services/api';
import StatsOverview from '../components/StatsOverview';
import ActivityHeatmap from '../components/ActivityHeatmap';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  Go: '#00ADD8', Rust: '#dea584', 'C++': '#f34b7d', C: '#555555',
  Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF',
  Dart: '#00B4AB', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
  Vue: '#41b883', Svelte: '#ff3e00', Jupyter: '#DA5B0B',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { userId, repos, setRepos, reposLoading, setReposLoading } = useStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updated');

  const fetchRepos = async () => {
    if (!userId) return;
    setReposLoading(true);
    try {
      const res = await reposAPI.getAll(userId);
      setRepos(res.data);
      toast.success(`Loaded ${res.data.length} repositories`);
    } catch (err) {
      toast.error('Failed to fetch repositories');
    }
  };

  useEffect(() => {
    if (userId && repos.length === 0) fetchRepos();
  }, [userId]);

  const filteredRepos = repos
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'forks') return b.forks - a.forks;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks, 0);
  const topLangs = {};
  repos.forEach((r) => { if (r.language) topLangs[r.language] = (topLangs[r.language] || 0) + 1; });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your GitHub repositories</p>
        </div>
        <button onClick={fetchRepos} disabled={reposLoading} className="btn-secondary flex items-center gap-2 w-fit">
          <RefreshCw size={16} className={reposLoading ? 'animate-spin' : ''} />
          {reposLoading ? 'Syncing...' : 'Sync Repos'}
        </button>
      </div>

      {/* Stats */}
      <StatsOverview repos={repos} totalStars={totalStars} totalForks={totalForks} topLangs={topLangs} />

      {/* Activity Heatmap */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-brand-400" />
          Repository Activity
        </h2>
        <ActivityHeatmap repos={repos} />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full pl-11"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field bg-surface-100 min-w-[160px]"
        >
          <option value="updated">Recently Updated</option>
          <option value="stars">Most Stars</option>
          <option value="forks">Most Forks</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Loading */}
      {reposLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-3">
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-1/2" />
              <div className="flex gap-4 mt-4">
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Repos Grid */}
      {!reposLoading && (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo, i) => (
              <motion.div
                key={repo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => navigate(`/dashboard/repo/${repo.id}`)}
                className="glass-card-hover p-6 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate group-hover:text-brand-400 transition-colors">
                      {repo.name}
                    </h3>
                    {repo.private && <span className="badge-purple text-[10px] mt-1">Private</span>}
                  </div>
                  {repo.language && (
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: LANG_COLORS[repo.language] || '#8b949e' }}
                      />
                      <span className="text-xs text-gray-500">{repo.language}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[2.5rem]">
                  {repo.description || 'No description provided'}
                </p>

                <div className="flex items-center gap-5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star size={13} className="text-yellow-500" /> {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={13} className="text-blue-400" /> {repo.forks}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={13} className="text-green-400" /> {repo.watchers}
                  </span>
                  {repo.open_issues > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertCircle size={13} className="text-orange-400" /> {repo.open_issues}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {!reposLoading && filteredRepos.length === 0 && repos.length > 0 && (
        <div className="text-center py-16 text-gray-500">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>No repositories match your search.</p>
        </div>
      )}
    </div>
  );
}