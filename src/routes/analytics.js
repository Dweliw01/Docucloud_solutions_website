// Analytics routes
const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// Track page view
router.post('/pageview', async (req, res) => {
  try {
    const { sessionId, url, title, referrer, screenWidth, screenHeight, viewportWidth, viewportHeight } = req.body;

    if (!sessionId || !url) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and URL are required'
      });
    }

    await analyticsService.trackPageView(sessionId, {
      url,
      title,
      referrer,
      screenWidth,
      screenHeight,
      viewportWidth,
      viewportHeight,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Track pageview error:', error);
    res.status(500).json({ success: false, message: 'Tracking error' });
  }
});

// Track event
router.post('/event', async (req, res) => {
  try {
    const { sessionId, name, category, label, value, pageUrl, metadata } = req.body;

    if (!sessionId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and event name are required'
      });
    }

    await analyticsService.trackEvent(sessionId, {
      name,
      category,
      label,
      value,
      pageUrl,
      metadata
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ success: false, message: 'Tracking error' });
  }
});

// Update time spent
router.post('/time-spent', async (req, res) => {
  try {
    const { sessionId, pageUrl, timeSpent } = req.body;

    if (!sessionId || !pageUrl || timeSpent === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, page URL, and time spent are required'
      });
    }

    await analyticsService.updateTimeSpent(sessionId, pageUrl, timeSpent);
    res.json({ success: true });
  } catch (error) {
    console.error('Update time spent error:', error);
    res.status(500).json({ success: false, message: 'Tracking error' });
  }
});

// Get analytics summary (admin endpoint)
router.get('/summary', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const summary = await analyticsService.getSummary(days);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
});

module.exports = router;
