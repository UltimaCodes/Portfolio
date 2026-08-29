// Music player functionality
(function() {
    'use strict';

    const tracks = [
        { title: "Cellar of Ghosts - Kardashev", src: "music/cog.mp3" },
        { title: "Hymn For A Droid - Psychedelic Porn Crumpets", src: "music/hymnforadroid.mp3" },
        { title: "Entombed - Deftones", src: "music/entombed.mp3" },
        { title: "Snow Sleep - Kardashev", src: "music/snowsleep.mp3" }
    ];

    let currentTrack = 0;
    let audio, trackTitle, seekBar, currentTimeDisplay, durationDisplay, playButton, trackList;

    function initMusicPlayer() {
        audio = utils.getElement("#audio");
        trackTitle = utils.getElement("#track-title");
        seekBar = utils.getElement("#seek-bar");
        currentTimeDisplay = utils.getElement("#current-time");
        durationDisplay = utils.getElement("#duration");
        playButton = utils.getElement("#play-pause-btn");
        trackList = utils.getElement("#track-list");

        if (!audio) return; // Exit if music player not on this page

        renderTrackList();
        setupEventListeners();
        loadTrack(currentTrack);
    }

    function renderTrackList() {
        if (!trackList) return;
        trackList.innerHTML = tracks.map((track, index) =>
            `<div class="track-row" data-index="${index}">${track.title}</div>`
        ).join('');
        trackList.querySelectorAll('.track-row').forEach(row => {
            row.addEventListener('click', () => {
                currentTrack = parseInt(row.dataset.index, 10);
                loadTrack(currentTrack);
                audio.play().catch(() => {});
            });
        });
    }

    function highlightActiveTrack() {
        if (!trackList) return;
        trackList.querySelectorAll('.track-row').forEach(row => {
            row.classList.toggle('playing', parseInt(row.dataset.index, 10) === currentTrack);
        });
    }

    function setupEventListeners() {
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("play", () => updatePlayButtonLabel());
        audio.addEventListener("pause", () => updatePlayButtonLabel());
        seekBar.addEventListener("input", handleSeekBarInput);
    }

    function updatePlayButtonLabel() {
        if (playButton) playButton.textContent = audio.paused ? 'PLAY' : 'PAUSE';
    }

    function loadTrack(index) {
        const track = tracks[index];
        audio.src = track.src;
        trackTitle.textContent = track.title;
        audio.load();
        updatePlayButtonLabel();
        highlightActiveTrack();
    }

    function togglePlay() {
        if (audio.paused) {
            audio.play().catch(() => {}); // Handle play failure silently
        } else {
            audio.pause();
        }
    }

    function nextTrack() {
        currentTrack = (currentTrack + 1) % tracks.length;
        loadTrack(currentTrack);
        audio.play().catch(() => {});
    }

    function prevTrack() {
        currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrack);
        audio.play().catch(() => {});
    }

    function handleLoadedMetadata() {
        seekBar.max = Math.floor(audio.duration);
        durationDisplay.textContent = formatTime(audio.duration);
    }

    function handleTimeUpdate() {
        seekBar.value = Math.floor(audio.currentTime);
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
    }

    function handleSeekBarInput() {
        audio.currentTime = seekBar.value;
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    // Expose functions globally for onclick handlers
    window.togglePlay = togglePlay;
    window.nextTrack = nextTrack;
    window.prevTrack = prevTrack;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMusicPlayer);
    } else {
        initMusicPlayer();
    }
})();