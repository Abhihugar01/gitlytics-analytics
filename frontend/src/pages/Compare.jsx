import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import useStore from '../store/useStore';
import { analysisAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Compare() {
  const { userId, repos } = useStore();
  const [repoA, setRepoA] = useState('');
  const [repoB, setRepoB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!repoA || !repoB) return toast.error('Select two repos');
    if (repoA === repoB) return toast.error('Choose different repos');
    setLoading(true);
    try {
      const res = await analysisAPI.compare(repoA, repoB, userId);
      setResult(res.data);
    } catch {
      toast.error('Failed to compare — make sure both repos are analyzed');
    } finally {
      setLoading(false);
    }
  };

  const RepoSummary = ({ data, label }) => {
    if (!data) return null;
    return (
      <div className="glass-card p-6 flex-1">
        <h3 className="text-lg font-bold text-white mb-4">{data.repo?.name || label}</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Stars</span><span className="font-semibold">{data.repo?.stars ?? '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Forks</span><span className="font-semibold">{data.repo?.forks ?? '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Popularity</span><span className="font-semibold text-brand-400">{data.analysis?.popularity_score ?? '—'}</span></div>
          {data.analysis?.language_breakdown && (
            <div>
              <span className="text-gray-500 block mb-2">Languages</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.analysis.language_breakdown).slice(0, 5).map(([lang, pct]) => (
                  <span key={lang} className="badge-blue">{lang}: {typeof pct === 'number' ? pct.toFixed(1) : pct}%</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Compare Repositories</h1>
        <p className="text-gray-500 mt-1">Side-by-side comparison of two repositories</p>
      </div>

      {/* Selectors */}
      <div className="flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1 w-full">
          <label className="text-xs text-gray-500 mb-1 block">Repository A</label>
          <select value={repoA} onChange={(e) => setRepoA(e.target.value)} className="input-field w-full">
            <option value="">Select a repository</option>
            {repos.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-200 border border-surface-300 flex-shrink-0 mb-0.5">
          <ArrowLeftRight size={16} className="text-gray-500" />
        </div>
        <div className="flex-1 w-full">
          <label className="text-xs text-gray-500 mb-1 block">Repository B</label>
          <select value={repoB} onChange={(e) => setRepoB(e.target.value)} className="input-field w-full">
            <option value="">Select a repository</option>
            {repos.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <button onClick={handleCompare} disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="flex flex-col md:flex-row gap-6">
          <RepoSummary data={result.repo_a} label="Repo A" />
          <RepoSummary data={result.repo_b} label="Repo B" />
        </div>
      )}
    </div>
  );
}
