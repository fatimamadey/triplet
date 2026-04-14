"use client";

import { useTrips } from "@/hooks/useTrips";
import { useFavorites } from "@/hooks/useFavorites";
import TripCard from "./TripCard";
import { Map, PlusCircle, Loader2, Heart } from "lucide-react";
import Link from "next/link";

export default function TripGrid() {
  const { trips, isLoading: tripsLoading, isError: tripsError } = useTrips();
  const { favorites, isLoading: favsLoading } = useFavorites();

  if (tripsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  if (tripsError) {
    return (
      <div className="pinned-card pin-red tilt-1 max-w-md mx-auto mt-8 p-6 text-center">
        <p className="text-coral font-medium">Failed to load trips. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Favorites first */}
      {!favsLoading && favorites.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Heart size={22} className="text-coral" />
            Favorites
          </h2>
          <p className="text-muted text-sm mb-4">Trips you&apos;ve saved</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((fav, index) =>
              fav.trip ? (
                <TripCard
                  key={fav.id}
                  trip={fav.trip}
                  index={index}
                  isFavorite
                />
              ) : null
            )}
          </div>
        </div>
      )}

      {/* My Trips */}
      {trips.length === 0 ? (
        <div className="pinned-card pin-blue tilt-1 max-w-md mx-auto mt-8 p-8 text-center">
          <Map size={48} className="mx-auto text-muted mb-4" />
          <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
          <p className="text-muted mb-6">
            Create your first trip to start planning your adventure!
          </p>
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <PlusCircle size={18} />
            Create a Trip
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">My Trips</h2>
          <p className="text-muted text-sm mb-4">Your travel plans</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trips.map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
