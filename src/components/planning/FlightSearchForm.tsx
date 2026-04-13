"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface FlightSearchFormProps {
  onSearch: (params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults?: number;
  }) => void;
  isLoading: boolean;
}

export default function FlightSearchForm({
  onSearch,
  isLoading,
}: FlightSearchFormProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin.trim() || !destination.trim() || !departureDate) return;

    onSearch({
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departureDate,
      returnDate: returnDate || undefined,
      adults,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            From (Airport Code)
          </label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g., JFK"
            maxLength={3}
            required
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm uppercase"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            To (Airport Code)
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., NRT"
            maxLength={3}
            required
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm uppercase"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            Departure
          </label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            Return (optional)
          </label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={departureDate}
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            Passengers
          </label>
          <input
            type="number"
            min={1}
            max={9}
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !origin.trim() || !destination.trim() || !departureDate}
        className="flex items-center gap-2 px-4 py-2 bg-pin-blue text-white rounded font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Searching Google Flights...
          </>
        ) : (
          <>
            <Search size={16} />
            Search Flights
          </>
        )}
      </button>
    </form>
  );
}
