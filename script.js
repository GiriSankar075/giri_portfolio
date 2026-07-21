/* ==========================================================================
   PORTFOLIO SCRIPT
   Everything here is small, dependency-free vanilla JS, split into clearly
   named functions so it's easy to read, reuse, or strip pieces out for your
   own site.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  setFooterYear();
  setupMobileNav();
  setupScrollSpy();
  setupScrollReveal();
  setupCounters();
  setupRoleTyper();
});

/* --------------------------------------------------------------------------
   1. Footer year — avoids hardcoding a year that goes stale
   -------------------------------------------------------------------------- */
function setFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* --------------------------------------------------------------------------
   2. Mobile nav toggle — shows/hides the nav list on small screens
   -------------------------------------------------------------------------- */
function setupMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --------------------------------------------------------------------------
   3. Scroll-spy — highlights the nav link matching the section in view.
      Uses IntersectionObserver instead of a scroll listener: cheaper, and
      the browser only tells us when something actually changes.
   -------------------------------------------------------------------------- */
function setupScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const links = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const linkFor = (id) =>
    document.querySelector(`.nav-link[href="#${id}"]`);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          const activeLink = linkFor(entry.target.id);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* --------------------------------------------------------------------------
   4. Scroll reveal — fades/slides elements in the first time they enter
      the viewport. Respects prefers-reduced-motion by revealing everything
      immediately (the CSS transition duration is also clamped there).
   -------------------------------------------------------------------------- */
function setupScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. Animated counters — the numbers in the hero "status panel" count up
      from 0 to their target value once the panel scrolls into view.
   -------------------------------------------------------------------------- */
function setupCounters() {
  const values = document.querySelectorAll('.status-value');
  if (!values.length) return;

  const animateValue = (el) => {
    const target = parseFloat(el.dataset.count || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = current.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateValue(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  values.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   6. Hero role "typer" — cycles through a short list of role titles with a
      simple type/delete effect. Purely decorative, so it's skipped entirely
      under prefers-reduced-motion.
   -------------------------------------------------------------------------- */
function setupRoleTyper() {
  const el = document.getElementById('role-typer');
  if (!el) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const roles = [
    'PCB Design & Embedded Systems',
    'Robotics & Hardware Prototyping',
    'Mechatronics Engineering Student',
  ];

  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = false;

  const TYPE_SPEED = 55;
  const DELETE_SPEED = 30;
  const HOLD_TIME = 1600;

  function tick() {
    const currentRole = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      if (charIndex > currentRole.length) {
        charIndex = currentRole.length;
        deleting = true;
        el.textContent = currentRole;
        setTimeout(tick, HOLD_TIME);
        return;
      }
    } else {
      charIndex--;
      if (charIndex < 0) {
        charIndex = 0;
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    el.textContent = currentRole.slice(0, charIndex);
    setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
  }

  setTimeout(tick, HOLD_TIME);
}