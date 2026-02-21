import type { GeoPoint } from "../types";

export const ARRIVALS_MAP_VIEWBOX = {
  width: 960,
  height: 520,
};

export interface MapPoint {
  x: number;
  y: number;
}

export interface WrappedArcPath {
  d: string;
  start: MapPoint;
  end: MapPoint;
}

export function projectGeoPointToMap(point: GeoPoint, width = ARRIVALS_MAP_VIEWBOX.width, height = ARRIVALS_MAP_VIEWBOX.height): MapPoint {
  return {
    x: ((point.lon + 180) / 360) * width,
    y: ((90 - point.lat) / 180) * height,
  };
}

function buildQuadraticArcPath(start: MapPoint, end: MapPoint): string {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const arcLift = Math.min(135, Math.max(20, distance * 0.34));
  const controlX = (start.x + end.x) / 2;
  const controlY = (start.y + end.y) / 2 - arcLift;

  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function getShortestWrappedPair(origin: MapPoint, destination: MapPoint, width: number): { start: MapPoint; end: MapPoint } {
  const start = { ...origin };
  const end = { ...destination };
  const dx = end.x - start.x;

  if (dx > width / 2) {
    start.x += width;
  } else if (dx < -width / 2) {
    end.x += width;
  }

  return { start, end };
}

export function buildWrappedArcPaths(origin: MapPoint, destination: MapPoint, width = ARRIVALS_MAP_VIEWBOX.width): WrappedArcPath[] {
  const { start, end } = getShortestWrappedPair(origin, destination, width);
  const offsets = [-width, 0, width];

  return offsets
    .map((offset) => {
      const shiftedStart = { x: start.x + offset, y: start.y };
      const shiftedEnd = { x: end.x + offset, y: end.y };

      if (Math.max(shiftedStart.x, shiftedEnd.x) < -16 || Math.min(shiftedStart.x, shiftedEnd.x) > width + 16) {
        return null;
      }

      return {
        d: buildQuadraticArcPath(shiftedStart, shiftedEnd),
        start: shiftedStart,
        end: shiftedEnd,
      };
    })
    .filter((path): path is WrappedArcPath => Boolean(path));
}
