import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('passionkeep_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface User {
  id: string;
  name: string;
  email: string;
  passion: string;
  stats: { totalSessions: number; avgJoy: number; avgStress: number; streak: number };
  bio?: string;
}

interface Session {
  _id: string;
  title: string;
  passion: string;
  duration: number;
  joyLevel: number;
  stressLevel: number;
  energyLevel: number;
  reflection?: string;
  mood: string;
  aiInsight?: string;
  burnoutRisk: string;
  createdAt: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passion: string) => Promise<void>;
  logout: () => void;
  fetchSessions: () => Promise<void>;
  createSession: (data: any) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
  getAIInsight: (data: any) => Promise<string>;
  getWeeklyReport: () => Promise<any>;
  getBurnoutCheck: () => Promise<any>;
  clearError: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      sessions: [],
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await API.post('/auth/login', { email, password });
          localStorage.setItem('passionkeep_token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
          throw err;
        }
      },

      register: async (name, email, password, passion) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await API.post('/auth/register', { name, email, password, passion });
          localStorage.setItem('passionkeep_token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.message || 'Registration failed', isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('passionkeep_token');
        set({ user: null, token: null, sessions: [] });
      },

      fetchSessions: async () => {
        try {
          const { data } = await API.get('/sessions');
          set({ sessions: data });
        } catch (err) {
          console.error('Failed to fetch sessions:', err);
        }
      },

      createSession: async (sessionData) => {
        set({ isLoading: true });
        try {
          const { data } = await API.post('/sessions', sessionData);
          set(state => ({ sessions: [data, ...state.sessions], isLoading: false }));
          // Update user stats
          const { data: userData } = await API.get('/auth/me');
          set({ user: userData.user });
          return data;
        } catch (err: any) {
          set({ error: err.response?.data?.message || 'Failed to create session', isLoading: false });
          throw err;
        }
      },

      deleteSession: async (id) => {
        await API.delete(`/sessions/${id}`);
        set(state => ({ sessions: state.sessions.filter(s => s._id !== id) }));
      },

      getAIInsight: async (data) => {
        try {
          const response = await API.post('/ai/insight', data);
          return response.data.insight;
        } catch {
          return "Keep nurturing your passion with joy!";
        }
      },

      getWeeklyReport: async () => {
        const { data } = await API.get('/ai/weekly-report');
        return data;
      },

      getBurnoutCheck: async () => {
        const { data } = await API.post('/ai/burnout-check');
        return data;
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'passionkeep-storage',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
);

export { API };
