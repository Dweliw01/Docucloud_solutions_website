// Analytics service - handles visitor tracking
const supabase = require('../config/database');
const useragent = require('useragent');

class AnalyticsService {
  // Create or get visitor session
  async getOrCreateSession(sessionId, metadata = {}) {
    try {
      // Try to find existing session
      const { data: existing } = await supabase
        .from('visitor_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (existing) {
        return existing;
      }

      // Create new session
      const ua = useragent.parse(metadata.userAgent);

      const { data: session, error } = await supabase
        .from('visitor_sessions')
        .insert([{
          session_id: sessionId,
          ip_address: metadata.ipAddress,
          user_agent: metadata.userAgent,
          device_type: this.getDeviceType(ua),
          browser: ua.toAgent(),
          os: ua.os.toString(),
          referrer: metadata.referrer,
          landing_page: metadata.pageUrl
        }])
        .select()
        .single();

      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get or create session error:', error);
      throw error;
    }
  }

  // Track page view
  async trackPageView(sessionId, pageData) {
    try {
      // Get session
      const session = await this.getOrCreateSession(sessionId, {
        userAgent: pageData.userAgent,
        ipAddress: pageData.ipAddress,
        referrer: pageData.referrer,
        pageUrl: pageData.url
      });

      // Insert page view
      const { error: pvError } = await supabase
        .from('page_views')
        .insert([{
          session_id: session.id,
          page_url: pageData.url,
          page_title: pageData.title,
          screen_width: pageData.screenWidth,
          screen_height: pageData.screenHeight,
          viewport_width: pageData.viewportWidth,
          viewport_height: pageData.viewportHeight
        }]);

      if (pvError) throw pvError;

      // Update session page views count
      await supabase
        .from('visitor_sessions')
        .update({
          page_views: session.page_views + 1,
          last_seen: new Date().toISOString(),
          exit_page: pageData.url
        })
        .eq('id', session.id);

      return { success: true };
    } catch (error) {
      console.error('Track page view error:', error);
      throw error;
    }
  }

  // Track event
  async trackEvent(sessionId, eventData) {
    try {
      // Get session
      const { data: session } = await supabase
        .from('visitor_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (!session) {
        throw new Error('Session not found');
      }

      // Insert event
      const { error } = await supabase
        .from('events')
        .insert([{
          session_id: session.id,
          event_name: eventData.name,
          event_category: eventData.category,
          event_label: eventData.label,
          event_value: eventData.value,
          page_url: eventData.pageUrl,
          metadata: eventData.metadata
        }]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Track event error:', error);
      throw error;
    }
  }

  // Update time spent on page
  async updateTimeSpent(sessionId, pageUrl, timeSpent) {
    try {
      // Get session
      const { data: session } = await supabase
        .from('visitor_sessions')
        .select('id, total_time_spent')
        .eq('session_id', sessionId)
        .single();

      if (!session) return { success: false };

      // Update session total time
      await supabase
        .from('visitor_sessions')
        .update({
          total_time_spent: session.total_time_spent + timeSpent,
          last_seen: new Date().toISOString()
        })
        .eq('id', session.id);

      // Update most recent page view time
      const { data: recentPageView } = await supabase
        .from('page_views')
        .select('id')
        .eq('session_id', session.id)
        .eq('page_url', pageUrl)
        .order('viewed_at', { ascending: false })
        .limit(1)
        .single();

      if (recentPageView) {
        await supabase
          .from('page_views')
          .update({ time_spent: timeSpent })
          .eq('id', recentPageView.id);
      }

      return { success: true };
    } catch (error) {
      console.error('Update time spent error:', error);
      throw error;
    }
  }

  // Link inquiry to session
  async linkInquiryToSession(sessionId, inquiryId) {
    try {
      const { error } = await supabase
        .from('visitor_sessions')
        .update({
          submitted_inquiry: true,
          inquiry_id: inquiryId
        })
        .eq('session_id', sessionId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Link inquiry error:', error);
      throw error;
    }
  }

  // Get analytics summary
  async getSummary(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get visitor stats
      const { data: stats } = await supabase
        .from('daily_visitor_stats')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      // Get top pages
      const { data: topPages } = await supabase
        .from('top_pages')
        .select('*')
        .limit(10);

      // Get traffic sources
      const { data: sources } = await supabase
        .from('traffic_sources')
        .select('*');

      return {
        stats,
        topPages,
        sources
      };
    } catch (error) {
      console.error('Get summary error:', error);
      throw error;
    }
  }

  // Helper: Determine device type
  getDeviceType(ua) {
    if (ua.device.family === 'iPhone' || ua.device.family === 'iPad') {
      return 'mobile';
    }
    if (ua.device.family !== 'Other') {
      return 'mobile';
    }
    return 'desktop';
  }
}

module.exports = new AnalyticsService();
