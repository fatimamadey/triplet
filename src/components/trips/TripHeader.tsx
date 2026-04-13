"use client";

import { Trip } from "@/lib/types";
import { MapPin, Calendar, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TripHeader({ trip }: { trip: Trip }) {
  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-4 transition-colors text-sm"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      {/* Header card with image */}
      <div className="pinned-card pin-red overflow-hidden">
        {trip.image_url && (
          <div className="h-40 overflow-hidden">
            <img
              src={trip.image_url}
              alt={trip.destination}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-5 pt-6">
          <h1 className="text-2xl font-bold text-foreground">{trip.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {trip.destination}
              {trip.country && `, ${trip.country}`}
            </span>
            {trip.start_date && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(trip.start_date)}
                {trip.end_date && ` — ${formatDate(trip.end_date)}`}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={14} />
              {trip.num_travelers} traveler{trip.num_travelers !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
