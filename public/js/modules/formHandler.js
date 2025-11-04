// Form Handler Module
// Handles contact form submissions

class FormHandler {
  constructor(formId, analytics) {
    this.form = document.getElementById(formId);
    this.analytics = analytics;
    this.apiBase = '/api/inquiry';

    if (this.form) {
      this.init();
    }
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    console.log('Form handler initialized');
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this.form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || '',
      company: formData.get('company') || '',
      message: formData.get('message'),
      source: 'website',
      sessionId: this.analytics ? this.analytics.sessionId : null
    };

    // Validate
    if (!this.validateForm(data)) {
      return;
    }

    // Show loading state
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        this.showSuccess(result.message);
        this.form.reset();

        // Track conversion event
        if (this.analytics) {
          this.analytics.trackEvent('form_submit', 'conversion', 'contact_form');
        }
      } else {
        this.showError(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError('An error occurred. Please try emailing us directly at info@docucloudsolutions.com');
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }

  validateForm(data) {
    // Clear previous errors
    this.clearErrors();

    let isValid = true;

    // Validate name
    if (!data.name || data.name.length < 2) {
      this.showFieldError('name', 'Please enter your name');
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      this.showFieldError('email', 'Please enter a valid email address');
      isValid = false;
    }

    // Validate message
    if (!data.message || data.message.length < 10) {
      this.showFieldError('message', 'Please enter a message (at least 10 characters)');
      isValid = false;
    }

    return isValid;
  }

  showFieldError(fieldName, message) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.classList.add('error');

      // Create error message element
      const errorDiv = document.createElement('div');
      errorDiv.className = 'form-error';
      errorDiv.textContent = message;
      field.parentNode.appendChild(errorDiv);
    }
  }

  clearErrors() {
    // Remove error classes
    this.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    // Remove error messages
    this.form.querySelectorAll('.form-error').forEach(el => el.remove());

    // Remove success/error messages
    this.form.querySelectorAll('.form-message').forEach(el => el.remove());
  }

  showSuccess(message) {
    this.clearErrors();

    // Hide all form fields and button
    const formGroups = this.form.querySelectorAll('.form-group');
    const submitButton = this.form.querySelector('button[type="submit"]');
    const privacyText = this.form.querySelector('.form-privacy');

    formGroups.forEach(group => {
      group.style.display = 'none';
    });

    if (submitButton) {
      submitButton.style.display = 'none';
    }

    if (privacyText) {
      privacyText.style.display = 'none';
    }

    // Create success message with better styling
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message success-large';
    messageDiv.innerHTML = `
      <div style="text-align: center; padding: 3rem 2rem;">
        <svg viewBox="0 0 24 24" style="width: 80px; height: 80px; margin: 0 auto 1.5rem; stroke: #10b981; fill: none; stroke-width: 2;">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9 12l2 2 4-4"></path>
        </svg>
        <h2 style="color: #10b981; font-size: 2rem; margin-bottom: 1rem;">Thank You!</h2>
        <p style="color: #64748b; font-size: 1.1rem; line-height: 1.8; max-width: 500px; margin: 0 auto;">
          ${message}
        </p>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 1.5rem;">
          We look forward to helping you automate your business processes!
        </p>
      </div>
    `;
    this.form.insertBefore(messageDiv, this.form.firstChild);

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  showError(message) {
    this.clearErrors();

    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message error';
    messageDiv.textContent = message;
    this.form.insertBefore(messageDiv, this.form.firstChild);

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Export
window.FormHandler = FormHandler;
