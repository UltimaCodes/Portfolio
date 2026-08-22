// Generic tab switching — used by About and Setup. Click a .about-jumptab,
// show the .about-panel whose data-panel matches the tab's data-tab.
(function() {
    'use strict';

    function initTabs() {
        const tabs = document.querySelectorAll('.about-jumptab');
        if (!tabs.length) return; // Not a tabbed page

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.about-panel').forEach(panel => {
                    panel.classList.toggle('active', panel.dataset.panel === tab.dataset.tab);
                });
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTabs);
    } else {
        initTabs();
    }
})();
