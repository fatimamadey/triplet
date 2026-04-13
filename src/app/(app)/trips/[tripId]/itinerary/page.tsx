"use client";

import { Calendar } from "lucide-react";

export default function ItineraryPage() {
  return (
    <div className="pinned-card pin-yellow p-6 pt-8">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} className="text-pin-yellow" />
        <h2 className="text-lg font-bold">Day-by-Day Itinerary</h2>
      </div>
      <p className="text-muted text-sm">
        Itinerary builder coming soon. You&apos;ll be able to plan activities for each day here.
      </p>
    </div>
  );
}
