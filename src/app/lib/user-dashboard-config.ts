import {
  Home,
  FolderOpen,
  FileText,
  Settings,
  LucideIcon,
} from 'lucide-react';

export enum UserDashboardPageId {
  OVERVIEW = 'overview',
  CATEGORIES = 'categories',
  LETTERS = 'letters',
  LETTERS_VIEW = 'letters-view',
  TOPICS = 'topics',
  SUBCATEGORIES = 'subcategories',
  SETTINGS = 'settings',
}

export interface UserDashboardPageConfig {
  id: UserDashboardPageId | string;
  label: string;
  icon?: LucideIcon;
  path: string;
  description?: string;
}

export const USER_DASHBOARD_PAGES: UserDashboardPageConfig[] = [
  {
    id: UserDashboardPageId.OVERVIEW,
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    description: 'Overview of your content',
  },
  {
    id: UserDashboardPageId.CATEGORIES,
    label: 'Categories',
    icon: FolderOpen,
    path: '/dashboard-categories',
    description: 'Browse content categories',
  },
  {
    id: UserDashboardPageId.SUBCATEGORIES,
    label: 'Subcategories',
    icon: FolderOpen,
    path: '/dashboard-subcategories',
    description: 'Browse subcategories',
  },
  {
    id: UserDashboardPageId.TOPICS,
    label: 'Topics',
    icon: FileText,
    path: '/dashboard-topics',
    description: 'Browse topics',
  },
  {
    id: UserDashboardPageId.LETTERS,
    label: 'Letters',
    icon: FileText,
    path: '/dashboard-letters',
    description: 'Browse wellness letters',
  },
  {
    id: UserDashboardPageId.LETTERS_VIEW,
    label: 'Letter View',
    icon: FileText,
    path: '/dashboard-letters-view',
    description: 'View letter details',
  },
];

export const getUserDashboardPageConfig = (pageId: string): UserDashboardPageConfig | undefined => {
  return USER_DASHBOARD_PAGES.find((page) => page.id === pageId);
};

export const USER_DASHBOARD_COLORS = {
  primary: '#0ea5e9',
  secondary: '#06b6d4',
  accent: '#0284c7',
  light: '#f0f9ff',
  text: '#0c4a6e',
} as const;
