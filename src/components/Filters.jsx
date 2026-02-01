import React from "react";

export default function Filters({ showFilters, filters, setFilters, dataFilters, toggleContinent, resetFilters, filteredStats }) {
  if (!showFilters) return null;

  const hasActiveFilters = filters.continents.length > 0 ||
    filters.happiness.min || filters.happiness.max ||
    filters.income.min || filters.income.max;

  return (
    <div className="mb-6 border-b border-neutral-800 pb-4">
      <div className="flex flex-wrap items-end gap-6">
        {/* Continents */}
        <div>
          <label className="block text-xs text-neutral-500 mb-2">Continent</label>
          <div className="flex flex-wrap gap-1.5">
            {dataFilters?.countries?.map((continent) => {
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
  );
}
