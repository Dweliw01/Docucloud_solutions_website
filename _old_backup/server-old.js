// ============================================
// DocuCloud Solutions - Express API Server
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const sgMail = require('@sendgrid/mail');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ============================================
// MIDDLEWARE
// ============================================

// Security - Allow inline scripts for Google Analytics in development
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));

// CORS - Allow localhost in development
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CORS_ORIGIN || 'https://docucloudsolutions.com']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files (HTML, CSS, JS, images)
app.use(express.static('.'));

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Calculate lead score
function calculateLeadScore(data) {
  let score = 0;
  
  if (data.company && data.company.length > 0) score += 10;
  if (data.phone && data.phone.length > 0) score += 15;
  if (data.message && data.message.length > 50) score += 20;
  if (data.message && data.message.length > 200) score += 10;
  if (data.source === 'direct') score += 25;
  if (data.referrer && data.referrer.includes('google')) score += 10;
  
  return Math.min(score, 100);
}

// Send email notification
async function sendEmailNotification(lead, score) {
  const msg = {
    to: process.env.NOTIFICATION_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: `🔔 New Lead: ${lead.company || lead.name} (Score: ${score}/100)`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎯 New Lead Alert!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #1e293b;">Lead Information</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; width: 30%;">Name:</td>
                <td style="padding: 10px;">${lead.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">Email:</td>
                <td style="padding: 10px;"><a href="mailto:${lead.email}" style="color: #2563eb;">${lead.email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">Phone:</td>
                <td style="padding: 10px;"><a href="tel:${lead.phone}" style="color: #2563eb;">${lead.phone || 'Not provided'}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">Company:</td>
                <td style="padding: 10px;">${lead.company || 'Not provided'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">Lead Score:</td>
                <td style="padding: 10px;"><span style="background: #2563eb; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold;">${score}/100</span></td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Source:</td>
                <td style="padding: 10px;">${lead.source}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1e293b;">Message:</h3>
            <p style="color: #64748b; line-height: 1.6; white-space: pre-wrap;">${lead.message}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.DASHBOARD_URL || 'https://app.docucloudsolutions.com'}/leads/${lead.id}" 
               style="display: inline-block; padding: 15px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View in Dashboard →
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p>DocuCloud Solutions | Automated Lead Notification System</p>
        </div>
      </body>
      </html>
    `
  };
  
  await sgMail.send(msg);
}

// Send confirmation email to lead
async function sendConfirmationEmail(lead) {
  const msg = {
    to: lead.email,
    from: process.env.FROM_EMAIL,
    subject: 'Thanks for reaching out to DocuCloud Solutions!',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank You, ${lead.name.split(' ')[0]}!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            We received your inquiry and appreciate you reaching out to DocuCloud Solutions.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">What happens next?</h3>
            <ul style="color: #64748b; line-height: 1.8;">
              <li>We'll review your inquiry within the next few hours</li>
              <li>A team member will contact you within 24 hours</li>
              <li>We'll schedule your free 15-minute automation consultation</li>
              <li>You'll receive a customized automation strategy</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            In the meantime, check out our <a href="https://docucloudsolutions.com/#results" style="color: #2563eb;">case studies</a> 
            to see how we've helped businesses like yours save 10-30 hours per week.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              Best regards,<br>
              <strong style="color: #1e293b;">The DocuCloud Solutions Team</strong>
            </p>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p>DocuCloud Solutions LLC<br>
          Based in New York City | Serving businesses nationwide<br>
          <a href="https://docucloudsolutions.com" style="color: #2563eb;">docucloudsolutions.com</a></p>
        </div>
      </body>
      </html>
    `
  };
  
  await sgMail.send(msg);
}

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, company, message, source, userAgent, timestamp } = req.body;
    
    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }
    
    // Calculate lead score
    const leadScore = calculateLeadScore({
      name, email, phone, company, message, source,
      referrer: req.headers.referer
    });
    
    // Insert lead into database
    const { data: lead, error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          email,
          phone,
          company,
          message,
          source: source || 'website',
          user_agent: userAgent || req.headers['user-agent'],
          ip_address: req.ip,
          referrer: req.headers.referer,
          lead_score: leadScore,
          status: 'new'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    // Send notifications (don't wait for completion)
    Promise.all([
      sendEmailNotification(lead, leadScore),
      sendConfirmationEmail(lead)
    ]).catch(err => console.error('Email error:', err));
    
    // Log activity
    await supabase.from('activity_log').insert([
      {
        activity_type: 'lead_created',
        entity_type: 'lead',
        entity_id: lead.id,
        description: `New lead created: ${name} from ${company || 'Unknown'}`
      }
    ]);
    
    res.json({
      success: true,
      leadId: lead.id,
      message: 'Thank you! We\'ll contact you within 24 hours.'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again or email us directly.'
    });
  }
});

// Track pageview
app.post('/api/analytics/pageview', async (req, res) => {
  try {
    const { url, title, referrer, screen, viewport } = req.body;
    
    // Parse user agent
    const ua = require('useragent').parse(req.headers['user-agent']);
    
    // Get or create session
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    // Insert pageview
    const { error } = await supabase
      .from('analytics_pageviews')
      .insert([
        {
          url,
          page_title: title,
          referrer,
          session_id: sessionId,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          device_type: ua.device.family,
          browser: ua.toAgent(),
          os: ua.os.toString(),
          screen_resolution: screen,
          viewport_size: viewport
        }
      ]);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Pageview tracking error:', error);
    res.status(500).json({ success: false });
  }
});

// Track custom event
app.post('/api/analytics/event', async (req, res) => {
  try {
    const { event, category, label, value, page } = req.body;
    
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    const { error } = await supabase
      .from('analytics_events')
      .insert([
        {
          event_name: event,
          event_category: category,
          event_label: label,
          event_value: value,
          session_id: sessionId,
          page_url: page || req.headers.referer,
          metadata: req.body
        }
      ]);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Event tracking error:', error);
    res.status(500).json({ success: false });
  }
});

// Get lead by ID (protected route - add auth middleware)
app.get('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ success: false, message: 'Error fetching lead' });
  }
});

// Get analytics summary (protected route - add auth middleware)
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const { timeframe = '30' } = req.query; // days
    
    // Get pageview stats
    const { data: pageviews } = await supabase
      .from('analytics_pageviews')
      .select('*')
      .gte('created_at', new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000).toISOString());
    
    // Get lead stats
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000).toISOString());
    
    // Calculate metrics
    const uniqueSessions = new Set(pageviews.map(pv => pv.session_id)).size;
    const totalPageviews = pageviews.length;
    const totalLeads = leads.length;
    const conversionRate = uniqueSessions > 0 ? (totalLeads / uniqueSessions * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        timeframe: `${timeframe} days`,
        sessions: uniqueSessions,
        pageviews: totalPageviews,
        leads: totalLeads,
        conversionRate: `${conversionRate}%`,
        avgLeadScore: leads.length > 0 
          ? (leads.reduce((sum, l) => sum + l.lead_score, 0) / leads.length).toFixed(0)
          : 0
      }
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ success: false });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n🚀 DocuCloud Solutions API Server`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
