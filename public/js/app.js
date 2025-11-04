// ============================================
// DocuCloud Solutions - Main Application
// ============================================

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DocuCloud Solutions - Application Starting...');

  // Initialize Analytics
  const analytics = new Analytics();
  analytics.init();

  // Initialize Navigation
  const navigation = new Navigation();

  // Initialize Form Handler
  const contactForm = new FormHandler('contact-form', analytics);

  // Initialize FAQ Accordion
  const faq = new FAQ();

  // Initialize Carousel
  const carousel = new Carousel();

  // Initialize Scroll Animations
  initScrollAnimations();

  // Initialize Chat Widget
  initChatWidget();

  // Log initialization complete
  console.log('Application initialized successfully');

  // Optional: Initialize Google Analytics if available
  if (typeof gtag !== 'undefined') {
    console.log('Google Analytics detected');
  }

  // Optional: Initialize Facebook Pixel if available
  if (typeof fbq !== 'undefined') {
    console.log('Facebook Pixel detected');
  }
});

// Global function for tracking events from HTML onclick attributes
function trackEvent(name, category, label) {
  if (window.analytics) {
    window.analytics.trackEvent(name, category, label);
  }
}

// Initialize scroll animations for cards
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(
    '.service-card, .case-study-card, .testimonial-card, .process-step, .pricing-card'
  );

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  console.log(`Scroll animations initialized for ${animatedElements.length} elements`);
}

// Initialize chat widget
function initChatWidget() {
  const chatWidget = document.getElementById('chat-widget');

  if (chatWidget) {
    chatWidget.addEventListener('click', () => {
      alert('Live chat coming soon! For now, please use the contact form or email info@docucloudsolutions.com');
    });

    console.log('Chat widget initialized');
  }
}

// Make trackEvent available globally
window.trackEvent = trackEvent;
