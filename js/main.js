/* RZ REVEL – hlavný skript (v3)
   Animácie sú jemné: odkrytie riadkov z masky, fade + malý posun, mapa. */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.header');

  /* Mobilné menu */
  const toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    const setMenu = (open) => {
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Zavrieť menu' : 'Otvoriť menu');
    };
    toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    document.querySelectorAll('.mobile-menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  /* Hlavička – tmavé sklo, keď už nie je nad tmavou kartou */
  const darkTop = document.querySelector('[data-dark-top]');
  const updateHeader = () => {
    const limit = darkTop ? darkTop.getBoundingClientRect().bottom - 80 : 0;
    header.classList.toggle('is-solid', limit < 0);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* Aktuálny rok */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* Lightbox pre galériu */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const img = lightbox.querySelector('img');
    document.querySelectorAll('.gallery button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const thumb = btn.querySelector('img');
        img.src = thumb.src;
        img.alt = thumb.alt;
        lightbox.showModal();
      });
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  }

  /* Kontaktný formulár – v statickej verzii len ukážka (vo WP Contact Form 7) */
  const form = document.querySelector('[data-demo-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.querySelector('.form-note').hidden = false;
    });
  }

  /* Nastavenia cookies – otvorí lištu cookie pluginu (doplní sa vo WP) */
  document.querySelectorAll('[data-cookie-settings]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (window.CookieConsent && typeof window.CookieConsent.showPreferences === 'function') {
        window.CookieConsent.showPreferences();
      }
    });
  });

  /* ---------- Animácie ---------- */
  if (reduceMotion || typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  const ease = 'power3.out';

  // Úvodná karta – fotka sa jemne priblíži, riadky nadpisu vyjdú z masky
  const intro = gsap.timeline({ defaults: { ease } });
  intro
    .from('[data-dark-top] .bg img', { scale: 1.2, duration: 1.8, ease: 'power2.out' }, 0)
    .from('[data-dark-top] h1 .line > span', { yPercent: 110, duration: 1.1, stagger: 0.09 }, 0.15)
    .from('[data-intro]', { y: 20, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.5)
    .from('.header > *', { y: -16, opacity: 0, duration: 0.8, stagger: 0.06 }, 0.3);

  // Nadpisy sekcií – riadky z masky
  gsap.utils.toArray('[data-lines]').forEach((el) => {
    gsap.from(el.querySelectorAll('.line > span'), {
      yPercent: 110, duration: 1, ease, stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // Jednotlivé prvky
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 30, opacity: 0, duration: 0.9, ease,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Skupiny kariet
  gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
    gsap.from(group.children, {
      y: 30, opacity: 0, duration: 0.8, ease, stagger: 0.07,
      scrollTrigger: { trigger: group, start: 'top 85%', once: true },
    });
  });

  // Počítadlá
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseInt(el.dataset.count, 10);
    const obj = { v: parseInt(el.dataset.countFrom || '0', 10) };
    gsap.to(obj, {
      v: end, duration: 1.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = Math.round(obj.v); },
    });
  });

  // Mapa – glóbus sa jemne zdvihne, krajiny sa zafarbia, špendlík "doskočí"
  const map = document.querySelector('.map');
  if (map) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: map, start: 'top 80%', once: true } });
    tl.from(map.querySelector('.map-svg'), { y: 60, opacity: 0, duration: 1.4, ease })
      .from(map.querySelectorAll('.map-hl'), { opacity: 0, duration: 0.8, stagger: 0.15 }, 0.5)
      .from(map.querySelector('.map-pin'), { scale: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(2.5)' }, 0.9)
      .from(map.querySelector('.map-legend'), { opacity: 0, y: 10, duration: 0.6 }, 1);
    gsap.to(map.querySelector('.map-pin circle'), {
      attr: { r: 18 }, opacity: 0, duration: 1.8, ease: 'power1.out', repeat: -1, delay: 2,
    });
  }
})();
