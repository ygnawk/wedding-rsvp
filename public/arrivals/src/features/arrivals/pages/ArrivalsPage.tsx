import { useMemo, useState } from "react";
import { ArrivalsBoard } from "../components/ArrivalsBoard";
import { ArrivalsWorldMap } from "../components/ArrivalsWorldMap";
import { mockArrivals, mockCountryGroups, mockRoutes, mockTotalArrivals } from "../data/mockArrivals";
import type { ArrivalsSelection } from "../types";
import "../styles/arrivals.css";

const ARRIVALS_TITLE_LABEL = "Tracking everyon's journey to Beijing";

export function ArrivalsPage() {
  const [selection, setSelection] = useState<ArrivalsSelection | null>(null);

  const cityIdByOriginId = useMemo(() => {
    const map = new Map<string, string>();

    for (const country of mockCountryGroups) {
      for (const city of country.cities) {
        for (const originId of city.originIds) {
          map.set(originId, city.id);
        }
      }
    }

    return map;
  }, []);

  const highlightedOriginIds = useMemo(() => {
    if (!selection) {
      return [] as string[];
    }

    if (selection.type === "country") {
      return mockArrivals.origins
        .filter((origin) => origin.countryCode === selection.countryCode)
        .map((origin) => origin.id);
    }

    if (selection.type === "city") {
      return selection.originIds;
    }

    return [selection.originId];
  }, [selection]);

  const activeCountryCode = selection ? selection.countryCode : null;
  const activeCityId = selection && selection.type !== "country" ? selection.cityId : null;
  const activeOriginId = selection && selection.type === "origin" ? selection.originId : null;
  const scrollToCityId = selection && selection.type === "origin" ? selection.cityId : null;

  const handleCountrySelect = (countryCode: string) => {
    setSelection((previous) => {
      if (previous?.type === "country" && previous.countryCode === countryCode) {
        return null;
      }

      return {
        type: "country",
        countryCode,
      };
    });
  };

  const handleCitySelect = (countryCode: string, cityId: string, originIds: string[]) => {
    setSelection((previous) => {
      if (previous?.type === "city" && previous.cityId === cityId) {
        return null;
      }

      return {
        type: "city",
        countryCode,
        cityId,
        originIds,
      };
    });
  };

  const handleOriginSelect = (originId: string) => {
    const origin = mockArrivals.origins.find((item) => item.id === originId);

    if (!origin) {
      return;
    }

    const cityId = cityIdByOriginId.get(originId);

    if (!cityId) {
      return;
    }

    setSelection((previous) => {
      if (previous?.type === "origin" && previous.originId === originId) {
        return null;
      }

      return {
        type: "origin",
        originId,
        countryCode: origin.countryCode,
        cityId,
      };
    });
  };

  return (
    <section className="arrivals-page" aria-labelledby="arrivals-page-title">
      <header className="arrivals-page__header">
        <h1 id="arrivals-page-title" className="arrivals-page__title">
          {ARRIVALS_TITLE_LABEL}
        </h1>
      </header>

      <div className="arrivals-page__content">
        <ArrivalsWorldMap
          beijing={mockArrivals.beijing}
          routes={mockRoutes}
          highlightedOriginIds={highlightedOriginIds}
          activeOriginId={activeOriginId}
          onOriginSelect={handleOriginSelect}
        />
        <ArrivalsBoard
          countries={mockCountryGroups}
          totalArrivals={mockTotalArrivals}
          lastUpdatedIso={mockArrivals.lastUpdatedIso}
          activeCountryCode={activeCountryCode}
          activeCityId={activeCityId}
          scrollToCityId={scrollToCityId}
          onCountrySelect={handleCountrySelect}
          onCitySelect={handleCitySelect}
        />
      </div>
    </section>
  );
}
