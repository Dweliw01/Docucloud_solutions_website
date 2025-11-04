// FAQ Accordion Module
// Handles FAQ accordion interactions

class FAQ {
  constructor() {
    this.faqItems = document.querySelectorAll('.faq-item');
    if (this.faqItems.length > 0) {
      this.init();
    }
  }

  init() {
    this.faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => this.toggleFAQ(item));
      }
    });

    console.log('FAQ accordion initialized');
  }

  toggleFAQ(item) {
    const isActive = item.classList.contains('active');

    // Close all FAQ items
    this.faqItems.forEach(faqItem => {
      faqItem.classList.remove('active');
    });

    // Open clicked item if it wasn't active
    if (!isActive) {
      item.classList.add('active');
    }
  }
}

// Export
window.FAQ = FAQ;
