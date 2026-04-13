"use client";

import { useParams } from "next/navigation";
import { useTrip } from "@/hooks/useTrips";
import TripHeader from "@/components/trips/TripHeader";
import TripTabNav from "@/components/trips/TripTabNav";
import CostTicker from "@/components/cost/CostTicker";
import { Loader2 } from "lucide-react";

export default function TripDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const tripId = params.tripId as string;
  const { trip, isLoading, isError } = useTrip(tripId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="pinned-card pin-red tilt-1 max-w-md mx-auto mt-8 p-6 text-center">
        <p className="text-coral font-medium">Trip not found or access denied.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TripHeader trip={trip} />

      {/* Cost ticker - always visible */}
      <CostTicker tripId={tripId} />

      {/* Tab navigation */}
      <TripTabNav tripId={tripId} />

      {/* Tab content */}
      <div>{children}</div>
    </div>
  );
}
