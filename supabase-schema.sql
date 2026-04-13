-- Triplet Database Schema
-- Run this in the Supabase SQL Editor to create all tables

-- Trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  country TEXT,
  country_code TEXT,
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  num_travelers INTEGER DEFAULT 1,
  share_token TEXT UNIQUE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'ready')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_trips_clerk_user ON trips(clerk_user_id);
CREATE INDEX idx_trips_share_token ON trips(share_token);

-- Flights table
CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  airline TEXT,
  flight_number TEXT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_at TIMESTAMPTZ,
  arrival_at TIMESTAMPTZ,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  passengers INTEGER DEFAULT 1,
  booking_url TEXT,
  amadeus_offer_id TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_flights_trip ON flights(trip_id);

-- Hotels table
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  check_in DATE,
  check_out DATE,
  price_per_night NUMERIC(10,2),
  total_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  rooms INTEGER DEFAULT 1,
  rating NUMERIC(2,1),
  image_url TEXT,
  amadeus_hotel_id TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_hotels_trip ON hotels(trip_id);

-- Itinerary days table
CREATE TABLE itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_itin_days_trip ON itinerary_days(trip_id);
CREATE UNIQUE INDEX idx_itin_days_unique ON itinerary_days(trip_id, day_number);

-- Itinerary items table
CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'activity' CHECK (category IN ('restaurant', 'attraction', 'activity', 'transport', 'shopping', 'other')),
  start_time TIME,
  end_time TIME,
  estimated_cost NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  place_id TEXT,
  place_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_itin_items_day ON itinerary_items(day_id);
CREATE INDEX idx_itin_items_trip ON itinerary_items(trip_id);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX idx_favorites_unique ON favorites(clerk_user_id, trip_id);
CREATE INDEX idx_favorites_user ON favorites(clerk_user_id);
