import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Github, BarChart3, Zap, Shield, TrendingUp, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const features = [
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Commit frequency, contributor insights, and language breakdowns' },
  { icon: Zap, title: 'Async Processing', desc: 'Background analysis with real-time progress tracking' },
  { icon: TrendingUp, title: 'Trend Prediction', desc: 'ML-powered repository popularity predictions' },
  { icon: Shield, title: 'Secure OAuth', desc: 'GitHub OAuth 2.0 with encrypted token storage' },
];

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { userId, setAuth } = useStore();

  useEffect(() => {
    const tokenParam = params.get('token');
    const userIdParam = params.get('user_id');
    if (tokenParam && userIdParam) {
      setAuth(userIdParam, tokenParam);
      navigate('/dashboard', { replace: true });
    }
  }, [params]);

  useEffect(() => {
    if (userId) navigate('/dashboard', { replace: true });
  }, [userId]);

  const handleLogin = () => {
    window.location.href = `${API_BASE}/auth/github`;
  };

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-3xl"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-xl shadow-brand-500/30 animate-glow">
              <GitBranch size={28} className="text-white" />
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Git
            </span>
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              lytics
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-4 font-light">
            Deep analytics for your GitHub repositories
          </p>
          <p className="text-sm text-gray-600 mb-10 max-w-xl mx-auto">
            Visualize commit patterns, track contributors, analyze language trends, and predict repository popularity — all from one beautiful dashboard.
          </p>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-white/10 hover:shadow-white/20 transition-shadow duration-300"
          >
            <Github size={24} />
            Continue with GitHub
          </motion.button>

          <p className="text-xs text-gray-600 mt-4">
            We only request read access to your repositories.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20 max-w-5xl w-full"
        >
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="glass-card p-5 group hover:border-brand-500/30 transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3 group-hover:bg-brand-500/20 transition-colors">
                <Icon size={20} className="text-brand-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="mt-16 text-xs text-gray-700">
          Built with FastAPI · React · PostgreSQL · Celery
        </div>
      </div>
    </div>
  );
}