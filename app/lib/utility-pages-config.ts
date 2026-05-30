export enum UtilityPageId {
  PRICING = 'pricing',
  PAYMENT = 'payment',
  PAYMENT_SUCCESS = 'payment-success',
  IMPROVE_MESSAGE = 'improve-message',
  SEARCH_FEELINGS = 'search-feelings',
  SETTINGS = 'settings',
}

export interface UtilityPageConfig {
  id: UtilityPageId | string;
  label: string;
  path: string;
  description?: string;
  isPublic?: boolean;
}

export const UTILITY_PAGES: UtilityPageConfig[] = [
  {
    id: UtilityPageId.PRICING,
    label: 'Pricing',
    path: '/pricing',
    description: 'View pricing plans',
    isPublic: true,
  },
  {
    id: UtilityPageId.PAYMENT,
    label: 'Payment',
    path: '/payment',
    description: 'Manage payment information',
    isPublic: false,
  },
  {
    id: UtilityPageId.PAYMENT_SUCCESS,
    label: 'Payment Success',
    path: '/payment/success',
    description: 'Payment confirmation',
    isPublic: false,
  },
  {
    id: UtilityPageId.IMPROVE_MESSAGE,
    label: 'Improve Message',
    path: '/improve-message',
    description: 'Enhance your message content',
    isPublic: false,
  },
  {
    id: UtilityPageId.SEARCH_FEELINGS,
    label: 'Search Feelings',
    path: '/search-feelings',
    description: 'Find content by emotions',
    isPublic: false,
  },
  {
    id: UtilityPageId.SETTINGS,
    label: 'Settings',
    path: '/settings',
    description: 'User account settings',
    isPublic: false,
  },
];

export const getUtilityPageConfig = (pageId: string): UtilityPageConfig | undefined => {
  return UTILITY_PAGES.find((page) => page.id === pageId);
};

export const PUBLIC_PAGES = UTILITY_PAGES.filter((page) => page.isPublic).map((page) => page.path);

export const PROTECTED_PAGES = UTILITY_PAGES.filter((page) => !page.isPublic).map((page) => page.path);

export const PAGE_ROUTES = {
  HOME: '/',
  PRICING: '/pricing',
  PAYMENT: '/payment',
  PAYMENT_SUCCESS: '/payment/success',
  IMPROVE_MESSAGE: '/improve-message',
  SEARCH_FEELINGS: '/search-feelings',
  SETTINGS: '/settings',
} as const;
