import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RepoDetail from './pages/RepoDetail';
import Compare from './pages/Compare';
import Global from './pages/Global';
import Feed from './pages/Feed';
import DashboardLayout from './layouts/DashboardLayout';
import useStore from './store/useStore';

function ProtectedRoute({ children }) {
  const userId = useStore((s) => s.userId);
  if (!userId) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#21262d',
            color: '#e6edf3',
            border: '1px solid #30363d',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="repo/:repoId" element={<RepoDetail />} />
            <Route path="compare" element={<Compare />} />
            <Route path="global" element={<Global />} />
            <Route path="activity" element={<Feed />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;