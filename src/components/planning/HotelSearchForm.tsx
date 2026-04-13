"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface HotelSearchFormProps {
  destination: string;
  onSearch: (params: {
    query: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
    type?: "hotels" | "rentals";
  }) => void;
  isLoading: boolean;
}

export default function HotelSearchForm({
  destination,
  onSearch,
  isLoading,
}: HotelSearchFormProps) {
  const [query, setQuery] = useState(destination ? `Hotels in ${destination}` : "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [type, setType] = useState<"hotels" | "rentals">("hotels");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !checkIn || !checkOut) return;

    onSearch({
      query: query.trim(),
      checkIn,
      checkOut,
      adults,
      type,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex gap-1 bg-cream-dark rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setType("hotels")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            type === "hotels"
              ? "bg-teal text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Hotels
        </button>
        <button
          type="button"
          onClick={() => setType("rentals")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            type === "rentals"
              ? "bg-teal text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Vacation Rentals
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
          Search
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Hotels in Tokyo"
          required
          className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            Check In
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            Check Out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn}
            required
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            Guests
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value) || 2)}
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !query.trim() || !checkIn || !checkOut}
        className="flex items-center gap-2 px-4 py-2 bg-pin-green text-white rounded font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search size={16} />
            Search {type === "rentals" ? "Vacation Rentals" : "Hotels"}
          </>
        )}
      </button>
    </form>
  );
}
