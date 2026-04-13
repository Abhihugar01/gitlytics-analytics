import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Auth
  userId: localStorage.getItem('gitlytics_user_id') || null,
  token: localStorage.getItem('gitlytics_token') || null,
  user: null,

  setAuth: (userId, token) => {
    localStorage.setItem('gitlytics_user_id', userId);
    localStorage.setItem('gitlytics_token', token);
    set({ userId, token });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('gitlytics_user_id');
    localStorage.removeItem('gitlytics_token');
    set({ userId: null, token: null, user: null, repos: [], selectedRepo: null });
  },

  // Repos
  repos: [],
  reposLoading: false,
  setRepos: (repos) => set({ repos, reposLoading: false }),
  setReposLoading: (v) => set({ reposLoading: v }),

  // Selected repo
  selectedRepo: null,
  setSelectedRepo: (repo) => set({ selectedRepo: repo }),

  // Analysis
  analysisData: {},
  setAnalysis: (repoId, data) =>
    set((state) => ({ analysisData: { ...state.analysisData, [repoId]: data } })),
}));

export default useStore;
