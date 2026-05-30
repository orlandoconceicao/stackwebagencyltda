/*
  Refactored Scroll Reveal
  - Mobile-first sensible defaults
  - Cascade groups for card collections
  - Uses CSS variables for performant transitions
  - Respects prefers-reduced-motion
  - Uses IntersectionObserver + requestAnimationFrame
*/

const mobileBreakpoint = 720;

const cardSelectors = ['.plan-card', '.feature-card', '.testimonial-card', '.benefit-card', '.stat-card', '.card', '.hero-card'];
const cascadeChildSelector = cardSelectors.join(',');

const revealSelectors = 'section, .hero-card, .plan-card, .feature-card, .testimonial-card, .btn, .section-header';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let revealObserver = null;

const config = {
  desktop: { translateY: 30, duration: 700, ease: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  mobile: { translateY: 15, duration: 500, ease: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  cascadeDelay: { min: 60, max: 100 },
  maxStaggered: 12,
};

function isMobile() {
  return window.matchMedia(`(max-width: ${mobileBreakpoint}px)`).matches;
}

function applyInitialReveal(el, options = {}) {
  // Add base class only once
  if (!el.classList.contains('reveal')) {
    el.classList.add('reveal');
  }

  const { translate, duration, ease, delay } = options;

  if (translate != null) el.style.setProperty('--reveal-translate', `${translate}px`);
  if (duration != null) el.style.setProperty('--reveal-duration', `${duration}ms`);
  if (ease != null) el.style.setProperty('--reveal-ease', ease);
  if (delay != null) el.style.setProperty('--reveal-delay', `${delay}ms`);
  el.style.willChange = 'transform, opacity';
}

function revealNow(el) {
  el.classList.add('visible');
}

function handleIntersection(entries, observer) {
  entries.forEach(entry => {
    const target = entry.target;

    if (entry.isIntersecting) {
      // If element is a container with cascade children, reveal children in stagger
      const children = Array.from(target.querySelectorAll(cascadeChildSelector)).filter(c => target.contains(c));

      if (children.length > 1) {
        const stagger = Math.min(config.cascadeDelay.max, Math.max(config.cascadeDelay.min, Math.round((isMobile() ? config.cascadeDelay.min : (config.cascadeDelay.min + config.cascadeDelay.max) / 2))));
        const baseDelay = 20; // a tiny base so container doesn't feel static
        children.slice(0, config.maxStaggered).forEach((child, i) => {
          const delay = baseDelay + i * stagger;
          applyInitialReveal(child, {
            translate: isMobile() ? config.mobile.translateY : config.desktop.translateY,
            duration: isMobile() ? config.mobile.duration : config.desktop.duration,
            ease: isMobile() ? config.mobile.ease : config.desktop.ease,
            delay,
          });
          // reveal with RAF to batch paints
          requestAnimationFrame(() => revealNow(child));
        });

        // If there are more children than maxStaggered, reveal remaining without extra delays
        if (children.length > config.maxStaggered) {
          children.slice(config.maxStaggered).forEach(child => {
            applyInitialReveal(child, {
              translate: isMobile() ? config.mobile.translateY : config.desktop.translateY,
              duration: isMobile() ? config.mobile.duration : config.desktop.duration,
              ease: isMobile() ? config.mobile.ease : config.desktop.ease,
              delay: config.cascadeDelay.max,
            });
            requestAnimationFrame(() => revealNow(child));
          });
        }

        // Once revealed on mobile, we can unobserve the whole container to save work
        if (isMobile()) observer.unobserve(target);
      } else {
        // Single element reveal
        const idx = target.dataset.revealIndex ? Number(target.dataset.revealIndex) : 0;
        const stagger = isMobile() ? config.cascadeDelay.min : Math.min(320, idx * 60);
        applyInitialReveal(target, {
          translate: isMobile() ? config.mobile.translateY : config.desktop.translateY,
          duration: isMobile() ? config.mobile.duration : config.desktop.duration,
          ease: isMobile() ? config.mobile.ease : config.desktop.ease,
          delay: stagger,
        });
        requestAnimationFrame(() => revealNow(target));

        if (isMobile()) observer.unobserve(target);
      }
    } else {
      // when leaving viewport, on desktop remove visible to allow subtle re-entrance
      if (!isMobile()) {
        target.classList.remove('visible');
      }
    }
  });
}

function createRevealObserver() {
  if (revealObserver) {
    revealObserver.disconnect();
  }

  if (prefersReducedMotion) {
    // reveal everything immediately and skip observer
    document.querySelectorAll(revealSelectors).forEach(el => {
      el.classList.remove('reveal');
      el.classList.add('visible');
      el.style.willChange = 'auto';
    });
    return;
  }

  const threshold = isMobile() ? 0.02 : 0.12;
  const rootMargin = isMobile() ? `0px 0px -${Math.round(window.innerHeight * 0.35)}px 0px` : '0px 0px -100px 0px';

  revealObserver = new IntersectionObserver(handleIntersection, { threshold, rootMargin });

  const nodeList = document.querySelectorAll(revealSelectors);
  nodeList.forEach((el, i) => {
    // tag elements with an index to create tasteful desktop staggering
    el.dataset.revealIndex = i;
    // add base reveal class and default vars; small base delay so groups feel premium
    applyInitialReveal(el, {
      translate: isMobile() ? config.mobile.translateY : config.desktop.translateY,
      duration: isMobile() ? config.mobile.duration : config.desktop.duration,
      ease: isMobile() ? config.mobile.ease : config.desktop.ease,
      delay: isMobile() ? config.cascadeDelay.min : Math.min(320, i * 60),
    });

    // For performance, observe only elements that are not inside a cascade container root
    // If the element itself is a parent of multiple cards, observe the parent (container) instead
    const children = Array.from(el.querySelectorAll(cascadeChildSelector));
    if (children.length > 1) {
      revealObserver.observe(el);
    } else {
      revealObserver.observe(el);
    }
  });
}

// init
createRevealObserver();

// resize debounce
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    createRevealObserver();
  }, 160);
});

// media query sync
const mm = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
function handleMediaChange() {
  createRevealObserver();
}
if (mm.addEventListener) {
  mm.addEventListener('change', handleMediaChange);
} else {
  mm.addListener(handleMediaChange);
}

// expose for debug if needed
window.__reveal = { createRevealObserver };