"use client";

import { Share2 } from "lucide-react";

export default function SharePage() {
  return (
    <div className="pinned-card pin-green p-6 pt-8">
      <div className="flex items-center gap-2 mb-4">
        <Share2 size={20} className="text-pin-green" />
        <h2 className="text-lg font-bold">Share This Trip</h2>
      </div>
      <p className="text-muted text-sm">
        Sharing features coming soon. You&apos;ll be able to generate a shareable link here.
      </p>
    </div>
  );
}
