# Hanami

**Hanami** is a small **photo-sharing style** social feed app built with **Angular 16**. The name nods to cherry-blossom season in Japan—sharing moments with friends. Demo data stars familiar **anime-inspired characters** (fan tribute; not affiliated with any franchise).

The app uses **JSON Server** as a fake REST API backed by `db.json`, so you can run everything locally without a real backend.

## Features

- **Authentication**: register and log in; main routes are protected with an `authGuard`.
- **Home feed**: stories strip, searchable posts, likes, comments, and follow suggestions.
- **Explore**: grid of posts with discovery search.
- **Create post**: caption and image URL form.
- **Profile**: your profile or `/profile/:username`, stats, follow / unfollow, post grid.
- **Theme**: light / dark toggle (persisted via `ThemeService`, key `hanami-theme`).
- **Icons**: [Iconify](https://iconify.design/) via the `<iconify-icon>` web component (Material Design Icons in templates).
- **UI**: natural, flat palette (warm neutrals, forest green and terracotta accents) and **Plus Jakarta Sans** (Google Fonts in `src/index.html`).

## Prerequisites

- **Node.js** (LTS recommended) and **npm**

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the API** (must be running before you use the app; the dev client uses `http://localhost:3000` from `src/environments/environment.ts`)

   ```bash
   npm run server
   ```

3. **Start the Angular app** (in another terminal)

   ```bash
   npm start
   ```

   Open **http://localhost:4200/**. You will be redirected to `/login` until you sign in.

### Demo accounts

Users and posts live in `db.json` (anime-themed personas). Example logins (email / password):

| Email | Password |
|-------|----------|
| `luffy@example.com` | `pirateking` |
| `goku@example.com` | `kamehameha` |
| `naruto@example.com` | `ramen4life` |

Registering through the UI adds new users to the database file while JSON Server is running.

## NPM scripts

| Script | Description |
|--------|-------------|
| `npm start` | Dev server (`ng serve`) at port 4200 |
| `npm run build` | Production build (`ng build`; optional `API_BASE_URL` overwrites prod API URL — see below) |
| `npm run watch` | Development build in watch mode |
| `npm test` | Unit tests (Karma + Jasmine) |
| `npm run server` | JSON Server watching `db.json` on port 3000 (localhost only) |
| `npm run server:prod` | JSON Server for deployment: listens on **`0.0.0.0`**, uses **`PORT`** (default 3000), enables **CORS** for your web app origin |

## Configuration

- **API base URL**: `src/environments/environment.ts` (development) and `environment.prod.ts` (production builds). `src/app/core/api.config.ts` re-exports this as `API_BASE_URL`.
- **CI / production builds**: Set environment variable **`API_BASE_URL`** to your public API origin (no trailing slash), e.g. `https://api.example.com`. The `npm run build` script runs `scripts/write-env-prod.cjs` first; if `API_BASE_URL` is set, it rewrites `environment.prod.ts` before `ng build`.
- **Angular project**: `hanami` in `angular.json` (build output `dist/hanami`).

## Deploying (practical path: JSON Server + static Angular)

Use the **same stack as local dev**: run **JSON Server** as a **long-lived web process** (not serverless). The browser loads a **static build** from `dist/hanami` with the API origin baked in via **`API_BASE_URL`**.

**Caveats**

- Free PaaS disks are often **ephemeral**: sign-ups and new posts may disappear after a restart or redeploy unless you attach a **persistent disk** or move to a real database.
- **Cold starts**: free-tier APIs may spin down after idle; the first request can take ~30–60s.

### Option 1 — Render (recommended, one repo, two services)

This repo includes [`render.yaml`](render.yaml): a **Node** web service for the API and a **static site** for the Angular app.

1. Push the project to **GitHub** (or GitLab / Bitbucket supported by Render).
2. In the [Render dashboard](https://dashboard.render.com/), choose **New → Blueprint**. Connect the repo and select the branch that contains `render.yaml`.
3. Apply the blueprint. Render creates:
   - **`hanami-api`**: build `npm ci`, start `npm run server:prod`, default URL `https://hanami-api.onrender.com`.
   - **`hanami-web`**: build `npm ci && npm run build` with `API_BASE_URL=https://hanami-api.onrender.com`, publishes `./dist/hanami` with a SPA rewrite to `index.html`.
4. Wait for both deploys to finish. Open the **hanami-web** URL (e.g. `https://hanami-web.onrender.com`). If the UI cannot reach the API, open **hanami-api → Logs** and confirm it is listening; then in **hanami-web → Environment**, set **`API_BASE_URL`** to the **exact** API URL shown in the dashboard (no trailing slash), and trigger **Manual Deploy → Clear build cache & deploy**.
5. If you **rename** `hanami-api`, update **`API_BASE_URL`** on `hanami-web` to match the new public API origin and redeploy the static site.

**Seeing JSON Server’s endpoint list instead of the Angular UI?** That page is served by **hanami-api** (the fake REST API). The app UI lives on the **static site**: open **`hanami-web`** in the dashboard and use **its** URL (e.g. `https://hanami-web.onrender.com`), not the API URL. The two services always have **different** `.onrender.com` addresses.

### Option 2 — Manual (no Blueprint)

On any host that runs Node (no container required):

1. Create a **Web Service** with **Node**, root directory = repo root, **build** `npm ci`, **start** `npm run server:prod`. Save the HTTPS API origin.
2. On your machine or in CI, set **`API_BASE_URL`** to that API origin (no trailing slash), run **`npm ci`** and **`npm run build`**, then deploy **`dist/hanami`** to static hosting (Netlify, Cloudflare Pages, S3, etc.). Configure **SPA fallback** so every path serves **`index.html`** (so `/login`, `/home`, etc. work on refresh).

### Verify a production build locally

```bash
# Terminal 1 — API (no env var needed)
npm run server:prod

# Terminal 2 — bake API URL into the bundle, then serve static files
API_BASE_URL=http://127.0.0.1:3000 npm run build
npx --yes serve dist/hanami -p 8080
```

Open `http://127.0.0.1:8080` and exercise login and feed.

### When you outgrow JSON Server

| Option | Why |
|--------|-----|
| **[Supabase](https://supabase.com/)** | Postgres + auth; you’d point Angular services at Supabase instead of this REST shape. |
| **[Firestore](https://firebase.google.com/docs/firestore)** | Hosted documents + Google auth. |
| **Custom Express + DB** | Production-standard control and migrations. |

## Project layout (high level)

```
src/app/
  components/     # login, register, home, explore, create-post, profile
  core/           # API config
  guards/         # auth guard
  services/       # auth, users, posts, follows, theme
  pipes/          # e.g. relative time
db.json           # JSON Server data (demo users & posts)
render.yaml       # Render Blueprint (API web service + static site)
```

## Build

```bash
npm run build
```

Output goes to `dist/hanami/`.

## Tests

```bash
npm test
```

End-to-end tests are not wired up in this repo.

## Tech stack

- [Angular](https://angular.io/) 16  
- [JSON Server](https://github.com/typicode/json-server)  
- [Iconify Icon web component](https://www.npmjs.com/package/iconify-icon)  
- [RxJS](https://rxjs.dev/)

## Further reading

- [Angular CLI documentation](https://angular.io/cli)
