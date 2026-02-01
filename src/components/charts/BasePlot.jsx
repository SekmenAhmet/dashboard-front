import React from "react";
import Plot from "react-plotly.js";

export default function BasePlot({ data, layout, height = 300 }) {
  return (
    <Plot
      data={data}
      layout={{
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: "#a3a3a3", size: 11, family: "Inter, system-ui" },
        margin: { l: 50, r: 20, t: 20, b: 40 },
        height,
        xaxis: { gridcolor: "#262626", zerolinecolor: "#404040" },
        yaxis: { gridcolor: "#262626", zerolinecolor: "#404040" },
        ...layout,
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%", height }}
      useResizeHandler
    />
  );
}
