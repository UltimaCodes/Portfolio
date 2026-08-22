// Projects page functionality
(function() {
    'use strict';

    function initProjectsPage() {
        setupProjectHoverEffects();
    }

    function setupProjectHoverEffects() {
        const projectCards = document.querySelectorAll('.project-card');

        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                // Add subtle glow effect
                card.style.boxShadow = '0 0 30px #ff00aa, 4px 4px 0 #ff00aa';
            });

            card.addEventListener('mouseleave', () => {
                // Reset to default shadow
                card.style.boxShadow = '4px 4px 0 #ff00aa';
            });

            // Add click ripple effect
            card.addEventListener('click', (e) => {
                const ripple = document.createElement('div');
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 0, 170, 0.6)';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple 0.6s linear';
                ripple.style.left = (e.clientX - card.offsetLeft) + 'px';
                ripple.style.top = (e.clientY - card.offsetTop) + 'px';
                ripple.style.width = ripple.style.height = '20px';
                ripple.style.pointerEvents = 'none';

                card.style.position = 'relative';
                card.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add ripple animation to CSS
        if (!document.querySelector('#ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
            document.head.appendChild(style);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectsPage);
    } else {
        initProjectsPage();
    }
})();