"use client";

import { FlightOffer } from "@/hooks/useFlights";
import { Plane, Clock, ArrowRight, Plus } from "lucide-react";

interface FlightResultCardProps {
  offer: FlightOffer;
  onAdd: (offer: FlightOffer) => void;
  adding?: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const hours = match[1] || "0";
  const mins = match[2] || "0";
  return `${hours}h ${mins}m`;
}

export default function FlightResultCard({
  offer,
  onAdd,
  adding,
}: FlightResultCardProps) {
  return (
    <div className="bg-cream-dark rounded-lg p-4 border border-cork/50">
      <div className="flex items-center justify-between gap-4">
        {/* Flight info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold bg-pin-blue/10 text-pin-blue px-2 py-0.5 rounded">
              {offer.airline}
            </span>
            <span className="text-xs text-muted">{offer.flightNumber}</span>
            {offer.stops > 0 && (
              <span className="text-xs text-coral font-medium">
                {offer.stops} stop{offer.stops > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="text-center">
              <p className="font-bold">{formatTime(offer.departureAt)}</p>
              <p className="text-xs text-muted">{offer.origin}</p>
            </div>
            <div className="flex-1 flex items-center gap-1 text-muted">
              <div className="flex-1 border-t border-dashed border-cork" />
              <Plane size={14} />
              <div className="flex-1 border-t border-dashed border-cork" />
            </div>
            <div className="text-center">
              <p className="font-bold">{formatTime(offer.arrivalAt)}</p>
              <p className="text-xs text-muted">{offer.destination}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-1 text-xs text-muted">
            <Clock size={12} />
            {formatDuration(offer.duration)}
          </div>

          {offer.returnItinerary && (
            <div className="mt-2 pt-2 border-t border-cork/30">
              <p className="text-xs text-muted mb-1">Return</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{offer.destination}</span>
                <ArrowRight size={12} className="text-muted" />
                <span className="font-medium">{offer.origin}</span>
                <span className="text-xs text-muted ml-1">
                  {formatDuration(offer.returnItinerary.duration)}
                  {offer.returnItinerary.stops > 0 &&
                    ` · ${offer.returnItinerary.stops} stop${offer.returnItinerary.stops > 1 ? "s" : ""}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Price + Add button */}
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-foreground">
            ${offer.price.toFixed(0)}
          </p>
          <p className="text-xs text-muted mb-2">{offer.currency}</p>
          <button
            onClick={() => onAdd(offer)}
            disabled={adding}
            className="flex items-center gap-1 px-3 py-1.5 bg-teal text-white rounded text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
