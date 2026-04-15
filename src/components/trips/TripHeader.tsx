"use client";

import { Trip } from "@/lib/types";
import { MapPin, Calendar, Users, ArrowLeft, ChevronDown, Pencil, X, Check, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import FavoriteButton from "@/components/share/FavoriteButton";
import { updateTrip } from "@/lib/mutations";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { mutate } from "swr";

const statuses = [
  { value: "planning", label: "Planning", color: "text-pin-blue border-pin-blue" },
  { value: "ready", label: "Ready", color: "text-leaf border-leaf" },
  { value: "completed", label: "Completed", color: "text-pin-green border-pin-green" },
];

export default function TripHeader({ trip }: { trip: Trip }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState(trip.title);
  const [editDestination, setEditDestination] = useState(trip.destination);
  const [editStartDate, setEditStartDate] = useState(trip.start_date || "");
  const [editEndDate, setEditEndDate] = useState(trip.end_date || "");
  const [editTravelers, setEditTravelers] = useState(String(trip.num_travelers));

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const currentStatus = statuses.find((s) => s.value === trip.status) || statuses[0];

  function startEditing() {
    setEditTitle(trip.title);
    setEditDestination(trip.destination);
    setEditStartDate(trip.start_date || "");
    setEditEndDate(trip.end_date || "");
    setEditTravelers(String(trip.num_travelers));
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateTrip(trip.id, {
        title: editTitle,
        destination: editDestination,
        start_date: editStartDate || undefined,
        end_date: editEndDate || undefined,
        num_travelers: parseInt(editTravelers) || 1,
      });
      toast.success("Trip updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update trip");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setShowStatusMenu(false);
    try {
      await updateTrip(trip.id, { status: newStatus });
      toast.success(`Trip marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tripId", trip.id);

      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      mutate(`/api/trips/${trip.id}`);
      mutate("/api/trips");
      toast.success("Photo updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-4 transition-colors text-sm"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      {/* Header card */}
      <div className="pinned-card pin-red">
        {/* Image with upload overlay */}
        <div className="relative h-44 overflow-hidden rounded-t-sm group">
          {trip.image_url ? (
            <img
              src={trip.image_url}
              alt={trip.destination}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal/20 via-pin-blue/15 to-sunshine/20" />
          )}
          {/* Photo upload overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            {uploading ? (
              <Loader2 size={28} className="text-white animate-spin" />
            ) : (
              <div className="bg-black/50 text-white rounded-full p-3">
                <Camera size={20} />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        <div className="p-5 pt-6">
          {editing ? (
            /* ===== EDIT MODE ===== */
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-bold bg-cream border-2 border-cork rounded px-2 py-1 flex-1 focus:outline-none focus:border-teal"
                  placeholder="Trip name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wide font-semibold">Destination</label>
                  <input
                    type="text"
                    value={editDestination}
                    onChange={(e) => setEditDestination(e.target.value)}
                    className="w-full px-2 py-1.5 bg-cream border-2 border-cork rounded text-sm focus:outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wide font-semibold">Travelers</label>
                  <input
                    type="number"
                    value={editTravelers}
                    onChange={(e) => setEditTravelers(e.target.value)}
                    min={1}
                    max={20}
                    className="w-full px-2 py-1.5 bg-cream border-2 border-cork rounded text-sm focus:outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wide font-semibold">Start Date</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-cream border-2 border-cork rounded text-sm focus:outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wide font-semibold">End Date</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    min={editStartDate}
                    className="w-full px-2 py-1.5 bg-cream border-2 border-cork rounded text-sm focus:outline-none focus:border-teal"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !editTitle.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-teal text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 px-4 py-1.5 border border-cork rounded-lg text-sm font-medium text-muted hover:text-foreground"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ===== VIEW MODE ===== */
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground">{trip.title}</h1>
                  {/* Status toggle */}
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                      className={`sticker text-xs ${currentStatus.color} !transform-none cursor-pointer flex items-center gap-1`}
                    >
                      {currentStatus.label}
                      <ChevronDown size={10} />
                    </button>
                    {showStatusMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                        <div className="absolute top-full left-0 mt-1 bg-paper border border-cork rounded-lg shadow-xl z-50 py-1 min-w-[130px]">
                          {statuses.map((s) => (
                            <button
                              key={s.value}
                              onClick={() => handleStatusChange(s.value)}
                              className={`w-full text-left px-3 py-2 text-sm font-medium hover:bg-cream-dark transition-colors ${
                                s.value === trip.status ? "text-teal" : "text-foreground"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Edit button */}
                  <button
                    onClick={startEditing}
                    className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-cream-dark transition-colors"
                    title="Edit trip details"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {trip.destination}
                    {trip.country && `, ${trip.country}`}
                  </span>
                  {trip.start_date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(trip.start_date)}
                      {trip.end_date && ` — ${formatDate(trip.end_date)}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {trip.num_travelers} traveler{trip.num_travelers !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <FavoriteButton tripId={trip.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
