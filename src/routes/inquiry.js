// Inquiry routes
const express = require('express');
const router = express.Router();
const inquiryService = require('../services/inquiryService');
const analyticsService = require('../services/analyticsService');
const { validateInquiry } = require('../middleware/validator');

// Submit contact form
router.post('/', validateInquiry, async (req, res) => {
  try {
    const { name, email, phone, company, message, source, sessionId } = req.body;

    // Create inquiry
    const result = await inquiryService.createInquiry(
      { name, email, phone, company, message, source },
      {
        referrer: req.headers.referer,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    );

    // Link to session if provided
    if (sessionId && result.inquiry) {
      await analyticsService.linkInquiryToSession(sessionId, result.inquiry.id);
    }

    res.json({
      success: true,
      message: 'Thank you! We\'ll contact you within 24 hours.',
      inquiryId: result.inquiry.id
    });
  } catch (error) {
    console.error('Submit inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again or email us directly.'
    });
  }
});

// Get inquiry by ID (for admin use)
router.get('/:id', async (req, res) => {
  try {
    const inquiry = await inquiryService.getInquiryById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({ success: true, data: inquiry });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiry'
    });
  }
});

module.exports = router;
