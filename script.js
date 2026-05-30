const revealSelectors = [
  'section',
  '.hero-content',
  '.hero-image',
  '.service-card',
  '.feature-card',
  '.plan-card',
  '.testimonial-card',
  '.stat-card',
  '.contact-card',
  '.section-header',
  '.btn',
  '.card',
].join(', ');

const revealConfig = {
  desktop: { baseDelay: 60, increment: 100, translateY: 40, duration: 820, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  tablet: { baseDelay: 45, increment: 80, translateY: 40, duration: 720, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  mobile: { baseDelay: 30, increment: 60, translateY: 40, duration: 620, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
};

let revealObserver = null;

function isReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getDeviceProfile() {
  if (window.matchMedia('(max-width: 720px)').matches) {
    return revealConfig.mobile;
  }
  if (window.matchMedia('(max-width: 1024px)').matches) {
    return revealConfig.tablet;
  }
  return revealConfig.desktop;
}

function getSectionGroup(element) {
  const section = element.closest('section');
  if (section) {
    const items = [section, ...section.querySelectorAll(revealSelectors)];
    return items.filter(item => item === section || item.closest('section') === section);
  }
  return Array.from(document.querySelectorAll(revealSelectors)).filter(item => !item.closest('section'));
}

function getRevealDelay(element, profile) {
  const group = getSectionGroup(element);
  const index = Math.max(0, group.indexOf(element));
  return profile.baseDelay + index * profile.increment;
}

function revealElement(element, profile) {
  element.style.setProperty('--reveal-delay', `${getRevealDelay(element, profile)}ms`);
  element.style.setProperty('--reveal-duration', `${profile.duration}ms`);
  element.style.setProperty('--reveal-ease', profile.ease);
  element.style.setProperty('--reveal-translate', `${profile.translateY}px`);
  element.classList.add('scroll-reveal');
}

function handleIntersection(entries) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    }

    const element = entry.target;
    requestAnimationFrame(() => element.classList.add('visible'));
    revealObserver.unobserve(element);
  });
}

function revealAllImmediately() {
  document.querySelectorAll(revealSelectors).forEach(element => {
    element.classList.add('scroll-reveal', 'visible');
    element.style.transition = 'none';
  });
}

function setupRevealObserver() {
  if (revealObserver) {
    revealObserver.disconnect();
  }

  if (isReducedMotion()) {
    revealAllImmediately();
    return;
  }

  const profile = getDeviceProfile();
  const options = {
    threshold: 0.08,
    rootMargin: '0px 0px -100px 0px',
  };

  revealObserver = new IntersectionObserver(handleIntersection, options);
  const elements = Array.from(document.querySelectorAll(revealSelectors));

  elements.forEach(element => {
    revealElement(element, profile);
    revealObserver.observe(element);
  });
}

function handleViewportChange() {
  setupRevealObserver();
}

setupRevealObserver();

const breakpointQuery = window.matchMedia('(max-width: 1024px)');
if (breakpointQuery.addEventListener) {
  breakpointQuery.addEventListener('change', handleViewportChange);
} else if (breakpointQuery.addListener) {
  breakpointQuery.addListener(handleViewportChange);
}
