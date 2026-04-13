import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, GitBranch, BarChart3, LogOut, Github, ArrowLeftRight,
  Sparkles, Users, ShieldCheck, Activity, Zap, Bell
} from 'lucide-react';
import useStore from '../store/useStore';
import { useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const navSections = [
  {
    label: 'Core',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/dashboard/activity', icon: GitBranch, label: 'Activity Feed' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/dashboard/ai-pulse', icon: Sparkles, label: 'AI Pulse Hub' },
      { to: '/dashboard/compare', icon: ArrowLeftRight, label: 'Compare' },
      { to: '/dashboard/global', icon: BarChart3, label: 'Global Impact' },
    ]
  },
  {
    label: 'SaaS Analytics',
    items: [
      { to: '/dashboard/dev-velocity', icon: Users, label: 'Dev Velocity' },
      { to: '/dashboard/health-fleet', icon: Activity, label: 'Health Fleet' },
      { to: '/dashboard/security-hub', icon: ShieldCheck, label: 'Security Hub' },
      { to: '/dashboard/flow-metrics', icon: Zap, label: 'Advanced Flow' },
    ]
  },
  {
    label: 'Control',
    items: [
        { to: '/dashboard/alerts', icon: Bell, label: 'Smart Alerts' },
    ]
  }
];

export default function DashboardLayout() {
  const { userId, user, setUser, logout } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId && !user) {
      authAPI.getMe(userId)
        .then((res) => setUser(res.data))
        .catch(() => {});
    }
  }, [userId]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-surface-300/50 bg-surface-100/80 backdrop-blur-lg">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Github size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Gitlytics
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Analytics</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-hide">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <h3 className="px-4 text-[10px] font-bold text-gray-600 uppercase tracking-[2px] mb-2">
                {section.label}
              </h3>
              {section.items.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand-500/15 text-brand-400 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-surface-200/60'
                    }`
                  }
                >
                  <Icon size={18} className="group-hover:scale-110 transition-transform" />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-surface-300/50">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-9 h-9 rounded-full ring-2 ring-brand-500/40"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name || user.username}</p>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors w-full px-2 py-1.5"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-grid relative">
        {/* Subtle top gradient */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
        <div className="p-8 max-w-7xl mx-auto relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
