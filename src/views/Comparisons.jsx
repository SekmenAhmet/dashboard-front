import React from "react";
import ChartCard from "../components/ui/ChartCard";
import BasePlot from "../components/charts/BasePlot";
import { CONTINENT_COLORS } from "../constants/colors";

export default function Comparisons({ filteredGeo }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="Revenu vs Bonheur" subtitle="Corrélation entre richesse et bien-être">
          <BasePlot
            height={350}
            data={[{
              type: "scatter",
              mode: "markers",
              x: filteredGeo?.avg_income || [],
              y: filteredGeo?.happiness_score || [],
              text: filteredGeo?.cities || [],
              marker: { size: 8, color: filteredGeo?.countries?.map((c) => CONTINENT_COLORS[c]) || [], opacity: 0.7 },
              hovertemplate: "%{text}<br>Revenu: %{x}€<br>Bonheur: %{y:.1f}/10<extra></extra>",
            }]}
            layout={{ xaxis: { title: "Revenu (€/mois)" }, yaxis: { title: "Bonheur (/10)", range: [0, 10] } }}
          />
        </ChartCard>

        <ChartCard title="Qualité de l'air vs Bonheur" subtitle="Impact environnemental sur le bien-être">
          <BasePlot
            height={350}
            data={[{
              type: "scatter",
              mode: "markers",
              x: filteredGeo?.air_quality_index || [],
              y: filteredGeo?.happiness_score || [],
              text: filteredGeo?.cities || [],
              marker: { size: 8, color: filteredGeo?.countries?.map((c) => CONTINENT_COLORS[c]) || [], opacity: 0.7 },
              hovertemplate: "%{text}<br>AQI: %{x}<br>Bonheur: %{y:.1f}/10<extra></extra>",
            }]}
            layout={{ xaxis: { title: "Index qualité air (AQI - bas = mieux)" }, yaxis: { title: "Bonheur (/10)", range: [0, 10] } }}
          />
        </ChartCard>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="Revenus par continent" subtitle="Distribution des revenus mensuels">
          <BasePlot
            height={320}
            data={[...new Set(filteredGeo?.countries || [])].map((continent) => {
              const indices = filteredGeo.countries.map((c, i) => (c === continent ? i : -1)).filter((i) => i >= 0);
              return { type: "box", name: continent, y: indices.map((i) => filteredGeo.avg_income[i]), marker: { color: CONTINENT_COLORS[continent] }, boxpoints: false };
            })}
            layout={{ showlegend: false, yaxis: { title: "Revenu (€/mois)" } }}
          />
        </ChartCard>

        <ChartCard title="Bonheur par continent" subtitle="Distribution des scores de bonheur">
          <BasePlot
            height={320}
            data={[...new Set(filteredGeo?.countries || [])].map((continent) => {
              const indices = filteredGeo.countries.map((c, i) => (c === continent ? i : -1)).filter((i) => i >= 0);
              return { type: "box", name: continent, y: indices.map((i) => filteredGeo.happiness_score[i]), marker: { color: CONTINENT_COLORS[continent] }, boxpoints: false };
            })}
            layout={{ showlegend: false, yaxis: { title: "Bonheur (/10)", range: [0, 10] } }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
