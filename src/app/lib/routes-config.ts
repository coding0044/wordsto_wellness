/**
 * Centralized Application Routes Configuration
 * Single source of truth for all application routes across the project
 */

export enum AppPageId {
  // Home
  HOME = 'home',

  // Auth
  LOGIN = 'login',
  SIGNUP = 'signup',
  FORGOT_PASSWORD = 'forgot-password',
  RESET_PASSWORD = 'reset-password',
  VERIFY_OTP = 'verify-otp',

  // User Dashboard
  DASHBOARD = 'dashboard',
  DASHBOARD_CATEGORIES = 'dashboard-categories',
  DASHBOARD_LETTERS = 'dashboard-letters',
  DASHBOARD_LETTERS_VIEW = 'dashboard-letters-view',
  DASHBOARD_TOPICS = 'dashboard-topics',
  DASHBOARD_SUBCATEGORIES = 'dashboard-subcategories',

  // Admin Dashboard
  ADMIN_OVERVIEW = 'admin-overview',
  ADMIN_CATEGORIES = 'admin-categories',
  ADMIN_SUBCATEGORIES = 'admin-subcategories',
  ADMIN_TOPICS = 'admin-topics',
  ADMIN_LETTERS = 'admin-letters',
  ADMIN_USERS = 'admin-users',

  // Utilities
  PRICING = 'pricing',
  PAYMENT = 'payment',
  PAYMENT_SUCCESS = 'payment-success',
  IMPROVE_MESSAGE = 'improve-message',
  SEARCH_FEELINGS = 'search-feelings',
  SETTINGS = 'settings',
}

export interface AppPageConfig {
  id: AppPageId | string;
  label: string;
  path: string;
  category: 'auth' | 'admin' | 'dashboard' | 'utility' | 'public';
  protected?: boolean;
  description?: string;
}

export const APP_PAGES: AppPageConfig[] = [
  // Home & Public
  {
    id: AppPageId.HOME,
    label: 'Home',
    path: '/',
    category: 'public',
    protected: false,
  },

  // Auth Pages
  {
    id: AppPageId.LOGIN,
    label: 'Login',
    path: '/login',
    category: 'auth',
    protected: false,
    description: 'Sign in to your account',
  },
  {
    id: AppPageId.SIGNUP,
    label: 'Sign Up',
    path: '/signup',
    category: 'auth',
    protected: false,
    description: 'Create a new account',
  },
  {
    id: AppPageId.FORGOT_PASSWORD,
    label: 'Forgot Password',
    path: '/forgot-password',
    category: 'auth',
    protected: false,
    description: 'Reset your password',
  },
  {
    id: AppPageId.RESET_PASSWORD,
    label: 'Reset Password',
    path: '/reset-password',
    category: 'auth',
    protected: false,
    description: 'Set a new password',
  },
  {
    id: AppPageId.VERIFY_OTP,
    label: 'Verify OTP',
    path: '/verify-otp',
    category: 'auth',
    protected: false,
    description: 'Verify your one-time password',
  },

  // User Dashboard Pages
  {
    id: AppPageId.DASHBOARD,
    label: 'Dashboard',
    path: '/dashboard',
    category: 'dashboard',
    protected: true,
    description: 'User dashboard overview',
  },
  {
    id: AppPageId.DASHBOARD_CATEGORIES,
    label: 'Categories',
    path: '/dashboard-categories',
    category: 'dashboard',
    protected: true,
    description: 'Browse content categories',
  },
  {
    id: AppPageId.DASHBOARD_SUBCATEGORIES,
    label: 'Subcategories',
    path: '/dashboard-subcategories',
    category: 'dashboard',
    protected: true,
    description: 'Browse subcategories',
  },
  {
    id: AppPageId.DASHBOARD_TOPICS,
    label: 'Topics',
    path: '/dashboard-topics',
    category: 'dashboard',
    protected: true,
    description: 'Browse topics',
  },
  {
    id: AppPageId.DASHBOARD_LETTERS,
    label: 'Letters',
    path: '/dashboard-letters',
    category: 'dashboard',
    protected: true,
    description: 'Browse wellness letters',
  },
  {
    id: AppPageId.DASHBOARD_LETTERS_VIEW,
    label: 'Letter View',
    path: '/dashboard-letters-view',
    category: 'dashboard',
    protected: true,
    description: 'View letter details',
  },

  // Admin Dashboard Pages
  {
    id: AppPageId.ADMIN_OVERVIEW,
    label: 'Admin Overview',
    path: '/admin-dashboard/overview',
    category: 'admin',
    protected: true,
    description: 'Admin dashboard overview',
  },
  {
    id: AppPageId.ADMIN_CATEGORIES,
    label: 'Manage Categories',
    path: '/admin-dashboard/categories',
    category: 'admin',
    protected: true,
    description: 'Manage content categories',
  },
  {
    id: AppPageId.ADMIN_SUBCATEGORIES,
    label: 'Manage Subcategories',
    path: '/admin-dashboard/subcategories',
    category: 'admin',
    protected: true,
    description: 'Manage content subcategories',
  },
  {
    id: AppPageId.ADMIN_TOPICS,
    label: 'Manage Topics',
    path: '/admin-dashboard/topics',
    category: 'admin',
    protected: true,
    description: 'Manage content topics',
  },
  {
    id: AppPageId.ADMIN_LETTERS,
    label: 'Manage Letters',
    path: '/admin-dashboard/letters',
    category: 'admin',
    protected: true,
    description: 'Manage wellness letters',
  },
  {
    id: AppPageId.ADMIN_USERS,
    label: 'Manage Users',
    path: '/admin-dashboard/users',
    category: 'admin',
    protected: true,
    description: 'Manage user accounts',
  },

  // Utility Pages
  {
    id: AppPageId.PRICING,
    label: 'Pricing',
    path: '/pricing',
    category: 'utility',
    protected: false,
    description: 'View pricing plans',
  },
  {
    id: AppPageId.PAYMENT,
    label: 'Payment',
    path: '/payment',
    category: 'utility',
    protected: true,
    description: 'Manage payment information',
  },
  {
    id: AppPageId.PAYMENT_SUCCESS,
    label: 'Payment Success',
    path: '/payment/success',
    category: 'utility',
    protected: true,
    description: 'Payment confirmation',
  },
  {
    id: AppPageId.IMPROVE_MESSAGE,
    label: 'Improve Message',
    path: '/improve-message',
    category: 'utility',
    protected: true,
    description: 'Enhance your message content',
  },
  {
    id: AppPageId.SEARCH_FEELINGS,
    label: 'Search Feelings',
    path: '/search-feelings',
    category: 'utility',
    protected: true,
    description: 'Find content by emotions',
  },
  {
    id: AppPageId.SETTINGS,
    label: 'Settings',
    path: '/settings',
    category: 'utility',
    protected: true,
    description: 'User account settings',
  },
];

