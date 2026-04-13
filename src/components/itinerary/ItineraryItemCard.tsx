"use client";

import { ItineraryItem } from "@/lib/types";
import {
  Utensils,
  Camera,
  MapPin,
  Bus,
  ShoppingBag,
  Circle,
  Trash2,
  Clock,
  DollarSign,
} from "lucide-react";

const categoryIcons: Record<string, typeof MapPin> = {
  restaurant: Utensils,
  attraction: Camera,
  activity: MapPin,
  transport: Bus,
  shopping: ShoppingBag,
  other: Circle,
};

const categoryColors: Record<string, string> = {
  restaurant: "text-coral border-coral",
  attraction: "text-pin-blue border-pin-blue",
  activity: "text-teal border-teal",
  transport: "text-pin-yellow border-pin-yellow",
  shopping: "text-leaf border-leaf",
  other: "text-muted border-muted",
};

interface ItineraryItemCardProps {
  item: ItineraryItem;
  onRemove: (itemId: string) => void;
}

export default function ItineraryItemCard({
  item,
  onRemove,
}: ItineraryItemCardProps) {
  const Icon = categoryIcons[item.category] || MapPin;
  const colorClass = categoryColors[item.category] || categoryColors.other;

  return (
    <div className="flex items-start gap-3 bg-paper rounded-lg p-3 border border-cork/30 group">
      {/* Category icon */}
      <div className={`sticker ${colorClass} !transform-none`}>
        <Icon size={12} />
        {item.category}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{item.title}</h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted">
          {item.start_time && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {item.start_time.slice(0, 5)}
              {item.end_time && ` – ${item.end_time.slice(0, 5)}`}
            </span>
          )}
          {item.estimated_cost > 0 && (
            <span className="flex items-center gap-1">
              <DollarSign size={10} />
              ${Number(item.estimated_cost).toFixed(0)}
            </span>
          )}
        </div>
        {item.notes && (
          <p className="text-xs text-muted mt-1 truncate">{item.notes}</p>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-coral/10 text-muted hover:text-coral transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
