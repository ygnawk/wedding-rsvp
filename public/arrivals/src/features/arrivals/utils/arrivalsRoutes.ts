import type { ArrivalByCountry, ArrivalCountryGroup, ArrivalOrigin, ArrivalRoute, GeoPoint } from "../types";

const defaultTopRouteLimit = 6;

export function buildCityId(countryCode: string, city: string): string {
  return `${countryCode.toLowerCase()}-${city
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")}`;
}

export function deriveArrivalRoutes(
  origins: ArrivalOrigin[],
  destination: GeoPoint,
  topRouteLimit = defaultTopRouteLimit,
): ArrivalRoute[] {
  const sortedOrigins = [...origins].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));

  return sortedOrigins.map((origin, index) => ({
    id: `route-${origin.id}`,
    originId: origin.id,
    originCity: origin.city,
    country: origin.country,
    countryCode: origin.countryCode,
    origin: {
      lat: origin.lat,
      lon: origin.lon,
    },
    destination,
    count: origin.count,
    rank: index + 1,
    isTopRoute: index < topRouteLimit,
  }));
}

export function deriveCountryGroups(origins: ArrivalOrigin[], byCountry: ArrivalByCountry[]): ArrivalCountryGroup[] {
  const groupedByCountry = new Map<string, ArrivalOrigin[]>();

  for (const origin of origins) {
    const existing = groupedByCountry.get(origin.countryCode) ?? [];
    existing.push(origin);
    groupedByCountry.set(origin.countryCode, existing);
  }

  return [...byCountry]
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country))
    .map((countrySummary) => {
      const originsForCountry = groupedByCountry.get(countrySummary.countryCode) ?? [];
      const cityMap = new Map<string, ArrivalOrigin[]>();

      for (const origin of originsForCountry) {
        const cityId = buildCityId(origin.countryCode, origin.city);
        const existing = cityMap.get(cityId) ?? [];
        existing.push(origin);
        cityMap.set(cityId, existing);
      }

      const cities = [...cityMap.entries()]
        .map(([cityId, cityOrigins]) => ({
          id: cityId,
          city: cityOrigins[0].city,
          count: cityOrigins.reduce((sum, origin) => sum + origin.count, 0),
          originIds: cityOrigins.map((origin) => origin.id),
        }))
        .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));

      return {
        country: countrySummary.country,
        countryCode: countrySummary.countryCode,
        count: countrySummary.count,
        cities,
      };
    });
}

export function getTopRoutes(routes: ArrivalRoute[], topRouteLimit = defaultTopRouteLimit): ArrivalRoute[] {
  return routes.filter((route) => route.isTopRoute).slice(0, topRouteLimit);
}
