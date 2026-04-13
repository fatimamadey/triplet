"use client";

import { useTripCosts } from "@/hooks/useTripCosts";
import { DollarSign, Users, Plane, Hotel, MapPin } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CostTicker({ tripId }: { tripId: string }) {
  const { costs, isLoading } = useTripCosts(tripId);

  if (isLoading || !costs) {
    return (
      <div className="bg-paper border-2 border-cork rounded-lg px-4 py-3 animate-pulse">
        <div className="h-6 bg-cream-dark rounded w-32" />
      </div>
    );
  }

  return (
    <div className="bg-paper border-2 border-cork rounded-lg px-4 py-3">
      <div className="flex items-center gap-6 flex-wrap">
        {/* Grand total */}
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-teal" />
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Total</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(costs.grandTotal)}
            </p>
          </div>
        </div>

        {/* Per person */}
        <div className="flex items-center gap-2">
          <Users size={18} className="text-pin-blue" />
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Per Person</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(costs.perPerson)}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-8 bg-cork" />

        {/* Breakdown */}
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-muted">
            <Plane size={14} />
            {formatCurrency(costs.flights.total)}
          </span>
          <span className="flex items-center gap-1 text-muted">
            <Hotel size={14} />
            {formatCurrency(costs.hotels.total)}
          </span>
          <span className="flex items-center gap-1 text-muted">
            <MapPin size={14} />
            {formatCurrency(costs.activities.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
