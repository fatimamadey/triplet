"use client";

import { useState } from "react";
import { X, Plus, Loader2, Search, MapPin } from "lucide-react";

interface PlaceResult {
  id: string;
  name: string;
  address: string | null;
  categories: string[];
  photo: string | null;
  rating: number | null;
}

interface AddItemModalProps {
  dayLabel: string;
  destination: string;
  onAdd: (data: {
    title: string;
    category: string;
    start_time?: string;
    end_time?: string;
    estimated_cost?: number;
    notes?: string;
    place_id?: string;
    place_data?: unknown;
  }) => Promise<void>;
  onClose: () => void;
}

const categories = [
  { value: "restaurant", label: "Restaurant" },
  { value: "attraction", label: "Attraction" },
  { value: "activity", label: "Activity" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other" },
];

export default function AddItemModal({
  dayLabel,
  destination,
  onAdd,
  onClose,
}: AddItemModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("activity");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Place search — off by default
  const [showSearch, setShowSearch] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  async function handlePlaceSearch() {
    if (!placeQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/search/places?query=${encodeURIComponent(placeQuery)}&near=${encodeURIComponent(destination)}`
      );
      if (res.ok) {
        setPlaceResults(await res.json());
      }
    } catch {
      // Silent fail
    } finally {
      setSearching(false);
    }
  }

  function handleSelectPlace(place: PlaceResult) {
    setSelectedPlace(place);
    setTitle(place.name);
    if (place.categories.length > 0) {
      const cat = place.categories[0].toLowerCase();
      if (cat.includes("restaurant") || cat.includes("food") || cat.includes("cafe") || cat.includes("bar") || cat.includes("ramen")) {
        setCategory("restaurant");
      } else if (cat.includes("museum") || cat.includes("landmark") || cat.includes("park") || cat.includes("monument") || cat.includes("temple")) {
        setCategory("attraction");
      } else if (cat.includes("shop") || cat.includes("store") || cat.includes("mall") || cat.includes("market")) {
        setCategory("shopping");
      }
    }
    setPlaceResults([]);
    setPlaceQuery("");
    setShowSearch(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onAdd({
        title: title.trim(),
        category,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        estimated_cost: cost ? parseFloat(cost) : undefined,
        notes: notes.trim() || undefined,
        place_id: selectedPlace?.id,
        place_data: selectedPlace
          ? { name: selectedPlace.name, address: selectedPlace.address, photo_url: selectedPlace.photo, categories: selectedPlace.categories }
          : undefined,
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-paper rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cork/30 sticky top-0 bg-paper z-10">
          <h3 className="font-bold text-foreground">Add to {dayLabel}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-cream-dark text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Selected place banner */}
          {selectedPlace && (
            <div className="flex items-center gap-2 bg-teal/10 rounded px-3 py-2 text-sm">
              <MapPin size={14} className="text-teal" />
              <span className="font-medium flex-1">{selectedPlace.name}</span>
              {selectedPlace.rating && (
                <span className="text-xs text-muted">{selectedPlace.rating} stars</span>
              )}
              <button
                type="button"
                onClick={() => { setSelectedPlace(null); setTitle(""); }}
                className="text-muted hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Google Maps search toggle — optional, costs 1 SerpAPI credit */}
          {!selectedPlace && (
            <div>
              {!showSearch ? (
                <button
                  type="button"
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-2 text-xs text-pin-blue hover:text-foreground transition-colors"
                >
                  <Search size={12} />
                  Search Google Maps for a place (uses 1 API credit)
                </button>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide">
                      Search Google Maps
                    </label>
                    <button
                      type="button"
                      onClick={() => { setShowSearch(false); setPlaceResults([]); }}
                      className="text-xs text-muted hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={placeQuery}
                      onChange={(e) => setPlaceQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handlePlaceSearch())}
                      placeholder={`e.g., ramen in ${destination}`}
                      autoFocus
                      className="flex-1 px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={handlePlaceSearch}
                      disabled={searching || !placeQuery.trim()}
                      className="px-3 py-2 bg-pin-blue text-white rounded text-sm hover:opacity-90 disabled:opacity-50"
                    >
                      {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                  </div>

                  {placeResults.length > 0 && (
                    <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                      {placeResults.map((place) => (
                        <button
                          key={place.id}
                          type="button"
                          onClick={() => handleSelectPlace(place)}
                          className="w-full flex items-center gap-2 p-2 rounded bg-cream-dark hover:bg-cork/20 transition-colors text-left"
                        >
                          {place.photo ? (
                            <img src={place.photo} alt="" className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-cork/20 flex items-center justify-center">
                              <MapPin size={14} className="text-muted" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{place.name}</p>
                            <p className="text-xs text-muted truncate">
                              {place.categories.join(" · ")}{place.address && ` · ${place.address}`}
                            </p>
                          </div>
                          {place.rating && (
                            <span className="text-xs font-medium text-sunshine">{place.rating}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
                Activity Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Visit Tokyo Tower"
                required
                className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
                Category
              </label>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      category === cat.value
                        ? "bg-teal text-white"
                        : "bg-cream-dark text-muted hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
                Estimated Cost ($)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                min={0}
                step={0.01}
                className="w-32 px-3 py-2 rounded border-2 border-cork bg-paper text-foreground focus:outline-none focus:border-teal transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any details or tips..."
                rows={2}
                className="w-full px-3 py-2 rounded border-2 border-cork bg-paper text-foreground placeholder:text-muted focus:outline-none focus:border-teal transition-colors text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal text-white rounded font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add Activity
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
