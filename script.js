// ============= HYPERSPEED BACKGROUND COMPONENT =============

class HyperspeedBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.geometry = null;
        this.material = null;
        this.lines = null;
        this.animationId = null;
        this.speed = 1;
        this.targetSpeed = 1;
        this.fov = 90;
        this.targetFov = 90;
        this.count = 2000;

        this.colors = {
            leftCars: [0xdc2626, 0xfb923c, 0xeab308],
            rightCars: [0x3b82f6, 0x06b6d4, 0x8b5cf6],
        };

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020617);

        // Camera setup
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(this.fov, width / height, 0.1, 10000);
        this.camera.position.z = 10;
        this.camera.position.y = 7;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(width, height);

        // Create geometry and material
        this.createGeometry();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createGeometry() {
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.count * 3 * 2);
        const lineColors = new Float32Array(this.count * 3 * 2);

        for (let i = 0; i < this.count; i++) {
            const z = Math.random() * 400;
            const r = 10 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;

            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;

            const idx = i * 6;
            positions[idx] = x;
            positions[idx + 1] = y;
            positions[idx + 2] = -z;

            positions[idx + 3] = x;
            positions[idx + 4] = y;
            positions[idx + 5] = -(z + 10 + Math.random() * 50);

            const colorSet = i % 2 === 0 ? this.colors.leftCars : this.colors.rightCars;
            const chosenColor = new THREE.Color(
                colorSet[Math.floor(Math.random() * colorSet.length)]
            );

            lineColors[idx] = chosenColor.r;
            lineColors[idx + 1] = chosenColor.g;
            lineColors[idx + 2] = chosenColor.b;

            lineColors[idx + 3] = chosenColor.r;
            lineColors[idx + 4] = chosenColor.g;
            lineColors[idx + 5] = chosenColor.b;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

        this.material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });

        this.lines = new THREE.LineSegments(this.geometry, this.material);
        this.scene.add(this.lines);
    }

    setupEventListeners() {
        window.addEventListener('mousedown', () => this.speedUp());
        window.addEventListener('mouseup', () => this.slowDown());
        window.addEventListener('touchstart', () => this.speedUp());
        window.addEventListener('touchend', () => this.slowDown());
    }

    speedUp() {
        this.targetSpeed = 3;
        this.targetFov = 150;
    }

    slowDown() {
        this.targetSpeed = 1;
        this.targetFov = 90;
    }

    animate = () => {
        this.animationId = requestAnimationFrame(this.animate);

        // Smooth speed and fov interpolation
        this.speed += (this.targetSpeed - this.speed) * 0.05;
        this.fov += (this.targetFov - this.fov) * 0.05;

        this.camera.fov = this.fov;
        this.camera.updateProjectionMatrix();

        // Update positions
        const pos = this.geometry.attributes.position.array;
        for (let i = 0; i < this.count; i++) {
            const idx = i * 6;
            pos[idx + 2] += this.speed * 5;
            pos[idx + 5] += this.speed * 5;

            if (pos[idx + 2] > 50) {
                pos[idx + 2] = -400;
                pos[idx + 5] = -(400 + 10 + Math.random() * 50);
            }

            // Turbulent distortion
            const offset = Math.sin(Date.now() * 0.001 + pos[idx + 2] * 0.01) * 2;
            pos[idx] += offset * 0.01;
            pos[idx + 3] += offset * 0.01;
        }
        this.geometry.attributes.position.needsUpdate = true;

        this.renderer.render(this.scene, this.camera);
    };

    onWindowResize = () => {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    dispose() {
        cancelAnimationFrame(this.animationId);
        this.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();
    }
}

// ============= SCROLL ANIMATIONS =============

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                }
            });
        }, this.observerOptions);

        this.init();
    }

    init() {
        // Observe all fade-in elements
        document.querySelectorAll('.fade-in').forEach((el) => {
            el.style.opacity = '0';
            this.observer.observe(el);
        });

        document.querySelectorAll('.ecosystem-card').forEach((el, index) => {
            el.style.opacity = '0';
            el.style.animation = `fadeInUp 0.8s ease-out ${index * 0.1}s forwards`;
            this.observer.observe(el);
        });
    }
}

// ============= SMOOTH SCROLL & INTERACTIVE ELEMENTS =============

class InteractiveElements {
    constructor() {
        this.init();
    }

