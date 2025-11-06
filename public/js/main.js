/* ============================================
   DocuCloud Solutions - Main JavaScript
   ============================================ */

// ============================================
// 1. MOBILE MENU FUNCTIONALITY
// ============================================
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('nav ul');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ============================================
// 2. SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// 3. STICKY HEADER
// ============================================
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ============================================
// 4. FAQ ACCORDION
// ============================================
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ============================================
// 5. FORM SUBMISSION
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            company: document.getElementById('company').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString(),
            source: window.location.href,
            userAgent: navigator.userAgent
        };
        
        try {
            // Send to your backend API
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                // Track conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', {
                        'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
                        'value': 500.0,
                        'currency': 'USD'
                    });
                }
                
                // Track with custom analytics
                trackEvent('form_submission', 'contact', formData.company);
                
                alert('Thank you! We\'ll contact you within 24 hours to schedule your free consultation. Check your email for confirmation.');
                this.reset();
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('There was an error submitting your form. Please email us directly at info@docucloud.solutions');
        }
    });
}

// ============================================
// 6. SCROLL ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .case-study-card, .testimonial-card, .process-step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// 7. UTILITY FUNCTIONS
// ============================================

// Track custom events
function trackEvent(eventName, category, label) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            'event_category': category,
            'event_label': label
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', eventName, {
            category: category,
            label: label
        });
    }
    
    // Custom analytics endpoint
    fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event: eventName,
            category: category,
            label: label,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        })
    }).catch(err => console.error('Analytics error:', err));
}

// Make trackEvent available globally
window.trackEvent = trackEvent;

// ============================================
// 8. PAGE LOAD TRACKING
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Track page view with additional data
    const pageData = {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        screen: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString()
    };
    
    // Send to custom analytics
    fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData)
    }).catch(err => console.error('Page tracking error:', err));
});

// ============================================
// 9. EXIT INTENT TRACKING
// ============================================
let exitIntentShown = false;

document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 0 && !exitIntentShown) {
        exitIntentShown = true;
        trackEvent('exit_intent', 'engagement', 'mouse_leave');
        
        // Optional: Show exit intent popup
        // showExitIntentPopup();
    }
});

// ============================================
// 10. SCROLL DEPTH TRACKING
// ============================================
let scrollDepths = [25, 50, 75, 100];
let trackedDepths = [];

window.addEventListener('scroll', function() {
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    scrollDepths.forEach(depth => {
        if (scrollPercentage >= depth && !trackedDepths.includes(depth)) {
            trackedDepths.push(depth);
            trackEvent('scroll_depth', 'engagement', `${depth}%`);
        }
    });
});

// ============================================
// 11. TIME ON PAGE TRACKING
// ============================================
let timeOnPage = 0;
setInterval(() => {
    timeOnPage += 10;
    
    // Track at 30 seconds, 1 minute, 3 minutes, 5 minutes
    if ([30, 60, 180, 300].includes(timeOnPage)) {
        trackEvent('time_on_page', 'engagement', `${timeOnPage}s`);
    }
}, 10000); // Check every 10 seconds
