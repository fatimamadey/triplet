# Triplet - Travel Planner/Guide Web App

## Context

We're building **Triplet**, a travel planner and itinerary guide web app. The app has two main stages: **Planning** (search flights, hotels, track costs) and **Itinerary** (discover places and build day-by-day plans). Users can share itineraries via links and favorite trips. The UI uses a **vibrant bulletin board aesthetic** — cork board textures, pinned cards, warm earthy tones with colorful accents.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript, `src/` directory)
- **Styling:** Tailwind CSS 4 — vibrant bulletin board theme (cork textures, pinned cards, warm tones)
- **Auth:** Clerk (`@clerk/nextjs`)
- **Database:** Supabase (accessed via service role key from API routes)
- **State:** SWR for server state, React Context for trip-scoped UI state
- **Icons:** lucide-react
- **Toasts:** sonner
- **Charts:** recharts (cost breakdown)
- **Deploy:** Vercel
- **Repo:** GitHub → `triplet`

## External APIs

| API | Purpose | Auth |
|-----|---------|------|
| Amadeus Self-Service | Flights + Hotels | OAuth2 client credentials (free test env) |
| Foursquare Places | Restaurants, attractions, activities | API key (100k calls/mo free) |
| REST Countries | Country data, currency codes | None (free) |
| Unsplash | Destination images | Access key (free) |
| ExchangeRate-API | Currency conversion | API key (free tier) |

All API keys in `.env.local` — never hardcoded. External API calls proxied through Next.js API routes so keys stay server-side.

---

## Database Schema (Supabase)

All tables use `clerk_user_id TEXT` for ownership. No Supabase Auth — all access goes through API routes using the service role key with manual user filtering.

### Tables

**`trips`** — id (UUID PK), clerk_user_id, title, destination, country, country_code, currency, image_url, start_date, end_date, num_travelers (default 1), share_token (unique, nullable), status ('planning'|'ready'), created_at, updated_at

**`flights`** — id (UUID PK), trip_id (FK→trips CASCADE), clerk_user_id, airline, flight_number, origin (IATA), destination (IATA), departure_at, arrival_at, price, currency, passengers, booking_url, amadeus_offer_id, raw_data (JSONB), created_at

**`hotels`** — id (UUID PK), trip_id (FK→trips CASCADE), clerk_user_id, name, address, check_in, check_out, price_per_night, total_price, currency, rooms, rating, image_url, amadeus_hotel_id, raw_data (JSONB), created_at

**`itinerary_days`** — id (UUID PK), trip_id (FK→trips CASCADE), day_number, date, notes, created_at. Unique constraint on (trip_id, day_number).

**`itinerary_items`** — id (UUID PK), day_id (FK→itinerary_days CASCADE), trip_id (FK→trips CASCADE), sort_order, title, category ('restaurant'|'attraction'|'activity'|'transport'|'shopping'|'other'), start_time, end_time, estimated_cost, currency, notes, place_id (Foursquare ID), place_data (JSONB — cached name, rating, photo, address, lat/lng), created_at

**`favorites`** — id (UUID PK), clerk_user_id, trip_id (FK→trips CASCADE), created_at. Unique constraint on (clerk_user_id, trip_id).

### Cost Tracking
Total cost computed by aggregating: `SUM(flights.price) + SUM(hotels.total_price) + SUM(itinerary_items.estimated_cost)`. No denormalized column — data set per trip is small. Cost-per-person = grand total / num_travelers.

---

## App Routes

