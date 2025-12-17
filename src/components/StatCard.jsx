import React from "react";
import { clsx } from "clsx";

const gradients = {
  cool: "from-white/10 via-white/5 to-white/0",
  warm: "from-silver/40 via-white/10 to-white/0",
};

export default function StatCard({ title, value, unit, hint, tone = "cool" }) {
  return (
    <div className="card relative overflow-hidden">
      <div className={clsx("absolute inset-0 blur-3xl opacity-70 bg-gradient-to-br", gradients[tone])} />
      <div className="relative flex flex-col gap-2">
        <p className="muted uppercase tracking-[0.08em]">{title}</p>
        <p className="text-3xl font-semibold text-accent">
          {value}
          {unit && <span className="text-sm text-silver/70 ml-1">{unit}</span>}
        </p>
        {hint && <p className="muted">{hint}</p>}
      </div>
    </div>
  );
}
