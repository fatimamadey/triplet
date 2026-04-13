"use client";

import { Plane, Hotel } from "lucide-react";

export default function PlanningPage() {
  return (
    <div className="space-y-8">
      {/* Flights section placeholder */}
      <div className="pinned-card pin-blue p-6 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Plane size={20} className="text-pin-blue" />
          <h2 className="text-lg font-bold">Flights</h2>
        </div>
        <p className="text-muted text-sm">
          Flight search coming soon. You&apos;ll be able to search and save flights here.
        </p>
      </div>

      {/* Hotels section placeholder */}
      <div className="pinned-card pin-green p-6 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Hotel size={20} className="text-pin-green" />
          <h2 className="text-lg font-bold">Hotels</h2>
        </div>
        <p className="text-muted text-sm">
          Hotel search coming soon. You&apos;ll be able to search and save hotels here.
        </p>
      </div>
    </div>
  );
}
