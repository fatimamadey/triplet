"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrip } from "@/lib/mutations";
import { Plane, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateTripForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numTravelers, setNumTravelers] = useState(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim() || !title.trim()) return;

    setLoading(true);
    try {
      // Fetch country info
      let country: string | undefined;
      let countryCode: string | undefined;
      let currency: string | undefined;

      try {
        const countryRes = await fetch(
          `/api/external/countries?name=${encodeURIComponent(destination)}`
        );
        if (countryRes.ok) {
          const countries = await countryRes.json();
          if (countries.length > 0) {
            country = countries[0].name;
            countryCode = countries[0].code;
            currency = countries[0].currency;
          }
        }
      } catch {
        // Country lookup is best-effort
      }

      // Fetch destination image
      let imageUrl: string | undefined;
      try {
        const imgRes = await fetch(
          `/api/external/unsplash?query=${encodeURIComponent(destination)}`
        );
        if (imgRes.ok) {
          const img = await imgRes.json();
          if (img.url) {
            imageUrl = img.url;
          }
        }
      } catch {
        // Image fetch is best-effort
      }

      const trip = await createTrip({
        title,
        destination,
        country,
        country_code: countryCode,
        currency,
        image_url: imageUrl,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        num_travelers: numTravelers,
      });

      toast.success("Trip created!");
      router.push(`/trips/${trip.id}/planning`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create trip");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trip Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-foreground mb-2">
          Trip Name
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Tokyo Adventure 2026"
          required
          className="w-full px-4 py-3 rounded-lg border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors"
        />
      </div>

      {/* Destination */}
      <div>
        <label htmlFor="destination" className="block text-sm font-semibold text-foreground mb-2">
          Destination City
        </label>
        <input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g., Tokyo, Paris, New York"
          required
          className="w-full px-4 py-3 rounded-lg border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-semibold text-foreground mb-2">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-semibold text-foreground mb-2">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="w-full px-4 py-3 rounded-lg border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors"
          />
        </div>
      </div>

      {/* Number of Travelers */}
      <div>
        <label htmlFor="travelers" className="block text-sm font-semibold text-foreground mb-2">
          Number of Travelers
        </label>
        <input
          id="travelers"
          type="number"
          min={1}
          max={20}
          value={numTravelers}
          onChange={(e) => setNumTravelers(parseInt(e.target.value) || 1)}
          className="w-32 px-4 py-3 rounded-lg border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !destination.trim() || !title.trim()}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Creating Trip...
          </>
        ) : (
          <>
            <Plane size={18} />
            Create Trip
          </>
        )}
      </button>
    </form>
  );
}
