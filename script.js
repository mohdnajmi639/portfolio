document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initSideNav();
    initRevealAnimations();
    initSmoothNav();
    initNetworkCanvas();
    initLightbox();
});

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

function initSideNav() {
    const content = document.getElementById('pageContent');
    const sections = document.querySelectorAll('.section[id]');
    const navItems = document.querySelectorAll('.sidenav__item');
    if (!content || !sections.length || !navItems.length) return;

    function updateActiveNav() {
        const scrollTop = content.scrollTop;
        const viewHeight = content.clientHeight;
        let currentId = 'hero';

        if (scrollTop < 100) {
            currentId = 'hero';
        } else {
            sections.forEach(section => {
                if (scrollTop >= section.offsetTop - viewHeight * 0.4) {
                    currentId = section.id;
                }
            });
        }

        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === currentId);
        });
    }

    content.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
}

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

function initSmoothNav() {
    const content = document.getElementById('pageContent');
    if (!content) return;

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            if (targetId === '#hero') {
                content.scrollTop = 0;
                return;
            }

            const target = document.querySelector(targetId);
            if (target) content.scrollTop = target.offsetTop;
        });
    });
}

function initNetworkCanvas() {
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, dots = [];
    let mouse = { x: -9999, y: -9999 };

    const CONFIG = {
        dotCount: 120,
        radiusMin: 1.5,
        radiusMax: 3.5,
        connectDist: 200,
        mouseDist: 200,
        speedMin: 0.15,
        speedMax: 0.5,
        color: { r: 160, g: 120, b: 90 }
    };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createDots() {
        const count = Math.floor(CONFIG.dotCount * (width * height) / (1920 * 1080));
        dots = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = CONFIG.speedMin + Math.random() * (CONFIG.speedMax - CONFIG.speedMin);
            dots.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: CONFIG.radiusMin + Math.random() * (CONFIG.radiusMax - CONFIG.radiusMin),
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
            if (distMouse < CONFIG.mouseDist) {
                const force = (1 - distMouse / CONFIG.mouseDist) * 0.015;
                dot.vx += dxm * force;
                dot.vy += dym * force;
            }

            const speed = Math.sqrt(dot.vx * dot.vx + dot.vy * dot.vy);
            if (speed > CONFIG.speedMax * 1.5) {
                dot.vx *= 0.98;
                dot.vy *= 0.98;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        const { r, g, b } = CONFIG.color;

        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.connectDist) {
                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - dist / CONFIG.connectDist) * 0.15})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        for (const dot of dots) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${dot.opacity})`;
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

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    const images = document.querySelectorAll('.clickable-image');

    if (!lightbox || !lightboxImg || !closeBtn) return;

    images.forEach(img => {
        img.addEventListener('click', function () {
            lightbox.classList.add('active');
            lightboxImg.src = this.src;
        });
    });

    closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
        }
    });
}
