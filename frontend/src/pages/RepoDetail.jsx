import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, Loader2, ExternalLink, Star, GitFork, Eye, AlertCircle, ShieldAlert, Cpu, Activity, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { reposAPI, analysisAPI } from '../services/api';
import CommitChart from '../components/CommitChart';
import LanguagePie from '../components/LanguagePie';
import ContributorsChart from '../components/ContributorsChart';

const HealthIndicator = ({ score }) => {
    const color = score > 80 ? 'text-emerald-400' : score > 50 ? 'text-blue-400' : 'text-orange-400';
    const bgColor = score > 80 ? 'bg-emerald-500/10' : score > 50 ? 'bg-blue-500/10' : 'bg-orange-500/10';
    
    return (
        <div className={`p-6 rounded-3xl ${bgColor} border border-white/5 flex items-center gap-6`}>
            <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-300" />
                    <motion.circle 
                        cx="40" cy="40" r="36" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 36}
                        initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                        animate={{ strokeDashoffset: (2 * Math.PI * 36) * (1 - score / 100) }}
                        className={color}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${color}`}>{Math.round(score)}</span>
                </div>
            </div>
            <div>
                <h3 className="text-white font-bold text-lg">Health Score</h3>
                <p className="text-sm text-gray-400">Overall repository vitality index</p>
            </div>
        </div>
    );
};

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
    if (analysis && userId && (!analysis.ai_summary || analysis.ai_summary === "")) {
        analysisAPI.getInsights(repoId, userId)
            .then(res => setInsights(res.data))
            .catch(() => {});
    }
  }, [analysis, repoId, userId]);

  const downloadReport = () => {
    const url = analysisAPI.getReportUrl(repoId, userId);
    window.open(url, '_blank');
  };

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

  // Real-time WebSocket Task Tracking
  useEffect(() => {
    if (!taskId) return;
    
    const wsUrl = analysisAPI.getTaskWS(taskId);
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.progress) setProgress(data.progress);
        if (data.step) setStep(data.step);
        
        if (data.status === 'SUCCESS' && data.result) {
          setAnalysis(repoId, data.result);
          setAnalyzing(false);
          setTaskId(null);
          toast.success('Analysis complete!');
          ws.close();
        } else if (data.status === 'FAILURE') {
          toast.error('Analysis failed');
          setAnalyzing(false);
          setTaskId(null);
          ws.close();
        }
    };

    ws.onerror = () => {
        // Fallback or retry logic if needed
    };

    return () => ws.close();
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
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="group relative">
                <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                {repo.name[0].toUpperCase()}
                </div>
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
                    <CheckCircle size={18} className="text-brand-400" />
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-8">
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
              <AnimatePresence>
              {analyzing && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card p-6 border-brand-500/30 shadow-2xl shadow-brand-500/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Loader2 size={24} className="text-brand-400 animate-spin" />
                        <div>
                            <span className="text-sm font-bold text-white block">Real-time Analysis Pipeline</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">{step || 'Connecting to WebSocket...'}</span>
                        </div>
                    </div>
                    <span className="text-2xl font-mono text-brand-400">{progress}%</span>
                  </div>
                  <div className="w-full bg-surface-300 rounded-full h-3 mb-2 overflow-hidden overflow-hidden relative">
                    <motion.div
                      className="h-full bg-brand-gradient rounded-full relative z-10"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-x-0 bottom-0 top-0 bg-brand-400/10 animate-pulse" />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600 font-mono uppercase tracking-tighter">
                      <span>Initializing Engine</span>
                      <span>Extraction</span>
                      <span>AI Pulse Gen</span>
                      <span>Finalizing</span>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>

              {/* Charts area */}
              {analysis && (
                <div className="space-y-6">
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
                </div>
              )}
          </div>

          <div className="space-y-6">
            {analysis && (
                <>
                    <HealthIndicator score={analysis.health_score || 0} />
                    
                    {/* AI Summary */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 border-brand-500/20">
                        <div className="flex items-center gap-2 mb-4 text-brand-400">
                             <TrendingUp size={18} />
                             <h3 className="font-bold uppercase tracking-widest text-xs">AI Deep Intel</h3>
                        </div>
                        <div className="text-gray-300 text-sm leading-relaxed space-y-4 whitespace-pre-line border-l-2 border-brand-500/20 pl-4 py-1">
                            {analysis.ai_summary || "AI Summary is being generated. Run analysis to refresh."}
                        </div>
                    </motion.div>

                    {/* Security Alerts */}
                    <div className="glass-card p-6">
                         <div className="flex items-center gap-2 mb-4 text-orange-400">
                             <ShieldAlert size={18} />
                             <h3 className="font-bold uppercase tracking-widest text-xs">Security Risks</h3>
                        </div>
                        {(!analysis.security_alerts || analysis.security_alerts.length === 0) ? (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm italic">
                                <CheckCircle size={14} /> No active vulnerabilities detected
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {analysis.security_alerts.slice(0, 3).map((alert, idx) => (
                                    <div key={idx} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-200">
                                        {alert.security_advisory?.summary || "Potential dependency vulnerability"}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
          </div>
      </div>
    </div>
  );
}