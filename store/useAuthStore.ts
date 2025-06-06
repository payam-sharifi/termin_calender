import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      login: (token) =>
        set({ isAuthenticated: true, token }),
      logout: () =>
        set({ isAuthenticated: false, token: null }),
    }),
    {
      name: 'auth-storage', // نام key در localStorage
    }
  )
);
