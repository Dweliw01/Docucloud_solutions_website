// ============================================
// DocuCloud Solutions - Express API Server
// Clean, modular architecture
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./src/config');

// Import routes
const inquiryRoutes = require('./src/routes/inquiry');
const analyticsRoutes = require('./src/routes/analytics');

// ============================================
// INITIALIZE APP
// ============================================
const app = express();
const PORT = config.port;

// ============================================
// MIDDLEWARE
// ============================================

// Security - Disable CSP in development for easier testing
app.use(helmet({
  contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false
}));

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting on API routes
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Inquiry routes
app.use('/api/inquiry', inquiryRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🚀 DocuCloud Solutions API Server          ║
╠═══════════════════════════════════════════════╣
║   📡 Port: ${PORT}                              ║
║   🌍 Environment: ${config.nodeEnv.padEnd(23)}║
║   ⏰ Started: ${new Date().toLocaleTimeString().padEnd(25)}║
╚═══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
