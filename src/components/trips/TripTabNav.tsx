"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Calendar, Share2 } from "lucide-react";

const tabs = [
  { href: "planning", label: "Planning", icon: Plane },
  { href: "itinerary", label: "Itinerary", icon: Calendar },
  { href: "share", label: "Share", icon: Share2 },
];

export default function TripTabNav({ tripId }: { tripId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 bg-paper border-2 border-cork rounded-lg p-1">
      {tabs.map((tab) => {
        const fullHref = `/trips/${tripId}/${tab.href}`;
        const isActive = pathname.includes(`/${tab.href}`);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={fullHref}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${isActive
                ? "bg-teal text-white"
                : "text-muted hover:text-foreground hover:bg-cream-dark"
              }
            `}
          >
            <Icon size={16} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
