import { useState } from "react";
import { useDashboard } from "./hooks/useDashboard";
import Navbar from "./components/Navbar";
import Filters from "./components/Filters";
import Overview from "./views/Overview";
import Distributions from "./views/Distributions";
import Comparisons from "./views/Comparisons";
import Correlations from "./views/Correlations";
import Geography from "./views/Geography";

export default function App() {
  const {
    data,
    loading,
    error,
    filters,
    setFilters,
    filteredGeo,
    filteredStats,
    topCities,
    continentStats,
    rentEffort,
    resetFilters,
    toggleContinent
  } = useDashboard();

  const [activeTab, setActiveTab] = useState("overview");
  const [showFilters, setShowFilters] = useState(true);

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

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Filters
          showFilters={showFilters}
          filters={filters}
          setFilters={setFilters}
          dataFilters={data.filters}
          toggleContinent={toggleContinent}
          resetFilters={resetFilters}
          filteredStats={filteredStats}
        />

        {activeTab === "overview" && (
          <Overview
            filteredStats={filteredStats}
            topCities={topCities}
            continentStats={continentStats}
          />
        )}

        {activeTab === "distributions" && (
          <Distributions
            filters={filters}
            filteredGeo={filteredGeo}
            rentEffort={rentEffort}
          />
        )}

        {activeTab === "comparisons" && (
          <Comparisons
            filteredGeo={filteredGeo}
          />
        )}

        {activeTab === "correlations" && (
          <Correlations
            correlations={data.correlations}
          />
        )}

        {activeTab === "geography" && (
          <Geography
            filteredGeo={filteredGeo}
            continentStats={continentStats}
          />
        )}
      </div>
    </div>
  );
}
