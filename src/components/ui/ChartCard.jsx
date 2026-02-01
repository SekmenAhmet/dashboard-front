import React from "react";

export default function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-neutral-300">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
