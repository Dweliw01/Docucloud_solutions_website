-- ============================================
-- Database Cleanup Script - COMPLETE VERSION
-- Purpose: Remove old schema to prepare for new one
-- ============================================

-- IMPORTANT: This will delete ALL data in these tables!
-- Make sure you have a backup if needed before running this.

-- ============================================
-- Step 1: Drop all indexes explicitly
-- ============================================
DROP INDEX IF EXISTS idx_inquiries_email CASCADE;
DROP INDEX IF EXISTS idx_inquiries_created CASCADE;
DROP INDEX IF EXISTS idx_inquiries_status CASCADE;

DROP INDEX IF EXISTS idx_sessions_id CASCADE;
DROP INDEX IF EXISTS idx_sessions_first_seen CASCADE;
DROP INDEX IF EXISTS idx_sessions_submitted CASCADE;

DROP INDEX IF EXISTS idx_pageviews_session CASCADE;
DROP INDEX IF EXISTS idx_pageviews_url CASCADE;
DROP INDEX IF EXISTS idx_pageviews_viewed CASCADE;

DROP INDEX IF EXISTS idx_events_session CASCADE;
DROP INDEX IF EXISTS idx_events_name CASCADE;
DROP INDEX IF EXISTS idx_events_occurred CASCADE;

-- ============================================
-- Step 2: Drop all views
-- ============================================
DROP VIEW IF EXISTS daily_visitor_stats CASCADE;
DROP VIEW IF EXISTS top_pages CASCADE;
DROP VIEW IF EXISTS recent_inquiries_with_context CASCADE;
DROP VIEW IF EXISTS traffic_sources CASCADE;

-- Drop any other views that might exist
DROP VIEW IF EXISTS analytics_summary CASCADE;
DROP VIEW IF EXISTS conversion_funnel CASCADE;

-- ============================================
-- Step 3: Drop all functions
-- ============================================
DROP FUNCTION IF EXISTS update_session_activity(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS link_inquiry_to_session(UUID, UUID) CASCADE;

-- ============================================
-- Step 4: Drop all tables (in reverse dependency order)
-- ============================================

-- Drop dependent tables first (those with foreign keys)
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS visitor_sessions CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;

-- Drop any other tables that might exist from previous schema
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- ============================================
-- Step 4: Verify cleanup
-- ============================================

-- You can uncomment these to verify tables are gone:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- SELECT table_name FROM information_schema.views
-- WHERE table_schema = 'public';

-- ============================================
-- READY FOR NEW SCHEMA
-- ============================================
-- After running this cleanup script, you can now run:
-- database/schema.sql to create the new simplified schema
