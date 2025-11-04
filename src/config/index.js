// Application configuration
require('dotenv').config();

module.exports = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },

  // Email
  email: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.FROM_EMAIL || 'noreply@docucloudsolutions.com',
    notificationEmail: process.env.NOTIFICATION_EMAIL || 'info@docucloudsolutions.com'
  },

  // Security
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CORS_ORIGIN || 'https://docucloudsolutions.com'
      : ['http://localhost:3000', 'http://127.0.0.1:3000']
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
  },

  // Analytics
  analytics: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    trackPageViews: true,
    trackEvents: true
  }
};
