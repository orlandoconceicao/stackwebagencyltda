const navToggle = document.querySelector('#navToggle');
const mainNav = document.querySelector('#mainNav');
const themeToggle = document.querySelector('#themeToggle');
const themeColor = document.querySelector('#themeColor');
const root = document.documentElement;

function updateThemeControl(theme) {
  const nextThemeName = theme === 'dark' ? 'claro' : 'escuro';
  const label = `Ativar tema ${nextThemeName}`;
  themeToggle.setAttribute('aria-label', label);
  themeToggle.setAttribute('title', label);
}

function setTheme(theme) {
  root.dataset.theme = theme;
  themeColor.setAttribute('content', theme === 'dark' ? '#06101d' : '#f3f7fb');
  updateThemeControl(theme);

  try {
    localStorage.setItem('stackweb-theme', theme);
  } catch (error) {
    return;
  }
}

updateThemeControl(root.dataset.theme);
themeColor.setAttribute('content', root.dataset.theme === 'dark' ? '#06101d' : '#f3f7fb');

const siteHeader = document.querySelector('.site-header');
function updateHeaderState() {
  siteHeader.classList.toggle('scrolled', window.scrollY > 12);
}
updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });

themeToggle.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

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
  if (window.innerWidth > 800) {
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
