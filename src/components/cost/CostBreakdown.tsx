"use client";

import { useTripCosts } from "@/hooks/useTripCosts";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Plane, Hotel, MapPin } from "lucide-react";

const COLORS = ["#3498db", "#27ae60", "#1abc9c"];

export default function CostBreakdown({ tripId }: { tripId: string }) {
  const { costs, isLoading } = useTripCosts(tripId);

  if (isLoading || !costs || costs.grandTotal === 0) return null;

  const data = [
    { name: "Flights", value: costs.flights.total, icon: Plane, color: COLORS[0] },
    { name: "Hotels", value: costs.hotels.total, icon: Hotel, color: COLORS[1] },
    { name: "Activities", value: costs.activities.total, icon: MapPin, color: COLORS[2] },
  ].filter((d) => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="pinned-card pin-red p-5 pt-7">
      <h3 className="font-bold text-sm mb-4">Cost Breakdown</h3>

      <div className="flex items-center gap-6">
        {/* Chart */}
        <div className="w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${Number(value).toFixed(0)}`}
                contentStyle={{
                  backgroundColor: "#fffef9",
                  border: "1px solid #c4a882",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1">
          {data.map((item) => {
            const Icon = item.icon;
            const pct = ((item.value / costs.grandTotal) * 100).toFixed(0);
            return (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Icon size={14} className="text-muted" />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-muted">
                  ${item.value.toFixed(0)} <span className="text-xs">({pct}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
