"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Map, MapPin, Calendar, Users, Plane, Hotel,
  Clock, DollarSign, Loader2, Utensils, Camera,
  Bus, ShoppingBag, Circle, Star,
} from "lucide-react";
import FavoriteButton from "@/components/share/FavoriteButton";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface SharedTripData {
  trip: {
    id: string;
    title: string;
    destination: string;
    country: string | null;
    image_url: string | null;
    start_date: string | null;
    end_date: string | null;
    num_travelers: number;
  };
  flights: Array<{
    airline: string | null;
    flight_number: string | null;
    origin: string;
    destination: string;
    departure_at: string | null;
    price: number | null;
  }>;
  hotels: Array<{
    name: string;
    check_in: string | null;
    check_out: string | null;
    total_price: number | null;
    rating: number | null;
    image_url: string | null;
  }>;
  itinerary: Array<{
    day_number: number;
    date: string | null;
    items: Array<{
      title: string;
      category: string;
      start_time: string | null;
      estimated_cost: number;
    }>;
  }>;
  costs: {
    flights: number;
    hotels: number;
    activities: number;
    grandTotal: number;
    perPerson: number;
  };
}

const categoryIcons: Record<string, typeof MapPin> = {
  restaurant: Utensils, attraction: Camera, activity: MapPin,
  transport: Bus, shopping: ShoppingBag, other: Circle,
};

export default function SharedTripPage() {
  const params = useParams();
  const token = params.token as string;
  const { isSignedIn } = useAuth();
  const [data, setData] = useState<SharedTripData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`/api/share?token=${token}`);
        if (!res.ok) {
          setError("Trip not found or link is invalid.");
          return;
        }
        setData(await res.json());
      } catch {
        setError("Failed to load trip.");
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [token]);

  const navBar = (
    <nav className="bg-paper border-b border-cork/30 sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Map size={22} className="text-teal" />
          <span className="text-xl font-handwritten font-bold text-foreground">Triplet</span>
        </Link>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
              My Trips
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm text-muted hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up" className="px-4 py-1.5 bg-teal text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Sign Up to Save Trips
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen cork-bg">
        {navBar}
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen cork-bg">
        {navBar}
        <div className="flex items-center justify-center p-8">
          <div className="pinned-card pin-red p-8 text-center max-w-md">
            <Map size={48} className="mx-auto text-muted mb-4" />
            <h1 className="text-xl font-bold mb-2">Trip Not Found</h1>
            <p className="text-muted mb-4">{error || "This share link is invalid."}</p>
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-5 py-2 bg-teal text-white rounded-lg text-sm font-medium hover:opacity-90">
              Sign up to create your own trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { trip, flights, hotels, itinerary, costs } = data;

  const formatDate = (d: string | null) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <div className="min-h-screen cork-bg">
      {navBar}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="pinned-card pin-red overflow-hidden mb-6">
          {trip.image_url && (
            <div className="h-48 overflow-hidden">
              <img src={trip.image_url} alt={trip.destination} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6 pt-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{trip.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={14} />{trip.destination}{trip.country && `, ${trip.country}`}</span>
                  {trip.start_date && (
                    <span className="flex items-center gap-1"><Calendar size={14} />{formatDate(trip.start_date)}{trip.end_date && ` — ${formatDate(trip.end_date)}`}</span>
                  )}
                  <span className="flex items-center gap-1"><Users size={14} />{trip.num_travelers} traveler{trip.num_travelers !== 1 ? "s" : ""}</span>
                </div>
              </div>
              {isSignedIn && <FavoriteButton tripId={trip.id} />}
            </div>
          </div>
        </div>

        {/* Cost summary */}
        <div className="bg-paper border-2 border-cork rounded-lg px-4 py-3 mb-6">
          <div className="flex items-center gap-6 flex-wrap text-sm">
            <div><p className="text-xs text-muted uppercase">Total</p><p className="text-lg font-bold">${costs.grandTotal.toFixed(0)}</p></div>
            <div><p className="text-xs text-muted uppercase">Per Person</p><p className="text-lg font-bold">${costs.perPerson.toFixed(0)}</p></div>
            <div className="hidden sm:block w-px h-8 bg-cork" />
            <span className="flex items-center gap-1 text-muted"><Plane size={14} />${costs.flights.toFixed(0)}</span>
            <span className="flex items-center gap-1 text-muted"><Hotel size={14} />${costs.hotels.toFixed(0)}</span>
            <span className="flex items-center gap-1 text-muted"><MapPin size={14} />${costs.activities.toFixed(0)}</span>
          </div>
        </div>

        {/* Flights */}
        {flights.length > 0 && (
          <div className="pinned-card pin-blue p-5 pt-7 mb-6">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-3"><Plane size={18} className="text-pin-blue" />Flights</h2>
            <div className="space-y-2">
              {flights.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-cream-dark rounded p-3 text-sm">
                  <div>
                    <span className="font-medium">{f.airline} {f.flight_number}</span>
                    <span className="text-muted ml-2">{f.origin} → {f.destination}</span>
                  </div>
                  {f.price && <span className="font-bold">${Number(f.price).toFixed(0)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotels */}
        {hotels.length > 0 && (
          <div className="pinned-card pin-green p-5 pt-7 mb-6">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-3"><Hotel size={18} className="text-pin-green" />Hotels</h2>
            <div className="space-y-2">
              {hotels.map((h, i) => (
                <div key={i} className="flex items-center gap-3 bg-cream-dark rounded p-3">
                  {h.image_url && <img src={h.image_url} alt={h.name} className="w-12 h-12 rounded object-cover" />}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{h.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      {h.rating && <span className="flex items-center gap-0.5"><Star size={10} className="text-sunshine fill-sunshine" />{Number(h.rating).toFixed(1)}</span>}
                      {h.check_in && h.check_out && <span>{formatDate(h.check_in)} — {formatDate(h.check_out)}</span>}
                    </div>
                  </div>
                  {h.total_price && <span className="font-bold text-sm">${Number(h.total_price).toFixed(0)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        {itinerary.length > 0 && (
          <div className="pinned-card pin-yellow p-5 pt-7">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-4"><Calendar size={18} className="text-pin-yellow" />Itinerary</h2>
            <div className="space-y-4">
              {itinerary.map((day) => (
                <div key={day.day_number}>
                  <h3 className="font-bold text-sm mb-2">
                    Day {day.day_number}
                    {day.date && <span className="text-muted font-normal ml-2">
                      {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>}
                  </h3>
                  {(day.items || []).length === 0 ? (
                    <p className="text-xs text-muted">No activities planned</p>
                  ) : (
                    <div className="space-y-1.5">
                      {day.items.map((item, j) => {
                        const Icon = categoryIcons[item.category] || MapPin;
                        return (
                          <div key={j} className="flex items-center gap-3 bg-cream-dark rounded p-2.5 text-sm">
                            <Icon size={14} className="text-muted flex-shrink-0" />
                            <span className="flex-1 font-medium">{item.title}</span>
                            {item.start_time && <span className="text-xs text-muted flex items-center gap-1"><Clock size={10} />{item.start_time.slice(0, 5)}</span>}
                            {item.estimated_cost > 0 && <span className="text-xs text-muted flex items-center gap-1"><DollarSign size={10} />${Number(item.estimated_cost).toFixed(0)}</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
