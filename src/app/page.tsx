import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Map, Plane, Hotel, Heart } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen cork-bg">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <Map size={40} className="text-teal" />
          <h1 className="text-6xl font-handwritten font-bold text-foreground">Triplet</h1>
        </div>
        <p className="text-xl text-muted max-w-2xl mx-auto mb-10">
          Plan your trips, discover amazing places, and share itineraries with
          friends — all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-8 py-3 bg-teal text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="px-8 py-3 bg-paper text-foreground rounded-lg font-semibold border-2 border-cork hover:bg-cream transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="pinned-card pin-red tilt-1 p-6 pt-8">
          <Plane size={32} className="text-pin-blue mb-3" />
          <h3 className="text-lg font-bold mb-2">Plan Everything</h3>
          <p className="text-muted text-sm">
            Search flights, hotels, and track your budget with real-time cost
            estimates per person.
          </p>
        </div>
        <div className="pinned-card pin-green tilt-2 p-6 pt-8">
          <Map size={32} className="text-teal mb-3" />
          <h3 className="text-lg font-bold mb-2">Build Itineraries</h3>
          <p className="text-muted text-sm">
            Discover popular places and create detailed day-by-day plans for
            your destination.
          </p>
        </div>
        <div className="pinned-card pin-yellow tilt-3 p-6 pt-8">
          <Heart size={32} className="text-coral mb-3" />
          <h3 className="text-lg font-bold mb-2">Share & Favorite</h3>
          <p className="text-muted text-sm">
            Share your itineraries with friends and save your favorite trips
            for inspiration.
          </p>
        </div>
      </div>
    </div>
  );
}
