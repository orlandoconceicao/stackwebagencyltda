/**
 * ============================================
 * SCROLL REVEAL SYSTEM - PRODUCTION READY
 * ============================================
 * 
 * Um sistema de revelação premium com:
 * ✓ Um único IntersectionObserver global
 * ✓ Cascata otimizada por dispositivo
 * ✓ Estados iniciais e finais precisos
 * ✓ Sem memory leaks ou conflitos
 * ✓ Suporte completo a mobile
 * ✓ Respeita prefers-reduced-motion
 */

const ScrollReveal = (() => {
  // ========================================
  // CONFIGURAÇÃO
  // ========================================
  
  const CONFIG = {
    selectors: [
      'section',
      '.hero-content',
      '.hero-card',
      '.service-card',
      '.feature-card',
      '.plan-card',
      '.testimonial-card',
      '.stat-card',
      '.contact-card',
      '.section-header',
      '.btn',
      '.card',
    ],
    
    devices: {
      desktop: {
        // Desktop: incremento de 90ms entre elementos
        increment: 90,
        baseDelay: 0,
        duration: 750,
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      tablet: {
        // Tablet: incremento de 75ms entre elementos
        increment: 75,
        baseDelay: 0,
        duration: 760,
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      mobile: {
        // Mobile: incremento de 60ms entre elementos
        increment: 60,
        baseDelay: 0,
        duration: 770,
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
    
    // IntersectionObserver options otimizado
    observerOptions: {
      // 10% do elemento visível para acionar
      threshold: 0.1,
      // Margem superior para antecipar 50px, inferior para detectar 0px
      rootMargin: '-50px 0px 0px 0px',
    },
  };

  // ========================================
  // ESTADO GLOBAL
  // ========================================
  
  let observer = null;
  let observedElements = new Set();
  let lastDeviceProfile = null;
  let mediaQueryListener = null;

  // ========================================
  // HELPERS - Verificação de Estado
  // ========================================
  
  /**
   * Verifica se o usuário tem preferência por redução de movimento
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Determina o perfil do dispositivo baseado no viewport
   */
  function getDeviceProfile() {
    if (window.matchMedia('(max-width: 720px)').matches) {
      return CONFIG.devices.mobile;
    }
    if (window.matchMedia('(max-width: 1024px)').matches) {
      return CONFIG.devices.tablet;
    }
    return CONFIG.devices.desktop;
  }

  /**
   * Calcula o delay de cascata para um elemento
   * Agrupa por seção e numera elementos sequencialmente
   */
  function calculateDelay(element, profile) {
    // Encontra a seção pai ou usa o document como raiz
    const section = element.closest('section');
    const container = section || document;
    
    // Obtém todos os elementos revelados dentro dessa seção
    const revealableElements = Array.from(
      container.querySelectorAll(CONFIG.selectors.join(', '))
    ).filter(el => {
      // Garante que cada elemento está no container certo
      return section ? el.closest('section') === section : !el.closest('section');
    });
    
    // Encontra o índice do elemento atual
    const index = revealableElements.indexOf(element);
    const position = Math.max(0, index);
    
    // Calcula delay: baseDelay + (posição × incremento)
    return profile.baseDelay + position * profile.increment;
  }

  // ========================================
  // SETUP - Configuração de Elementos
  // ========================================
  
  /**
   * Prepara um elemento para revelação
   * Define as variáveis CSS e classes
   */
  function prepareElement(element, profile) {
    const delay = calculateDelay(element, profile);
    
    element.style.setProperty('--reveal-duration', `${profile.duration}ms`);
    element.style.setProperty('--reveal-ease', profile.ease);
    element.style.setProperty('--reveal-delay', `${delay}ms`);
    
    // Adiciona a classe que define o estado inicial
    if (!element.classList.contains('scroll-reveal')) {
      element.classList.add('scroll-reveal');
    }
  }

  /**
   * Revela um elemento imediatamente (para reduced motion ou pré-load)
   */
  function revealElementImmediately(element) {
    element.style.transition = 'none';
    element.classList.add('scroll-reveal', 'visible');
  }

  // ========================================
  // INTERSECTION OBSERVER
  // ========================================
  
  /**
   * Callback do IntersectionObserver
   * Aciona a revelação quando elemento entra na viewport
   */
  function handleIntersection(entries) {
    entries.forEach(entry => {
      // Ignora elementos que saem da viewport
      if (!entry.isIntersecting) {
        return;
      }

      const element = entry.target;

      // Usa requestAnimationFrame para garantir smooth animation
      requestAnimationFrame(() => {
        element.classList.add('visible');
      });

      // Para de observar (revelação acontece apenas uma vez)
      observer.unobserve(element);
      observedElements.delete(element);
    });
  }

  /**
   * Cria e retorna um novo IntersectionObserver
   */
  function createObserver() {
    return new IntersectionObserver(
      handleIntersection,
      CONFIG.observerOptions
    );
  }

  /**
   * Desconecta o observer anterior e limpa estado
   */
  function disconnectObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    observedElements.clear();
  }

  // ========================================
  // INICIALIZAÇÃO E SETUP
  // ========================================
  
  /**
   * Inicializa todo o sistema de scroll reveal
   * Chamado na primeira vez e quando há mudanças de breakpoint
   */
  function initialize() {
    // Verifica se deve usar animação reduzida
    if (prefersReducedMotion()) {
      // Revela tudo imediatamente sem animação
      document.querySelectorAll(CONFIG.selectors.join(', ')).forEach(el => {
        revealElementImmediately(el);
      });
      return;
    }

    // Limpa observer anterior
    disconnectObserver();

    // Obtém perfil do dispositivo
    const profile = getDeviceProfile();
    lastDeviceProfile = profile;

    // Cria novo observer
    observer = createObserver();

    // Prepara todos os elementos reveladores
    document.querySelectorAll(CONFIG.selectors.join(', ')).forEach(element => {
      prepareElement(element, profile);
      observer.observe(element);
      observedElements.add(element);
    });
  }

  /**
   * Reinicializa se o dispositivo mudou de categoria
   * (ex: desktop → tablet) mas não em mudanças menores
   */
  function handleViewportChange() {
    const newProfile = getDeviceProfile();
    
    // Só reinicializa se mudou de categoria (desktop/tablet/mobile)
    if (
      !lastDeviceProfile ||
      newProfile.increment !== lastDeviceProfile.increment
    ) {
      initialize();
    }
  }

  /**
   * Listener para mudanças de preferência de movimento reduzido
   */
  function handleReducedMotionChange(mq) {
    if (mq.matches) {
      // Usuário ativou reduced motion
      disconnectObserver();
      document.querySelectorAll(CONFIG.selectors.join(', ')).forEach(el => {
        revealElementImmediately(el);
      });
    } else {
      // Usuário desativou reduced motion
      initialize();
    }
  }

  /**
   * Cleanup: remove todos os listeners quando página descarrega
   */
  function cleanup() {
    if (mediaQueryListener) {
      mediaQueryListener.removeEventListener?.('change', handleViewportChange);
      mediaQueryListener.removeListener?.(handleViewportChange);
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.removeEventListener?.('change', handleReducedMotionChange);
    reducedMotionQuery.removeListener?.(handleReducedMotionChange);

    disconnectObserver();
    observedElements.clear();
  }

  // ========================================
  // PUBLIC API
  // ========================================
  
  return {
    /**
     * Inicializa o sistema
     */
    init() {
      // Inicialização principal
      initialize();

      // Setup de viewport listener para tablet/mobile/desktop
      mediaQueryListener = window.matchMedia('(max-width: 1024px)');
      if (mediaQueryListener.addEventListener) {
        mediaQueryListener.addEventListener('change', handleViewportChange);
      } else {
        // Fallback para browsers antigos
        mediaQueryListener.addListener(handleViewportChange);
      }

      // Setup de reduced motion listener
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (reducedMotionQuery.addEventListener) {
        reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
      } else {
        reducedMotionQuery.addListener(handleReducedMotionChange);
      }

      // Cleanup ao descarregar página
      window.addEventListener('beforeunload', cleanup);
    },

    /**
     * Reinicializa o sistema (útil para pages dinâmicas)
     */
    reinit() {
      initialize();
    },

    /**
     * Retorna informações de debug
     */
    debug() {
      return {
        observedCount: observedElements.size,
        currentProfile: lastDeviceProfile,
        prefersReducedMotion: prefersReducedMotion(),
        observerActive: observer !== null,
      };
    },
  };
})();

// ========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ========================================

// Inicia quando o DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ScrollReveal.init());
} else {
  // DOM já foi carregado
  ScrollReveal.init();
}

