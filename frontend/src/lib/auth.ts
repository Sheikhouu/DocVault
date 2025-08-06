import { authAPI } from '@/services/api';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('auth_token');
  const user = getCurrentUser();
  
  return !!(token && user);
};

// Sign out user
export const signOut = async (): Promise<void> => {
  try {
    await authAPI.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/signin';
};