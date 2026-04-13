"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { addFavorite, removeFavorite } from "@/lib/mutations";
import { useIsFavorited } from "@/hooks/useFavorites";
import { toast } from "sonner";

export default function FavoriteButton({ tripId }: { tripId: string }) {
  const isFavorited = useIsFavorited(tripId);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      if (isFavorited) {
        await removeFavorite(tripId);
        toast.success("Removed from favorites");
      } else {
        await addFavorite(tripId);
        toast.success("Added to favorites!");
      }
    } catch {
      toast.error("Failed to update favorite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
        isFavorited
          ? "bg-coral/10 text-coral border-2 border-coral"
          : "bg-paper text-muted border-2 border-cork hover:border-coral hover:text-coral"
      }`}
    >
      <Heart
        size={16}
        className={isFavorited ? "fill-coral" : ""}
      />
      {isFavorited ? "Favorited" : "Favorite"}
    </button>
  );
}
