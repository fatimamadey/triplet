"use client";

import { Flight } from "@/lib/types";
import { Plane, TrainFront, Bus, Car, Trash2, Clock, ExternalLink } from "lucide-react";

const transportIcons = {
  flight: Plane,
  train: TrainFront,
  bus: Bus,
  driving: Car,
};

const transportColors = {
  flight: "text-pin-blue",
  train: "text-pin-green",
  bus: "text-pin-yellow",
  driving: "text-coral",
};

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
  const type = flight.transport_type || "flight";
  const Icon = transportIcons[type] || Plane;
  const color = transportColors[type] || "text-pin-blue";

  // Extract URL from notes if present
  const urlMatch = flight.notes?.match(/https?:\/\/[^\s]+/);

  return (
    <div className="pinned-card pin-blue p-4 pt-6 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={16} className={color} />
            <span className="font-bold text-sm">
              {flight.airline || type.charAt(0).toUpperCase() + type.slice(1)}{" "}
              {flight.flight_number || ""}
            </span>
            <span className="text-xs bg-cream-dark px-1.5 py-0.5 rounded text-muted capitalize">
              {type}
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

          {flight.notes && (
            <p className="text-xs text-muted mt-1.5 truncate">{flight.notes}</p>
          )}
          {urlMatch && (
            <a
              href={urlMatch[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-pin-blue hover:underline mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} />
              Booking Link
            </a>
          )}
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
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
