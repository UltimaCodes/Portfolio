// Age tracker functionality
(function() {
    'use strict';

    const birthDate = new Date('2008-08-15T00:00:00');
    let ageDisplay;

    function initAgeTracker() {
        ageDisplay = utils.getElement('#age-display');
        if (!ageDisplay) return; // Exit if age tracker not on this page

        updateAge();
        setInterval(updateAge, 1000);
    }

    function updateAge() {
        const now = new Date();
        const timeDiff = calculateTimeDifference(birthDate, now);

        const ageText = `${timeDiff.years} years, ${timeDiff.months} months, ${timeDiff.days} days, ${timeDiff.hours} hours, ${timeDiff.minutes} minutes, ${timeDiff.seconds} seconds`;
        ageDisplay.textContent = ageText;
    }

    function calculateTimeDifference(start, end) {
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();
        let hours = end.getHours() - start.getHours();
        let minutes = end.getMinutes() - start.getMinutes();
        let seconds = end.getSeconds() - start.getSeconds();

        // Handle negative values by borrowing from higher units
        if (seconds < 0) {
            seconds += 60;
            minutes--;
        }
        if (minutes < 0) {
            minutes += 60;
            hours--;
        }
        if (hours < 0) {
            hours += 24;
            days--;
        }
        if (days < 0) {
            months--;
            const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            months += 12;
            years--;
        }

        return { years, months, days, hours, minutes, seconds };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAgeTracker);
    } else {
        initAgeTracker();
    }
})();