"use client";

import Link from "next/link";
import { Trip } from "@/lib/types";
import { Calendar, Users, MapPin, Trash2 } from "lucide-react";
import { deleteTrip } from "@/lib/mutations";
import { toast } from "sonner";

const pinColors = ["pin-red", "pin-blue", "pin-green", "pin-yellow"];
const tilts = ["tilt-1", "tilt-2", "tilt-3", "tilt-4"];

export default function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const pinColor = pinColors[index % pinColors.length];
  const tilt = tilts[index % tilts.length];

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      await deleteTrip(trip.id);
      toast.success("Trip deleted");
    } catch {
      toast.error("Failed to delete trip");
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link href={`/trips/${trip.id}/planning`}>
      <div
        className={`pinned-card ${pinColor} ${tilt} p-4 pt-6 hover:shadow-lg transition-shadow cursor-pointer group`}
      >
        {/* Image */}
        {trip.image_url ? (
          <div className="polaroid mb-3">
            <img
              src={trip.image_url}
              alt={trip.destination}
              className="w-full h-32 object-cover"
            />
          </div>
        ) : (
          <div className="bg-cream-dark rounded h-32 mb-3 flex items-center justify-center">
            <MapPin size={32} className="text-muted" />
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-foreground text-lg mb-1 truncate">
          {trip.title}
        </h3>

        {/* Destination */}
        <div className="flex items-center gap-1 text-muted text-sm mb-2">
          <MapPin size={14} />
          <span>{trip.destination}</span>
          {trip.country_code && (
            <span className="text-xs bg-cream-dark px-1.5 py-0.5 rounded ml-1">
              {trip.country_code}
            </span>
          )}
        </div>

        {/* Dates & Travelers */}
        <div className="flex items-center gap-3 text-xs text-muted">
          {trip.start_date && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(trip.start_date)}
              {trip.end_date && ` - ${formatDate(trip.end_date)}`}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={12} />
            {trip.num_travelers}
          </span>
        </div>

        {/* Status badge */}
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`sticker text-xs ${
              trip.status === "ready"
                ? "text-leaf border-leaf"
                : "text-pin-blue border-pin-blue"
            }`}
          >
            {trip.status === "ready" ? "Ready" : "Planning"}
          </span>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-coral/10 text-muted hover:text-coral transition-all"
            title="Delete trip"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
}
