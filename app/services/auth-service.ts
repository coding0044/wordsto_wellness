import { fetchJson, jsonHeaders, authHeaders } from '@/lib/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface SubscriptionData {
  plan?: string;
  status?: string;
  usesLeft?: number | null;
  resetFrequency?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    planName?: string;
    planStatus?: string;
    usesLeft?: number | null;
    resetFrequency?: string;
    plan?: SubscriptionData;
    subscription?: SubscriptionData;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  planName?: string;
  planStatus?: string;
  usesLeft?: string;
  resetFrequency?: string;
  plan?: SubscriptionData;
  subscription?: SubscriptionData;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  return fetchJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
}

export async function signup(data: SignupData): Promise<AuthResponse> {
  return fetchJson<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser(token: string): Promise<User> {
  return fetchJson<{ user: User }>('/api/auth/me', {
    headers: authHeaders(token),
  }).then((response) => response.user);
}

export async function subscribe(data: SubscriptionData): Promise<{ user: User }> {
  return fetchJson<{ user: User }>('/api/auth/subscribe', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
  return fetchJson('/api/auth/forgot-password', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  return fetchJson('/api/auth/reset-password?token=' + encodeURIComponent(token), {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ password }),
  });
}

export async function logout(): Promise<void> {
  await fetchJson('/api/auth/logout', {
    method: 'POST',
  });
}

export async function getAdminUsers(token: string): Promise<User[]> {
  return fetchJson<{ users: User[] }>('/api/auth/admin/users', {
    headers: authHeaders(token),
  }).then((response) => response.users || []);
}

export async function createAdminUser(data: Partial<User> & { password?: string }): Promise<User> {
  return fetchJson<{ user: User }>('/api/auth/admin/users', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  }).then((response) => response.user);
}

export async function updateAdminUser(id: string, data: Partial<User>): Promise<User> {
  return fetchJson<{ user: User }>(`/api/auth/admin/users?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  }).then((response) => response.user);
}

export async function deleteAdminUser(id: string): Promise<void> {
  await fetchJson(`/api/auth/admin/users?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
