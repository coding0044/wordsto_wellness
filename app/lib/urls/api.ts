export const ApiRoutes = {
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: (token: string) => `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
    verifyOtp: '/api/auth/verify-otp',
    resendOtp: '/api/auth/resend-otp',
    google: '/api/auth/google',
    changePassword: '/api/auth/change-password',
    subscribe: '/api/auth/subscribe',
    adminUsers: '/api/auth/admin/users',
  },
  public: {
    categories: '/api/public/categories',
    subcategories: '/api/public/subcategories',
    topics: '/api/public/topics',
    letters: '/api/public/letters',
    contentTree: '/api/public/content-tree',
  },
  content: {
    categories: '/api/content/categories',
    subcategories: '/api/content/subcategories',
    topics: '/api/content/topics',
    letters: '/api/content/letters',
  },
  user: {
    profilePicture: '/api/user/profile-picture',
    update: '/api/user/update',
    upgradePlan: '/api/user/upgrade-plan',
  },
};
