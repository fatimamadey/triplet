"use client";

import { useState } from "react";
import { useTripCosts } from "@/hooks/useTripCosts";
import { useTrip } from "@/hooks/useTrips";
import useSWR from "swr";
import { DollarSign, Users, ArrowRightLeft, Route, Hotel, MapPin } from "lucide-react";

function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

const fetcher = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : null));

export default function CostTicker({ tripId }: { tripId: string }) {
  const { costs, isLoading } = useTripCosts(tripId);
  const { trip } = useTrip(tripId);
  const [showLocal, setShowLocal] = useState(false);

  const tripCurrency = trip?.currency || "USD";
  const canConvert = tripCurrency !== "USD";

  const { data: rateData } = useSWR(
    canConvert && showLocal
      ? `/api/external/exchange-rate?from=USD&to=${tripCurrency}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (isLoading || !costs) {
    return (
      <div className="bg-paper border-2 border-cork rounded-lg px-4 py-3 animate-pulse">
        <div className="h-6 bg-cream-dark rounded w-32" />
      </div>
    );
  }

  const rate = rateData?.rate || null;
  const displayCurrency = showLocal && rate ? tripCurrency : "USD";
  const multiplier = showLocal && rate ? rate : 1;

  return (
    <div className="bg-paper border-2 border-cork rounded-lg px-4 py-3">
      <div className="flex items-center gap-6 flex-wrap">
        {/* Grand total */}
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-teal" />
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Total</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(costs.grandTotal * multiplier, displayCurrency)}
            </p>
          </div>
        </div>

        {/* Per person */}
        <div className="flex items-center gap-2">
          <Users size={18} className="text-pin-blue" />
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Per Person</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(costs.perPerson * multiplier, displayCurrency)}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-8 bg-cork" />

        {/* Mini breakdown */}
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-muted" title="Transport">
            <Route size={14} />
            {formatCurrency(costs.flights.total * multiplier, displayCurrency)}
          </span>
          <span className="flex items-center gap-1 text-muted" title="Hotels">
            <Hotel size={14} />
            {formatCurrency(costs.hotels.total * multiplier, displayCurrency)}
          </span>
          <span className="flex items-center gap-1 text-muted" title="Activities">
            <MapPin size={14} />
            {formatCurrency(costs.activities.total * multiplier, displayCurrency)}
          </span>
        </div>

        {/* Currency toggle */}
        {canConvert && (
          <>
            <div className="hidden sm:block w-px h-8 bg-cork" />
            <button
              onClick={() => setShowLocal(!showLocal)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showLocal
                  ? "bg-teal text-white"
                  : "bg-cream-dark text-muted hover:text-foreground border border-cork"
              }`}
            >
              <ArrowRightLeft size={12} />
              {showLocal ? tripCurrency : `→ ${tripCurrency}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
