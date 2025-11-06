# AI Travel Planner – Architecture and Data Flow

## Overview
- Frontend: React (Vite), Tailwind, Framer Motion
- Auth: Google OAuth (implicit, client-side)
- Data: Firebase Firestore (trips), LocalStorage (session/profile), Service APIs for hotels/payment

## UI Structure
- `Client/src/main.jsx`: App bootstrap, `BrowserRouter`, `Toaster`, Google OAuth provider
- `Client/src/App.jsx`: Routes, page transitions, lazy loading; global `Header` and `Hero`
- `Client/src/components/custom/Header.jsx`: Top nav, login/logout, profile avatar
- `Client/src/components/custom/Hero.jsx`: Landing section shortcuts to key features
- Other feature screens loaded lazily: create trip, view trip, trips list, maps, recommendations, image analysis, booking

## Authentication Flow (Google OAuth)
- Trigger: Header Sign In button → `useGoogleLogin`
- On success: fetch profile from `https://www.googleapis.com/oauth2/v3/userinfo` with access token
- Storage (client-only):
  - `localStorage.authToken` = Google access token
  - `localStorage.googleProfile` = JSON string of Google profile
- Session updates: Header stores auth state in React state and listens to a custom `authChanged` event to refresh UI when login/logout happens
- Logout: removes both keys from LocalStorage and routes to `/`

### Where does user data go?
- No backend session is created. The Google access token and profile are kept in the browser only (LocalStorage).
- When saving trips, selected `userDetails` (from `googleProfile`) are embedded in each Firestore document.

### How to verify login data
1. Open the app in the browser, sign in.
2. Open DevTools → Application → Local Storage → origin:
   - Confirm keys: `authToken`, `googleProfile`
3. Network tab → filter "userinfo" to see profile fetch.

## Trip Data Flow (Firestore)
- Config: `Client/src/firebaseConfig.jsx` initializes Firebase app and exports `db`
- Save trip: `saveTripDetails(tripData, tripId)`
  - Reads `googleProfile` from LocalStorage and sets `tripData.userDetails`
  - Writes to Firestore: collection `trips`, document id = `tripId`
- Read trip: `getTripDetails(tripId)` fetches a single document
- List trips of user: `getUserTrips(userId)` where `userDetails.id == userId`

### How to verify trip data in Firebase
1. Ensure `.env` contains Firebase keys (`VITE_FIREBASE_*`), app is initialized
2. Go to Firebase Console → Firestore → collection `trips`
3. Find docs with fields including `userDetails` (id/email/name) and your trip payload

## Places/Maps and External APIs
- `Client/src/GlobalApi.jsx` uses Google Places API (`places:searchText`) via Axios
- Uses header `X-Goog-Api-Key` from `VITE_GOOGLE_API_KEY`
- Results include `places.photos`, `places.displayName`, `places.id`

## Production-Readiness Notes
- Client-only tokens are stored in LocalStorage (convenient but less secure). For production, consider a backend token exchange and httpOnly cookies.
- Restrict Google API keys by domain and API scopes
- Do not commit secrets; keep keys in `.env` files and CI secrets

## UI/Performance Enhancements Added
- Framer Motion animations for header, hero, cards
- Page transitions between routes with `AnimatePresence`
- Route-level code splitting via `React.lazy` + `Suspense`
- Tailwind theme tokens already present (`tailwind.config.js`, `index.css`)

## Operational Checks
- Login state: check `localStorage` and Header avatar
- Trips in Firestore: Firebase Console → `trips`
- Google Places: Network tab calls to `places.googleapis.com` succeed with 200
- Environment: verify `VITE_GOOGLE_AUTH_CLIENT_ID`, `VITE_GOOGLE_API_KEY`, and `VITE_FIREBASE_*` present

## Key Files
- `Client/src/components/custom/Header.jsx` – login/logout, profile, nav
- `Client/src/firebaseConfig.jsx` – Firebase init and trip helpers
- `Client/src/GlobalApi.jsx` – Google Places client
- `Client/src/App.jsx` – animated routing and lazy loading
- `Client/src/components/custom/Hero.jsx` – animated landing UI


