import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import type { ArrivalRoute, GeoPoint } from "../types";
import { ARRIVALS_MAP_VIEWBOX, buildWrappedArcPaths, projectGeoPointToMap } from "../utils/mapGeometry";

const continentPaths = [
  "M66 158 L110 122 L165 104 L218 108 L263 132 L284 170 L270 206 L243 224 L210 230 L188 260 L165 248 L126 250 L92 230 L76 198 Z",
  "M228 275 L255 290 L270 328 L266 370 L252 420 L232 462 L210 448 L203 406 L210 364 L206 324 Z",
  "M356 130 L392 110 L448 108 L502 124 L546 146 L602 148 L660 136 L734 154 L804 182 L856 214 L892 250 L878 284 L842 302 L786 292 L736 278 L690 286 L654 266 L614 274 L576 262 L540 242 L494 224 L456 214 L424 194 L384 188 L364 166 Z",
  "M500 244 L538 258 L564 290 L578 334 L572 382 L546 422 L512 430 L486 398 L476 350 L484 304 Z",
  "M770 352 L806 338 L846 344 L874 368 L864 398 L824 410 L784 404 L760 382 Z",
  "M252 70 L290 56 L320 66 L328 92 L304 108 L274 102 Z",
];

interface ArrivalsWorldMapProps {
  beijing: GeoPoint;
  routes: ArrivalRoute[];
  highlightedOriginIds: string[];
  activeOriginId: string | null;
  onOriginSelect: (originId: string) => void;
}

interface RouteSegment {
  key: string;
  d: string;
  route: ArrivalRoute;
  origin: { x: number; y: number };
  useForPlane: boolean;
}

interface OriginDot {
  id: string;
  city: string;
  country: string;
  x: number;
  y: number;
}

const PLANE_TANGENT_LOOK_DISTANCE = 2.8;
const PLANE_EDGE_FADE_PROGRESS = 0.08;
const PLANE_MAX_TRAVEL_PROGRESS = 0.996;
const PLANE_BOOTSTRAP_DELAY_MIN_MS = 480;
const PLANE_BOOTSTRAP_DELAY_MAX_MS = 9200;
const PLANE_BOOTSTRAP_PRIORITY_BONUS_MS = 3600;
const PLANE_SAME_ROUTE_LAUNCH_STAGGER_MS = 520;

function isPointVisibleInViewBox(point: { x: number; y: number }) {
  return (
    point.x >= 0 &&
    point.x <= ARRIVALS_MAP_VIEWBOX.width &&
    point.y >= 0 &&
    point.y <= ARRIVALS_MAP_VIEWBOX.height
  );
}

function getPlanePathIndex(
  wrappedPaths: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }>,
  origin: { x: number; y: number },
  destination: { x: number; y: number },
) {
  if (!wrappedPaths.length) {
    return -1;
  }

  // Prefer the visible segment that starts exactly at the origin.
  const originPathIndex = wrappedPaths.findIndex((path) => {
    if (!isPointVisibleInViewBox(path.start)) {
      return false;
    }

    const xDelta = Math.abs(path.start.x - origin.x);
    const yDelta = Math.abs(path.start.y - origin.y);
    return xDelta < 0.5 && yDelta < 0.5;
  });

  if (originPathIndex >= 0) {
    return originPathIndex;
  }

  // Fallback to destination visibility for routes that don't expose a visible origin segment.
  const destinationPathIndex = wrappedPaths.findIndex((path) => {
    if (!isPointVisibleInViewBox(path.end)) {
      return false;
    }

    const xDelta = Math.abs(path.end.x - destination.x);
    const yDelta = Math.abs(path.end.y - destination.y);
    return xDelta < 0.5 && yDelta < 0.5;
  });

  if (destinationPathIndex >= 0) {
    return destinationPathIndex;
  }

  const firstVisiblePathIndex = wrappedPaths.findIndex(
    (path) => isPointVisibleInViewBox(path.start) || isPointVisibleInViewBox(path.end),
  );

  return firstVisiblePathIndex >= 0 ? firstVisiblePathIndex : 0;
}

