import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import { getFilters, getGeographic, getOverview, getCorrelations, getCitiesByCountry } from "./api/client";

const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  neutral: "#6b7280",
};

const CONTINENT_COLORS = {
  Europe: "#3b82f6",
  Asia: "#f59e0b",
  "North America": "#10b981",
  "South America": "#8b5cf6",
  Africa: "#ef4444",
  Oceania: "#06b6d4",
};

const TABS = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "distributions", label: "Distributions" },
  { id: "comparisons", label: "Comparaisons" },
  { id: "correlations", label: "Corrélations" },
  { id: "geography", label: "Géographie" },
];

function StatCard({ label, value, unit, color = "blue" }) {
  const colors = {
    blue: "border-blue-500/30 bg-blue-500/5",
    green: "border-emerald-500/30 bg-emerald-500/5",
    purple: "border-purple-500/30 bg-purple-500/5",
    orange: "border-orange-500/30 bg-orange-500/5",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">
        {value}
        {unit && <span className="text-sm text-neutral-400 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = "" }) {
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

function BasePlot({ data, layout, height = 300 }) {
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

export default function App() {
  const [data, setData] = useState({
    overview: null,
    geo: null,
    filters: null,
    correlations: null,
    byCountry: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(true);

  const [filters, setFilters] = useState({
    continents: [],
    happiness: { min: "", max: "" },
    income: { min: "", max: "" },
  });

  useEffect(() => {
    async function load() {
      try {
        const [overview, geo, filtersData, correlations, byCountry] = await Promise.all([
          getOverview(),
          getGeographic(),
          getFilters(),
          getCorrelations(),
          getCitiesByCountry(),
        ]);
        setData({ overview, geo, filters: filtersData, correlations, byCountry });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredGeo = useMemo(() => {
    if (!data.geo) return null;

    const indices = data.geo.cities
      .map((_, i) => {
        const country = data.geo.countries[i];
        const happiness = data.geo.happiness_score[i];
        const income = data.geo.avg_income[i];

        if (filters.continents.length > 0 && !filters.continents.includes(country)) return -1;
        if (filters.happiness.min && happiness < Number(filters.happiness.min)) return -1;
        if (filters.happiness.max && happiness > Number(filters.happiness.max)) return -1;
        if (filters.income.min && income < Number(filters.income.min)) return -1;
        if (filters.income.max && income > Number(filters.income.max)) return -1;
        return i;
      })
      .filter((i) => i >= 0);

    const pick = (arr) => indices.map((i) => arr[i]);

    return {
      cities: pick(data.geo.cities),
      countries: pick(data.geo.countries),
      avg_income: pick(data.geo.avg_income),
      happiness_score: pick(data.geo.happiness_score),
      air_quality_index: pick(data.geo.air_quality_index),
      public_transport_score: pick(data.geo.public_transport_score),
      green_space_ratio: pick(data.geo.green_space_ratio),
      internet_penetration: pick(data.geo.internet_penetration),
      population_density: pick(data.geo.population_density),
      avg_rent: pick(data.geo.avg_rent),
      latitude: pick(data.geo.latitude),
      longitude: pick(data.geo.longitude),
    };
  }, [data.geo, filters]);

  const filteredStats = useMemo(() => {
    if (!filteredGeo || filteredGeo.cities.length === 0) return null;
    const count = filteredGeo.cities.length;
    const avgHappiness = filteredGeo.happiness_score.reduce((a, b) => a + b, 0) / count;
    const avgIncome = filteredGeo.avg_income.reduce((a, b) => a + b, 0) / count;
    const avgAir = filteredGeo.air_quality_index.reduce((a, b) => a + b, 0) / count;
    return { count, avgHappiness, avgIncome, avgAir };
  }, [filteredGeo]);

  const topCities = useMemo(() => {
    if (!filteredGeo) return [];
    return filteredGeo.cities
      .map((city, i) => ({
        city,
        country: filteredGeo.countries[i],
        happiness: filteredGeo.happiness_score[i],
        income: filteredGeo.avg_income[i],
      }))
      .sort((a, b) => b.happiness - a.happiness)
      .slice(0, 10);
  }, [filteredGeo]);

  const continentStats = useMemo(() => {
    if (!filteredGeo) return [];
    const stats = {};
    filteredGeo.countries.forEach((country, i) => {
      if (!stats[country]) stats[country] = { count: 0, happiness: [], income: [] };
      stats[country].count++;
      stats[country].happiness.push(filteredGeo.happiness_score[i]);
      stats[country].income.push(filteredGeo.avg_income[i]);
    });
    return Object.entries(stats).map(([continent, s]) => ({
      continent,
      cities: s.count,
      avgHappiness: s.happiness.reduce((a, b) => a + b, 0) / s.happiness.length,
      avgIncome: s.income.reduce((a, b) => a + b, 0) / s.income.length,
    }));
  }, [filteredGeo]);

  const rentEffort = useMemo(() => {
    if (!filteredGeo) return [];
    return filteredGeo.avg_income.map((income, i) => {
      const rent = filteredGeo.avg_rent[i];
      if (!income || income === 0) return 0;
      return (rent / income) * 100;
    });
  }, [filteredGeo]);

  const resetFilters = () => {
    setFilters({
      continents: [],
      happiness: { min: "", max: "" },
      income: { min: "", max: "" },
    });
  };

  const toggleContinent = (continent) => {
    setFilters((prev) => ({
      ...prev,
      continents: prev.continents.includes(continent)
        ? prev.continents.filter((c) => c !== continent)
        : [...prev.continents, continent],
    }));
  };

  const hasActiveFilters = filters.continents.length > 0 ||
    filters.happiness.min || filters.happiness.max ||
    filters.income.min || filters.income.max;

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-2xl">!</span>
          </div>
          <p className="text-red-400 mb-2">Erreur de connexion</p>
          <p className="text-neutral-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 text-sm">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const { overview, correlations } = data;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <span className="text-sm font-medium text-neutral-300">City Lifestyle</span>

            <div className="flex items-center gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs transition-colors ${
                    activeTab === tab.id
                      ? "text-white"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`text-xs transition-colors ${
                showFilters ? "text-white" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Filtres {hasActiveFilters && "•"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtres */}
        {showFilters && (
          <div className="mb-6 border-b border-neutral-800 pb-4">
            <div className="flex flex-wrap items-end gap-6">
              {/* Continents */}
              <div>
                <label className="block text-xs text-neutral-500 mb-2">Continent</label>
                <div className="flex flex-wrap gap-1.5">
                  {data.filters?.countries?.map((continent) => {
                    const isSelected = filters.continents.includes(continent);
                    return (
                      <button
                        key={continent}
                        onClick={() => toggleContinent(continent)}
                        className={`px-2.5 py-1 text-xs rounded transition-colors ${
                          isSelected
                            ? "bg-neutral-700 text-white"
                            : "bg-neutral-800/50 text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        {continent}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bonheur */}
              <div>
                <label className="block text-xs text-neutral-500 mb-2">Bonheur</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filters.happiness.min}
                    onChange={(e) => setFilters({ ...filters, happiness: { ...filters.happiness, min: e.target.value } })}
                    className="w-16 bg-transparent border border-neutral-800 rounded px-2 py-1 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                  />
                  <span className="text-neutral-600 text-xs">—</span>
                  <input
                    type="number"
                    placeholder="10"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filters.happiness.max}
                    onChange={(e) => setFilters({ ...filters, happiness: { ...filters.happiness, max: e.target.value } })}
                    className="w-16 bg-transparent border border-neutral-800 rounded px-2 py-1 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              {/* Revenu */}
              <div>
                <label className="block text-xs text-neutral-500 mb-2">Revenu (€)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    step="500"
                    value={filters.income.min}
                    onChange={(e) => setFilters({ ...filters, income: { ...filters.income, min: e.target.value } })}
                    className="w-20 bg-transparent border border-neutral-800 rounded px-2 py-1 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                  />
                  <span className="text-neutral-600 text-xs">—</span>
                  <input
                    type="number"
                    placeholder="∞"
                    min="0"
                    step="500"
                    value={filters.income.max}
                    onChange={(e) => setFilters({ ...filters, income: { ...filters.income, max: e.target.value } })}
                    className="w-20 bg-transparent border border-neutral-800 rounded px-2 py-1 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              {/* Résultat + Reset */}
              <div className="flex items-center gap-4 ml-auto">
                <span className="text-xs text-neutral-500">
                  {filteredStats?.count || 0} villes
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-neutral-500 hover:text-white transition-colors"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenu des onglets */}
        {activeTab === "overview" && (
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
        )}

        {activeTab === "distributions" && (
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
        )}

        {activeTab === "comparisons" && (
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
        )}

        {activeTab === "correlations" && (
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
        )}

        {activeTab === "geography" && (
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
        )}
      </div>
    </div>
  );
}
