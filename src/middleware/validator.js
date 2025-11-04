// Request validation middleware

// Validate inquiry submission
function validateInquiry(req, res, next) {
  const { name, email, message } = req.body;

  // Check required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required.'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  // Validate name length
  if (name.length < 2 || name.length > 255) {
    return res.status(400).json({
      success: false,
      message: 'Name must be between 2 and 255 characters.'
    });
  }

  // Validate message length
  if (message.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Message must be at least 10 characters long.'
    });
  }

  next();
}

// Validate tracking data
function validateTrackingData(req, res, next) {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required.'
    });
  }

  next();
}

module.exports = {
  validateInquiry,
  validateTrackingData
};
