"use client";

import { HotelResult } from "@/hooks/useHotels";
import { Star, Plus, MapPin, ChevronRight } from "lucide-react";

interface HotelResultCardProps {
  hotel: HotelResult;
  checkIn: string;
  checkOut: string;
  onAdd: (hotel: HotelResult) => void;
  onViewDetails: (hotel: HotelResult) => void;
  adding?: boolean;
}

export default function HotelResultCard({
  hotel,
  checkIn,
  checkOut,
  onAdd,
  onViewDetails,
  adding,
}: HotelResultCardProps) {
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      ))
    : null;

  return (
    <div
      className="bg-cream-dark rounded-lg border border-cork/50 overflow-hidden flex cursor-pointer hover:border-teal/50 transition-colors"
      onClick={() => onViewDetails(hotel)}
    >
      {/* Image */}
      {hotel.image ? (
        <div className="w-32 sm:w-40 flex-shrink-0">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-32 sm:w-40 flex-shrink-0 bg-cork/20 flex items-center justify-center">
          <MapPin size={24} className="text-muted" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm leading-tight">{hotel.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                {hotel.hotelClassLabel && (
                  <span className="text-xs text-muted">{hotel.hotelClassLabel}</span>
                )}
                {hotel.rating && (
                  <span className="flex items-center gap-0.5 text-xs">
                    <Star size={12} className="text-sunshine fill-sunshine" />
                    <span className="font-medium">{hotel.rating}</span>
                    {hotel.reviews > 0 && (
                      <span className="text-muted">({hotel.reviews.toLocaleString()})</span>
                    )}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight size={16} className="text-muted flex-shrink-0 mt-1" />
          </div>

          {/* Amenities */}
          {hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {hotel.amenities.slice(0, 3).map((a) => (
                <span
                  key={a}
                  className="text-xs bg-paper px-1.5 py-0.5 rounded text-muted"
                >
                  {a}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="text-xs text-muted">
                  +{hotel.amenities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price + Add */}
        <div className="flex items-end justify-between mt-2">
          <div>
            {hotel.pricePerNight && (
              <p className="text-lg font-bold">${hotel.pricePerNight}<span className="text-xs text-muted font-normal">/night</span></p>
            )}
            {hotel.totalPrice && nights && (
              <p className="text-xs text-muted">
                ${hotel.totalPrice} total · {nights} night{nights > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(hotel); }}
            disabled={adding}
            className="flex items-center gap-1 px-3 py-1.5 bg-teal text-white rounded text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Plus size={14} />
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
