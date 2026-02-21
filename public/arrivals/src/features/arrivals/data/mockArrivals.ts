import { mockArrivalGuestCount, mockArrivals as rawMockArrivals } from "../../../../data/mockArrivals";
import { deriveArrivalRoutes, deriveCountryGroups, getTopRoutes } from "../utils/arrivalsRoutes";

export const mockArrivals = rawMockArrivals;

export const mockRoutes = deriveArrivalRoutes(mockArrivals.origins, mockArrivals.beijing, 6);
export const mockTopRoutes = getTopRoutes(mockRoutes, 6);
export const mockCountryGroups = deriveCountryGroups(mockArrivals.origins, mockArrivals.byCountry);
export const mockTotalArrivals = mockArrivalGuestCount;
