import React from "react";

const TABS = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "distributions", label: "Distributions" },
  { id: "comparisons", label: "Comparaisons" },
  { id: "correlations", label: "Corrélations" },
  { id: "geography", label: "Géographie" },
];

export default function Navbar({ activeTab, setActiveTab, showFilters, setShowFilters, hasActiveFilters }) {
  return (
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
  );
}
