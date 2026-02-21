import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import type { ArrivalCountryGroup } from "../types";

interface ArrivalsBoardProps {
  countries: ArrivalCountryGroup[];
  totalArrivals: number;
  lastUpdatedIso: string;
  activeCountryCode: string | null;
  activeCityId: string | null;
  scrollToCityId: string | null;
  onCountrySelect: (countryCode: string) => void;
  onCitySelect: (countryCode: string, cityId: string, originIds: string[]) => void;
}

const BOARD_TIME_START_MINUTES = 6 * 60 + 20;
const BOARD_TIME_STEP_MINUTES = 17;
const BEIJING_TIME_ZONE = "Asia/Shanghai";

function normalizeFlapText(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9 .&/+\-]/g, " ");
}

function padFlapText(value: string, length: number, alignEnd = false): string {
  const normalized = normalizeFlapText(value).slice(0, length);
  return alignEnd ? normalized.padStart(length, " ") : normalized.padEnd(length, " ");
}

function buildBoardTime(slotIndex: number): string {
  const totalMinutes = (BOARD_TIME_START_MINUTES + Math.max(0, slotIndex) * BOARD_TIME_STEP_MINUTES) % (24 * 60);
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}.${minutes}`;
}

interface FlapStripProps {
  value: string;
  length: number;
  variant: "time" | "destination" | "count" | "marker";
  alignEnd?: boolean;
}

function FlapStrip({ value, length, variant, alignEnd = false }: FlapStripProps) {
  const padded = padFlapText(value, length, alignEnd);

  return (
    <span className={`arrivals-board__flap-strip arrivals-board__flap-strip--${variant}`} aria-hidden="true">
      {[...padded].map((character, index) => (
        <span
          key={`${variant}-${index}`}
          className={character === " " ? "arrivals-board__flap arrivals-board__flap--blank" : "arrivals-board__flap"}
          data-flap-index={index}
          aria-hidden="true"
        >
          {character === " " ? "\u00A0" : character}
        </span>
      ))}
    </span>
  );
}

export function ArrivalsBoard({
  countries,
  totalArrivals,
  lastUpdatedIso: _lastUpdatedIso,
  activeCountryCode,
  activeCityId,
  scrollToCityId,
  onCountrySelect,
  onCitySelect,
}: ArrivalsBoardProps) {
  const [beijingNow, setBeijingNow] = useState(() => new Date());
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setBeijingNow(new Date());
    }, 60000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const beijingLastUpdatedLabel = useMemo(
    () =>
      beijingNow.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: BEIJING_TIME_ZONE,
      }),
    [beijingNow],
  );

  const beijingLastUpdatedDateTime = useMemo(
    () =>
      new Intl.DateTimeFormat("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: BEIJING_TIME_ZONE,
      }).format(beijingNow),
    [beijingNow],
  );

  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => b.count - a.count || a.country.localeCompare(b.country)),
    [countries],
  );

  const [expandedCountryCodes, setExpandedCountryCodes] = useState<string[]>(() =>
    sortedCountries.slice(0, 3).map((country) => country.countryCode),
  );

  const cityRowRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const validCodes = new Set(sortedCountries.map((country) => country.countryCode));

    setExpandedCountryCodes((previous) => {
      const filtered = previous.filter((code) => validCodes.has(code));

      if (filtered.length > 0) {
        return filtered;
      }

      return sortedCountries.slice(0, 3).map((country) => country.countryCode);
    });
  }, [sortedCountries]);

  useEffect(() => {
    if (!activeCountryCode) {
      return;
    }

    setExpandedCountryCodes((previous) =>
      previous.includes(activeCountryCode) ? previous : [...previous, activeCountryCode],
    );
  }, [activeCountryCode]);

  useEffect(() => {
    if (!scrollToCityId) {
      return;
    }

    const target = cityRowRefs.current[scrollToCityId];

    if (!target) {
      return;
    }

    target.scrollIntoView({
      block: "nearest",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [prefersReducedMotion, scrollToCityId]);

  const toggleCountryExpansion = (countryCode: string) => {
    setExpandedCountryCodes((previous) =>
      previous.includes(countryCode) ? previous.filter((code) => code !== countryCode) : [...previous, countryCode],
    );
  };

  return (
    <section className="arrivals-board" aria-label="Arrivals board">
      <header className="arrivals-board__header">
        <h2 className="arrivals-board__title">ARRIVALS</h2>
        <p className="arrivals-board__meta">{totalArrivals} guests inbound</p>
        <time className="arrivals-board__timestamp" dateTime={beijingLastUpdatedDateTime}>
          Updated {beijingLastUpdatedLabel}
        </time>
      </header>

      <div className="arrivals-board__columns" aria-hidden="true">
        <span className="arrivals-board__column-label">ETA</span>
        <span className="arrivals-board__column-label">ORIGIN</span>
        <span className="arrivals-board__column-label">PAX</span>
        <span className="arrivals-board__column-label">+</span>
      </div>

      <div className="arrivals-board__list" role="list">
        {sortedCountries.map((country, countryIndex) => {
          const isExpanded = expandedCountryCodes.includes(country.countryCode);
          const isCountryActive = activeCountryCode === country.countryCode;
          const countryButtonClassName = [
            "arrivals-board__country-button",
            isCountryActive ? "arrivals-board__country-button--active" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <section key={country.countryCode} className="arrivals-board__group" role="listitem">
              <button
                type="button"
                className={countryButtonClassName}
                onClick={() => {
                  onCountrySelect(country.countryCode);
                  toggleCountryExpansion(country.countryCode);
                }}
                aria-expanded={isExpanded}
                aria-controls={`arrivals-cities-${country.countryCode}`}
                aria-label={`${country.country}, ${country.count} guests inbound, ${isExpanded ? "collapse" : "expand"} cities`}
              >
                <span className="arrivals-board__time-cell">
                  <FlapStrip value={buildBoardTime(countryIndex * 8)} length={5} variant="time" />
                </span>
                <span className="arrivals-board__country-cell">
                  <FlapStrip value={country.country} length={15} variant="destination" />
                </span>
                <span className="arrivals-board__count-cell">
                  <FlapStrip value={String(country.count)} length={3} variant="count" alignEnd />
                </span>
                <span className="arrivals-board__toggle-cell" aria-hidden="true">
                  <FlapStrip value={isExpanded ? "-" : "+"} length={1} variant="marker" />
                </span>
              </button>

              <div
                id={`arrivals-cities-${country.countryCode}`}
                className={isExpanded ? "arrivals-board__cities arrivals-board__cities--expanded" : "arrivals-board__cities"}
              >
                {country.cities.map((city, cityIndex) => {
                  const isCityActive = activeCityId === city.id;
                  const cityButtonClassName = [
                    "arrivals-board__city-button",
                    isCityActive ? "arrivals-board__city-button--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={city.id}
                      ref={(node) => {
                        cityRowRefs.current[city.id] = node;
                      }}
                      type="button"
                      className={cityButtonClassName}
                      onClick={() => onCitySelect(country.countryCode, city.id, city.originIds)}
                      aria-label={`${city.city}, ${city.count} guests from ${country.country}`}
                    >
                      <span className="arrivals-board__time-cell">
                        <FlapStrip value={buildBoardTime(countryIndex * 8 + cityIndex + 1)} length={5} variant="time" />
                      </span>
                      <span className="arrivals-board__city-cell">
                        <FlapStrip value={city.city} length={15} variant="destination" />
                      </span>
                      <span className="arrivals-board__count-cell">
                        <FlapStrip value={String(city.count)} length={3} variant="count" alignEnd />
                      </span>
                      <span className="arrivals-board__filler-cell" aria-hidden="true">
                        <FlapStrip value="" length={1} variant="marker" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
