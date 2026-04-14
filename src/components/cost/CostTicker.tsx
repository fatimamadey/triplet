"use client";

import { useTripCosts } from "@/hooks/useTripCosts";
import { useTrip } from "@/hooks/useTrips";
import useSWR from "swr";
import { DollarSign, Users, Plane, Hotel, MapPin, ArrowRightLeft } from "lucide-react";

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const fetcher = (url: string) => fetch(url).then((r) => r.ok ? r.json() : null);

export default function CostTicker({ tripId }: { tripId: string }) {
  const { costs, isLoading } = useTripCosts(tripId);
  const { trip } = useTrip(tripId);

  // Fetch exchange rate if trip currency is not USD
  const tripCurrency = trip?.currency || "USD";
  const needsConversion = tripCurrency !== "USD";
  const { data: rateData } = useSWR(
    needsConversion ? `/api/external/exchange-rate?from=USD&to=${tripCurrency}` : null,
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
            {rate && (
              <p className="text-xs text-muted">
                ~{formatCurrency(costs.grandTotal * rate, tripCurrency)}
              </p>
            )}
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
            {rate && (
              <p className="text-xs text-muted">
                ~{formatCurrency(costs.perPerson * rate, tripCurrency)}
              </p>
            )}
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

        {/* Exchange rate badge */}
        {rate && (
          <>
            <div className="hidden sm:block w-px h-8 bg-cork" />
            <span className="flex items-center gap-1 text-xs text-muted">
              <ArrowRightLeft size={12} />
              1 USD = {rate.toFixed(2)} {tripCurrency}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
