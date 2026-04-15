"use client";

import { useParams } from "next/navigation";
import { Calendar, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useItinerary } from "@/hooks/useItinerary";
import { useTrip } from "@/hooks/useTrips";
import DayColumn from "@/components/itinerary/DayColumn";
import { generateDays, addItineraryItem, removeItineraryItem } from "@/lib/mutations";
import { useState } from "react";

export default function ItineraryPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { days, isLoading, mutate } = useItinerary(tripId);
  const { trip } = useTrip(tripId);
  const [generating, setGenerating] = useState(false);

  async function handleGenerateDays() {
    setGenerating(true);
    try {
      await generateDays(tripId);
      toast.success("Days generated from trip dates!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate days");
    } finally {
      setGenerating(false);
    }
  }

  async function handleAddItem(dayId: string, data: {
    title: string;
    category: string;
    start_time?: string;
    end_time?: string;
    estimated_cost?: number;
    notes?: string;
  }) {
    try {
      await addItineraryItem(tripId, dayId, data);
      toast.success("Activity added!");
    } catch {
      toast.error("Failed to add activity");
      throw new Error("Failed");
    }
  }

  async function handleRemoveItem(dayId: string, itemId: string) {
    try {
      await removeItineraryItem(tripId, dayId, itemId);
      toast.success("Activity removed");
    } catch {
      toast.error("Failed to remove activity");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  // No days yet — show generate prompt
  if (days.length === 0) {
    return (
      <div className="sticky-note max-w-md mx-auto text-center rounded-sm">
        <Calendar size={48} className="mx-auto text-muted/50 mb-4" />
        <h2 className="text-2xl mb-2">No itinerary yet!</h2>
        <p className="text-lg text-muted mb-6">
          Let&apos;s plan some adventures...
        </p>
        <button
          onClick={handleGenerateDays}
          disabled={generating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {generating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Calendar size={18} />
          )}
          Generate Days
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header flex items-center gap-2">
          <Calendar size={20} className="text-pin-yellow" />
          Day-by-Day Itinerary
        </h2>
        <button
          onClick={handleGenerateDays}
          disabled={generating}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground border border-cork rounded hover:border-teal transition-colors disabled:opacity-50"
          title="Regenerate days from trip dates (clears existing)"
        >
          <RefreshCw size={12} />
          Regenerate
        </button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {days.map((day) => (
          <DayColumn
            key={day.id}
            day={day}
            destination={trip?.destination || ""}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />
        ))}
      </div>
    </div>
  );
}
