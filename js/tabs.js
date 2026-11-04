// Tab bars on Setup and Projects. A button shows the panel with the matching
// data-panel, and data-tab="all" shows every panel. Without this script every
// panel just stays visible, so nothing gets lost if it fails to load.
(function() {
    'use strict';

    document.querySelectorAll('.tabs').forEach(bar => {
        const buttons = [...bar.querySelectorAll('button')];
        const panels = [...document.querySelectorAll('[data-panel]')];

        function show(name) {
            buttons.forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
            panels.forEach(p => { p.hidden = name !== 'all' && p.dataset.panel !== name; });
        }

        buttons.forEach(b => b.addEventListener('click', () => {
            show(b.dataset.tab);
            history.replaceState(null, '', '#' + b.dataset.tab);
        }));

        const wanted = location.hash.slice(1);
        show(buttons.some(b => b.dataset.tab === wanted) ? wanted : buttons[0].dataset.tab);
    });
})();
