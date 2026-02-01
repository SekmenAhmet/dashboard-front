import { useState, useEffect, useMemo } from "react";
import { getFilters, getGeographic, getOverview, getCorrelations, getCitiesByCountry } from "../api/client";

export function useDashboard() {
  const [data, setData] = useState({
    overview: null,
    geo: null,
    filters: null,
    correlations: null,
    byCountry: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
      .slice(10); // Note: Original code was slice(0, 10). Wait, slice(10) gives everything AFTER index 10. The original was slice(0, 10) for TOP 10.
  }, [filteredGeo]);

  // CORRECTION: The original code used .slice(0, 10). I must ensure I don't introduce a bug.
  // I will fix the slice in the next write, I'll rewrite this part to be sure.
  
  const topCitiesFixed = useMemo(() => {
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

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    filteredGeo,
    filteredStats,
    topCities: topCitiesFixed,
    continentStats,
    rentEffort,
    resetFilters,
    toggleContinent
  };
}