```
src/app/
  layout.tsx                          — ClerkProvider, fonts, Toaster, theme
  page.tsx                            — Landing page / redirect to dashboard
  globals.css                         — Tailwind + bulletin board theme styles

  (auth)/
    sign-in/[[...sign-in]]/page.tsx   — Clerk SignIn
    sign-up/[[...sign-up]]/page.tsx   — Clerk SignUp

  (app)/                              — Protected routes (sidebar layout)
    layout.tsx                        — Sidebar + auth guard
    dashboard/page.tsx                — My Trips grid + My Favorites grid

    trips/
      new/page.tsx                    — Create trip form
      [tripId]/
        layout.tsx                    — Trip header + CostTicker + tab nav + TripContext
        page.tsx                      — Redirect to planning or itinerary
        planning/page.tsx             — Flight search + Hotel search + saved items
        itinerary/page.tsx            — Day-by-day planner with place search
        share/page.tsx                — Generate/copy share link

  share/[token]/page.tsx              — PUBLIC read-only trip view + favorite button

  api/
    trips/route.ts                             — GET list, POST create
    trips/[tripId]/route.ts                    — GET, PATCH, DELETE
    trips/[tripId]/share/route.ts              — POST generate token, GET by token (public)
    trips/[tripId]/flights/route.ts            — GET, POST
    trips/[tripId]/flights/[flightId]/route.ts — PATCH, DELETE
    trips/[tripId]/hotels/route.ts             — GET, POST
    trips/[tripId]/hotels/[hotelId]/route.ts   — PATCH, DELETE
    trips/[tripId]/itinerary/route.ts          — GET all days+items, POST new day
    trips/[tripId]/itinerary/[dayId]/route.ts  — PATCH, DELETE day
    trips/[tripId]/itinerary/[dayId]/items/route.ts         — POST item
    trips/[tripId]/itinerary/[dayId]/items/[itemId]/route.ts — PATCH, DELETE
    trips/[tripId]/itinerary/[dayId]/items/reorder/route.ts  — PATCH batch reorder
    trips/[tripId]/costs/route.ts              — GET aggregated costs
    favorites/route.ts                         — GET, POST, DELETE
    search/flights/route.ts                    — Proxy → Amadeus
    search/hotels/route.ts                     — Proxy → Amadeus
    search/places/route.ts                     — Proxy → Foursquare
    external/countries/route.ts                — Proxy → REST Countries
    external/unsplash/route.ts                 — Proxy → Unsplash
    external/exchange-rate/route.ts            — Proxy → ExchangeRate-API
```

### Route Protection
- `middleware.ts` at project root: protect `/(app)/*`, allow `/(auth)/*`, `/share/*`, `/`, `/api/trips/*/share` (GET with token)
- All API routes validate Clerk session via `auth()` — return 401 if missing
- Exception: `GET /api/trips/[tripId]/share?token=xxx` is public

---

## Key Components

```
src/components/
  layout/    — Sidebar, PageContainer, TripLayout
  ui/        — Card, Modal, Badge, LoadingSpinner, EmptyState, CostTicker,
               SearchInput (debounced), DateRangePicker, CurrencyDisplay
  dashboard/ — TripCard, FavoriteTripCard
  trips/     — CreateTripForm, TripHeader, TripTabNav
  planning/  — FlightSearchForm, FlightResultCard, FlightSavedCard,
               HotelSearchForm, HotelResultCard, HotelSavedCard, PlanningCostSummary
  itinerary/ — DayColumn, ItineraryItemCard, AddItemModal,
               PlaceSearchResults, PlaceCard, DayNotes
  share/     — ShareSettings, SharedTripView, FavoriteButton
  cost/      — CostBreakdown (pie chart), CostPerPerson
```

### Bulletin Board Design Language
- **Background:** Cork board texture (CSS background or subtle pattern)
- **Cards:** White/cream cards with slight random rotations (1-3deg), drop shadows resembling pinned paper
- **Pins/tacks:** Colorful pin icons at top of cards (red, blue, green, yellow)
- **Typography:** Mix of clean sans-serif with occasional handwritten/marker-style accent fonts
- **Colors:** Warm base (cork brown, cream) with vibrant accents (teal, coral, sunshine yellow, leafy green)
- **Images:** Polaroid-style frames for destination photos
- **Tape:** Decorative washi tape elements for section dividers
- **Stickers/badges:** Category badges styled as travel stickers

---

## State Management

### SWR Hooks (`src/hooks/`)
- `useTrips`, `useTrip`, `useTripCosts`, `useFlights`, `useHotels`, `useItinerary`, `useFavorites`
- `useFlightSearch`, `useHotelSearch`, `usePlaceSearch` (conditional fetching)
- `useCountry`, `useExchangeRate`

### TripContext
Wraps `trips/[tripId]/layout.tsx`. Holds trip ID and provides `refreshCosts()` that calls SWR `mutate` on the costs endpoint. Avoids prop-drilling.

### Mutation Pattern
All writes → fetch API route → call `mutate()` on relevant SWR keys (especially always revalidate costs after any flight/hotel/item change).

---

## Lib Utilities (`src/lib/`)

- **`supabase.ts`** — `createClient(URL, SERVICE_ROLE_KEY)` server-only client
- **`auth.ts`** — `getAuthUserId()` wrapper around Clerk's `auth()`, `unauthorized()` response helper
- **`amadeus.ts`** — OAuth2 token caching + helpers for flight/hotel search
- **`types.ts`** — All TypeScript interfaces
- **`mutations.ts`** — Client-side mutation helpers that call API + trigger SWR revalidation
- **`utils.ts`** — Format currency, generate share tokens, etc.

---

## Build Phases

