const mode = localStorage.getItem("mode") || "";
const toggle = document.querySelector(".toggle");
const body = document.querySelector("body");

document.body.className = mode;

toggle.addEventListener("click", ()=>{
  localStorage.setItem("mode", mode === "light" ? "" : "light")
  body.classList.toggle("light")
})

document.addEventListener('DOMContentLoaded', () => {
  const burgerMenu = document.querySelector('.burger-menu');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body = document.body;

  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  document.body.appendChild(overlay);

  function toggleMenu() {
    burgerMenu.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    body.style.overflow = body.style.overflow === 'hidden' ? '' : 'hidden';
  }

  burgerMenu.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  // Close menu when clicking a link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu.classList.contains('active')) {
        toggleMenu();
      }
    });
  });
});