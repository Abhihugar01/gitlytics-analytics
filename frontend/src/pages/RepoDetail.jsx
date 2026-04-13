import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, Loader2, ExternalLink, Star, GitFork, Eye, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { reposAPI, analysisAPI } from '../services/api';
import CommitChart from '../components/CommitChart';
import LanguagePie from '../components/LanguagePie';
import ContributorsChart from '../components/ContributorsChart';
import { ArrowLeft as ArrowLeftIcon, CheckCircle as CheckCircleIcon } from 'lucide-react';

export default function RepoDetail() {
  const { repoId } = useParams();
  const { userId, analysisData, setAnalysis } = useStore();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('');
  const [insights, setInsights] = useState([]);

  const analysis = analysisData[repoId] || null;

  // Fetch repo data
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    reposAPI.getOne(repoId, userId)
      .then((res) => {
        setRepo(res.data);
        if (res.data.analysis) setAnalysis(repoId, res.data.analysis);
      })
      .catch(() => toast.error('Failed to load repository'))
      .finally(() => setLoading(false));
  }, [repoId, userId]);

  // Fetch Insights
  useEffect(() => {
    if (analysis && userId) {
        analysisAPI.getInsights(repoId, userId)
            .then(res => setInsights(res.data))
            .catch(() => {});
    }
  }, [analysis, repoId, userId]);

  // Also try to fetch stored analysis
  useEffect(() => {
    if (!userId || analysis) return;
    analysisAPI.getAnalysis(repoId, userId)
      .then((res) => setAnalysis(repoId, res.data))
      .catch(() => {});
  }, [repoId, userId]);

  const downloadReport = () => {
    const url = analysisAPI.getReportUrl(repoId, userId);
    window.open(url, '_blank');
  };

  // Start analysis
  const startAnalysis = async () => {
    try {
      setAnalyzing(true);
      setProgress(0);
      const res = await analysisAPI.start(repoId, userId);
      setTaskId(res.data.task_id);
      toast('Analysis started!', { icon: '🔬' });
    } catch (err) {
      toast.error('Failed to start analysis');
      setAnalyzing(false);
    }
  };

  // Poll for task completion
  useEffect(() => {
    if (!taskId) return;
    const interval = setInterval(async () => {
      try {
        const res = await analysisAPI.getTaskStatus(taskId);
        const { status, result, progress: p, step: s } = res.data;
        if (p) setProgress(p);
        if (s) setStep(s);
        if (status === 'SUCCESS' && result) {
          setAnalysis(repoId, result);
          setAnalyzing(false);
          setTaskId(null);
          toast.success('Analysis complete!');
          clearInterval(interval);
        } else if (status === 'FAILURE') {
          toast.error('Analysis failed');
          setAnalyzing(false);
          setTaskId(null);
          clearInterval(interval);
        }
      } catch {
        // keep polling
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [taskId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-96" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      </div>
    );
  }

  if (!repo) return <div className="text-gray-500 text-center py-20">Repository not found.</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back + Header */}
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-400 transition-colors mb-4">
          <ArrowLeftIcon size={16} /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20">
              {repo.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                {repo.name}
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer"
                  className="text-gray-600 hover:text-brand-400 transition-colors">
                  <ExternalLink size={20} />
                </a>
              </h1>
              <p className="text-gray-500 mt-1">{repo.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {analysis && (
                <motion.button whileHover={{ y: -2 }} onClick={downloadReport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-200 border border-surface-300 text-gray-300 hover:border-brand-500/50 hover:text-white transition-all">
                    <CheckCircleIcon size={18} className="text-brand-400" />
                    Export Audit PDF
                </motion.button>
            )}
            {!analysis && !analyzing && (
                <motion.button whileTap={{ scale: 0.96 }} onClick={startAnalysis} className="btn-primary flex items-center gap-2 w-fit">
                <Play size={18} /> Run Deep Analysis
                </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Star, label: 'Stars', value: repo.stars, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { icon: GitFork, label: 'Forks', value: repo.forks, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Eye, label: 'Watchers', value: repo.watchers, color: 'text-green-400', bg: 'bg-green-500/10' },
          { icon: AlertCircle, label: 'Issues', value: repo.open_issues, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
            <span className="text-2xl font-bold text-white">{value.toLocaleString()}</span>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Analysis progress */}
      {analyzing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 size={20} className="text-brand-400 animate-spin" />
            <span className="text-sm font-medium">Analyzing repository...</span>
          </div>
          <div className="w-full bg-surface-300 rounded-full h-2 mb-2 overflow-hidden">
            <motion.div
              className="h-full bg-brand-gradient rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500">{step || 'Starting...'} — {progress}%</p>
        </motion.div>
      )}

      {/* AI Pulse */}
      {analysis && insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/10 flex flex-col gap-3"
                >
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400">AI PULSE // {insight.type}</span>
                        {insight.trend === 'up' ? <ArrowLeftIcon size={14} className="rotate-90 text-emerald-400" /> : <div className="w-3 h-0.5 bg-gray-600" />}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{insight.text}"</p>
                </motion.div>
            ))}
        </div>
      )}

      {/* Analysis results */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Commit Frequency</h3>
              <CommitChart data={analysis.commit_frequency} />
            </div>
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Language Breakdown</h3>
              <LanguagePie data={analysis.language_breakdown?.breakdown || analysis.language_breakdown} />
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Top Contributors</h3>
            <ContributorsChart data={analysis.top_contributors} />
          </div>

          {/* Stars trend */}
          {analysis.stars_trend && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analysis.stars_trend).filter(([k]) => k !== 'popularity_score').map(([key, val]) => (
                <div key={key} className="stat-card">
                  <span className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                  <span className="text-xl font-bold text-white">{typeof val === 'number' ? val.toLocaleString() : val}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}