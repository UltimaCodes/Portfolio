// The buttons on the settings page. js/shared.js holds the settings themselves.
(function() {
    'use strict';

    const buttons = document.querySelectorAll('[data-setting]');

    function refresh() {
        buttons.forEach(button => {
            const current = siteSettings.get(button.dataset.setting);
            button.setAttribute('aria-pressed', String(current === button.dataset.value));
        });
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => siteSettings.set(button.dataset.setting, button.dataset.value));
    });

    document.addEventListener('settingchange', refresh);
    refresh();
})();
