import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Github, Star, GitBranch, MessageSquare } from 'lucide-react';
import useStore from '../store/useStore';
import { reposAPI, analysisAPI } from '../services/api';

export default function Feed() {
  const { userId, user } = useStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !user) return;

    // Load initial data
    reposAPI.getActivity(userId)
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Connect to WebSocket for REAL-TIME updates
    const wsUrl = analysisAPI.getActivityWS(userId);
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'github_event') {
            setEvents(prev => [data.payload, ...prev].slice(0, 50));
        }
    };

    return () => ws.close();
  }, [userId, user]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
          <Terminal size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Live Activity Feed</h1>
          <p className="text-sm text-gray-500">Real-time pulses from your GitHub ecosystem</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-brand-500/20">
        <div className="bg-surface-200/50 px-4 py-2 border-b border-surface-300 flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <span className="text-[10px] font-mono text-gray-500 ml-2 uppercase tracking-widest">Real-time Stream // {events.length} Events</span>
        </div>
        
        <div className="p-2 font-mono text-xs">
          {loading ? (
            <div className="p-4 text-gray-600 animate-pulse">Initializing activity stream...</div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {events.map((event, idx) => (
                  <motion.div
                    key={event.id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-2 hover:bg-white/5 rounded transition-colors group"
                  >
                    <span className="text-brand-400 opacity-50">[{new Date(event.created_at).toLocaleTimeString()}]</span>
                    <div className="flex-1">
                      <span className="text-emerald-400 font-bold">{event.actor?.display_login || 'user'}</span>
                      <span className="text-gray-400"> performed </span>
                      <span className="text-blue-400 font-bold px-1.5 py-0.5 rounded bg-blue-500/10">{event.type}</span>
                      <span className="text-gray-400"> on </span>
                      <span className="text-white hover:underline cursor-pointer">{event.repo?.name}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
