"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plane, Hotel, AlertCircle, TrendingDown, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import FlightSearchForm from "@/components/planning/FlightSearchForm";
import FlightResultCard from "@/components/planning/FlightResultCard";
import FlightSavedCard from "@/components/planning/FlightSavedCard";
import ManualTransportForm from "@/components/planning/ManualTransportForm";
import HotelSearchForm from "@/components/planning/HotelSearchForm";
import HotelResultCard from "@/components/planning/HotelResultCard";
import HotelSavedCard from "@/components/planning/HotelSavedCard";
import {
  useFlights,
  useFlightSearch,
  FlightSearchParams,
  FlightOffer,
} from "@/hooks/useFlights";
import {
  useHotels,
  useHotelSearch,
  HotelSearchParams,
  HotelResult,
} from "@/hooks/useHotels";
import { useTrip } from "@/hooks/useTrips";
import { addFlight, removeFlight, addHotel, removeHotel } from "@/lib/mutations";

export default function PlanningPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { trip } = useTrip(tripId);

  // Transport state
  const [flightSearchParams, setFlightSearchParams] = useState<FlightSearchParams | null>(null);
  const [addingFlightId, setAddingFlightId] = useState<string | null>(null);
  const [showManualTransport, setShowManualTransport] = useState(false);
  const { flights } = useFlights(tripId);
  const {
    results: flightResults,
    priceInsights,
    isLoading: flightSearchLoading,
    isError: flightSearchError,
    errorMessage: flightErrorMessage,
  } = useFlightSearch(flightSearchParams);

  // Hotel state
  const [hotelSearchParams, setHotelSearchParams] = useState<HotelSearchParams | null>(null);
  const [addingHotelId, setAddingHotelId] = useState<string | null>(null);
  const { hotels } = useHotels(tripId);
  const {
    results: hotelResults,
    isLoading: hotelSearchLoading,
    isError: hotelSearchError,
    errorMessage: hotelErrorMessage,
  } = useHotelSearch(hotelSearchParams);

  // Pre-fill search with trip data
  function handleFlightSearch(searchParams: FlightSearchParams) {
    setFlightSearchParams(searchParams);
  }

  function handleHotelSearch(searchParams: HotelSearchParams) {
    setHotelSearchParams(searchParams);
  }

  // Flight handlers
  async function handleAddFlight(offer: FlightOffer) {
    setAddingFlightId(offer.id);
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
      setAddingFlightId(null);
    }
  }

  async function handleAddManualTransport(data: {
    transport_type: string;
    origin: string;
    destination: string;
    airline?: string;
    flight_number?: string;
    departure_at?: string;
    price?: number;
    notes?: string;
  }) {
    try {
      await addFlight(tripId, {
        ...data,
        currency: "USD",
      });
      toast.success("Transport added!");
      setShowManualTransport(false);
    } catch {
      toast.error("Failed to add transport");
      throw new Error("Failed");
    }
  }

  async function handleRemoveFlight(flightId: string) {
    try {
      await removeFlight(tripId, flightId);
      toast.success("Removed");
    } catch {
      toast.error("Failed to remove");
    }
  }

  // Hotel handlers
  async function handleAddHotel(hotel: HotelResult) {
    setAddingHotelId(hotel.id);
    try {
      await addHotel(tripId, {
        name: hotel.name,
        price_per_night: hotel.pricePerNight ?? undefined,
        total_price: hotel.totalPrice ?? undefined,
        rating: hotel.rating ?? undefined,
        image_url: hotel.image ?? undefined,
        check_in: hotelSearchParams?.checkIn,
        check_out: hotelSearchParams?.checkOut,
      });
      toast.success("Hotel added to trip!");
    } catch {
      toast.error("Failed to add hotel");
    } finally {
      setAddingHotelId(null);
    }
  }

  async function handleRemoveHotel(hotelId: string) {
    try {
      await removeHotel(tripId, hotelId);
      toast.success("Hotel removed");
    } catch {
      toast.error("Failed to remove hotel");
    }
  }

  return (
    <div className="space-y-8">
      {/* Transport section */}
      <div className="pinned-card pin-blue p-6 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plane size={20} className="text-pin-blue" />
            <h2 className="text-lg font-bold">Transport</h2>
          </div>
          <button
            onClick={() => setShowManualTransport(!showManualTransport)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-cork rounded hover:border-teal text-muted hover:text-foreground transition-colors"
          >
            <PlusCircle size={14} />
            {showManualTransport ? "Search Flights Instead" : "Add Manually"}
          </button>
        </div>

        {/* Saved transport */}
        {flights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
              Saved Transport
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {flights.map((flight) => (
                <FlightSavedCard key={flight.id} flight={flight} onRemove={handleRemoveFlight} />
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-cork/30 pt-4">
          {showManualTransport ? (
            <>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
                Add Transport Manually
              </h3>
              <ManualTransportForm
                defaultOrigin=""
                defaultDestination={trip?.destination || ""}
                onAdd={handleAddManualTransport}
              />
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
                Search Flights
              </h3>
              <FlightSearchForm
                onSearch={handleFlightSearch}
                isLoading={flightSearchLoading}
                defaultDepartureDate={trip?.start_date || ""}
                defaultReturnDate={trip?.end_date || ""}
                defaultAdults={String(trip?.num_travelers || 1)}
              />
            </>
          )}
        </div>

        {/* Flight search results */}
        {!showManualTransport && flightSearchParams && (
          <div className="mt-4 space-y-3">
            {flightSearchLoading && <p className="text-sm text-muted">Searching Google Flights...</p>}
            {flightSearchError && (
              <div className="flex items-start gap-2 text-coral text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{flightErrorMessage || "Flight search failed."}</span>
              </div>
            )}
            {priceInsights && (
              <div className="flex items-center gap-3 bg-teal/10 rounded-lg px-4 py-2 text-sm">
                <TrendingDown size={16} className="text-teal" />
                <span>
                  Lowest: <strong>${priceInsights.lowest_price}</strong>
                  {priceInsights.typical_price_range && (
                    <> · Typical: ${priceInsights.typical_price_range[0]}–${priceInsights.typical_price_range[1]}</>
                  )}
                  {priceInsights.price_level && (
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      priceInsights.price_level === "low" ? "bg-pin-green/20 text-pin-green" :
                      priceInsights.price_level === "typical" ? "bg-pin-blue/20 text-pin-blue" :
                      "bg-coral/20 text-coral"
                    }`}>{priceInsights.price_level}</span>
                  )}
                </span>
              </div>
            )}
            {!flightSearchLoading && !flightSearchError && flightResults.length === 0 && (
              <p className="text-sm text-muted">No flights found. Try different dates or airports.</p>
            )}
            {flightResults.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                  {flightResults.length} Flights Found
                </h3>
                {flightResults.map((offer) => (
                  <FlightResultCard key={offer.id} offer={offer} onAdd={handleAddFlight} adding={addingFlightId === offer.id} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Hotels section */}
      <div className="pinned-card pin-green p-6 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Hotel size={20} className="text-pin-green" />
          <h2 className="text-lg font-bold">Hotels & Stays</h2>
        </div>

        {hotels.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
              Saved Hotels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hotels.map((hotel) => (
                <HotelSavedCard key={hotel.id} hotel={hotel} onRemove={handleRemoveHotel} />
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-cork/30 pt-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Search Hotels & Vacation Rentals
          </h3>
          <HotelSearchForm
            destination={trip?.destination || ""}
            onSearch={handleHotelSearch}
            isLoading={hotelSearchLoading}
            defaultCheckIn={trip?.start_date || ""}
            defaultCheckOut={trip?.end_date || ""}
            defaultAdults={String(trip?.num_travelers || 2)}
          />
        </div>

        {hotelSearchParams && (
          <div className="mt-4 space-y-3">
            {hotelSearchLoading && <p className="text-sm text-muted">Searching Google Hotels...</p>}
            {hotelSearchError && (
              <div className="flex items-start gap-2 text-coral text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{hotelErrorMessage || "Hotel search failed."}</span>
              </div>
            )}
            {!hotelSearchLoading && !hotelSearchError && hotelResults.length === 0 && (
              <p className="text-sm text-muted">No hotels found. Try a different search.</p>
            )}
            {hotelResults.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                  {hotelResults.length} Properties Found
                </h3>
                <div className="space-y-3">
                  {hotelResults.map((hotel) => (
                    <HotelResultCard key={hotel.id} hotel={hotel} checkIn={hotelSearchParams.checkIn} checkOut={hotelSearchParams.checkOut} onAdd={handleAddHotel} adding={addingHotelId === hotel.id} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
