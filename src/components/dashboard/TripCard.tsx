"use client";

import Link from "next/link";
import { Trip } from "@/lib/types";
import { Calendar, Users, MapPin, Trash2, Heart, DollarSign } from "lucide-react";
import { deleteTrip, addFavorite, removeFavorite } from "@/lib/mutations";
import { useIsFavorited } from "@/hooks/useFavorites";
import { useTripCosts } from "@/hooks/useTripCosts";
import { toast } from "sonner";

const pinColors = ["pin-red", "pin-blue", "pin-green", "pin-yellow"];
const tilts = ["tilt-1", "tilt-2", "tilt-3", "tilt-4"];

export default function TripCard({
  trip,
  index,
  isFavorite,
}: {
  trip: Trip;
  index: number;
  isFavorite?: boolean;
}) {
  const pinColor = pinColors[index % pinColors.length];
  const tilt = tilts[index % tilts.length];
  const favorited = useIsFavorited(trip.id);
  const { costs } = useTripCosts(trip.id);

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

  async function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (favorited) {
        await removeFavorite(trip.id);
        toast.success("Removed from favorites");
      } else {
        await addFavorite(trip.id);
        toast.success("Added to favorites!");
      }
    } catch {
      toast.error("Failed to update favorite");
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    planning: { label: "Planning", className: "text-pin-blue border-pin-blue" },
    ready: { label: "Ready", className: "text-leaf border-leaf" },
    completed: { label: "Completed", className: "text-pin-green border-pin-green" },
  };

  const status = statusConfig[trip.status] || statusConfig.planning;

  return (
    <Link href={`/trips/${trip.id}/planning`}>
      <div
        className={`pinned-card ${pinColor} ${tilt} p-4 pt-6 hover:shadow-lg transition-shadow cursor-pointer group relative`}
      >
        {/* Hover actions - top right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-full shadow-sm ${
              favorited
                ? "bg-coral/10 text-coral"
                : "bg-paper text-muted hover:text-coral"
            }`}
            title={favorited ? "Unfavorite" : "Favorite"}
          >
            <Heart size={14} className={favorited ? "fill-coral" : ""} />
          </button>
          {!isFavorite && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-full bg-paper shadow-sm text-muted hover:text-coral"
              title="Delete trip"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

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
          <div className="rounded h-32 mb-3 flex items-center justify-center bg-gradient-to-br from-teal/20 via-pin-blue/15 to-sunshine/20">
            <MapPin size={32} className="text-teal/50" />
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

        {/* Cost + Status row */}
        <div className="mt-3 flex items-center justify-between">
          <span className={`sticker text-xs ${status.className}`}>
            {status.label}
          </span>
          <div className="flex items-center gap-2">
            {costs && costs.grandTotal > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-teal">
                <DollarSign size={12} />
                {costs.grandTotal.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