export function ArrivalsWorldMap({
  beijing,
  routes,
  highlightedOriginIds,
  activeOriginId,
  onOriginSelect,
}: ArrivalsWorldMapProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const planePathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const planeRefs = useRef<Record<string, SVGGElement | null>>({});

  const highlightedSet = useMemo(() => new Set(highlightedOriginIds), [highlightedOriginIds]);
  const hasHighlights = highlightedSet.size > 0;

  const beijingPoint = projectGeoPointToMap(beijing, ARRIVALS_MAP_VIEWBOX.width, ARRIVALS_MAP_VIEWBOX.height);

  const routeSegments = useMemo<RouteSegment[]>(() => {
    return routes.flatMap((route) => {
      const origin = projectGeoPointToMap(route.origin, ARRIVALS_MAP_VIEWBOX.width, ARRIVALS_MAP_VIEWBOX.height);
      const destination = projectGeoPointToMap(route.destination, ARRIVALS_MAP_VIEWBOX.width, ARRIVALS_MAP_VIEWBOX.height);
      const wrappedPaths = buildWrappedArcPaths(origin, destination, ARRIVALS_MAP_VIEWBOX.width);

      const selectedPathIndex = getPlanePathIndex(wrappedPaths, origin, destination);

      return wrappedPaths.map((path, pathIndex) => ({
        key: `${route.id}-${pathIndex}`,
        d: path.d,
        route,
        origin,
        useForPlane: route.isTopRoute && pathIndex === selectedPathIndex,
      }));
    });
  }, [routes]);

  const originDots = useMemo<OriginDot[]>(() => {
    const dotByOriginId = new Map<string, OriginDot>();

    for (const route of routes) {
      if (dotByOriginId.has(route.originId)) {
        continue;
      }

      const point = projectGeoPointToMap(route.origin, ARRIVALS_MAP_VIEWBOX.width, ARRIVALS_MAP_VIEWBOX.height);

      dotByOriginId.set(route.originId, {
        id: route.originId,
        city: route.originCity,
        country: route.country,
        x: point.x,
        y: point.y,
      });
    }

    return Array.from(dotByOriginId.values());
  }, [routes]);

  const planeTracks = useMemo(
    () => routeSegments.filter((segment) => segment.useForPlane).slice(0, 6),
    [routeSegments],
  );

  useEffect(() => {
    if (prefersReducedMotion || planeTracks.length === 0) {
      return;
    }

    const maxRouteCount = routes.reduce((highest, route) => Math.max(highest, Number(route.count) || 0), 0);

    const animationTracks = planeTracks
      .map((segment, index) => {
        const pathEl = planePathRefs.current[segment.route.id];
        const planeEl = planeRefs.current[segment.route.id];

        if (!pathEl || !planeEl) {
          return null;
        }

        const length = pathEl.getTotalLength();

        if (!length || !Number.isFinite(length)) {
          return null;
        }

        const routeWeight =
          maxRouteCount > 0 ? Math.max(0, Math.min(1, (Number(segment.route.count) || 0) / maxRouteCount)) : 0;
        const weightedMaxDelay = Math.max(
          PLANE_BOOTSTRAP_DELAY_MIN_MS,
          PLANE_BOOTSTRAP_DELAY_MAX_MS - routeWeight * PLANE_BOOTSTRAP_PRIORITY_BONUS_MS,
        );
        const randomDelayMs =
          PLANE_BOOTSTRAP_DELAY_MIN_MS +
          Math.random() * Math.max(0, weightedMaxDelay - PLANE_BOOTSTRAP_DELAY_MIN_MS);
        const launchDelayMs = randomDelayMs + index * PLANE_SAME_ROUTE_LAUNCH_STAGGER_MS;

        return {
          pathEl,
          planeEl,
          length,
          speed: 0.018 + Math.max(0, 7 - segment.route.rank) * 0.0012,
          launchDelayMs,
        };
      })
      .filter((track): track is NonNullable<typeof track> => Boolean(track));

    if (animationTracks.length === 0) {
      return;
    }

    const startTime = performance.now();
    let frameId = 0;

    const animate = (timestamp: number) => {
      const elapsedMs = timestamp - startTime;

      for (const track of animationTracks) {
        if (elapsedMs < track.launchDelayMs) {
          track.planeEl.style.opacity = "0";
          continue;
        }

        const elapsedSeconds = (elapsedMs - track.launchDelayMs) / 1000;
        const progress = (elapsedSeconds * track.speed) % 1;
        const travelProgress = Math.max(0, Math.min(PLANE_MAX_TRAVEL_PROGRESS, progress * PLANE_MAX_TRAVEL_PROGRESS));
        const distance = travelProgress * track.length;
        const point = track.pathEl.getPointAtLength(distance);
        const lookDistance = Math.min(
          PLANE_TANGENT_LOOK_DISTANCE,
          Math.max(1.4, Math.min(PLANE_TANGENT_LOOK_DISTANCE, track.length * 0.06)),
        );
        const canUseLookAhead = distance + lookDistance <= track.length;
        const lookAheadPoint = canUseLookAhead
          ? track.pathEl.getPointAtLength(Math.min(track.length, distance + lookDistance))
          : point;
        const lookBehindPoint = canUseLookAhead
          ? point
          : track.pathEl.getPointAtLength(Math.max(0, distance - lookDistance));
        let deltaX = canUseLookAhead ? lookAheadPoint.x - point.x : point.x - lookBehindPoint.x;
        let deltaY = canUseLookAhead ? lookAheadPoint.y - point.y : point.y - lookBehindPoint.y;
        if (Math.abs(deltaX) < 0.0001 && Math.abs(deltaY) < 0.0001) {
          deltaX = canUseLookAhead ? lookAheadPoint.x - lookBehindPoint.x : point.x - lookBehindPoint.x;
          deltaY = canUseLookAhead ? lookAheadPoint.y - lookBehindPoint.y : point.y - lookBehindPoint.y;
        }
        const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

        track.planeEl.setAttribute(
          "transform",
          `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(2)})`,
        );

        const fadeIn = Math.min(progress / PLANE_EDGE_FADE_PROGRESS, 1);
        const fadeOut = Math.min((1 - progress) / PLANE_EDGE_FADE_PROGRESS, 1);
        const visibility = Math.max(0, Math.min(fadeIn, fadeOut));
        track.planeEl.style.opacity = visibility.toFixed(2);
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [planeTracks, prefersReducedMotion, routes]);

  const handleDotKeyDown = (event: KeyboardEvent<SVGGElement>, originId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOriginSelect(originId);
    }
  };

  return (
    <div className="arrivals-map" aria-label="World map with Beijing highlighted as destination">
      <svg
        className="arrivals-map__svg"
        viewBox={`0 0 ${ARRIVALS_MAP_VIEWBOX.width} ${ARRIVALS_MAP_VIEWBOX.height}`}
        role="img"
      >
        <defs>
          <radialGradient id="arrivals-beijing-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(248, 244, 236, 0.45)" />
            <stop offset="100%" stopColor="rgba(248, 244, 236, 0)" />
          </radialGradient>
        </defs>

        <g className="arrivals-map__grid" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, index) => {
            const y = (index / 6) * ARRIVALS_MAP_VIEWBOX.height;
            return <line key={`h-${index}`} x1={0} y1={y} x2={ARRIVALS_MAP_VIEWBOX.width} y2={y} />;
          })}
          {Array.from({ length: 13 }).map((_, index) => {
            const x = (index / 12) * ARRIVALS_MAP_VIEWBOX.width;
            return <line key={`v-${index}`} x1={x} y1={0} x2={x} y2={ARRIVALS_MAP_VIEWBOX.height} />;
          })}
        </g>

        <g className="arrivals-map__land" aria-hidden="true">
          {continentPaths.map((path) => (
            <path key={path} d={path} />
          ))}
        </g>

        <g className="arrivals-map__routes" aria-hidden="true">
          {routeSegments.map((segment) => {
            const isHighlighted = highlightedSet.has(segment.route.originId);
            const isMuted = hasHighlights && !isHighlighted;
            const className = [
              "arrivals-map__route",
              segment.route.isTopRoute ? "arrivals-map__route--top" : "",
              isHighlighted ? "arrivals-map__route--active" : "",
              isMuted ? "arrivals-map__route--muted" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <path
                key={segment.key}
                d={segment.d}
                className={className}
                style={{ "--route-intensity": Math.min(segment.route.count / 12, 1) } as CSSProperties}
                ref={
                  segment.useForPlane
                    ? (node) => {
                        planePathRefs.current[segment.route.id] = node;
                      }
                    : undefined
                }
              />
            );
          })}
        </g>

        <g className="arrivals-map__origins">
          {originDots.map((dot) => {
            const isHighlighted = highlightedSet.has(dot.id);
            const isActive = activeOriginId === dot.id;
            const isMuted = hasHighlights && !isHighlighted;
            const dotClassName = [
              "arrivals-map__origin-dot",
              isHighlighted ? "arrivals-map__origin-dot--active" : "",
              isActive ? "arrivals-map__origin-dot--selected" : "",
              isMuted ? "arrivals-map__origin-dot--muted" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <g
                key={dot.id}
                className="arrivals-map__origin"
                role="button"
                tabIndex={0}
                aria-label={`Highlight ${dot.city}, ${dot.country}`}
                onClick={() => onOriginSelect(dot.id)}
                onKeyDown={(event) => handleDotKeyDown(event, dot.id)}
              >
                <circle className="arrivals-map__origin-hit" cx={dot.x} cy={dot.y} r={7.5} />
                <circle className={dotClassName} cx={dot.x} cy={dot.y} r={1.8} />
              </g>
            );
          })}
        </g>

        {!prefersReducedMotion && (
          <g className="arrivals-map__plane-layer" aria-hidden="true">
            {planeTracks.map((segment) => (
              <g
                key={`plane-${segment.route.id}`}
                className="arrivals-map__plane"
                ref={(node) => {
                  planeRefs.current[segment.route.id] = node;
                }}
                transform={`translate(${segment.origin.x.toFixed(2)} ${segment.origin.y.toFixed(2)})`}
              >
                <path className="arrivals-map__plane-icon" d="M -4 -1.8 L 4 0 L -4 1.8 L -2.6 0 Z" />
              </g>
            ))}
          </g>
        )}

        <g className="arrivals-map__focus">
          <circle
            className="arrivals-map__focus-glow"
            cx={beijingPoint.x}
            cy={beijingPoint.y}
            r={34}
            fill="url(#arrivals-beijing-glow)"
          />
          <circle className="arrivals-map__focus-ring" cx={beijingPoint.x} cy={beijingPoint.y} r={11} />
          <circle className="arrivals-map__focus-dot" cx={beijingPoint.x} cy={beijingPoint.y} r={3.2} />
          <text className="arrivals-map__focus-label" x={beijingPoint.x + 12} y={beijingPoint.y - 12}>
            Beijing
          </text>
        </g>
      </svg>
    </div>
  );
}
