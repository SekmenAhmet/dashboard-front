import React from "react";

export default function StatCard({ label, value, unit, color = "blue" }) {
  const colors = {
    blue: "border-blue-500/30 bg-blue-500/5",
    green: "border-emerald-500/30 bg-emerald-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
    orange: "border-orange-500/30 bg-orange-500/5",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">
        {value}
        {unit && <span className="text-sm text-neutral-400 ml-1">{unit}</span>}
      </p>
    </div>
  );
}
