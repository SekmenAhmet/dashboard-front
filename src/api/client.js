const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function fetchJSON(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getOverview() {
  return fetchJSON("/api/overview");
}

export async function getGeographic() {
  return fetchJSON("/api/geographic");
}

export async function getCorrelations() {
  return fetchJSON("/api/correlations");
}

export async function getCitiesByCountry() {
  return fetchJSON("/api/cities/by-country");
}

export async function getTopCities(metric, topN = 10) {
  return fetchJSON(`/api/cities/top/${metric}?top_n=${topN}`);
}

export async function getFilters() {
  return fetchJSON("/api/filters");
}

export const apiBase = API_BASE;
