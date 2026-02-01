import React from "react";
import ChartCard from "../components/ui/ChartCard";
import BasePlot from "../components/charts/BasePlot";

export default function Correlations({ correlations }) {
  return (
    <ChartCard title="Matrice de corrélation" subtitle="Coefficient de Pearson entre les variables (-1 à +1)">
      <BasePlot
        height={500}
        data={[{
          type: "heatmap",
          z: correlations?.correlation_matrix || [],
          x: correlations?.columns?.map((c) => c.replace(/_/g, " ")) || [],
          y: correlations?.columns?.map((c) => c.replace(/_/g, " ")) || [],
          colorscale: [[0, "#ef4444"], [0.5, "#262626"], [1, "#3b82f6"]],
          zmin: -1,
          zmax: 1,
          hovertemplate: "%{x}<br>×<br>%{y}<br><b>r = %{z:.2f}</b><extra></extra>",
          showscale: true,
          colorbar: { title: "r", thickness: 15 },
        }]}
        layout={{ margin: { l: 140, r: 40, t: 20, b: 120 }, xaxis: { tickangle: -45, side: "bottom" } }}
      />
    </ChartCard>
  );
}
