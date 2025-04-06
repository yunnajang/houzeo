import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: (user) => set({ user, isAuthenticated: true }),

  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
