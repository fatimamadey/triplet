import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { PlusCircle, Map } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Trips</h1>
        <p className="text-muted mt-1">Plan your next adventure</p>
      </div>

      {/* Empty state */}
      <div className="pinned-card pin-blue tilt-1 max-w-md mx-auto mt-16 p-8 text-center">
        <Map size={48} className="mx-auto text-muted mb-4" />
        <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
        <p className="text-muted mb-6">
          Create your first trip to start planning your adventure!
        </p>
        <Link
          href="/trips/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={18} />
          Create a Trip
        </Link>
      </div>
    </div>
  );
}
