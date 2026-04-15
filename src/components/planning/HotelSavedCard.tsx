"use client";

import { Hotel } from "@/lib/types";
import { Hotel as HotelIcon, Trash2, Star } from "lucide-react";

interface HotelSavedCardProps {
  hotel: Hotel;
  onRemove: (hotelId: string) => void;
}

export default function HotelSavedCard({
  hotel,
  onRemove,
}: HotelSavedCardProps) {
  const nights =
    hotel.check_in && hotel.check_out
      ? Math.max(
          1,
          Math.ceil(
            (new Date(hotel.check_out + "T00:00:00").getTime() -
              new Date(hotel.check_in + "T00:00:00").getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  return (
    <div className="pinned-card pin-green p-4 pt-6 group">
      <div className="flex items-start gap-3">
        {hotel.image_url ? (
          <img
            src={hotel.image_url}
            alt={hotel.name}
            className="w-16 h-16 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded bg-cream-dark flex items-center justify-center flex-shrink-0">
            <HotelIcon size={20} className="text-muted" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate">{hotel.name}</h4>
          {hotel.rating && (
            <span className="flex items-center gap-0.5 text-xs mt-0.5">
              <Star size={12} className="text-sunshine fill-sunshine" />
              {Number(hotel.rating).toFixed(1)}
            </span>
          )}
          <div className="text-xs text-muted mt-1">
            {hotel.check_in && hotel.check_out && (
              <span>
                {new Date(hotel.check_in + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" — "}
                {new Date(hotel.check_out + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {nights && ` · ${nights} night${nights > 1 ? "s" : ""}`}
              </span>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {hotel.total_price && (
            <p className="font-bold text-lg">${Number(hotel.total_price).toFixed(0)}</p>
          )}
          {hotel.price_per_night && (
            <p className="text-xs text-muted">${Number(hotel.price_per_night).toFixed(0)}/night</p>
          )}
          <button
            onClick={() => onRemove(hotel.id)}
            className="opacity-0 group-hover:opacity-100 mt-1 p-1.5 rounded hover:bg-coral/10 text-muted hover:text-coral transition-all"
            title="Remove hotel"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
