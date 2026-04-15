"use client";

import { HotelResult } from "@/hooks/useHotels";
import { X, Star, MapPin, Clock, Plus, ExternalLink, Wifi, Car } from "lucide-react";
import { useState } from "react";

interface HotelDetailModalProps {
  hotel: HotelResult;
  checkIn: string;
  checkOut: string;
  onAdd: (hotel: HotelResult) => void;
  onClose: () => void;
  adding?: boolean;
}

export default function HotelDetailModal({
  hotel,
  checkIn,
  checkOut,
  onAdd,
  onClose,
  adding,
}: HotelDetailModalProps) {
  const [currentImage, setCurrentImage] = useState(0);

  const nights =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  const images = hotel.images.length > 0 ? hotel.images : hotel.image ? [hotel.image] : [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-paper rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-paper z-10 flex items-center justify-between p-4 border-b border-cork/30">
          <h3 className="font-bold text-lg text-foreground truncate pr-4">{hotel.name}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-cream-dark text-muted flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Image gallery */}
        {images.length > 0 && (
          <div className="relative">
            <img
              src={images[currentImage]}
              alt={hotel.name}
              className="w-full h-64 object-cover"
            />
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentImage ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Details */}
        <div className="p-5 space-y-4">
          {/* Type + Rating + Stars */}
          <div className="flex items-center gap-3 flex-wrap">
            {hotel.hotelClassLabel && (
              <span className="text-sm font-medium text-muted">{hotel.hotelClassLabel}</span>
            )}
            {hotel.rating && (
              <span className="flex items-center gap-1 text-sm">
                <Star size={14} className="text-sunshine fill-sunshine" />
                <span className="font-bold">{hotel.rating}</span>
                {hotel.reviews > 0 && (
                  <span className="text-muted">({hotel.reviews.toLocaleString()} reviews)</span>
                )}
              </span>
            )}
            <span className="text-xs bg-cream-dark px-2 py-0.5 rounded text-muted capitalize">
              {hotel.type}
            </span>
          </div>

          {/* Location */}
          {hotel.coordinates && (
            <div className="flex items-start gap-2 text-sm text-muted">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" />
              <div>
                <p>
                  {hotel.coordinates.latitude.toFixed(4)}, {hotel.coordinates.longitude.toFixed(4)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${hotel.coordinates.latitude},${hotel.coordinates.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pin-blue hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  View on Google Maps <ExternalLink size={10} />
                </a>
              </div>
            </div>
          )}

          {/* Check in/out times */}
          {(hotel.checkInTime || hotel.checkOutTime) && (
            <div className="flex items-center gap-4 text-sm text-muted">
              {hotel.checkInTime && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Check-in: {hotel.checkInTime}
                </span>
              )}
              {hotel.checkOutTime && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Check-out: {hotel.checkOutTime}
                </span>
              )}
            </div>
          )}

          {/* Amenities */}
          {hotel.amenities.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-1.5">
                {hotel.amenities.map((a) => (
                  <span
                    key={a}
                    className="text-xs bg-cream-dark px-2 py-1 rounded text-foreground"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-cream-dark rounded-lg p-4">
            <div className="flex items-end justify-between">
              <div>
                {hotel.pricePerNight && (
                  <p className="text-2xl font-bold">
                    ${hotel.pricePerNight}
                    <span className="text-sm text-muted font-normal">/night</span>
                  </p>
                )}
                {hotel.totalPrice && nights && (
                  <p className="text-sm text-muted mt-1">
                    ${hotel.totalPrice} total for {nights} night{nights > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <button
                onClick={() => onAdd(hotel)}
                disabled={adding}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Plus size={16} />
                {adding ? "Adding..." : "Add to Trip"}
              </button>
            </div>
          </div>

          {/* External link */}
          {hotel.link && (
            <a
              href={hotel.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-pin-blue hover:underline"
            >
              View on booking site <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
