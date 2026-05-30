import {
  LayoutDashboard,
  FileText,
  Users,
  FolderTree,
  Layers,
  BookOpen,
  LucideIcon,
} from 'lucide-react';

export enum AdminPageId {
  OVERVIEW = 'overview',
  CATEGORIES = 'categories',
  SUBCATEGORIES = 'subcategories',
  TOPICS = 'topics',
  LETTERS = 'letters',
  USERS = 'users',
}

export interface AdminPageConfig {
  id: AdminPageId | string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface AccentColors {
  from: string;
  to: string;
  light: string;
  text: string;
  ring: string;
}

export const ADMIN_PAGES: AdminPageConfig[] = [
  {
    id: AdminPageId.OVERVIEW,
    label: 'Overview',
    icon: LayoutDashboard,
    path: '/admin-dashboard/overview',
  },
  {
    id: AdminPageId.CATEGORIES,
    label: 'Categories',
    icon: Layers,
    path: '/admin-dashboard/categories',
  },
  {
    id: AdminPageId.SUBCATEGORIES,
    label: 'Subcategories',
    icon: FolderTree,
    path: '/admin-dashboard/subcategories',
  },
  {
    id: AdminPageId.TOPICS,
    label: 'Topics',
    icon: BookOpen,
    path: '/admin-dashboard/topics',
  },
  {
    id: AdminPageId.LETTERS,
    label: 'Letters',
    icon: FileText,
    path: '/admin-dashboard/letters',
  },
  {
    id: AdminPageId.USERS,
    label: 'Users',
    icon: Users,
    path: '/admin-dashboard/users',
  },
];

export const ADMIN_ACCENT_COLORS: Record<string, AccentColors> = {
  [AdminPageId.CATEGORIES]: {
    from: '#6366f1',
    to: '#8b5cf6',
    light: '#eef2ff',
    text: '#4338ca',
    ring: '#c7d2fe',
  },
  [AdminPageId.SUBCATEGORIES]: {
    from: '#10b981',
    to: '#059669',
    light: '#ecfdf5',
    text: '#047857',
    ring: '#a7f3d0',
  },
  [AdminPageId.TOPICS]: {
    from: '#0ea5e9',
    to: '#2563eb',
    light: '#f0f9ff',
    text: '#0369a1',
    ring: '#bae6fd',
  },
  [AdminPageId.LETTERS]: {
    from: '#f59e0b',
    to: '#ef4444',
    light: '#fffbeb',
    text: '#b45309',
    ring: '#fde68a',
  },
  [AdminPageId.USERS]: {
    from: '#ec4899',
    to: '#a855f7',
    light: '#fdf4ff',
    text: '#9333ea',
    ring: '#e9d5ff',
  },
  [AdminPageId.OVERVIEW]: {
    from: '#818cf8',
    to: '#6366f1',
    light: '#eef2ff',
    text: '#4f46e5',
    ring: '#c7d2fe',
  },
};

export const getAdminPageConfig = (pageId: string): AdminPageConfig | undefined => {
  return ADMIN_PAGES.find((page) => page.id === pageId);
};

export const getAccentColor = (pageId: string): AccentColors => {
  return ADMIN_ACCENT_COLORS[pageId] || ADMIN_ACCENT_COLORS[AdminPageId.CATEGORIES];
};

export const ADMIN_FORM_TYPES = [
  { type: 'user', label: 'User' },
  { type: 'category', label: 'Category' },
  { type: 'subcategory', label: 'Subcategory' },
  { type: 'topic', label: 'Topic' },
  { type: 'letter', label: 'Letter' },
] as const;
