import type { MockArrivalByCountry, MockArrivalOrigin } from "../../../data/mockArrivals";

export interface GeoPoint {
  lat: number;
  lon: number;
}

export type ArrivalOrigin = MockArrivalOrigin;
export type ArrivalByCountry = MockArrivalByCountry;

export interface ArrivalRoute {
  id: string;
  originId: string;
  originCity: string;
  country: string;
  countryCode: string;
  origin: GeoPoint;
  destination: GeoPoint;
  count: number;
  rank: number;
  isTopRoute: boolean;
}

export interface ArrivalCitySummary {
  id: string;
  city: string;
  count: number;
  originIds: string[];
}

export interface ArrivalCountryGroup {
  country: string;
  countryCode: string;
  count: number;
  cities: ArrivalCitySummary[];
}

export type ArrivalsSelection =
  | {
      type: "country";
      countryCode: string;
    }
  | {
      type: "city";
      countryCode: string;
      cityId: string;
      originIds: string[];
    }
  | {
      type: "origin";
      originId: string;
      countryCode: string;
      cityId: string;
    };
