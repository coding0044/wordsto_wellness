'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Login mutation
export const useLogin = () => {
  const router = useRouter();
  
  return useMutation<AuthResponse, Error, LoginData>({
    mutationFn: async (data) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      if (data.user.role === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/dashboard');
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
    mutationFn: async (data) => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user.role === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/dashboard');
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
      
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get current user');
      }
      
      const data = await response.json();
      return data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  const router = useRouter();
  
  return useMutation<{ message: string }, Error, ForgotPasswordData>({
    mutationFn: async (data) => {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Store email for OTP verification
      sessionStorage.setItem('resetEmail', variables.email);
      router.push(`/verify-otp?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => {
      console.error('Forgot password error:', error.message);
    },
  });
};

// Reset password mutation
export const useResetPassword = () => {
  const router = useRouter();
  
  return useMutation<{ message: string }, Error, ResetPasswordData & { token: string }>({
    mutationFn: async ({ token, password }) => {
      const response = await fetch(`/api/auth/reset-password?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      router.push('/login');
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
    router.push('/login');
  };
};
