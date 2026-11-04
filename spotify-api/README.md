The server behind the Spotify section on the about page and the "listening to" row on the homepage.

GitHub Pages can't keep a secret, so this runs on Vercel and only hands out song names, artist names, links and covers.

Your Spotify account needs Premium for this, Spotify requires it for every Development Mode app.

1. Make an app at https://developer.spotify.com/dashboard with `http://127.0.0.1:8888/callback` as the redirect URI and Web API ticked
2. From this folder, run `node get-token.mjs` and approve it in the browser. The three secrets end up in `.env.local`, which git ignores
3. From this folder, run `npx vercel link`, then add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and `SPOTIFY_REFRESH_TOKEN` from `.env.local` under Settings, Environment Variables, then run `npx vercel --prod`
4. Put the URL it gives you, plus `/api/spotify`, into `API` at the top of `js/spotify.js`

Turning on a private session in Spotify hides what you're playing from the site.
