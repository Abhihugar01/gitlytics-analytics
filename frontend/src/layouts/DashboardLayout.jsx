import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GitBranch, BarChart3, LogOut, Github, ArrowLeftRight } from 'lucide-react';
import useStore from '../store/useStore';
import { useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/compare', icon: ArrowLeftRight, label: 'Compare' },
  { to: '/dashboard/global', icon: BarChart3, label: 'Global Impact' },
  { to: '/dashboard/activity', icon: GitBranch, label: 'Activity Feed' },
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
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface-200/60'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
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
      <main className="flex-1 overflow-y-auto bg-grid">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
