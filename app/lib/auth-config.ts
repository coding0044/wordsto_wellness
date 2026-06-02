export enum AuthPageId {
  LOGIN = 'login',
  SIGNUP = 'signup',
  FORGOT_PASSWORD = 'forgot-password',
  RESET_PASSWORD = 'reset-password',
  VERIFY_OTP = 'verify-otp',
}

export interface AuthPageConfig {
  id: AuthPageId | string;
  label: string;
  path: string;
  description?: string;
}

export const AUTH_PAGES: AuthPageConfig[] = [
  {
    id: AuthPageId.LOGIN,
    label: 'Login',
    path: '/login',
    description: 'Sign in to your account',
  },
  {
    id: AuthPageId.SIGNUP,
    label: 'Sign Up',
    path: '/signup',
    description: 'Create a new account',
  },
  {
    id: AuthPageId.FORGOT_PASSWORD,
    label: 'Forgot Password',
    path: '/forgot-password',
    description: 'Reset your password',
  },
  {
    id: AuthPageId.RESET_PASSWORD,
    label: 'Reset Password',
    path: '/reset-password',
    description: 'Set a new password',
  },
  {
    id: AuthPageId.VERIFY_OTP,
    label: 'Verify OTP',
    path: '/verify-otp',
    description: 'Verify your one-time password',
  },
];

export const getAuthPageConfig = (pageId: string): AuthPageConfig | undefined => {
  return AUTH_PAGES.find((page) => page.id === pageId);
};

export const AUTH_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin-dashboard/overview',
} as const;
