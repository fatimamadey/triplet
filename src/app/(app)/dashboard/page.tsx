import TripGrid from "@/components/dashboard/TripGrid";

export default function DashboardPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-handwritten font-bold text-foreground">My Trips</h1>
        <p className="text-muted mt-1">Plan your next adventure</p>
      </div>

      {/* Washi tape divider */}
      <div className="washi-tape mb-8 -mx-2" />

      {/* Trip grid + favorites */}
      <TripGrid />
    </div>
  );
}
