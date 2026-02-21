import { ArrivalsPage } from "./pages/ArrivalsPage";

export const ARRIVALS_TRACKER_FLAG = "NEXT_PUBLIC_ARRIVALS_TRACKER_ENABLED";

const env =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export const isArrivalsTrackerEnabled = env.NEXT_PUBLIC_ARRIVALS_TRACKER_ENABLED === "true";

export function ArrivalsRoute() {
  if (!isArrivalsTrackerEnabled) {
    return null;
  }

  return <ArrivalsPage />;
}
