// Central configuration file for all environment variables
// This makes it easy to import and use configs throughout the project

export const config = {
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || '',
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || '',
    cookieName: 'token',
    tokenExpiry: '7d',
  },

  // Google OAuth
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
  },

  // Email SMTP
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },

  // App Settings
  app: {
    name: 'wordstowellness',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },
};

// Helper function to check if required env vars are set
export function validateConfig() {
  const required = [
    { key: 'MONGODB_URI', value: config.mongodb.uri },
    { key: 'JWT_SECRET', value: config.auth.jwtSecret },
    { key: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID', value: config.google.clientId },
    { key: 'GOOGLE_CLIENT_SECRET', value: config.google.clientSecret },
  ];

  const missing = required.filter(item => !item.value);

  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:');
    missing.forEach(item => console.warn(`   - ${item.key}`));
  }

  return missing.length === 0;
}

export default config;
