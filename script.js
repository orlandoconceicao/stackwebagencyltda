const navToggle = document.querySelector('#navToggle');
const mainNav = document.querySelector('#mainNav');

function closeMenu() {
  mainNav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('menu-open', isOpen);
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMenu();
  }
});

const revealItems = document.querySelectorAll('[data-reveal]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px' });

  revealItems.forEach((item) => observer.observe(item));
}
