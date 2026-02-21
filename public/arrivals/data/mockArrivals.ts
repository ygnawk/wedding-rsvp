export interface MockArrivalOrigin {
  id: string;
  country: string;
  countryCode: string;
  city: string;
  count: number;
  lat: number;
  lon: number;
}

export interface MockArrivalByCountry {
  country: string;
  countryCode: string;
  count: number;
}

export interface MockArrivalsData {
  beijing: {
    lat: number;
    lon: number;
  };
  origins: MockArrivalOrigin[];
  byCountry: MockArrivalByCountry[];
  lastUpdatedIso: string;
}

export const mockArrivals: MockArrivalsData = {
  beijing: {
    lat: 39.904202,
    lon: 116.407394,
  },
  origins: [
    {
      id: "sg-singapore",
      country: "Singapore",
      countryCode: "SG",
      city: "Singapore",
      count: 15,
      lat: 1.352083,
      lon: 103.819836,
    },
    {
      id: "us-new-york",
      country: "United States",
      countryCode: "US",
      city: "New York",
      count: 3,
      lat: 40.7128,
      lon: -74.006,
    },
    {
      id: "us-boston",
      country: "United States",
      countryCode: "US",
      city: "Boston",
      count: 4,
      lat: 42.360082,
      lon: -71.05888,
    },
    {
      id: "us-san-francisco",
      country: "United States",
      countryCode: "US",
      city: "San Francisco",
      count: 5,
      lat: 37.774929,
      lon: -122.419416,
    },
    {
      id: "jp-tokyo",
      country: "Japan",
      countryCode: "JP",
      city: "Tokyo",
      count: 6,
      lat: 35.689487,
      lon: 139.691706,
    },
    {
      id: "kr-seoul",
      country: "South Korea",
      countryCode: "KR",
      city: "Seoul",
      count: 4,
      lat: 37.566536,
      lon: 126.977966,
    },
    {
      id: "th-bangkok",
      country: "Thailand",
      countryCode: "TH",
      city: "Bangkok",
      count: 3,
      lat: 13.756331,
      lon: 100.501765,
    },
    {
      id: "gb-london",
      country: "United Kingdom",
      countryCode: "GB",
      city: "London",
      count: 4,
      lat: 51.507351,
      lon: -0.127758,
    },
    {
      id: "at-vienna",
      country: "Austria",
      countryCode: "AT",
      city: "Vienna",
      count: 1,
      lat: 48.208174,
      lon: 16.373819,
    },
    {
      id: "au-sydney",
      country: "Australia",
      countryCode: "AU",
      city: "Sydney",
      count: 2,
      lat: -33.86882,
      lon: 151.20929,
    },
    {
      id: "my-kuala-lumpur",
      country: "Malaysia",
      countryCode: "MY",
      city: "Kuala Lumpur",
      count: 3,
      lat: 3.139003,
      lon: 101.686855,
    },
    {
      id: "us-ann-arbor",
      country: "United States",
      countryCode: "US",
      city: "Ann Arbor",
      count: 2,
      lat: 42.280826,
      lon: -83.743038,
    },
    {
      id: "cn-beijing-local",
      country: "China",
      countryCode: "CN",
      city: "Beijing",
      count: 2,
      lat: 39.904202,
      lon: 116.407394,
    },
    {
      id: "us-boulder",
      country: "United States",
      countryCode: "US",
      city: "Boulder",
      count: 1,
      lat: 40.014986,
      lon: -105.270546,
    },
  ],
  byCountry: [
    { country: "United States", countryCode: "US", count: 15 },
    { country: "Singapore", countryCode: "SG", count: 15 },
    { country: "Japan", countryCode: "JP", count: 6 },
    { country: "South Korea", countryCode: "KR", count: 4 },
    { country: "United Kingdom", countryCode: "GB", count: 4 },
    { country: "Thailand", countryCode: "TH", count: 3 },
    { country: "Malaysia", countryCode: "MY", count: 3 },
    { country: "China", countryCode: "CN", count: 2 },
    { country: "Australia", countryCode: "AU", count: 2 },
    { country: "Austria", countryCode: "AT", count: 1 },
  ],
  lastUpdatedIso: "2026-02-19T00:00:00.000Z",
};

export const mockArrivalGuestCount = mockArrivals.origins.reduce((sum, origin) => sum + origin.count, 0);
