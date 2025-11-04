-- ============================================
-- DocuCloud Solutions - Simplified Database Schema
-- Purpose: Track inquiries and visitor analytics
-- PostgreSQL/Supabase Compatible Version
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- INQUIRIES TABLE
-- Purpose: Store contact form submissions
-- ============================================
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Contact Information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    message TEXT NOT NULL,

    -- Metadata
    source VARCHAR(100) DEFAULT 'website', -- where they came from
    referrer TEXT, -- referring URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Status tracking
    status VARCHAR(50) DEFAULT 'new', -- new, contacted, converted, closed
    notes TEXT -- for internal follow-up notes
);

-- Indexes for inquiries table
CREATE INDEX idx_inquiries_email ON inquiries(email);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- ============================================
-- VISITOR SESSIONS TABLE
-- Purpose: Track unique visitor sessions
-- ============================================
CREATE TABLE visitor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,

    -- Visitor Information
    ip_address VARCHAR(100),
    user_agent TEXT,
    device_type VARCHAR(50), -- mobile, desktop, tablet
    browser VARCHAR(100),
    os VARCHAR(100),

    -- Location (if available)
    country VARCHAR(100),
    city VARCHAR(100),

    -- Session Timing
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_time_spent INTEGER DEFAULT 0, -- in seconds

    -- Session Metrics
    page_views INTEGER DEFAULT 0,
    referrer TEXT, -- where they came from
    landing_page TEXT, -- first page they visited
    exit_page TEXT, -- last page before leaving

    -- Conversion tracking
    submitted_inquiry BOOLEAN DEFAULT false,
    inquiry_id UUID REFERENCES inquiries(id)
);

-- Indexes for visitor_sessions table
CREATE INDEX idx_sessions_id ON visitor_sessions(session_id);
CREATE INDEX idx_sessions_first_seen ON visitor_sessions(first_seen DESC);
CREATE INDEX idx_sessions_submitted ON visitor_sessions(submitted_inquiry);

-- ============================================
-- PAGE VIEWS TABLE
-- Purpose: Track individual page views
-- ============================================
CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES visitor_sessions(id) ON DELETE CASCADE,

    -- Page Information
    page_url TEXT NOT NULL,
    page_title VARCHAR(500),

    -- Timing
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_spent INTEGER DEFAULT 0, -- in seconds

    -- Screen info
    screen_width INTEGER,
    screen_height INTEGER,
    viewport_width INTEGER,
    viewport_height INTEGER
);

-- Indexes for page_views table
CREATE INDEX idx_pageviews_session ON page_views(session_id);
CREATE INDEX idx_pageviews_url ON page_views(page_url);
CREATE INDEX idx_pageviews_viewed ON page_views(viewed_at DESC);

-- ============================================
-- EVENTS TABLE
-- Purpose: Track specific user interactions
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES visitor_sessions(id) ON DELETE CASCADE,

    -- Event details
    event_name VARCHAR(100) NOT NULL, -- button_click, form_start, scroll_depth, etc.
    event_category VARCHAR(100), -- engagement, conversion, navigation
    event_label VARCHAR(255),
    event_value NUMERIC,

    -- Context
    page_url TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Metadata (JSON for flexibility)
    metadata JSONB
);

-- Indexes for events table
CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_name ON events(event_name);
CREATE INDEX idx_events_occurred ON events(occurred_at DESC);

-- ============================================
-- ANALYTICS VIEWS
-- Purpose: Pre-computed queries for dashboards
-- ============================================

-- Daily visitor summary
CREATE OR REPLACE VIEW daily_visitor_stats AS
SELECT
    DATE(first_seen) as date,
    COUNT(DISTINCT id) as unique_visitors,
    SUM(page_views) as total_page_views,
    AVG(total_time_spent) as avg_time_spent_seconds,
    COUNT(*) FILTER (WHERE submitted_inquiry = true) as conversions,
    ROUND(
        COUNT(*) FILTER (WHERE submitted_inquiry = true)::NUMERIC /
        NULLIF(COUNT(DISTINCT id)::NUMERIC, 0) * 100,
        2
    ) as conversion_rate_percent
FROM visitor_sessions
GROUP BY DATE(first_seen)
ORDER BY date DESC;

-- Top pages by views
CREATE OR REPLACE VIEW top_pages AS
SELECT
    page_url,
    COUNT(*) as total_views,
    AVG(time_spent) as avg_time_spent_seconds,
    COUNT(DISTINCT session_id) as unique_visitors
FROM page_views
WHERE viewed_at > NOW() - INTERVAL '30 days'
GROUP BY page_url
ORDER BY total_views DESC
LIMIT 20;

-- Recent inquiries with session context
CREATE OR REPLACE VIEW recent_inquiries_with_context AS
SELECT
    i.id,
    i.name,
    i.email,
    i.phone,
    i.company,
    i.message,
    i.created_at,
    i.status,
    vs.page_views,
    vs.total_time_spent,
    vs.referrer,
    vs.device_type,
    vs.browser
FROM inquiries i
LEFT JOIN visitor_sessions vs ON i.id = vs.inquiry_id
ORDER BY i.created_at DESC;

-- Traffic sources summary
CREATE OR REPLACE VIEW traffic_sources AS
SELECT
    CASE
        WHEN referrer IS NULL THEN 'Direct'
        WHEN referrer LIKE '%google%' THEN 'Google'
        WHEN referrer LIKE '%facebook%' THEN 'Facebook'
        WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn'
        WHEN referrer LIKE '%twitter%' THEN 'Twitter'
        ELSE 'Other'
    END as source,
    COUNT(*) as sessions,
    AVG(total_time_spent) as avg_time_spent,
    COUNT(*) FILTER (WHERE submitted_inquiry = true) as conversions
FROM visitor_sessions
WHERE first_seen > NOW() - INTERVAL '30 days'
GROUP BY source
ORDER BY sessions DESC;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Update session last_seen and time spent
CREATE OR REPLACE FUNCTION update_session_activity(
    p_session_id UUID,
    p_time_increment INTEGER
) RETURNS void AS $$
BEGIN
    UPDATE visitor_sessions
    SET
        last_seen = NOW(),
        total_time_spent = total_time_spent + p_time_increment
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Link inquiry to session
CREATE OR REPLACE FUNCTION link_inquiry_to_session(
    p_inquiry_id UUID,
    p_session_id UUID
) RETURNS void AS $$
BEGIN
    UPDATE visitor_sessions
    SET
        submitted_inquiry = true,
        inquiry_id = p_inquiry_id
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE QUERIES (for testing)
-- ============================================

-- Get visitor overview for last 7 days
-- SELECT * FROM daily_visitor_stats WHERE date > NOW() - INTERVAL '7 days';

-- Get most popular pages
-- SELECT * FROM top_pages;

-- Get recent inquiries with visitor context
-- SELECT * FROM recent_inquiries_with_context LIMIT 10;

-- Get traffic sources
-- SELECT * FROM traffic_sources;

-- Get average session duration by device
-- SELECT device_type, AVG(total_time_spent) as avg_seconds
-- FROM visitor_sessions
-- WHERE first_seen > NOW() - INTERVAL '30 days'
-- GROUP BY device_type;
