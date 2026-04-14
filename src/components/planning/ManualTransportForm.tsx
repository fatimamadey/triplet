"use client";

import { useState } from "react";
import { Plus, Loader2, Plane, TrainFront, Bus, Car } from "lucide-react";

const transportTypes = [
  { value: "flight", label: "Flight", icon: Plane },
  { value: "train", label: "Train", icon: TrainFront },
  { value: "bus", label: "Bus", icon: Bus },
  { value: "driving", label: "Driving", icon: Car },
];

interface ManualTransportFormProps {
  defaultOrigin?: string;
  defaultDestination?: string;
  onAdd: (data: {
    transport_type: string;
    origin: string;
    destination: string;
    airline?: string;
    flight_number?: string;
    departure_at?: string;
    price?: number;
    notes?: string;
  }) => Promise<void>;
}

// Rough gas estimate: $0.15/mile average
const GAS_RATE_PER_MILE = 0.15;

export default function ManualTransportForm({
  defaultOrigin,
  defaultDestination,
  onAdd,
}: ManualTransportFormProps) {
  const [type, setType] = useState("flight");
  const [origin, setOrigin] = useState(defaultOrigin || "");
  const [destination, setDestination] = useState(defaultDestination || "");
  const [carrier, setCarrier] = useState("");
  const [number, setNumber] = useState("");
  const [departure, setDeparture] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [miles, setMiles] = useState("");
  const [loading, setLoading] = useState(false);

  const gasEstimate = miles ? (parseFloat(miles) * GAS_RATE_PER_MILE).toFixed(0) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    setLoading(true);
    try {
      const finalPrice =
        type === "driving" && !price && gasEstimate
          ? parseFloat(gasEstimate)
          : price
            ? parseFloat(price)
            : undefined;

      await onAdd({
        transport_type: type,
        origin: origin.trim(),
        destination: destination.trim(),
        airline: carrier.trim() || undefined,
        flight_number: number.trim() || undefined,
        departure_at: departure || undefined,
        price: finalPrice,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setCarrier("");
      setNumber("");
      setDeparture("");
      setPrice("");
      setNotes("");
      setMiles("");
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  }

  const Icon = transportTypes.find((t) => t.value === type)?.icon || Plane;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Transport type selector */}
      <div>
        <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
          Transport Type
        </label>
        <div className="flex gap-1 bg-cream-dark rounded-lg p-1">
          {transportTypes.map((t) => {
            const TIcon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex-1 justify-center ${
                  type === t.value
                    ? "bg-teal text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <TIcon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            From
          </label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder={type === "flight" ? "JFK" : "New York"}
            required
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            To
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={type === "flight" ? "NRT" : "Tokyo"}
            required
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {type !== "driving" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
                {type === "flight" ? "Airline" : "Operator"} (optional)
              </label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder={type === "flight" ? "United" : "Amtrak"}
                className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
                {type === "flight" ? "Flight #" : "Route #"} (optional)
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder={type === "flight" ? "UA 123" : "NE Regional"}
                className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm"
              />
            </div>
          </>
        )}
        {type === "driving" && (
          <div>
            <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
              Estimated Miles
            </label>
            <input
              type="number"
              value={miles}
              onChange={(e) => setMiles(e.target.value)}
              placeholder="300"
              className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm"
            />
            {gasEstimate && (
              <p className="text-xs text-teal mt-1">
                Est. gas cost: ~${gasEstimate} (at $0.15/mi)
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            Departure Date/Time
          </label>
          <input
            type="datetime-local"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
            Price ($)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={type === "driving" && gasEstimate ? gasEstimate : "0"}
            min={0}
            step={0.01}
            className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
          Notes / Booking Links (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste booking link, confirmation number, or any notes..."
          rows={2}
          className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !origin.trim() || !destination.trim()}
        className="flex items-center gap-2 px-4 py-2 bg-teal text-white rounded font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Plus size={16} />
        )}
        Add {transportTypes.find((t) => t.value === type)?.label}
      </button>
    </form>
  );
}
