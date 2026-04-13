"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";

interface AddItemModalProps {
  dayLabel: string;
  onAdd: (data: {
    title: string;
    category: string;
    start_time?: string;
    end_time?: string;
    estimated_cost?: number;
    notes?: string;
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
      <div className="bg-paper rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cork/30">
          <h3 className="font-bold text-foreground">Add to {dayLabel}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-cream-dark text-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
              autoFocus
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
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Add Activity
          </button>
        </form>
      </div>
    </div>
  );
}
