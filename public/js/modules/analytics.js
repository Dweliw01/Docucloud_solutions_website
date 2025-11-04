// Analytics Module
// Handles visitor tracking and analytics

class Analytics {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.pageLoadTime = Date.now();
    this.apiBase = '/api/analytics';
  }

  // Get or create session ID
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('sessionId');

    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('sessionId', sessionId);
    }

    return sessionId;
  }

  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track page view
  async trackPageView() {
    try {
      const data = {
        sessionId: this.sessionId,
        url: window.location.href,
        title: document.title,
        referrer: document.referrer || null,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      };

      await fetch(`${this.apiBase}/pageview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      console.log('Page view tracked');
    } catch (error) {
      console.error('Track pageview error:', error);
    }
  }

  // Track custom event
  async trackEvent(name, category, label = null, value = null, metadata = {}) {
    try {
      const data = {
        sessionId: this.sessionId,
        name,
        category,
        label,
        value,
        pageUrl: window.location.href,
        metadata
      };

      await fetch(`${this.apiBase}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      console.log(`Event tracked: ${name}`);
    } catch (error) {
      console.error('Track event error:', error);
    }
  }

  // Track time spent on page
  async sendTimeSpent() {
    try {
      const timeSpent = Math.floor((Date.now() - this.pageLoadTime) / 1000); // in seconds

      if (timeSpent > 0) {
        await fetch(`${this.apiBase}/time-spent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            pageUrl: window.location.href,
            timeSpent
          })
        });

        console.log(`Time spent tracked: ${timeSpent}s`);
      }
    } catch (error) {
      console.error('Track time spent error:', error);
    }
  }

  // Initialize analytics
  init() {
    // Track initial page view
    this.trackPageView();

    // Track time spent when user leaves
    window.addEventListener('beforeunload', () => {
      this.sendTimeSpent();
    });

    // Track time spent every 30 seconds (in case user doesn't close properly)
    setInterval(() => {
      this.sendTimeSpent();
      this.pageLoadTime = Date.now(); // Reset timer
    }, 30000);

    // Track clicks on CTA buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.cta-button') || e.target.closest('.cta-button')) {
        const button = e.target.matches('.cta-button') ? e.target : e.target.closest('.cta-button');
        const buttonText = button.textContent.trim();
        this.trackEvent('button_click', 'engagement', buttonText);
      }
    });

    console.log('Analytics initialized');
  }
}

// Export
window.Analytics = Analytics;
