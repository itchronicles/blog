document.addEventListener('DOMContentLoaded', function() {
  const slider = document.querySelector('.slider');
  const slides = document.querySelectorAll('.slide');
  const prevButton = document.querySelector('.slider-arrow.prev');
  const nextButton = document.querySelector('.slider-arrow.next');
  
  if (!slider || slides.length === 0) return;

  let currentSlide = 0;
  const slideInterval = 5000; // Change slide every 5 seconds
  let slideTimer;

  function goToSlide(index) {
    currentSlide = index;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    resetTimer();
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(currentSlide);
  }

  function resetTimer() {
    clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, slideInterval);
  }

  // Event listeners for arrows
  prevButton.addEventListener('click', () => {
    prevSlide();
  });

  nextButton.addEventListener('click', () => {
    nextSlide();
  });

  // Start the automatic slider
  resetTimer();
}); 