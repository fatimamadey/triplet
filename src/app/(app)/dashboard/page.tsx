import Link from "next/link";
import { PlusCircle } from "lucide-react";
import TripGrid from "@/components/dashboard/TripGrid";

export default function DashboardPage() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Trips</h1>
          <p className="text-muted mt-1">Plan your next adventure</p>
        </div>
        <Link
          href="/trips/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={16} />
          New Trip
        </Link>
      </div>

      {/* Trip grid */}
      <TripGrid />
    </div>
  );
}
