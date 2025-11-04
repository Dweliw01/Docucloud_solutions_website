// Navigation Module
// Handles mobile menu and scroll behavior

class Navigation {
  constructor() {
    this.header = document.getElementById('header');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navMenu = document.querySelector('nav ul');
    this.init();
  }

  init() {
    // Mobile menu toggle
    if (this.navToggle && this.navMenu) {
      this.navToggle.addEventListener('click', () => this.toggleMenu());

      // Close menu when clicking nav links
      this.navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            this.closeMenu();
          }
        });
      });
    }

    // Scroll behavior
    this.handleScroll();
    window.addEventListener('scroll', () => this.handleScroll());

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          const offsetTop = target.offsetTop - 80; // Account for fixed header
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });

    console.log('Navigation initialized');
  }

  toggleMenu() {
    this.navMenu.classList.toggle('active');
    const isOpen = this.navMenu.classList.contains('active');
    this.navToggle.textContent = isOpen ? '✕' : '☰';
  }

  closeMenu() {
    this.navMenu.classList.remove('active');
    this.navToggle.textContent = '☰';
  }

  handleScroll() {
    if (window.scrollY > 50) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }
  }
}

// Export
window.Navigation = Navigation;
