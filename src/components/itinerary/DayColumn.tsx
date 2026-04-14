"use client";

import { useState } from "react";
import { ItineraryDay } from "@/lib/types";
import ItineraryItemCard from "./ItineraryItemCard";
import AddItemModal from "./AddItemModal";
import { Plus, Calendar } from "lucide-react";

interface DayColumnProps {
  day: ItineraryDay;
  destination: string;
  onAddItem: (dayId: string, data: {
    title: string;
    category: string;
    start_time?: string;
    end_time?: string;
    estimated_cost?: number;
    notes?: string;
  }) => Promise<void>;
  onRemoveItem: (dayId: string, itemId: string) => void;
}

export default function DayColumn({
  day,
  destination,
  onAddItem,
  onRemoveItem,
}: DayColumnProps) {
  const [showModal, setShowModal] = useState(false);

  const dateLabel = day.date
    ? new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : `Day ${day.day_number}`;

  const dayTotal = (day.items || []).reduce(
    (sum, item) => sum + Number(item.estimated_cost || 0),
    0
  );

  return (
    <div className="pinned-card pin-yellow p-4 pt-6">
      {/* Day header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-pin-yellow" />
          <h3 className="font-bold text-sm">Day {day.day_number}</h3>
          <span className="text-xs text-muted">{dateLabel}</span>
        </div>
        {dayTotal > 0 && (
          <span className="text-xs font-medium text-teal">
            ${dayTotal.toFixed(0)}
          </span>
        )}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {(day.items || []).map((item) => (
          <ItineraryItemCard
            key={item.id}
            item={item}
            onRemove={(itemId) => onRemoveItem(day.id, itemId)}
          />
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-cork/50 rounded-lg text-muted hover:text-foreground hover:border-teal transition-colors text-xs font-medium"
      >
        <Plus size={14} />
        Add Activity
      </button>

      {/* Modal */}
      {showModal && (
        <AddItemModal
          dayLabel={`Day ${day.day_number} — ${dateLabel}`}
          destination={destination}
          onAdd={(data) => onAddItem(day.id, data)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
