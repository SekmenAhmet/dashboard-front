import React from "react";
import Plot from "react-plotly.js";
import ChartCard from "../components/ui/ChartCard";
import BasePlot from "../components/charts/BasePlot";
import { CONTINENT_COLORS } from "../constants/colors";

export default function Geography({ filteredGeo, continentStats }) {
  return (
    <div className="space-y-4">
      <ChartCard
        title="Carte mondiale"
        subtitle="Coordonnées approximatives (données synthétiques pour démonstration)"
      >
        <Plot
          data={[{
            type: "scattergeo",
            mode: "markers",
            lon: filteredGeo?.longitude || [],
            lat: filteredGeo?.latitude || [],
            text: filteredGeo?.cities?.map((c, i) =>
              `${c}<br>${filteredGeo.countries[i]}<br>Bonheur: ${filteredGeo.happiness_score[i]?.toFixed(1)}/10<br>Revenu: ${filteredGeo.avg_income[i]}€`
            ) || [],
            marker: {
              size: 10,
              color: filteredGeo?.happiness_score || [],
              colorscale: [[0, "#ef4444"], [0.5, "#f59e0b"], [1, "#10b981"]],
              cmin: 2,
              cmax: 9,
              colorbar: { title: "Bonheur", thickness: 15, len: 0.6 },
              line: { color: "#171717", width: 1 },
            },
            hoverinfo: "text",
          }]}
          layout={{
            height: 500,
            paper_bgcolor: "transparent",
            margin: { l: 0, r: 0, t: 10, b: 10 },
            geo: {
              projection: { type: "natural earth" },
              bgcolor: "transparent",
              showland: true,
              landcolor: "#262626",
              showocean: true,
              oceancolor: "#171717",
              showcoastlines: true,
              coastlinecolor: "#404040",
              showcountries: true,
              countrycolor: "#404040",
              showframe: false,
            },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%", height: 500 }}
          useResizeHandler
        />
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="Répartition géographique" subtitle="Nombre de villes par continent">
          <BasePlot
            height={300}
            data={[{
              type: "pie",
              labels: continentStats.map((c) => c.continent),
              values: continentStats.map((c) => c.cities),
              marker: { colors: continentStats.map((c) => CONTINENT_COLORS[c.continent]) },
              textinfo: "label+percent",
              hovertemplate: "%{label}: %{value} villes<extra></extra>",
            }]}
            layout={{ showlegend: false, margin: { l: 20, r: 20, t: 20, b: 20 } }}
          />
        </ChartCard>

        <ChartCard title="Bonheur par région" subtitle="Score moyen par continent">
          <BasePlot
            height={300}
            data={[{
              type: "bar",
              x: continentStats.map((c) => c.continent),
              y: continentStats.map((c) => c.avgHappiness),
              marker: { color: continentStats.map((c) => CONTINENT_COLORS[c.continent]) },
              hovertemplate: "%{x}: %{y:.1f}/10<extra></extra>",
            }]}
            layout={{ yaxis: { title: "Bonheur moyen (/10)", range: [0, 10] } }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
