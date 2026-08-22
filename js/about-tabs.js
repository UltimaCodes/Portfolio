// About page tab switching — click a tab, show only its panel.
(function() {
    'use strict';

    function initAboutTabs() {
        const tabs = document.querySelectorAll('.about-jumptab');
        if (!tabs.length) return; // Not on the About page

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = 'about-' + tab.dataset.tab;

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.about-panel').forEach(panel => {
                    panel.classList.toggle('active', panel.id === targetId);
                });
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAboutTabs);
    } else {
        initAboutTabs();
    }
})();
