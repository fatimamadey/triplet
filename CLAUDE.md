# Triplet — Travel Planner & Itinerary Guide

## What This Is

A full-stack travel planner web app where users create trips, search real flights/hotels with prices, build day-by-day itineraries, track costs with currency conversion, and share trips with friends via public links. Built for a databases course assignment (MPCS).

**Live:** https://triplet-eta.vercel.app
**Repo:** https://github.com/fatimamadey/triplet

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript, `src/` directory) |
| Styling | Tailwind CSS 4 + custom bulletin board theme |
| Fonts | DM Sans (body) + Caveat (handwritten accents) |
| Auth | Clerk (`@clerk/nextjs`) — email/Google/Apple sign-in |
| Database | Supabase (PostgreSQL, accessed via service role key) |
| Storage | Supabase Storage (`trip-photos` bucket for user uploads) |
| State | SWR for server cache, React hooks for UI state |
| Icons | lucide-react |
| Toasts | sonner |
| Theme | next-themes (light/dark mode) |
| Deploy | Vercel (auto-deploy from GitHub main branch) |

## External APIs

| API | Purpose | Free Tier | Env Var |
|-----|---------|-----------|---------|
| SerpAPI Google Flights | Flight search with real prices | 100/month | `SERPAPI_API_KEY` |
| SerpAPI Google Hotels | Hotel + vacation rental search | Same key | Same |
| SerpAPI Google Local | Place search for itinerary | Same key | Same |
| REST Countries | Country/currency detection | Unlimited | None needed |
| Unsplash | Destination photos for trip cards | 50/hour | `UNSPLASH_ACCESS_KEY` |
| ExchangeRate-API | USD ↔ local currency conversion | 1500/month | `EXCHANGE_RATE_API_KEY` |

**Note:** We originally planned to use Amadeus (flights) and Foursquare (places) but both had signup/deprecation issues. SerpAPI handles all three search types with one key. Place search is optional to conserve credits — users can add activities manually.

---

## Database Schema (Supabase)

All tables use `clerk_user_id TEXT` for ownership scoping. No Supabase Auth — all access goes through Next.js API routes using the service role key with manual user ID filtering.

### Tables

**`trips`** (core) — id, clerk_user_id, title, destination, country, country_code, currency, image_url, start_date, end_date, num_travelers, share_token (unique), status ('planning'|'ready'|'completed'), created_at, updated_at

**`flights`** (transport) — id, trip_id (FK CASCADE), clerk_user_id, airline, flight_number, origin, destination, departure_at, arrival_at, price, currency, passengers, booking_url, transport_type ('flight'|'train'|'bus'|'driving'), notes, created_at

**`hotels`** — id, trip_id (FK CASCADE), clerk_user_id, name, address, check_in, check_out, price_per_night, total_price, currency, rooms, rating, image_url, created_at

**`itinerary_days`** — id, trip_id (FK CASCADE), day_number, date, notes. Unique on (trip_id, day_number).

**`itinerary_items`** — id, day_id (FK CASCADE), trip_id (FK CASCADE), sort_order, title, category ('restaurant'|'attraction'|'activity'|'transport'|'shopping'|'other'), start_time, end_time, estimated_cost, currency, notes, place_id, place_data (JSONB), created_at

**`favorites`** — id, clerk_user_id, trip_id (FK CASCADE). Unique on (clerk_user_id, trip_id).

### Storage
- **Bucket:** `trip-photos` (public) — user-uploaded trip header images

### Cost Tracking
Total cost = `SUM(flights.price) + SUM(hotels.total_price) + SUM(itinerary_items.estimated_cost)`. Computed on read via `/api/trips/[tripId]/costs`. Per-person = total / num_travelers.

---

## App Architecture

### Route Structure
```
src/app/
  layout.tsx              — ClerkProvider, ThemeProvider, DM Sans font
  page.tsx                — Landing page (redirects to /dashboard if signed in)
  globals.css             — Bulletin board theme, dark mode, custom components

  (auth)/
    sign-in/[[...sign-in]]/  — Clerk SignIn
    sign-up/[[...sign-up]]/  — Clerk SignUp

  (app)/                  — Protected routes (top nav layout)
    layout.tsx            — TopNav + centered content container
    dashboard/            — Favorites + My Trips grid
    trips/new/            — Create trip form
    trips/[tripId]/
      layout.tsx          — Trip header + cost ticker + tab nav
      page.tsx            — Redirects to /planning
      planning/           — Transport search + hotel search
      itinerary/          — Day-by-day activity builder
      share/              — Generate shareable link

  share/[token]/          — PUBLIC read-only trip view (no auth needed)

  api/
    trips/                — CRUD
    trips/[tripId]/costs/ — Aggregated cost breakdown
    trips/[tripId]/flights/ — Transport CRUD
    trips/[tripId]/hotels/  — Hotel CRUD
    trips/[tripId]/itinerary/ — Days + items CRUD
    trips/[tripId]/share/   — Generate share token
    favorites/            — Favorites CRUD
    share/                — Public trip fetch by token
    search/flights/       — SerpAPI Google Flights proxy
    search/hotels/        — SerpAPI Google Hotels proxy
    search/places/        — SerpAPI Google Local proxy
    upload/               — Photo upload to Supabase Storage
    external/countries/   — REST Countries + city→country mapping
    external/unsplash/    — Unsplash image search
    external/exchange-rate/ — Currency conversion
```