    init() {
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Button hover effects
        document.querySelectorAll('.btn').forEach((btn) => {
            btn.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'translateY(-2px)';
            });

            btn.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'translateY(0)';
            });

            btn.addEventListener('click', () => {
                console.log('Button clicked:', btn.textContent);
                // Add form or action here
            });
        });

        // Ecosystem card interactions
        document.querySelectorAll('.ecosystem-card').forEach((card) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Feature card animations
        document.querySelectorAll('.feature-card').forEach((card) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }
}

// ============= PARALLAX SCROLL EFFECT =============

class ParallaxEffect {
    constructor() {
        this.scrollY = 0;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
            this.update();
        });
    }

    update() {
        // Add any parallax effects here
        const glows = document.querySelectorAll('[class*="glow"]');
        glows.forEach((glow) => {
            const offset = this.scrollY * 0.5;
            glow.style.transform = `translateY(${offset}px)`;
        });
    }
}

// ============= TYPING EFFECT FOR TEXT =============

class TypingEffect {
    constructor() {
        this.init();
    }

    init() {
        const headlines = document.querySelectorAll('.hero-headline, .section-title');
        headlines.forEach((headline) => {
            this.observeElement(headline);
        });
    }

    observeElement(element) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.typeText(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(element);
    }

    typeText(element) {
        element.style.opacity = '1';
        element.style.animation = 'fadeInUp 0.8s ease-out forwards';
    }
}

// ============= PARTICLE CURSOR EFFECT =============

class CursorEffect {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.createParticle(e.clientX, e.clientY);
        });
    }

    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = 'rgba(220, 38, 38, 0.5)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.animation = 'fadeOut 0.6s ease-out forwards';

        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 600);
    }
}

// Add particle fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// ============= LOADING & INITIALIZATION =============

document.addEventListener('DOMContentLoaded', () => {
    console.log('GigaInfinity Loading...');

    // Initialize Hyperspeed Background
    const hyperspeed = new HyperspeedBackground('hyperspeed-canvas');

    // Initialize Scroll Animations
    const scrollAnimations = new ScrollAnimations();

    // Initialize Interactive Elements
    const interactiveElements = new InteractiveElements();

    // Initialize Parallax Effect
    const parallaxEffect = new ParallaxEffect();

    // Initialize Typing Effect
    const typingEffect = new TypingEffect();

    // Initialize Cursor Effect (optional - comment out if not wanted)
    // const cursorEffect = new CursorEffect();

    // Add loading complete log
    window.addEventListener('load', () => {
        console.log('GigaInfinity Ready! 🚀');
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        hyperspeed.dispose();
    });
});

// ============= SCROLL SPY (Active Navigation) =============

class ScrollSpy {
    constructor() {
        this.sections = document.querySelectorAll('section[id]');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            this.updateActiveSection();
        });
    }

    updateActiveSection() {
        let current = '';
        this.sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        // You can use this to update active nav states if needed
    }
}

// Initialize ScrollSpy
document.addEventListener('DOMContentLoaded', () => {
    new ScrollSpy();
});

// ============= UTILITY: ELEMENT VISIBILITY CHECK =============

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

// ============= CUSTOM EVENT DISPATCHER =============

const eventBus = {
    events: {},

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    },

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter((cb) => cb !== callback);
        }
    },

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach((callback) => callback(data));
        }
    },
};

// ============= PERFORMANCE OPTIMIZATION =============

// Reduce animation frame rate if performance is low
const checkPerformance = () => {
    const start = performance.now();
    // Do some work
    const end = performance.now();
    const frameTime = end - start;

    if (frameTime > 16) {
        console.warn('Performance: Frame rate below 60fps');
    }
};

// Request animation frame with performance check
let frameCount = 0;
const performanceMonitor = () => {
    frameCount++;
    if (frameCount % 60 === 0) {
        checkPerformance();
    }
    requestAnimationFrame(performanceMonitor);
};

// Uncomment to enable performance monitoring
// performanceMonitor();

// ============= CONSOLE MESSAGES =============

console.log('%c🚀 GigaInfinity Premium Landing Page', 'color: #dc2626; font-size: 20px; font-weight: bold;');
console.log('%c📱 Responsive Design: Mobile, Tablet, Desktop', 'color: #3b82f6; font-size: 14px;');
console.log('%c✨ Features: Hyperspeed Background, Smooth Animations, Interactive Elements', 'color: #eab308; font-size: 14px;');
console.log('%c💡 Built with HTML5, CSS3, and Vanilla JavaScript', 'color: #8b5cf6; font-size: 14px;');
