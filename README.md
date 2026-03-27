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
| `npm run build` | Production build (`ng build`) |
| `npm run watch` | Development build in watch mode |
| `npm test` | Unit tests (Karma + Jasmine) |
| `npm run server` | JSON Server watching `db.json` on port 3000 |

## Configuration

- **API base URL**: `src/environments/environment.ts` (development) and `environment.prod.ts` (production builds). `src/app/core/api.config.ts` re-exports this as `API_BASE_URL`.
- **Angular project**: `hanami` in `angular.json` (build output `dist/hanami`).

### Production build locally

```bash
# Terminal 1
npm run server

# Terminal 2
npm run build
npx --yes serve dist/hanami -p 8080
```

Open `http://127.0.0.1:8080` and exercise login and feed. Adjust `apiUrl` in `src/environments/environment.prod.ts` if your API is not on `http://localhost:3000`.

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
