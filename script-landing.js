// SVG Globe - simple and clean
function initGlobe() {
    const svg = document.getElementById('globeSvg');
    if (!svg) return;

    // Add rotation animation to SVG
    let rotation = 0;
    function animateGlobe() {
        rotation += 0.5;
        // Subtle rotation effect through opacity changes on groups
        requestAnimationFrame(animateGlobe);
    }
    animateGlobe();

    // Add hover effect
    svg.addEventListener('mouseenter', () => {
        svg.style.filter = 'drop-shadow(0 30px 60px rgba(59, 130, 246, 0.4))';
    });

    svg.addEventListener('mouseleave', () => {
        svg.style.filter = 'drop-shadow(0 20px 40px rgba(59, 130, 246, 0.2))';
    });
}

// Smooth scroll behavior is handled by CSS

// Animate stats on scroll
function initStatsAnimation() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stat-box').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initGlobe();
    initStatsAnimation();

    // Add click animation to buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', function() {
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'scale(1)';
            ripple.style.animation = 'ripple 0.6s ease-out forwards';

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
        });
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