// Helper functions
export const getPageConfig = (pageId: string): AppPageConfig | undefined => {
  return APP_PAGES.find((page) => page.id === pageId);
};

export const getPagesByCategory = (category: string): AppPageConfig[] => {
  return APP_PAGES.filter((page) => page.category === category);
};

export const isProtectedPage = (pageId: string): boolean => {
  const page = getPageConfig(pageId);
  return page?.protected === true;
};

export const getAuthPages = (): AppPageConfig[] => getPagesByCategory('auth');
export const getAdminPages = (): AppPageConfig[] => getPagesByCategory('admin');
export const getDashboardPages = (): AppPageConfig[] => getPagesByCategory('dashboard');
export const getUtilityPages = (): AppPageConfig[] => getPagesByCategory('utility');

// Route constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',
  DASHBOARD: '/dashboard',
  DASHBOARD_CATEGORIES: '/dashboard-categories',
  DASHBOARD_SUBCATEGORIES: '/dashboard-subcategories',
  DASHBOARD_TOPICS: '/dashboard-topics',
  DASHBOARD_LETTERS: '/dashboard-letters',
  DASHBOARD_LETTERS_VIEW: '/dashboard-letters-view',
  ADMIN_OVERVIEW: '/admin-dashboard/overview',
  ADMIN_CATEGORIES: '/admin-dashboard/categories',
  ADMIN_SUBCATEGORIES: '/admin-dashboard/subcategories',
  ADMIN_TOPICS: '/admin-dashboard/topics',
  ADMIN_LETTERS: '/admin-dashboard/letters',
  ADMIN_USERS: '/admin-dashboard/users',
  PRICING: '/pricing',
  PAYMENT: '/payment',
  PAYMENT_SUCCESS: '/payment/success',
  IMPROVE_MESSAGE: '/improve-message',
  SEARCH_FEELINGS: '/search-feelings',
  SETTINGS: '/settings',
} as const;
