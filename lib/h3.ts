/**
 * H3 geospatial indexing utilities.
 *
 * This module wraps Uber's H3 (h3-js) library and acts as the single source of
 * truth for the project's coordinate system. Every location in the dashboard is
 * anchored to an H3 cell index rather than a raw lat/lng pair. Centers and
 * hexagon boundaries used for rendering are all derived from the H3 index, so
 * the geometry on the map is a true H3 grid cell, not a hand-drawn hexagon.
 */

import {
  latLngToCell,
  cellToLatLng,
  cellToBoundary,
  getResolution,
  isValidCell,
  gridDisk,
  cellArea,
  gridDistance,
  UNITS,
} from 'h3-js';

/**
 * Default H3 resolution for the Indonesia EWS grid.
 *
 * Resolution 6 cells have an average edge length of ~3.2 km and an average area
 * of ~36 km², which matches the regional hazard-cell granularity the dashboard
 * displays ("H3 Res 6" in the UI).
 *
 * @see https://h3geo.org/docs/core-library/restable
 */
export const H3_RESOLUTION = 6;

/** An H3 cell index, e.g. "86654e64fffffff". */
export type H3Index = string;

/** [latitude, longitude] tuple as returned by h3-js. */
export type LatLng = [number, number];

/**
 * Convert a geographic coordinate into the H3 cell index that contains it.
 * This is the canonical "point -> cell" bucketing operation.
 */
export function pointToCell(lat: number, lng: number, resolution: number = H3_RESOLUTION): H3Index {
  return latLngToCell(lat, lng, resolution);
}

/**
 * Get the geographic center ([lat, lng]) of an H3 cell. Note that this is the
 * cell centroid, which generally differs slightly from any point originally
 * indexed into the cell.
 */
export function cellToCenter(index: H3Index): LatLng {
  return cellToLatLng(index) as LatLng;
}

/**
 * Get the vertex boundary of an H3 cell.
 *
 * @param index  the H3 cell index
 * @param geoJson when true, returns [lng, lat] pairs (GeoJSON order) and closes
 *                the ring; when false (default) returns [lat, lng] pairs, which
 *                is the order Leaflet polygons expect.
 */
export function cellToPolygon(index: H3Index, geoJson = false): LatLng[] {
  return cellToBoundary(index, geoJson) as LatLng[];
}

/** Resolution of a given cell index. */
export function resolutionOf(index: H3Index): number {
  return getResolution(index);
}

/** True if the string is a valid H3 cell index. */
export function isValidH3(index: string): boolean {
  return isValidCell(index);
}

/**
 * Neighbouring cells within `ringSize` grid steps of the given cell (inclusive
 * of the origin cell). `ringSize` of 1 returns the cell plus its 6 immediate
 * neighbours.
 */
export function neighbors(index: H3Index, ringSize = 1): H3Index[] {
  return gridDisk(index, ringSize);
}

/** Area of an H3 cell in square kilometers. */
export function cellAreaKm2(index: H3Index): number {
  return cellArea(index, UNITS.km2);
}

/** Grid distance (number of cells) between two H3 cells, or null if undefined. */
export function cellDistance(a: H3Index, b: H3Index): number | null {
  try {
    return gridDistance(a, b);
  } catch {
    return null;
  }
}

/**
 * A short, human-readable form of an H3 index for compact UI display, e.g.
 * "86654e64f…fff". The full index is preserved; this is purely cosmetic.
 */
export function shortH3(index: H3Index): string {
  if (index.length <= 11) return index;
  return `${index.slice(0, 9)}…${index.slice(-3)}`;
}
