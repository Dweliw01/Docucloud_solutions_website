# DocuCloud Solutions - Project Structure

## Overview
This is a professionally organized codebase for DocuCloud Solutions' business automation website with integrated CRM and analytics.

## Directory Structure

```
docucloud-solutions/
├── public/                          # Frontend static files
│   ├── css/                         # Stylesheets
│   │   ├── base/                    # Base styles
│   │   │   ├── variables.css        # CSS variables (colors, spacing, etc.)
│   │   │   └── reset.css            # CSS reset and base styles
│   │   ├── components/              # Component-specific styles
│   │   │   ├── header.css           # Navigation and header
│   │   │   ├── buttons.css          # Button styles
│   │   │   └── forms.css            # Form styles
│   │   ├── layouts/                 # Layout styles
│   │   │   └── sections.css         # Section layouts (hero, stats, etc.)
│   │   └── main.css                 # Main CSS that imports all modules
│   ├── js/                          # JavaScript
│   │   ├── modules/                 # JavaScript modules
│   │   │   ├── analytics.js         # Analytics tracking
│   │   │   ├── formHandler.js       # Contact form handling
│   │   │   └── navigation.js        # Navigation and mobile menu
│   │   └── app.js                   # Main application entry point
│   ├── images/                      # Images and media
│   └── index.html                   # Main HTML file
│
├── src/                             # Backend source code
│   ├── config/                      # Configuration files
│   │   ├── database.js              # Database connection
│   │   ├── email.js                 # Email service config
│   │   └── index.js                 # Main config (loads from .env)
│   ├── routes/                      # API route handlers
│   │   ├── inquiry.js               # Inquiry/contact form routes
│   │   └── analytics.js             # Analytics tracking routes
│   ├── middleware/                  # Express middleware
│   │   └── validator.js             # Request validation
│   └── services/                    # Business logic
│       ├── inquiryService.js        # Inquiry handling
│       ├── emailService.js          # Email notifications
│       └── analyticsService.js      # Analytics tracking
│
├── database/                        # Database schema
│   └── schema.sql                   # PostgreSQL/Supabase schema
│
├── _old_backup/                     # Backup of old files
│
├── server.js                        # Express server entry point
├── package.json                     # Dependencies
├── .env                             # Environment variables
├── .env.example                     # Environment variables template
└── README.md                        # Project documentation
```

## Key Features

### 1. Modular Architecture
- **CSS Modules**: Organized by purpose (base, components, layouts)
- **JavaScript Modules**: Separated by functionality
- **Backend Services**: Clean separation of concerns

### 2. Simplified Database Schema
The database tracks only essential data:
- **inquiries**: Contact form submissions
- **visitor_sessions**: Unique visitor tracking
- **page_views**: Individual page views with time tracking
- **events**: Custom user interaction events

### 3. Professional API Structure
```
GET  /api/health              - Health check
POST /api/inquiry             - Submit contact form
GET  /api/inquiry/:id         - Get inquiry details
POST /api/analytics/pageview  - Track page view
POST /api/analytics/event     - Track custom event
POST /api/analytics/time-spent - Update time spent
GET  /api/analytics/summary   - Get analytics summary
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@docucloudsolutions.com
NOTIFICATION_EMAIL=info@docucloudsolutions.com
```

### 3. Set Up Database
Run the schema file in your Supabase SQL editor:
```sql
-- Located in: database/schema.sql
```

### 4. Run Development Server
```bash
npm start
# or with auto-reload:
npm run dev
```

Server will start on `http://localhost:3000`

## What Gets Tracked

### Visitor Analytics
- Unique sessions
- Page views per session
- Time spent on each page
- Device type, browser, OS
- Referrer source
- Landing and exit pages

### Inquiry Tracking
- Contact form submissions
- Associated with visitor sessions
- Email notifications sent automatically

### Custom Events
- Button clicks
- Form interactions
- CTA engagement
- Custom user actions

## Analytics Views

The database includes pre-built views for easy reporting:

```sql
-- Daily stats
SELECT * FROM daily_visitor_stats;

-- Top pages
SELECT * FROM top_pages;

-- Recent inquiries with context
SELECT * FROM recent_inquiries_with_context;

-- Traffic sources
SELECT * FROM traffic_sources;
```

## API Usage Examples

### Submit Inquiry
```javascript
fetch('/api/inquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-0123',
    company: 'Acme Corp',
    message: 'I need automation help',
    sessionId: 'session_xxx'
  })
});
```

### Track Page View
```javascript
fetch('/api/analytics/pageview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session_xxx',
    url: window.location.href,
    title: document.title,
    screenWidth: screen.width,
    screenHeight: screen.height
  })
});
```

### Track Event
```javascript
fetch('/api/analytics/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session_xxx',
    name: 'button_click',
    category: 'engagement',
    label: 'Get Started Button',
    pageUrl: window.location.href
  })
});
```

## File Modifications

When editing:
- **CSS**: Edit files in `public/css/` subdirectories
- **JavaScript**: Edit files in `public/js/modules/`
- **HTML**: Edit `public/index.html`
- **Server**: Edit files in `src/`

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Update CORS_ORIGIN in `.env`
3. Ensure database is accessible
4. Deploy to your hosting platform (Vercel, Netlify, etc.)

## Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation on all forms
- SQL injection protection via Supabase client

## Next Steps

1. Customize the content in `public/index.html`
2. Add more sections (services, pricing, etc.)
3. Update colors in `public/css/base/variables.css`
4. Add your logo to `public/images/`
5. Configure Google Analytics ID in HTML
6. Test the contact form
7. Set up email templates

## Support

For questions or issues, refer to the main README.md or contact the development team.
