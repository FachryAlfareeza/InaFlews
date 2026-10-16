'use client';

import { useEffect, useRef } from 'react';
import { HexFeatureProperties, mockGeoJSON } from '@/lib/mockData';
import { cellToPolygon, H3_RESOLUTION } from '@/lib/h3';

interface MapViewProps {
  onHexClick: (props: HexFeatureProperties) => void;
  selectedHexId: string | null;
}

function getRiskColor(risk: number): string {
  if (risk > 0.7) return '#ef4444';
  if (risk > 0.4) return '#f59e0b';
  return '#22c55e';
}

function getRiskFillColor(risk: number): string {
  if (risk > 0.7) return '#ef4444';
  if (risk > 0.4) return '#f59e0b';
  return '#22c55e';
}

function getRiskFillOpacity(risk: number): number {
  if (risk > 0.7) return 0.5;
  if (risk > 0.4) return 0.32;
  return 0.18;
}

// Inject Leaflet CSS if not already loaded
function ensureLeafletCSS() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('link[data-leaflet-css]')) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  link.setAttribute('data-leaflet-css', 'true');
  document.head.appendChild(link);
}

export default function MapView({ onHexClick, selectedHexId }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  // Keyed by H3 index -> the Leaflet polygon layer for that cell.
  const layersRef = useRef<Map<string, any>>(new Map());
  const propsByH3Ref = useRef<Map<string, HexFeatureProperties>>(new Map());
  const onHexClickRef = useRef(onHexClick);
  onHexClickRef.current = onHexClick;

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return;

    let L: any;
    let map: any;
    let intervals: any[] = [];

    const init = async () => {
      ensureLeafletCSS();
      L = await import('leaflet');

      if (!containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [-2.5, 118.0],
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
      });

      // CARTO basemap. The API key is read from the NEXT_PUBLIC_CARTO_API_KEY
      // environment variable (set it in project2/.env.local) and appended as a
      // `key` query param (per CARTO Basemaps) so it is never hardcoded in source.
      const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY;
      const cartoUrl =
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' +
        (cartoKey ? `?key=${cartoKey}` : '');

      if (!cartoKey) {
        console.warn(
          '[MapView] NEXT_PUBLIC_CARTO_API_KEY is not set. Basemap tiles may fail to load. ' +
            'Add it to project2/.env.local and restart the dev server.'
        );
      }

      L.tileLayer(cartoUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Render a true H3 cell boundary polygon for each feature. The vertices
      // come straight from h3-js (cellToBoundary), so the shapes on the map are
      // genuine H3 grid cells rather than hand-drawn hexagons.
      (mockGeoJSON.features as any[]).forEach((feature) => {
        const props = feature.properties as HexFeatureProperties;
        propsByH3Ref.current.set(props.h3Index, props);

        const color = getRiskColor(props.overallRiskScore);
        const fillColor = getRiskFillColor(props.overallRiskScore);
        const fillOpacity = getRiskFillOpacity(props.overallRiskScore);
        const isCritical = props.overallRiskScore > 0.7;

        // Leaflet expects [lat, lng] vertices.
        const latLngs = cellToPolygon(props.h3Index, false);

        const polygon = L.polygon(latLngs, {
          color,
          weight: isCritical ? 2.5 : 1.5,
          fillColor,
          fillOpacity,
          opacity: 0.9,
          className: isCritical ? 'h3-cell h3-cell-critical' : 'h3-cell',
        }).addTo(map);

        polygon.on('click', () => {
          onHexClickRef.current(props);
        });

        const tooltipContent = `
          <div style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:8px 12px;font-family:monospace;min-width:200px">
            <div style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px">H3 Cell &bull; Res ${H3_RESOLUTION}</div>
            <div style="color:#22d3ee;font-size:10px;margin-bottom:4px">${props.h3Index}</div>
            <div style="color:#f1f5f9;font-size:13px;font-weight:bold;margin-bottom:4px">${props.regionName}</div>
            <div style="color:#64748b;font-size:10px">${props.province} &bull; ${props.hexId}</div>
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid #1e293b">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="color:#94a3b8;font-size:11px">Risk Score</span>
                <span style="color:${color};font-size:11px;font-weight:bold">${(props.overallRiskScore * 100).toFixed(0)}%</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="color:#94a3b8;font-size:11px">Rainfall</span>
                <span style="color:#e2e8f0;font-size:11px">${props.currentRainfall} mm/hr</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:#94a3b8;font-size:11px">Soil Saturation</span>
                <span style="color:#e2e8f0;font-size:11px">${props.soilSaturation}%</span>
              </div>
            </div>
          </div>
        `;
        polygon.bindTooltip(tooltipContent, {
          sticky: true,
          opacity: 1,
          className: 'hex-tooltip',
        });

        polygon.on('mouseover', function (this: any) {
          this.setStyle({ weight: isCritical ? 3.5 : 2.5, fillOpacity: Math.min(0.75, fillOpacity + 0.2) });
          this.bringToFront();
        });
        polygon.on('mouseout', function (this: any) {
          if (props.h3Index === selectedHexId) return;
          this.setStyle({ weight: isCritical ? 2.5 : 1.5, fillOpacity });
        });

        layersRef.current.set(props.h3Index, polygon);

        // Pulse animation for critical cells.
        if (isCritical) {
          let bright = true;
          const interval = setInterval(() => {
            if (!layersRef.current.has(props.h3Index)) {
              clearInterval(interval);
              return;
            }
            polygon.setStyle({ fillOpacity: bright ? 0.3 : 0.55 });
            bright = !bright;
          }, 1200);
          intervals.push(interval);
        }
      });

      // Force resize after mount
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 500);

      mapRef.current = map;
    };

    init();

    return () => {
      intervals.forEach(clearInterval);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      layersRef.current.clear();
      propsByH3Ref.current.clear();
    };
  }, []);

  // Update cell styles when the selection changes.
  useEffect(() => {
    layersRef.current.forEach((polygon, h3Index) => {
      const props = propsByH3Ref.current.get(h3Index);
      if (!props) return;
      const isCritical = props.overallRiskScore > 0.7;
      const isSelected = h3Index === selectedHexId;

      polygon.setStyle({
        weight: isSelected ? 4 : isCritical ? 2.5 : 1.5,
        color: isSelected ? '#22d3ee' : getRiskColor(props.overallRiskScore),
        fillOpacity: isSelected ? 0.6 : getRiskFillOpacity(props.overallRiskScore),
      });
      if (isSelected) polygon.bringToFront();
    });
  }, [selectedHexId]);

  return (
    <div className="relative w-full h-full min-h-0">
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />

      {/* Bottom-left info overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#0a0f1e]/80 border border-slate-700/50 rounded px-2 py-1 flex items-center gap-2">
        <span className="text-[10px] font-mono text-slate-400">
          Indonesia EWS Grid &bull; Uber H3 Res {H3_RESOLUTION}
        </span>
        <span className="w-px h-2.5 bg-slate-600" />
        <span className="text-[10px] font-mono text-cyan-400/80">
          {mockGeoJSON.features.length} H3 Cells Active
        </span>
      </div>
    </div>
  );
}
