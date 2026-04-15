"use client";

import { Trip } from "@/lib/types";
import { MapPin, Calendar, Users, ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import FavoriteButton from "@/components/share/FavoriteButton";
import { updateTrip } from "@/lib/mutations";
import { toast } from "sonner";
import { useState } from "react";

const statuses = [
  { value: "planning", label: "Planning", color: "text-pin-blue border-pin-blue" },
  { value: "ready", label: "Ready", color: "text-leaf border-leaf" },
  { value: "completed", label: "Completed", color: "text-pin-green border-pin-green" },
];

export default function TripHeader({ trip }: { trip: Trip }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const currentStatus = statuses.find((s) => s.value === trip.status) || statuses[0];

  async function handleStatusChange(newStatus: string) {
    setShowStatusMenu(false);
    try {
      await updateTrip(trip.id, { status: newStatus });
      toast.success(`Trip marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

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

      {/* Header card */}
      <div className="pinned-card pin-red">
        {/* Image with its own overflow clip */}
        {trip.image_url ? (
          <div className="h-40 overflow-hidden rounded-t-sm">
            <img
              src={trip.image_url}
              alt={trip.destination}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-teal/20 via-pin-blue/15 to-sunshine/20 rounded-t-sm" />
        )}
        <div className="p-5 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{trip.title}</h1>
                {/* Status toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className={`sticker text-xs ${currentStatus.color} !transform-none cursor-pointer flex items-center gap-1`}
                  >
                    {currentStatus.label}
                    <ChevronDown size={10} />
                  </button>
                  {showStatusMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                      <div className="absolute top-full left-0 mt-1 bg-paper border border-cork rounded-lg shadow-xl z-50 py-1 min-w-[130px]">
                        {statuses.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => handleStatusChange(s.value)}
                            className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-cream-dark transition-colors ${
                              s.value === trip.status ? "text-teal" : "text-foreground"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
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
            <FavoriteButton tripId={trip.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
