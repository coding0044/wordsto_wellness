'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Routes } from '@/lib/urls';
import {
  login as loginService,
  signup as signupService,
  getCurrentUser as fetchCurrentUser,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  getAdminUsers as fetchAdminUsers,
  AuthResponse,
  User,
  LoginData,
  SignupData,
  ForgotPasswordData,
} from '@/services/auth-service';

// Login mutation
export const useLogin = () => {
  const router = useRouter();

  return useMutation<AuthResponse, Error, LoginData>({
    mutationFn: (data) => loginService(data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      if (data.user.role === 'admin') {
        router.push(Routes.adminDashboard);
      } else {
        router.push(Routes.dashboard);
      }
    },
    onError: (error) => {
      console.error('Login error:', error.message);
    },
  });
};

// Signup mutation
export const useSignup = () => {
  const router = useRouter();

  return useMutation<AuthResponse, Error, SignupData>({
    mutationFn: (data) => signupService(data),
    onSuccess: (data) => {
      if (data.user.role === 'admin') {
        router.push(Routes.adminDashboard);
      } else {
        router.push(Routes.dashboard);
      }
    },
    onError: (error) => {
      console.error('Signup error:', error.message);
    },
  });
};

// Get current user query
export const useCurrentUser = () => {
  return useQuery<User, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return fetchCurrentUser(token);
    },
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  const router = useRouter();

  return useMutation<{ message: string }, Error, ForgotPasswordData>({
    mutationFn: (data) => forgotPasswordService(data),
    onSuccess: (_data, variables) => {
      sessionStorage.setItem('resetEmail', variables.email);
      router.push(`${Routes.auth.verifyOtp}?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => {
      console.error('Forgot password error:', error.message);
    },
  });
};

// Reset password mutation
export const useResetPassword = () => {
  const router = useRouter();

  return useMutation<{ message: string }, Error, { token: string; password: string }>({
    mutationFn: async ({ token, password }) => resetPasswordService(token, password),
    onSuccess: () => {
      router.push(Routes.auth.login);
    },
    onError: (error) => {
      console.error('Reset password error:', error.message);
    },
  });
};

// Logout function
export const useLogout = () => {
  const router = useRouter();

  return () => {
    localStorage.removeItem('token');
    router.push(Routes.auth.login);
  };
};

// Get all users (admin only)
export const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return fetchAdminUsers(token);
    },
    retry: false,
    staleTime: 0, // No caching to ensure fresh data
  });
};
