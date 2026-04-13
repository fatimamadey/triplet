"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plane, Hotel, AlertCircle, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import FlightSearchForm from "@/components/planning/FlightSearchForm";
import FlightResultCard from "@/components/planning/FlightResultCard";
import FlightSavedCard from "@/components/planning/FlightSavedCard";
import {
  useFlights,
  useFlightSearch,
  FlightSearchParams,
  FlightOffer,
} from "@/hooks/useFlights";
import { addFlight, removeFlight } from "@/lib/mutations";

export default function PlanningPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { flights } = useFlights(tripId);
  const {
    results: searchResults,
    priceInsights,
    isLoading: searchLoading,
    isError: searchError,
    errorMessage,
  } = useFlightSearch(searchParams);

  async function handleAddFlight(offer: FlightOffer) {
    setAddingId(offer.id);
    try {
      await addFlight(tripId, {
        airline: offer.airline,
        flight_number: offer.flightNumber,
        origin: offer.origin,
        destination: offer.destination,
        departure_at: offer.departureAt,
        arrival_at: offer.arrivalAt,
        price: offer.price,
        currency: offer.currency,
      });
      toast.success("Flight added to trip!");
    } catch {
      toast.error("Failed to add flight");
    } finally {
      setAddingId(null);
    }
  }

  async function handleRemoveFlight(flightId: string) {
    try {
      await removeFlight(tripId, flightId);
      toast.success("Flight removed");
    } catch {
      toast.error("Failed to remove flight");
    }
  }

  return (
    <div className="space-y-8">
      {/* Flights section */}
      <div className="pinned-card pin-blue p-6 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Plane size={20} className="text-pin-blue" />
          <h2 className="text-lg font-bold">Flights</h2>
        </div>

        {/* Saved flights */}
        {flights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
              Saved Flights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {flights.map((flight) => (
                <FlightSavedCard
                  key={flight.id}
                  flight={flight}
                  onRemove={handleRemoveFlight}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search form */}
        <div className="border-t border-cork/30 pt-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Search Flights
          </h3>
          <FlightSearchForm
            onSearch={setSearchParams}
            isLoading={searchLoading}
          />
        </div>

        {/* Search results */}
        {searchParams && (
          <div className="mt-4 space-y-3">
            {searchLoading && (
              <p className="text-sm text-muted">Searching Google Flights...</p>
            )}

            {searchError && (
              <div className="flex items-start gap-2 text-coral text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  {errorMessage || "Flight search failed. Check your SERPAPI_API_KEY in .env.local"}
                </span>
              </div>
            )}

            {!searchLoading && !searchError && searchResults.length === 0 && (
              <p className="text-sm text-muted">
                No flights found. Try different dates or airports.
              </p>
            )}

            {/* Price insights */}
            {priceInsights && (
              <div className="flex items-center gap-3 bg-teal/10 rounded-lg px-4 py-2 text-sm">
                <TrendingDown size={16} className="text-teal" />
                <span>
                  Lowest: <strong>${priceInsights.lowest_price}</strong>
                  {priceInsights.typical_price_range && (
                    <> · Typical range: ${priceInsights.typical_price_range[0]}–${priceInsights.typical_price_range[1]}</>
                  )}
                  {priceInsights.price_level && (
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      priceInsights.price_level === 'low' ? 'bg-pin-green/20 text-pin-green' :
                      priceInsights.price_level === 'typical' ? 'bg-pin-blue/20 text-pin-blue' :
                      'bg-coral/20 text-coral'
                    }`}>
                      {priceInsights.price_level}
                    </span>
                  )}
                </span>
              </div>
            )}

            {searchResults.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                  {searchResults.length} Flights Found
                </h3>
                {searchResults.map((offer) => (
                  <FlightResultCard
                    key={offer.id}
                    offer={offer}
                    onAdd={handleAddFlight}
                    adding={addingId === offer.id}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Hotels section placeholder */}
      <div className="pinned-card pin-green p-6 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Hotel size={20} className="text-pin-green" />
          <h2 className="text-lg font-bold">Hotels</h2>
        </div>
        <p className="text-muted text-sm">
          Hotel search coming soon. You&apos;ll be able to search and save hotels here.
        </p>
      </div>
    </div>
  );
}
