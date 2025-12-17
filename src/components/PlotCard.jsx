import React from "react";
import Plot from "react-plotly.js";

export default function PlotCard({ title, description, height = 360, children }) {
  return (
    <div className="card h-full flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="section-title">{title}</h3>
          {description && <p className="muted">{description}</p>}
        </div>
        {children?.controls}
      </div>
      {children?.plot}
    </div>
  );
}

export function StyledPlot({ layout = {}, config = {}, style = {}, ...rest }) {
  const baseLayout = {
    paper_bgcolor: "#0a0a0b",
    plot_bgcolor: "#0a0a0b",
    font: { color: "#f5f5f5", family: "Inter, system-ui, sans-serif" },
    margin: { l: 60, r: 40, t: 40, b: 60 },
    ...layout,
  };

  const baseConfig = {
    displayModeBar: false,
    responsive: true,
    ...config,
  };

  return (
    <Plot
      style={{ width: "100%", height: "100%", ...style }}
      useResizeHandler
      layout={baseLayout}
      config={baseConfig}
      {...rest}
    />
  );
}