### Auth & Middleware
- `src/middleware.ts` uses Clerk middleware to protect `/(app)/*` routes
- Public routes: `/`, `/sign-in`, `/sign-up`, `/share/*`, `/api/share*`
- All API routes validate Clerk session via `auth()` except public share endpoint

### State Management
- **SWR hooks** in `src/hooks/`: useTrips, useTrip, useTripCosts, useFlights, useHotels, useItinerary, useFavorites, useFlightSearch, useHotelSearch
- **Mutations** in `src/lib/mutations.ts`: create/update/delete trip, add/remove flight, add/remove hotel, generate days, add/remove itinerary item, generate share token, add/remove favorite
- All mutations call SWR `mutate()` to revalidate relevant caches (especially costs)

---

## Design System — Bulletin Board Aesthetic

### Theme
- **Light mode:** Warm beige cork background (#f0e8d8), cream paper cards (#fffef9)
- **Dark mode:** Deep brown background (#1c1814), dark paper cards (#2a241c)
- CSS custom properties in `:root` / `.dark`, mapped through `@theme inline` for Tailwind

### Custom Components (globals.css)
- `.pinned-card` — Paper cards with realistic 3D thumbtacks (radial gradients + shadows)
- `.pin-red/blue/green/yellow` — Thumbtack color variants
- `.tilt-1/2/3/4` — Slight card rotations for bulletin board feel
- `.polaroid` — Photo frame with thick bottom border
- `.washi-tape` — Decorative striped tape divider
- `.sticker` — Rotated badge with border (for status/category labels)
- `.sticky-note` — Yellow sticky note for empty states (uses Caveat font)
- `.section-header` — Handwritten section titles (Caveat, 1.5rem)
- `.sidebar-wood` — Wood grain texture via repeating gradients
- `.cork-bg` — Cork texture with noise SVG + warm light gradients

### Key Design Decisions
- DM Sans for body text (warm, rounded, not techy)
- Caveat for branding and section headers (handwritten personality)
- Top navigation bar instead of sidebar (more content space)
- Cards lift 2px on hover with enhanced shadow
- Paper-textured form inputs
- Dark mode uses `color-scheme: dark` for native form elements

---

## Build History & Key Decisions

### Phase 0-2: Foundation
- Scaffolded Next.js + Clerk + Supabase
- Created all 6 database tables via Supabase MCP
- Built trip CRUD, dashboard, cost ticker, tab navigation

### Phase 3: Flight Search — API Pivots
- **Planned:** Amadeus API → signup page was down
- **Tried:** AviationStack → only tracking, no prices
- **Tried:** Kiwi Tequila → signup also broken
- **Settled on:** SerpAPI Google Flights — real Google Flights prices, 100/month free

### Phase 4: Hotel Search
- Used SerpAPI Google Hotels (same key) — returns hotels + vacation rentals (Airbnb/VRBO)
- Hotel detail modal with image gallery, amenities, Google Maps link, booking URL

### Phase 5: Itinerary
- Day-by-day planner auto-generated from trip dates
- Activities with categories (restaurant, attraction, activity, transport, shopping, other)
- Place search via SerpAPI Google Local — made **optional** to save API credits

### Phase 6: Sharing + Favorites
- Share token generation (crypto.randomBytes)
- Public `/share/[token]` page with nav bar (Sign In/Sign Up for unauthenticated visitors)
- Favorites system — favorite from shared view or own trips
- **Bug fix:** Had to add `/api/share` to Clerk middleware public routes

### Phase 7: Polish + Currency
- ExchangeRate-API for USD ↔ local currency toggle in cost ticker
- City→country mapping (50+ cities) since REST Countries only knows country names
- Cost breakdown in ticker (transport/hotels/activities)

### Post-Phase Iterations (from user feedback + Playwright E2E audits)
- **Number input bug** — Changed from parseInt-on-change to string state
- **Multi-transport** — Added train/bus/driving options with manual entry, gas estimate for driving, notes field for booking links
- **Date timezone bug** — All date displays now append `T00:00:00` to prevent UTC shift
- **Dark mode** — Full light/dark support via next-themes + CSS custom properties
- **Trip editing** — Inline edit mode for title, destination, dates, travelers + photo upload to Supabase Storage
- **Navigation redesign** — Moved from sidebar to top header nav for more content space
- **Font change** — Geist (techy) → DM Sans (warm/rounded)
- **Design system** — Sticky note empty states, handwritten section headers, wood grain sidebar, card hover lift, paper-textured inputs

---

## Environment Variables (`.env.local`)

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# SerpAPI (flights, hotels, places — same key)
SERPAPI_API_KEY=...

# Unsplash
UNSPLASH_ACCESS_KEY=...

# Exchange Rate
EXCHANGE_RATE_API_KEY=...
```

All must also be set in Vercel dashboard for production deployment.

---

## Running Locally

```bash
cd triplet
npm install
# Fill in .env.local with your API keys
npm run dev
# Visit http://localhost:3000
```

## Key Files

- `src/lib/supabase.ts` — Lazy-initialized Supabase client (handles missing env at build time)
- `src/lib/auth.ts` — Clerk auth helpers for API routes
- `src/lib/amadeus.ts` — SerpAPI search functions (flights + hotels) despite the filename
- `src/lib/types.ts` — All TypeScript interfaces
- `src/lib/mutations.ts` — Client-side mutation functions with SWR revalidation
- `src/middleware.ts` — Clerk route protection (public routes listed explicitly)
- `src/app/globals.css` — Complete bulletin board design system
