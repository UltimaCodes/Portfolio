// GET /api/spotify: what's playing right now, plus my top songs and artists.
// The site is static, so this is the one bit of server it needs. The refresh
// token lives in this project's environment variables and never reaches a browser.

const NOW_TTL_MS = 15 * 1000;
const TOP_TTL_MS = 60 * 60 * 1000;
const TOP_COUNT = 5;

let token = null;
let tokenExpires = 0;
let nowCache = { at: 0, value: null };
let topCache = { at: 0, value: null };

async function accessToken() {
    if (token && Date.now() < tokenExpires) return token;

    // Pasting into a dashboard can bring a stray space or newline along with it
    const clientId = process.env.SPOTIFY_CLIENT_ID.trim();
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET.trim();
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN.trim();

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken })
    });
    if (!res.ok) {
        // Spotify's reason says which value is wrong, and the lengths show a bad paste. Neither gives a value away.
        const { error } = await res.json().catch(() => ({}));
        throw new Error(`token request failed: ${res.status} ${error} (lengths: id ${clientId.length}, secret ${clientSecret.length}, refresh ${refreshToken.length})`);
    }

    const data = await res.json();
    token = data.access_token;
    tokenExpires = Date.now() + (data.expires_in - 60) * 1000;
    return token;
}

async function spotify(path) {
    const res = await fetch(`https://api.spotify.com/v1${path}`, {
        headers: { Authorization: `Bearer ${await accessToken()}` }
    });
    if (res.status === 204) return null;
    if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
    return res.json();
}

// Images come biggest first. The second one is around 300px, plenty for a small cover.
const picture = images => (images && (images[1] || images[0]) || {}).url || null;

const shapeTrack = track => ({
    name: track.name,
    artists: track.artists.map(artist => artist.name).join(', '),
    url: track.external_urls.spotify,
    image: picture(track.album.images)
});

const shapeArtist = artist => ({
    name: artist.name,
    url: artist.external_urls.spotify,
    image: picture(artist.images)
});

async function fetchNow() {
    const player = await spotify('/me/player');

    // A Spotify private session hides it from here too, which doubles as an off switch.
    const playing = player && player.is_playing && player.item
        && player.currently_playing_type === 'track'
        && !(player.device && player.device.is_private_session);
    if (playing) return { now: shapeTrack(player.item), last: null };

    const recent = await spotify('/me/player/recently-played?limit=1');
    const item = recent && recent.items && recent.items[0];
    return { now: null, last: item ? { ...shapeTrack(item.track), playedAt: item.played_at } : null };
}

async function fetchTop() {
    const [tracks, artists, me] = await Promise.all([
        spotify(`/me/top/tracks?time_range=short_term&limit=${TOP_COUNT}`),
        spotify(`/me/top/artists?time_range=short_term&limit=${TOP_COUNT}`),
        spotify('/me')
    ]);
    return {
        topTracks: tracks.items.map(shapeTrack),
        topArtists: artists.items.map(shapeArtist),
        profile: me.external_urls.spotify
    };
}

// Keeps the last good answer, so a Spotify hiccup doesn't blank the page and
// nobody can burn through the rate limit by adding junk to the URL.
async function cached(cache, ttl, load) {
    if (cache.value && Date.now() - cache.at < ttl) return cache.value;
    try {
        cache.value = await load();
        cache.at = Date.now();
    } catch (error) {
        console.error(error.message);
        if (!cache.value) throw error;
    }
    return cache.value;
}

export default {
    async fetch(request) {
        const headers = { 'Access-Control-Allow-Origin': '*' };

        if (request.method !== 'GET') {
            return Response.json({ error: 'method not allowed' }, { status: 405, headers });
        }
        if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REFRESH_TOKEN) {
            return Response.json({ error: 'not configured' }, { status: 500, headers });
        }

        try {
            const [now, top] = await Promise.all([
                cached(nowCache, NOW_TTL_MS, fetchNow),
                cached(topCache, TOP_TTL_MS, fetchTop)
            ]);
            return Response.json({ ...now, ...top }, {
                headers: { ...headers, 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=15' }
            });
        } catch (error) {
            return Response.json({ error: 'spotify unavailable' }, { status: 502, headers });
        }
    }
};
