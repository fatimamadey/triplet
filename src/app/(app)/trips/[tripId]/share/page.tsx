"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Share2, Copy, Check, Link, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateShareToken } from "@/lib/mutations";

export default function SharePage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerateLink() {
    setLoading(true);
    try {
      const token = await generateShareToken(tripId);
      const url = `${window.location.origin}/share/${token}`;
      setShareUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate link");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="pinned-card pin-green p-6 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Share2 size={20} className="text-pin-green" />
          <h2 className="text-lg font-bold">Share This Trip</h2>
        </div>

        <p className="text-muted text-sm mb-6">
          Generate a shareable link so anyone can view your trip itinerary,
          flights, and hotels. They can favorite it if they&apos;re logged in,
          but they can&apos;t edit it.
        </p>

        {!shareUrl ? (
          <button
            onClick={handleGenerateLink}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-teal text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Link size={18} />
            )}
            Generate Share Link
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 rounded border-2 border-cork bg-cream-dark text-foreground text-sm"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-4 py-2 bg-teal text-white rounded font-medium text-sm hover:opacity-90 transition-opacity"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-muted">
              Anyone with this link can view your trip. They can favorite it but not edit it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