### Phase 0: Project Scaffolding
1. `npx create-next-app@latest triplet` (TypeScript, Tailwind, App Router, src/)
2. Install deps: `@clerk/nextjs @supabase/supabase-js swr lucide-react sonner recharts`
3. Set up `.env.local` with all API keys
4. Configure Clerk: ClerkProvider in root layout, middleware.ts, sign-in/sign-up pages
5. Configure Supabase: create client in `src/lib/supabase.ts`, run table creation SQL
6. Create `src/lib/auth.ts` helper
7. Build base layout: Sidebar, PageContainer
8. Create `(app)/layout.tsx` with sidebar, minimal dashboard page
9. **Verify:** sign up → sign in → see dashboard → sign out
10. Create GitHub repo `triplet`, initial commit + push

### Phase 1: Trip CRUD + Dashboard
1. Create `src/lib/types.ts` with all interfaces
2. Build trip API routes (list, create, get, update, delete)
3. Build `useTrips`, `useTrip` hooks
4. Build CreateTripForm + `/trips/new` page
5. Build TripCard + dashboard grid
6. Wire up Unsplash proxy for destination images
7. Wire up REST Countries proxy for auto-detecting country/currency
8. **Git push**

### Phase 2: Trip Detail Layout + Cost Ticker
1. Build trip detail layout with TripHeader, CostTicker, TripTabNav
2. Build TripContext provider
3. Build `/api/trips/[tripId]/costs` aggregation endpoint
4. Build `useTripCosts` hook + CostTicker component (always visible)
5. Create placeholder pages for planning, itinerary, share tabs
6. **Git push**

### Phase 3: Planning — Flights
1. Build `src/lib/amadeus.ts` (OAuth token management)
2. Build flight search proxy route + flight CRUD routes
3. Build `useFlightSearch`, `useFlights` hooks
4. Build FlightSearchForm, FlightResultCard, FlightSavedCard
5. Wire into planning page — search, view results, save to trip
6. Verify CostTicker updates on add/remove
7. **Git push**

### Phase 4: Planning — Hotels
1. Build hotel search proxy route + hotel CRUD routes
2. Build `useHotelSearch`, `useHotels` hooks
3. Build HotelSearchForm, HotelResultCard, HotelSavedCard
4. Add hotels section to planning page
5. Build PlanningCostSummary (flights + hotels subtotals)
6. Verify CostTicker updates
7. **Git push**

### Phase 5: Itinerary — Day-by-Day Planning
1. Build itinerary API routes (days CRUD, items CRUD, reorder)
2. Build `useItinerary` hook
3. Build Foursquare places search proxy + `usePlaceSearch` hook
4. Build DayColumn, ItineraryItemCard, AddItemModal, PlaceSearchResults, PlaceCard
5. Auto-generate day columns from trip date range
6. Add activity flow: search place → fill form → save item
7. Support reordering and deletion
8. Verify CostTicker updates
9. **Git push**

### Phase 6: Sharing + Favorites
1. Build share token generation + public fetch endpoints
2. Build favorites CRUD endpoint + `useFavorites` hook
3. Build ShareSettings page (generate link, copy to clipboard)
4. Build `/share/[token]` public page with SharedTripView
5. Add FavoriteButton (works on shared view if logged in)
6. Add My Favorites section to dashboard
7. **Git push**

### Phase 7: Polish + Currency
1. Build exchange rate proxy + `useExchangeRate` hook
2. Build CurrencyDisplay component (local + home currency)
3. Build CostBreakdown chart (recharts pie chart)
4. Add loading skeletons, error states, empty states, toasts
5. Mobile responsiveness (collapsible sidebar)
6. Refine bulletin board aesthetic throughout
7. **Git push**

### Phase 8: Deploy
1. Push final code to GitHub
2. Connect repo to Vercel
3. Add all env vars in Vercel dashboard
4. Configure Clerk production redirect URLs
5. Test end-to-end in production
6. **Tag v1.0**

---

## Environment Variables (`.env.local`)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

AMADEUS_API_KEY=...
AMADEUS_API_SECRET=...

FOURSQUARE_API_KEY=...

UNSPLASH_ACCESS_KEY=...

EXCHANGE_RATE_API_KEY=...
```

---

## Verification

After each phase, verify by:
1. **Phase 0:** Sign up → sign in → see dashboard → sign out → redirect to sign-in
2. **Phase 1:** Create trip → see on dashboard → click into it → delete it
3. **Phase 2:** Open trip → see cost ticker at $0 → see tab navigation working
4. **Phase 3:** Search flights → see results → save one → cost ticker updates → remove it → cost updates
5. **Phase 4:** Same as flights but for hotels
6. **Phase 5:** Add days → search places → add items to days → reorder → costs update
7. **Phase 6:** Generate share link → open in incognito → see trip → log in → favorite it → see in dashboard favorites
8. **Phase 7:** Verify currency display, loading states, mobile layout, chart rendering
9. **Phase 8:** Full end-to-end on production Vercel URL
