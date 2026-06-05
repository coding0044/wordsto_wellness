/**
 * Centralized exports for all Tailwind styles and utilities
 * 
 * Usage:
 * import { GRADIENTS, TEXT, Button, INPUT } from '@/styles';
 */

// Color and gradient utilities
export * from './colors';

// Typography utilities
export * from './typography';

// Component styles
export * from './components';

// Layout and spacing utilities
export * from './spacing';

// Helper utilities
export * from './utils';

// Admin dashboard inline styles
export * from './admin-styles';

// Dashboard page Tailwind classes
export * from './dashboard-styles';

// Spacing and layout utilities
export * from './spacing';

// Layout patterns
export * from './layouts';

// Animations and transitions
export * from './animations';

// Extended button styles
export * from './buttons-extended';

// Utility functions
export * from './utils';


export const DASHBOARD_NAVBAR = {
  container: "flex items-center justify-between px-6 py-4 bg-white shadow",
  logo: "flex items-center gap-2",
  logoIcon: "w-6 h-6 text-red-500",
  logoText: "font-bold text-lg",
  linksContainer: "flex gap-6",
  linkActive: "text-blue-600 font-semibold",
  linkInactive: "text-gray-500 hover:text-black",
  userActionsContainer: "flex items-center gap-4",
  settingsButton: "flex items-center gap-2 px-3 py-1 border rounded",
  settingsIcon: "w-5 h-5"
};
