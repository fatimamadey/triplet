"use client";

import { FlightOffer } from "@/hooks/useFlights";
import { Plane, Clock, Plus } from "lucide-react";

interface FlightResultCardProps {
  offer: FlightOffer;
  onAdd: (offer: FlightOffer) => void;
  adding?: boolean;
}

function formatTime(dateStr: string): string {
  // SerpAPI returns "2023-10-03 15:10" format
  const parts = dateStr.split(" ");
  if (parts.length < 2) return dateStr;
  const [hours, mins] = parts[1].split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mins} ${ampm}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
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
            {offer.airlineLogo && (
              <img
                src={offer.airlineLogo}
                alt={offer.airline}
                className="w-6 h-6 object-contain"
              />
            )}
            <span className="text-sm font-bold">{offer.airline}</span>
            <span className="text-xs text-muted">{offer.flightNumber}</span>
            {offer.stops === 0 ? (
              <span className="text-xs text-pin-green font-medium">Nonstop</span>
            ) : (
              <span className="text-xs text-coral font-medium">
                {offer.stops} stop{offer.stops > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="text-center">
              <p className="font-bold">{formatTime(offer.departureAt)}</p>
              <p className="text-xs text-muted">{offer.origin}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-xs text-muted">
                {formatDuration(offer.totalDuration)}
              </span>
              <div className="w-full flex items-center gap-1 text-muted">
                <div className="flex-1 border-t border-dashed border-cork" />
                <Plane size={12} />
                <div className="flex-1 border-t border-dashed border-cork" />
              </div>
              {offer.layovers.length > 0 && (
                <span className="text-xs text-muted">
                  via {offer.layovers.map((l) => l.airport).join(", ")}
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold">{formatTime(offer.arrivalAt)}</p>
              <p className="text-xs text-muted">{offer.destination}</p>
            </div>
          </div>
        </div>

        {/* Price + Add button */}
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-foreground">
            ${offer.price}
          </p>
          <p className="text-xs text-muted mb-2">{offer.type}</p>
          <button
            onClick={() => onAdd(offer)}
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
