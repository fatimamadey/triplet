import CreateTripForm from "@/components/trips/CreateTripForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTripPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="pinned-card pin-blue p-8 pt-10">
        <h1 className="text-2xl font-bold text-foreground mb-1">Plan a New Trip</h1>
        <p className="text-muted mb-6">Where are you headed?</p>
        <CreateTripForm />
      </div>
    </div>
  );
}
