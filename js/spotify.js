// What I'm listening to, from the small server in spotify-api/. It holds the
// Spotify login so this file never sees it. If the server is down, everything
// Spotify stays hidden and the page looks like it never existed.
(function() {
    'use strict';

    const API = 'https://ryaan-spotify-api.vercel.app/api/spotify';
    const POLL_MS = 20000;

    const panel = document.getElementById('spotify');
    const row = document.getElementById('listening');
    if (!API || (!panel && !row)) return;

    const el = id => document.getElementById(id);

    // Only ever link and load what Spotify itself would hand out
    function link(a, url) {
        if (url && url.startsWith('https://open.spotify.com/')) a.href = url;
        else a.removeAttribute('href');
    }
    function cover(img, url) {
        if (url && /^https:\/\/[\w.-]+\.(scdn\.co|spotifycdn\.com)\//.test(url)) { img.src = url; img.hidden = false; }
        else { img.removeAttribute('src'); img.hidden = true; }
    }

    function ago(iso) {
        const minutes = Math.round((Date.now() - new Date(iso)) / 60000);
        if (!(minutes >= 0)) return '';
        if (minutes < 2) return 'just now';
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.round(minutes / 60);
        if (hours < 24) return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
        const days = Math.round(hours / 24);
        return days === 1 ? 'yesterday' : `${days} days ago`;
    }

    function fillList(list, items, subtitle) {
        list.textContent = '';
        items.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            link(a, item.url);
            const img = document.createElement('img');
            img.alt = '';
            img.width = img.height = 44;
            img.loading = 'lazy';
            img.referrerPolicy = 'no-referrer';
            cover(img, item.image);
            const text = utils.createElement('span', 'music-text');
            text.appendChild(utils.createElement('b', '', item.name));
            if (subtitle) text.appendChild(utils.createElement('span', '', subtitle(item)));
            a.append(img, text);
            li.appendChild(a);
            list.appendChild(li);
        });
    }

    function render(data) {
        const track = data.now || data.last;

        if (row) {
            row.hidden = !track;
            if (track) {
                el('listening-label').textContent = data.now ? 'listening to' : 'last played';
                const song = el('listening-song');
                song.textContent = `${track.name} by ${track.artists}`;
                link(song, track.url);
            }
        }

        if (!panel) return;
        panel.hidden = false;

        el('now-label').textContent = data.now ? 'listening to right now' : 'last played';
        el('now-link').parentElement.hidden = !track;
        if (track) {
            link(el('now-link'), track.url);
            cover(el('now-cover'), track.image);
            el('now-song').textContent = track.name;
            el('now-artist').textContent = track.artists;
            el('now-when').textContent = !data.now && track.playedAt ? ago(track.playedAt) : '';
        }

        fillList(el('top-songs'), data.topTracks || [], item => item.artists);
        fillList(el('top-artists'), data.topArtists || []);

        const profile = el('spotify-profile');
        link(profile, data.profile);
        profile.hidden = !profile.hasAttribute('href');
    }

    function refresh() {
        if (document.hidden) return;
        fetch(API, { cache: 'no-cache' })
            .then(res => { if (!res.ok) throw new Error(res.status); return res.json(); })
            .then(render)
            .catch(() => { /* keep whatever is on screen, try again next time */ });
    }

    refresh();
    setInterval(refresh, POLL_MS);
    document.addEventListener('visibilitychange', refresh);
})();
