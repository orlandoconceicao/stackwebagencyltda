const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  const expanded = mainNav.classList.contains('open');
  navToggle.setAttribute('aria-expanded', expanded);
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
    }
  });
});

const buttons = document.querySelectorAll('a[href^="#"]');

const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const smoothScrollTo = (targetY, duration = 280) => {
  const startY = window.scrollY || window.pageYOffset;
  const distance = targetY - startY;
  let startTime = null;

  const step = timestamp => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min(1, (timestamp - startTime) / duration);
    window.scrollTo(0, startY + distance * easeOutCubic(progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

buttons.forEach(button => {
  button.addEventListener('click', event => {
    const targetId = button.getAttribute('href');
    if (!targetId.startsWith('#') || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 16;
      smoothScrollTo(offsetTop, 280);
    }
  });
});

// Scroll animations with reveal effect - reactivates on every scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // Add visible class when element enters viewport
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      // Remove visible class when element leaves viewport to reset animation
      entry.target.classList.remove('visible');
    }
  });
}, observerOptions);

// Apply fade-in-up animation to all major elements
const elementsToAnimate = document.querySelectorAll('section, .hero-card, .plan-card, .feature-card, .testimonial-card, .btn, .section-header');

elementsToAnimate.forEach(element => {
  element.classList.add('fade-in-up');
  observer.observe(element);
});
