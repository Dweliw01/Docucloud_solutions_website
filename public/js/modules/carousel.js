// Carousel Module
// Handles image carousel/slideshow functionality

class Carousel {
  constructor() {
    this.carousel = document.querySelector('.carousel');
    if (this.carousel) {
      this.items = this.carousel.querySelectorAll('.carousel-item');
      this.indicators = this.carousel.querySelectorAll('.indicator');
      this.currentSlide = 0;
      this.autoPlayInterval = null;
      this.init();
    }
  }

  init() {
    // Add click handlers to indicators
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
        this.resetAutoPlay();
      });
    });

    // Start auto-play
    this.startAutoPlay();

    console.log('Carousel initialized with', this.items.length, 'slides');
  }

  goToSlide(index) {
    // Remove active class from all items and indicators
    this.items.forEach(item => item.classList.remove('active'));
    this.indicators.forEach(ind => ind.classList.remove('active'));

    // Add active class to selected slide and indicator
    this.items[index].classList.add('active');
    this.indicators[index].classList.add('active');

    this.currentSlide = index;
  }

  nextSlide() {
    const next = (this.currentSlide + 1) % this.items.length;
    this.goToSlide(next);
  }

  startAutoPlay() {
    // Auto-advance every 4 seconds
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  resetAutoPlay() {
    // Clear existing interval and start new one
    clearInterval(this.autoPlayInterval);
    this.startAutoPlay();
  }
}

// Export
window.Carousel = Carousel;
