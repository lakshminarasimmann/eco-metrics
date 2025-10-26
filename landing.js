// Counter animation
function animateCounter() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.parentElement.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                if (target > 1000000) {
                    counter.textContent = (current / 1000000).toFixed(1) + 'M+';
                } else if (target > 1000) {
                    counter.textContent = (current / 1000).toFixed(1) + 'K+';
                } else if (target === 99) {
                    counter.textContent = Math.floor(current) + '%';
                } else {
                    counter.textContent = Math.floor(current) + '+';
                }
                requestAnimationFrame(updateCounter);
            } else {
                if (target > 1000000) {
                    counter.textContent = (target / 1000000).toFixed(1) + 'M+';
                } else if (target > 1000) {
                    counter.textContent = (target / 1000).toFixed(1) + 'K+';
                } else if (target === 99) {
                    counter.textContent = target + '%';
                } else {
                    counter.textContent = target + '+';
                }
            }
        };
        
        updateCounter();
    });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

// Initialize animations on load
window.addEventListener('load', () => {
    animateCounter();
});

// Parallax effect for hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - (scrolled / 800);
    }
});
