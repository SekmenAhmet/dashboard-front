import React from "react";
import StatCard from "../components/ui/StatCard";
import ChartCard from "../components/ui/ChartCard";
import BasePlot from "../components/charts/BasePlot";
import { CHART_COLORS, CONTINENT_COLORS } from "../constants/colors";

export default function Overview({ filteredStats, topCities, continentStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Villes filtrées" value={filteredStats?.count || 0} color="blue" />
        <StatCard label="Bonheur moyen" value={filteredStats?.avgHappiness?.toFixed(1) || "-"} unit="/10" color="green" />
        <StatCard label="Revenu moyen" value={filteredStats?.avgIncome?.toFixed(0) || "-"} unit="€" color="purple" />
        <StatCard label="Qualité air" value={filteredStats?.avgAir?.toFixed(0) || "-"} unit="AQI" color="orange" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="Top 10 villes par bonheur" subtitle="Score de bonheur le plus élevé">
          <BasePlot
            height={320}
            data={[{
              type: "bar",
              orientation: "h",
              y: topCities.map((c) => c.city).reverse(),
              x: topCities.map((c) => c.happiness).reverse(),
              marker: { color: topCities.map((c) => CONTINENT_COLORS[c.country] || CHART_COLORS.neutral).reverse() },
              hovertemplate: "%{y}: %{x:.1f}/10<extra></extra>",
            }]}
            layout={{ margin: { l: 100, r: 20, t: 10, b: 30 }, xaxis: { title: "Score bonheur", range: [0, 10] } }}
          />
        </ChartCard>

        <ChartCard title="Répartition par continent" subtitle="Nombre de villes par région">
          <BasePlot
            height={320}
            data={[{
              type: "bar",
              x: continentStats.map((c) => c.continent),
              y: continentStats.map((c) => c.cities),
              marker: { color: continentStats.map((c) => CONTINENT_COLORS[c.continent] || CHART_COLORS.neutral) },
              hovertemplate: "%{x}: %{y} villes<extra></extra>",
            }]}
            layout={{ xaxis: { title: "" }, yaxis: { title: "Nombre de villes" } }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
