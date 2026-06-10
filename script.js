/* ============================================
   PORTFOLIO — Script
   Kyrre-style Frame + Network Canvas
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initSideNav();
    initRevealAnimations();
    initSmoothNav();
    initNetworkCanvas();
});

/* --- Scroll progress bar (right side) --- */
function initScrollProgress() {
    const content = document.getElementById('pageContent');
    const progress = document.getElementById('scrollProgress');
    if (!content || !progress) return;

    content.addEventListener('scroll', () => {
        const scrollTop = content.scrollTop;
        const scrollHeight = content.scrollHeight - content.clientHeight;
        const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progress.style.height = pct + '%';
    });
}

/* --- Side Navigation: active section tracking --- */
function initSideNav() {
    const content = document.getElementById('pageContent');
    const sections = document.querySelectorAll('.section[id]');
    const navItems = document.querySelectorAll('.sidenav__item');
    if (!content || !sections.length || !navItems.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navItems.forEach(item => {
                        item.classList.toggle('active', item.dataset.section === id);
                    });
                }
            });
        },
        { threshold: 0.1, root: content }
    );

    sections.forEach(section => observer.observe(section));
}

/* --- Reveal on scroll --- */
function initRevealAnimations() {
    const content = document.getElementById('pageContent');
    const elements = document.querySelectorAll('.reveal');
    if (!content) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 80);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px', root: content }
    );

    elements.forEach(el => observer.observe(el));
}

/* --- Smooth scroll for nav links --- */
function initSmoothNav() {
    const content = document.getElementById('pageContent');
    if (!content) return;

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

/* --- Network Connection Dots Background --- */
function initNetworkCanvas() {
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, dots = [];
    let mouse = { x: -9999, y: -9999 };

    const DOT_COUNT_BASE = 120;
    const DOT_RADIUS_MIN = 1.5;
    const DOT_RADIUS_MAX = 3.5;
    const CONNECT_DISTANCE = 200;
    const MOUSE_DISTANCE = 200;
    const SPEED_MIN = 0.15;
    const SPEED_MAX = 0.5;
    const DOT_COLOR = { r: 160, g: 120, b: 90 };
    const LINE_COLOR = { r: 160, g: 120, b: 90 };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createDots() {
        const area = width * height;
        const count = Math.floor(DOT_COUNT_BASE * (area / (1920 * 1080)));
        dots = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
            dots.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: DOT_RADIUS_MIN + Math.random() * (DOT_RADIUS_MAX - DOT_RADIUS_MIN),
                opacity: 0.2 + Math.random() * 0.4
            });
        }
    }

    function update() {
        for (const dot of dots) {
            dot.x += dot.vx;
            dot.y += dot.vy;
            if (dot.x < -10) dot.x = width + 10;
            if (dot.x > width + 10) dot.x = -10;
            if (dot.y < -10) dot.y = height + 10;
            if (dot.y > height + 10) dot.y = -10;

            const dxm = dot.x - mouse.x;
            const dym = dot.y - mouse.y;
            const distMouse = Math.sqrt(dxm * dxm + dym * dym);
            if (distMouse < MOUSE_DISTANCE) {
                const force = (1 - distMouse / MOUSE_DISTANCE) * 0.015;
                dot.vx += dxm * force;
                dot.vy += dym * force;
            }

            const speed = Math.sqrt(dot.vx * dot.vx + dot.vy * dot.vy);
            if (speed > SPEED_MAX * 1.5) {
                dot.vx *= 0.98;
                dot.vy *= 0.98;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DISTANCE) {
                    const opacity = (1 - dist / CONNECT_DISTANCE) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.strokeStyle = `rgba(${LINE_COLOR.r}, ${LINE_COLOR.g}, ${LINE_COLOR.b}, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        for (const dot of dots) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${DOT_COLOR.r}, ${DOT_COLOR.g}, ${DOT_COLOR.b}, ${dot.opacity})`;
            ctx.fill();
        }
    }

    function animate() {
        update();
        draw();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { resize(); createDots(); });
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    resize();
    createDots();
    animate();
}

/**
 * Lightbox Modal Logic
 */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const clickableImages = document.querySelectorAll('.clickable-image');

    if (!lightbox || !lightboxImg || !lightboxClose) return;

    clickableImages.forEach(img => {
        img.addEventListener('click', function () {
            lightbox.classList.add('active');
            lightboxImg.src = this.src;
        });
    });

    lightboxClose.addEventListener('click', function () {
        lightbox.classList.remove('active');
    });

    // Close when clicking outside the image
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape" && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
        }
    });
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initLightbox();
});
