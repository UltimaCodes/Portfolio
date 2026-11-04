// Run this once on your own machine to log in to Spotify: node get-token.mjs
// It writes all three secrets to .env.local (ignored by git) and doesn't print them.
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { exec } from 'node:child_process';
import { createInterface } from 'node:readline';

const REDIRECT = 'http://127.0.0.1:8888/callback';
const SCOPES = 'user-top-read user-read-playback-state user-read-recently-played';

const input = createInterface({ input: process.stdin });
const lines = input[Symbol.asyncIterator]();
const ask = async question => {
    process.stdout.write(question);
    const { value = '' } = await lines.next();
    return value.trim();
};
const clientId = await ask('Client ID: ');
const clientSecret = await ask('Client secret: ');
input.close();

const state = randomBytes(16).toString('hex');
const login = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT,
    state
});

async function exchange(code) {
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT })
    });
    const data = await res.json();
    if (!res.ok || !data.refresh_token) throw new Error(data.error_description || data.error || `status ${res.status}`);
    return data.refresh_token;
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url, REDIRECT);
    if (url.pathname !== '/callback') { res.writeHead(404).end(); return; }

    let message;
    let failed = false;
    try {
        if (url.searchParams.get('state') !== state) throw new Error('state did not match');
        if (url.searchParams.get('error')) throw new Error(url.searchParams.get('error'));
        const refreshToken = await exchange(url.searchParams.get('code'));
        writeFileSync(new URL('.env.local', import.meta.url),
            `SPOTIFY_CLIENT_ID=${clientId}\nSPOTIFY_CLIENT_SECRET=${clientSecret}\nSPOTIFY_REFRESH_TOKEN=${refreshToken}\n`);
        message = 'Saved to spotify-api/.env.local. You can close this tab.';
    } catch (error) {
        message = `Failed: ${error.message}`;
        failed = true;
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end(message);
    console.log(message);
    server.close();
    process.exitCode = failed ? 1 : 0;
});

server.listen(8888, '127.0.0.1', () => {
    console.log(`\nIf a browser doesn't open, go here:\n${login}\n`);
    if (!process.env.NO_BROWSER) exec(`start "" "${login.replace(/&/g, '^&')}"`, { shell: 'cmd.exe' });
});
