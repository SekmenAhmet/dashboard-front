import React, { useEffect, useMemo, useState } from "react";
import { getCitiesByCountry, getCorrelations, getGeographic, getOverview, getTopCities, apiBase } from "./api/client";
import StatCard from "./components/StatCard";
import PlotCard, { StyledPlot } from "./components/PlotCard";
import Badge from "./components/Badge";
import "./index.css";

const metrics = [
  { key: "happiness_score", label: "Bonheur" },
  { key: "avg_income", label: "Revenu" },
  { key: "internet_penetration", label: "Internet" },
  { key: "public_transport_score", label: "Transports" },
  { key: "green_space_ratio", label: "Espaces verts" },
  { key: "air_quality_index", label: "Qualité de l'air" },
];

function Header({ totalCities }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <p className="text-sm text-silver/60 uppercase tracking-[0.14em]">City Lifestyle Dashboard</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-2 text-accent">Qualité de vie urbaine</h1>
        <p className="text-silver/70 mt-2">
          Visualisation des indicateurs clés : bonheur, revenu, mobilité, environnement et connectivité.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>API: {apiBase}</Badge>
        <Badge tone="accent">Villes : {totalCities ?? "..."}</Badge>
      </div>
    </header>
  );
}

export default function App() {
  const [overview, setOverview] = useState(null);
  const [geo, setGeo] = useState(null);
  const [correlations, setCorrelations] = useState(null);
  const [countryStats, setCountryStats] = useState(null);
  const [top, setTop] = useState(null);
  const [currentTab, setCurrentTab] = useState("overview");
  const [metric, setMetric] = useState("happiness_score");
  const [topN, setTopN] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        const [overviewData, geoData, corrData, countryData] = await Promise.all([
          getOverview(),
          getGeographic(),
          getCorrelations(),
          getCitiesByCountry(),
        ]);
        setOverview(overviewData);
        setGeo(geoData);
        setCorrelations(corrData);
        setCountryStats(countryData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    async function fetchTop() {
      try {
        const topData = await getTopCities(metric, topN);
        setTop(topData);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchTop();
  }, [metric, topN]);

  const histogramData = useMemo(() => {
    if (!geo) return null;
    return {
      incomes: geo.avg_income,
      happiness: geo.happiness_score,
    };
  }, [geo]);

  const mapData = useMemo(() => {
    if (!geo) return null;
    return {
      lon: geo.longitude,
      lat: geo.latitude,
      text: geo.cities.map((city, idx) => `${city} · ${geo.countries[idx]}`),
      happiness: geo.happiness_score,
    };
  }, [geo]);

  const scatterData = useMemo(() => {
    if (!geo) return null;
    return {
      x: geo.avg_income,
      y: geo.happiness_score,
      transport: geo.public_transport_score,
      text: geo.cities.map((city, idx) => `${city} · ${geo.countries[idx]}`),
    };
  }, [geo]);

  const topData = useMemo(() => {
    if (!top) return null;
    return {
      x: top.metric_values,
      y: top.cities.map((c, idx) => `${c} · ${top.countries[idx]}`),
    };
  }, [top]);

  const heatmapData = useMemo(() => {
    if (!correlations) return null;
    return {
      z: correlations.correlation_matrix,
      x: correlations.columns,
      y: correlations.columns,
    };
  }, [correlations]);

  const countryBreakdown = useMemo(() => {
    if (!countryStats) return null;
    return {
      countries: countryStats.countries,
      cityCount: countryStats.city_count,
      happiness: countryStats.avg_happiness,
    };
  }, [countryStats]);

  if (error) {
    return (
      <div className="min-h-screen bg-ink text-accent flex items-center justify-center">
        <div className="card max-w-xl text-center space-y-3">
          <h2 className="text-xl font-semibold">Erreur</h2>
          <p className="text-silver/70">{error}</p>
          <p className="muted">Vérifiez que l'API backend est lancée sur {apiBase}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 py-6">
      <Header totalCities={overview?.total_cities} />

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "overview", label: "Vue d'ensemble" },
          { key: "comparisons", label: "Comparaisons & corrélations" },
          { key: "geography", label: "Géographie & pays" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCurrentTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm border ${
              currentTab === tab.key
                ? "bg-white/10 border-white/20 text-accent"
                : "bg-smoke border-white/10 text-silver hover:border-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="card h-28 skeleton" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {currentTab === "overview" && (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Villes"
                  value={overview?.total_cities ?? "-"}
                  hint={`${overview?.countries?.length ?? 0} pays`}
                  tone="warm"
                />
                <StatCard
                  title="Bonheur moyen"
                  value={(overview?.avg_happiness ?? 0).toFixed(2)}
                  unit="/10"
                  hint={`Plage ${overview?.happiness_range?.min ?? "-"}–${overview?.happiness_range?.max ?? "-"}`}
                />
                <StatCard
                  title="Revenu moyen"
                  value={`${Math.round(overview?.avg_income ?? 0).toLocaleString()} €`}
                  hint={`Plage ${overview?.income_range?.min ?? "-"}–${overview?.income_range?.max ?? "-"}`}
                />
                <StatCard
                  title="Qualité de l'air"
                  value={(overview?.avg_air_quality ?? 0).toFixed(1)}
                  hint="Index moyen (AQI)"
                />
              </section>

              <section className="space-y-4">
                <PlotCard
                  title="Top villes par métrique"
                  description="Graphique dynamique sur la métrique sélectionnée"
                  height={440}
                >
                  {{
                    controls: (
                      <div className="flex items-center gap-2">
                        <select
                          className="bg-smoke border border-white/10 rounded-lg px-3 py-2 text-sm text-accent"
                          value={metric}
                          onChange={(e) => setMetric(e.target.value)}
                        >
                          {metrics.map((m) => (
                            <option key={m.key} value={m.key}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={3}
                          max={15}
                          value={topN}
                          onChange={(e) => setTopN(Number(e.target.value))}
                          className="bg-smoke border border-white/10 rounded-lg px-3 py-2 w-20 text-sm text-accent"
                        />
                      </div>
                    ),
                    plot: (
                      <StyledPlot
                        style={{ height: 440 }}
                        data={[
                          {
                            type: "bar",
                            orientation: "h",
                            x: topData?.x ?? [],
                            y: topData?.y ?? [],
                            marker: {
                              color: "#f5f5f5",
                              line: { color: "#1f1f22", width: 1 },
                            },
                          },
                        ]}
                        layout={{
                          height: 440,
                          margin: { l: 160, r: 60, t: 40, b: 60 },
                          xaxis: { title: metrics.find((m) => m.key === metric)?.label ?? "Valeur" },
                          yaxis: { automargin: true },
                        }}
                      />
                    ),
                  }}
                </PlotCard>

                <PlotCard
                  title="Distribution des revenus"
                  description="Histogramme des revenus moyens par ville"
                  height={420}
                >
                  {{
                    plot: (
                      <StyledPlot
                        style={{ height: 420 }}
                        data={[
                          {
                            type: "histogram",
                            x: histogramData?.incomes ?? [],
                            marker: { color: "#f5f5f5", line: { color: "#111113", width: 1 } },
                            nbinsx: 30,
                            opacity: 0.9,
                          },
                        ]}
                        layout={{
                          height: 420,
                          bargap: 0.06,
                          xaxis: { title: "Revenu moyen (€)" },
                          yaxis: { title: "Nombre de villes" },
                        }}
                      />
                    ),
                  }}
                </PlotCard>

                <PlotCard
                  title="Distribution du bonheur"
                  description="Histogramme du score de bonheur par ville"
                  height={420}
                >
                  {{
                    plot: (
                      <StyledPlot
                        style={{ height: 420 }}
                        data={[
                          {
                            type: "histogram",
                            x: histogramData?.happiness ?? [],
                            marker: { color: "#d1d5db", line: { color: "#111113", width: 1 } },
                            nbinsx: 28,
                            opacity: 0.9,
                          },
                        ]}
                        layout={{
                          height: 420,
                          bargap: 0.08,
                          xaxis: { title: "Score de bonheur (/10)" },
                          yaxis: { title: "Nombre de villes" },
                        }}
                      />
                    ),
                  }}
                </PlotCard>
              </section>
            </>
          )}

          {currentTab === "comparisons" && (
            <section className="space-y-4">
              <PlotCard
                title="Bonheur vs revenu"
                description="Dispersion des villes, colorée par qualité des transports"
                height={520}
              >
                {{
                  plot: (
                    <StyledPlot
                      style={{ height: 520 }}
                      data={[
                        {
                          type: "scattergl",
                          mode: "markers",
                          x: scatterData?.x ?? [],
                          y: scatterData?.y ?? [],
                          text: scatterData?.text ?? [],
                          marker: {
                            size: 9,
                            opacity: 0.82,
                            color: scatterData?.transport ?? [],
                            colorscale: "Greys",
                            showscale: true,
                            colorbar: { title: "Transports" },
                            line: { color: "#0a0a0b", width: 0.5 },
                          },
                          hoverinfo: "text+x+y",
                        },
                      ]}
                      layout={{
                        height: 520,
                        xaxis: { title: "Revenu moyen (€)" },
                        yaxis: { title: "Bonheur (/10)" },
                        margin: { l: 90, r: 60, t: 40, b: 80 },
                      }}
                    />
                  ),
                }}
              </PlotCard>

              <PlotCard
                title="Corrélations"
                description="Matrice de corrélation des variables numériques"
                height={640}
              >
                {{
                  plot: (
                    <StyledPlot
                      style={{ height: 640 }}
                      data={[
                        {
                          type: "heatmap",
                          z: heatmapData?.z ?? [],
                          x: heatmapData?.x ?? [],
                          y: heatmapData?.y ?? [],
                          colorscale: "Greys",
                          reversescale: true,
                          showscale: true,
                        },
                      ]}
                      layout={{
                        height: 640,
                        margin: { l: 100, r: 80, t: 40, b: 100 },
                      }}
                    />
                  ),
                }}
              </PlotCard>
            </section>
          )}

          {currentTab === "geography" && (
            <section className="space-y-4">
              <PlotCard
                title="Carte des villes"
                description="Dispersion des villes sur le globe, colorée par score de bonheur"
                height={640}
              >
                {{
                  plot: (
                    <StyledPlot
                      style={{ height: 640 }}
                      data={[
                        {
                          type: "scattergeo",
                          mode: "markers",
                          lon: mapData?.lon ?? [],
                          lat: mapData?.lat ?? [],
                          text: mapData?.text ?? [],
                          marker: {
                            size: 7,
                            color: mapData?.happiness ?? [],
                            colorscale: "Greys",
                            showscale: true,
                            colorbar: { title: "Bonheur" },
                            line: { color: "#0a0a0b", width: 0.6 },
                          },
                          hoverinfo: "text",
                        },
                      ]}
                      layout={{
                        height: 640,
                        geo: {
                          projection: { type: "natural earth" },
                          bgcolor: "#0a0a0b",
                          showframe: false,
                          showcountries: true,
                          countrycolor: "#2c2c30",
                          landcolor: "#111113",
                          oceancolor: "#0a0a0b",
                        },
                        margin: { l: 0, r: 0, t: 20, b: 20 },
                      }}
                    />
                  ),
                }}
              </PlotCard>

              <PlotCard
                title="Villes par pays"
                description="Volume de villes par pays, coloré par bonheur moyen"
                height={520}
              >
                {{
                  plot: (
                    <StyledPlot
                      style={{ height: 520 }}
                      data={[
                        {
                          type: "bar",
                          x: countryBreakdown?.countries ?? [],
                          y: countryBreakdown?.cityCount ?? [],
                          marker: {
                            color: countryBreakdown?.happiness ?? [],
                            colorscale: "Greys",
                            showscale: true,
                            colorbar: { title: "Bonheur moyen" },
                            line: { color: "#1f1f22", width: 1 },
                          },
                        },
                      ]}
                      layout={{
                        height: 520,
                        margin: { l: 80, r: 60, t: 50, b: 120 },
                        xaxis: { title: "Pays" },
                        yaxis: { title: "Nombre de villes" },
                      }}
                    />
                  ),
                }}
              </PlotCard>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
