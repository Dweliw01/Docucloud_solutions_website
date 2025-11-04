/* ============================================
   DocuCloud Solutions - Database Schema
   PostgreSQL / Supabase Schema
   ============================================ */

-- ============================================
-- 1. LEADS & CONTACTS TABLE
-- ============================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contact Information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    
    -- Lead Details
    message TEXT,
    source VARCHAR(100), -- 'website', 'referral', 'direct', etc.
    campaign VARCHAR(100), -- UTM campaign tracking
    
    -- Lead Status
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'proposal', 'won', 'lost'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    
    -- Scoring
    lead_score INTEGER DEFAULT 0,
    estimated_value DECIMAL(10, 2),
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    
    -- Metadata
    user_agent TEXT,
    ip_address VARCHAR(45),
    referrer TEXT,
    
    -- Follow-up
    next_follow_up TIMESTAMP WITH TIME ZONE,
    last_contact TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    notes TEXT[]
);

-- Indexes for performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);

-- ============================================
-- 2. WEBSITE ANALYTICS TABLE
-- ============================================
CREATE TABLE analytics_pageviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Page Info
    url TEXT NOT NULL,
    page_title VARCHAR(500),
    referrer TEXT,
    
    -- User Info
    session_id VARCHAR(100),
    user_id UUID REFERENCES users(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Device Info
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_resolution VARCHAR(50),
    viewport_size VARCHAR(50),
    
    -- Location (if using geo-IP)
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    
    -- Engagement
    time_on_page INTEGER, -- seconds
    scroll_depth INTEGER, -- percentage
    
    -- Attribution
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100)
);

-- Indexes
CREATE INDEX idx_analytics_created_at ON analytics_pageviews(created_at);
CREATE INDEX idx_analytics_session ON analytics_pageviews(session_id);
CREATE INDEX idx_analytics_url ON analytics_pageviews(url);

-- ============================================
-- 3. EVENTS TRACKING TABLE
-- ============================================
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Event Details
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(100),
    event_label VARCHAR(255),
    event_value DECIMAL(10, 2),
    
    -- Session Info
    session_id VARCHAR(100),
    user_id UUID REFERENCES users(id),
    
    -- Page Context
    page_url TEXT,
    page_title VARCHAR(500),
    
    -- Additional Data
    metadata JSONB
);

-- Indexes
CREATE INDEX idx_events_name ON analytics_events(event_name);
CREATE INDEX idx_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_events_session ON analytics_events(session_id);

-- ============================================
-- 4. USERS TABLE (for authentication)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    
    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'sales', 'viewer'
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 5. CLIENTS TABLE
-- ============================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Company Info
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50), -- 'small', 'medium', 'large', 'enterprise'
    website VARCHAR(500),
    
    -- Primary Contact
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Business Details
    annual_revenue DECIMAL(12, 2),
    employee_count INTEGER,
    
    -- Engagement
    status VARCHAR(50) DEFAULT 'active', -- 'prospect', 'active', 'inactive', 'churned'
    start_date DATE,
    contract_value DECIMAL(10, 2),
    
    -- Assignment
    account_manager UUID REFERENCES users(id),
    
    -- Metadata
    notes TEXT[]
);

-- ============================================
-- 6. PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Project Info
    client_id UUID REFERENCES clients(id) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100), -- 'workflow_automation', 'custom_portal', 'integration', etc.
    description TEXT,
    
    -- Timeline
    start_date DATE,
    target_completion DATE,
    actual_completion DATE,
    
    -- Financial
    project_value DECIMAL(10, 2),
    hours_estimated INTEGER,
    hours_actual INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'in_progress', 'testing', 'completed', 'on_hold'
    progress_percentage INTEGER DEFAULT 0,
    
    -- Team
    project_lead UUID REFERENCES users(id),
    team_members UUID[],
    
    -- Results
    time_saved_hours INTEGER,
    cost_saved_amount DECIMAL(10, 2),
    roi_percentage DECIMAL(5, 2)
);

-- ============================================
-- 7. ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Activity
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'lead', 'client', 'project', etc.
    entity_id UUID,
    
    -- Details
    description TEXT,
    metadata JSONB
);

-- ============================================
-- 8. COMMUNICATION LOG TABLE
-- ============================================
CREATE TABLE communication_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Parties
    lead_id UUID REFERENCES leads(id),
    client_id UUID REFERENCES clients(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Communication
    communication_type VARCHAR(50) NOT NULL, -- 'email', 'call', 'meeting', 'note'
    subject VARCHAR(500),
    content TEXT,
    
    -- Follow-up
    requires_followup BOOLEAN DEFAULT false,
    followup_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    attachments TEXT[]
);

-- ============================================
-- 9. VIEWS FOR ANALYTICS
-- ============================================

-- Lead Conversion Funnel
CREATE VIEW lead_funnel AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(lead_score) as avg_score,
    SUM(estimated_value) as total_value
FROM leads
GROUP BY status
ORDER BY CASE status
    WHEN 'new' THEN 1
    WHEN 'contacted' THEN 2
    WHEN 'qualified' THEN 3
    WHEN 'proposal' THEN 4
    WHEN 'won' THEN 5
    WHEN 'lost' THEN 6
END;

-- Daily Website Traffic
CREATE VIEW daily_traffic AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(*) as pageviews,
    COUNT(DISTINCT ip_address) as unique_visitors,
    AVG(time_on_page) as avg_time_on_page
FROM analytics_pageviews
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Top Pages
CREATE VIEW top_pages AS
SELECT 
    url,
    COUNT(*) as views,
    AVG(time_on_page) as avg_time,
    AVG(scroll_depth) as avg_scroll
FROM analytics_pageviews
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY url
ORDER BY views DESC
LIMIT 20;

-- ============================================
-- 10. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Lead scoring function (example)
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    lead_record RECORD;
BEGIN
    SELECT * INTO lead_record FROM leads WHERE id = lead_id;
    
    -- Company provided: +10
    IF lead_record.company IS NOT NULL AND lead_record.company != '' THEN
        score := score + 10;
    END IF;
    
    -- Phone provided: +15
    IF lead_record.phone IS NOT NULL AND lead_record.phone != '' THEN
        score := score + 15;
    END IF;
    
    -- Message length: up to +20
    IF lead_record.message IS NOT NULL THEN
        score := score + LEAST(LENGTH(lead_record.message) / 10, 20);
    END IF;
    
    -- Direct source: +25
    IF lead_record.source = 'direct' THEN
        score := score + 25;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;
