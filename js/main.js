/* ============================================
   火火考公资料站 - Huohuo JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

  // ==========================================
  // 1. FLOATING PARTICLES (Hero Background)
  // ==========================================
  const particlesContainer = document.querySelector('.hero-particles');
  if (particlesContainer) {
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.width = (Math.random() * 4 + 2) + 'px';
      particle.style.height = particle.style.width;
      particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
      particle.style.animationDelay = (Math.random() * 10) + 's';
      particle.style.opacity = Math.random() * 0.3 + 0.1;
      particlesContainer.appendChild(particle);
    }
  }

  // ==========================================
  // 2. NAVBAR SCROLL EFFECT
  // ==========================================
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');

  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top button
    if (backToTop) {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }

    // Active nav link
    updateActiveNavLink();
  });

  // ==========================================
  // 3. MOBILE MENU TOGGLE
  // ==========================================
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle) {
    navToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
  }

  // Close mobile menu on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ==========================================
  // 4. ACTIVE NAV LINK (based on scroll)
  // ==========================================
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');

    let currentSection = '';
    sections.forEach(section => {
      const top = section.offsetTop - 150;
      const bottom = top + section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) {
        currentSection = section.getAttribute('id');
      }
    });

    navAnchors.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + currentSection) {
        a.classList.add('active');
      }
    });
  }

  // ==========================================
  // 5. SCROLL REVEAL ANIMATIONS
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optionally stop observing after reveal
        // revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================
  // 6. TABS (Study Materials)
  // ==========================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const target = this.getAttribute('data-tab');

      // Update buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Update content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.getAttribute('id') === target) {
          content.classList.add('active');
        }
      });
    });
  });

  // ==========================================
  // 7. BACK TO TOP
  // ==========================================
  if (backToTop) {
    backToTop.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================
  // 8. SMOOTH SCROLL FOR ALL ANCHOR LINKS
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ==========================================
  // 9. QUICK LINK CARDS CLICK
  // ==========================================
  document.querySelectorAll('.quick-link-card').forEach(card => {
    card.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      if (target) {
        const section = document.querySelector(target);
        if (section) {
          section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  console.log('🔥 火火考公资料站已加载完成！加油，上岸！');
});