"use client";

import { Flight } from "@/lib/types";
import { Plane, Trash2, Clock } from "lucide-react";

interface FlightSavedCardProps {
  flight: Flight;
  onRemove: (flightId: string) => void;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function FlightSavedCard({
  flight,
  onRemove,
}: FlightSavedCardProps) {
  return (
    <div className="pinned-card pin-blue p-4 pt-6 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Plane size={16} className="text-pin-blue" />
            <span className="font-bold text-sm">
              {flight.airline || "Flight"} {flight.flight_number || ""}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm mb-1">
            <span className="font-medium">{flight.origin}</span>
            <span className="text-muted">→</span>
            <span className="font-medium">{flight.destination}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted">
            {flight.departure_at && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDateTime(flight.departure_at)}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          {flight.price && (
            <p className="font-bold text-lg">
              ${Number(flight.price).toFixed(0)}
            </p>
          )}
          <button
            onClick={() => onRemove(flight.id)}
            className="opacity-0 group-hover:opacity-100 mt-1 p-1.5 rounded hover:bg-coral/10 text-muted hover:text-coral transition-all"
            title="Remove flight"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
