const mobileBreakpoint = 720;

let revealObserver = null;

const elementsToAnimate = Array.from(
  document.querySelectorAll('section, .hero-card, .plan-card, .feature-card, .testimonial-card, .btn, .section-header')
);

function createRevealObserver() {
  const isMobile = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`).matches;

  // CORREÇÃO CRÍTICA
  if (revealObserver) {
    revealObserver.disconnect();
  }

  const threshold = isMobile ? 0.02 : 0.12;
  const rootMargin = isMobile
    ? `0px 0px -${Math.round(window.innerHeight * 0.35)}px 0px`
    : '0px 0px -100px 0px';

  revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        if (isMobile) {
          obs.unobserve(entry.target);
        }
      } else {
        if (!isMobile) {
          entry.target.classList.remove('visible');
        }
      }
    });
  }, { threshold, rootMargin });

  elementsToAnimate.forEach((el, i) => {
    el.classList.add('fade-in-up');

    el.style.transitionDelay = isMobile
      ? '60ms'
      : `${Math.min(320, i * 60)}ms`;

    revealObserver.observe(el);
  });
}

// init
createRevealObserver();

// resize debounce
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(createRevealObserver, 140);
});

// media query sync
const mm = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);

function handleMediaChange() {
  createRevealObserver(); // FIX: removido observer errado
}

if (mm.addEventListener) {
  mm.addEventListener("change", handleMediaChange);
} else {
  mm.addListener(handleMediaChange);
}

handleMediaChange();