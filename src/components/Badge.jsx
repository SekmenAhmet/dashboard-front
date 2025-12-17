import React from "react";
import { clsx } from "clsx";

export default function Badge({ children, tone = "neutral" }) {
  const styles = {
    neutral: "bg-smoke text-silver",
    accent: "bg-white/10 text-accent border border-white/10",
  };
  return (
    <span className={clsx("px-3 py-1 rounded-full text-xs font-medium", styles[tone])}>{children}</span>
  );
}
