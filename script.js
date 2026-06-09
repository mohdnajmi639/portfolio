/* ============================================
   PORTFOLIO — Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavScroll();
    initMobileMenu();
    initRevealAnimations();
    initSmoothNav();
});

/* --- Navbar scroll effect --- */
function initNavScroll() {
    const nav = document.getElementById('nav');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                nav.classList.toggle('scrolled', window.scrollY > 60);
                ticking = false;
            });
            ticking = true;
        }
    });
}

/* --- Mobile menu toggle --- */
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('open');
        document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    menu.querySelectorAll('.mobile-menu__link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

/* --- Reveal on scroll --- */
function initRevealAnimations() {
    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger the animation slightly for multiple items
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 80);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
}

/* --- Smooth scroll for nav links --- */
function initSmoothNav() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}
