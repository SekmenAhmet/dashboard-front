import React from "react";
import ChartCard from "../components/ui/ChartCard";
import BasePlot from "../components/charts/BasePlot";
import { CONTINENT_COLORS } from "../constants/colors";

export default function Distributions({ filters, filteredGeo, rentEffort }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <ChartCard title="Distribution du bonheur" subtitle="Répartition des scores de 0 à 10">
        <BasePlot
          height={320}
          data={
            filters.continents.length > 0
              ? filters.continents.map((continent) => {
                  const indices = filteredGeo.countries.map((c, i) => c === continent ? i : -1).filter(i => i >= 0);
                  return {
                    type: "histogram",
                    name: continent,
                    x: indices.map(i => filteredGeo.happiness_score[i]),
                    nbinsx: 15,
                    opacity: 0.7,
                    marker: { color: CONTINENT_COLORS[continent] },
                  };
                })
              : [{
                  type: "histogram",
                  x: filteredGeo?.happiness_score || [],
                  nbinsx: 20,
                  marker: { color: "#737373", opacity: 0.8 },
                }]
          }
          layout={{
            xaxis: { title: "Score bonheur (/10)" },
            yaxis: { title: "Nombre de villes" },
            barmode: "overlay",
            showlegend: filters.continents.length > 1,
            legend: { x: 1, xanchor: "right", y: 1, bgcolor: "transparent", font: { size: 10 } },
          }}
        />
      </ChartCard>

      <ChartCard title="Distribution des revenus" subtitle="Revenu mensuel moyen en euros">
        <BasePlot
          height={320}
          data={
            filters.continents.length > 0
              ? filters.continents.map((continent) => {
                  const indices = filteredGeo.countries.map((c, i) => c === continent ? i : -1).filter(i => i >= 0);
                  return {
                    type: "histogram",
                    name: continent,
                    x: indices.map(i => filteredGeo.avg_income[i]),
                    nbinsx: 20,
                    opacity: 0.7,
                    marker: { color: CONTINENT_COLORS[continent] },
                  };
                })
              : [{
                  type: "histogram",
                  x: filteredGeo?.avg_income || [],
                  nbinsx: 25,
                  marker: { color: "#737373", opacity: 0.8 },
                }]
          }
          layout={{
            xaxis: { title: "Revenu (€/mois)" },
            yaxis: { title: "Nombre de villes" },
            barmode: "overlay",
            showlegend: filters.continents.length > 1,
            legend: { x: 1, xanchor: "right", y: 1, bgcolor: "transparent", font: { size: 10 } },
          }}
        />
      </ChartCard>

      <ChartCard title="Effort logement" subtitle="Ratio loyer/revenu mensuel">
        <BasePlot
          height={320}
          data={
            filters.continents.length > 0
              ? filters.continents.map((continent) => {
                  const indices = filteredGeo.countries.map((c, i) => c === continent ? i : -1).filter(i => i >= 0);
                  return {
                    type: "histogram",
                    name: continent,
                    x: indices.map(i => rentEffort[i]),
                    nbinsx: 20,
                    opacity: 0.7,
                    marker: { color: CONTINENT_COLORS[continent] },
                  };
                })
              : [{
                  type: "histogram",
                  x: rentEffort,
                  nbinsx: 25,
                  marker: { color: "#737373", opacity: 0.8 },
                }]
          }
          layout={{
            xaxis: { title: "Loyer / Revenu (%)" },
            yaxis: { title: "Nombre de villes" },
            barmode: "overlay",
            showlegend: filters.continents.length > 1,
            legend: { x: 1, xanchor: "right", y: 1, bgcolor: "transparent", font: { size: 10 } },
          }}
        />
      </ChartCard>

      <ChartCard title="Qualité de l'air" subtitle="Index AQI (plus bas = meilleur)">
        <BasePlot
          height={320}
          data={
            filters.continents.length > 0
              ? filters.continents.map((continent) => {
                  const indices = filteredGeo.countries.map((c, i) => c === continent ? i : -1).filter(i => i >= 0);
                  return {
                    type: "histogram",
                    name: continent,
                    x: indices.map(i => filteredGeo.air_quality_index[i]),
                    nbinsx: 15,
                    opacity: 0.7,
                    marker: { color: CONTINENT_COLORS[continent] },
                  };
                })
              : [{
                  type: "histogram",
                  x: filteredGeo?.air_quality_index || [],
                  nbinsx: 20,
                  marker: { color: "#737373", opacity: 0.8 },
                }]
          }
          layout={{
            xaxis: { title: "Index qualité air (AQI)" },
            yaxis: { title: "Nombre de villes" },
            barmode: "overlay",
            showlegend: filters.continents.length > 1,
            legend: { x: 1, xanchor: "right", y: 1, bgcolor: "transparent", font: { size: 10 } },
          }}
        />
      </ChartCard>
    </div>
  );
}
