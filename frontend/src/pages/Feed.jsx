import { useEffect, useState } from 'react';
import { Terminal, GitCommit, Star, GitPullRequest, AlertCircle } from 'lucide-react';
import { reposAPI } from '../services/api';
import useStore from '../store/useStore';

export default function Feed() {
  const { userId } = useStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reposAPI.getActivity(userId)
      .then(res => setEvents(res.data))
      .finally(() => setLoading(false));
  }, [userId]);

  const getEventIcon = (type) => {
    switch(type) {
      case 'PushEvent': return <GitCommit size={14} className="text-green-400" />;
      case 'WatchEvent': return <Star size={14} className="text-amber-400" />;
      case 'PullRequestEvent': return <GitPullRequest size={14} className="text-purple-400" />;
      default: return <AlertCircle size={14} className="text-blue-400" />;
    }
  };

  const formatEvent = (event) => {
    const time = new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const repo = event.repo.name.split('/')[1];
    
    let action = '';
    if (event.type === 'PushEvent') action = `pushed ${event.payload.commits?.length || 0} commits to`;
    else if (event.type === 'WatchEvent') action = `started watching`;
    else if (event.type === 'PullRequestEvent') action = `${event.payload.action} a PR in`;
    else action = `performed ${event.type} in`;

    return (
      <div className="flex items-start gap-4 text-sm font-mono group">
        <span className="text-gray-600 shrink-0">[{time}]</span>
        <div className="flex items-center gap-2">
            {getEventIcon(event.type)}
            <span className="text-gray-300 group-hover:text-white transition-colors">{action}</span>
            <span className="text-brand-400 font-bold">{repo}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Terminal className="text-brand-400" />
          Activity Feed
        </h1>
        <p className="text-gray-500 mt-1">Live heart-beat of your GitHub development stream</p>
      </div>

      <div className="flex-1 bg-black/40 border border-surface-300/50 rounded-2xl overflow-hidden flex flex-col backdrop-blur-md">
        <div className="bg-surface-200/50 px-4 py-2 border-b border-surface-300/50 flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono ml-2">Console v1.0.4</span>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
            {loading ? (
                <div className="text-brand-400 font-mono animate-pulse">Connecting to stream...</div>
            ) : events.length === 0 ? (
                <div className="text-gray-600 font-mono">No recent packets found.</div>
            ) : (
                events.map((ev, i) => (
                    <div key={ev.id || i} style={{ animationDelay: `${i * 100}ms` }} className="animate-slide-up">
                        {formatEvent(ev)}
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
