'use client';

import { useEffect, useRef } from 'react';
import { HexFeatureProperties, mockGeoJSON } from '@/lib/mockData';

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
  if (risk > 0.7) return 'rgba(239, 68, 68, 0.55)';
  if (risk > 0.4) return 'rgba(245, 158, 11, 0.35)';
  return 'rgba(34, 197, 94, 0.2)';
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

// Create a hexagon-shaped SVG path for use as a marker icon
function createHexagonIcon(color: string, fillColor: string, isCritical: boolean) {
  const size = isCritical ? 28 : 22;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
      <polygon
        points="50,3 93,25 93,75 50,97 7,75 7,25"
        fill="${fillColor}"
        stroke="${color}"
        stroke-width="${isCritical ? 3 : 2}"
      />
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function MapView({ onHexClick, selectedHexId }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
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

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add hexagon markers for each feature
      (mockGeoJSON.features as any[]).forEach((feature) => {
        const props = feature.properties as HexFeatureProperties;

        const color = getRiskColor(props.overallRiskScore);
        const fillColor = getRiskFillColor(props.overallRiskScore);
        const isCritical = props.overallRiskScore > 0.7;

        const icon = L.divIcon({
          className: 'hex-marker',
          html: `
            <div style="
              width: ${isCritical ? 28 : 22}px;
              height: ${isCritical ? 28 : 22}px;
              position: relative;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" style="overflow: visible;">
                <polygon
                  points="50,3 93,25 93,75 50,97 7,75 7,25"
                  fill="${fillColor}"
                  stroke="${color}"
                  stroke-width="${isCritical ? 3 : 2}"
                  style="${isCritical ? 'filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.6));' : ''}"
                />
              </svg>
            </div>
          `,
          iconSize: [isCritical ? 28 : 22, isCritical ? 28 : 22],
          iconAnchor: [isCritical ? 14 : 11, isCritical ? 14 : 11],
        });

        const marker = L.marker([props.lat, props.lng], { icon }).addTo(map);

        marker.on('click', () => {
          onHexClickRef.current(props);
        });

        marker.on('mouseover', function(this: any) {
          this.setStyle?.({ weight: 3 });
          const tooltipContent = `
            <div style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:8px 12px;font-family:monospace;min-width:180px">
              <div style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Hexagon ${props.hexId}</div>
              <div style="color:#f1f5f9;font-size:13px;font-weight:bold;margin-bottom:6px">${props.regionName}</div>
              <div style="color:#64748b;font-size:10px">${props.province}</div>
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
          marker.bindTooltip(tooltipContent, {
            sticky: true,
            opacity: 1,
            className: 'hex-tooltip',
          }).openTooltip();
        });

        markersRef.current.set(props.hexId, marker);

        // Pulse animation for critical hexagons
        if (isCritical) {
          let bright = true;
          const interval = setInterval(() => {
            const el = (marker as any)._icon;
            if (!el) { clearInterval(interval); return; }
            const svg = el.querySelector('polygon');
            if (svg) {
              svg.style.fillOpacity = bright ? '0.35' : '0.55';
            }
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
      markersRef.current.clear();
    };
  }, []);

  // Update marker styles when selection changes
  useEffect(() => {
    markersRef.current.forEach((marker, hexId) => {
      const el = (marker as any)._icon;
      if (!el) return;
      const polygon = el.querySelector('polygon');
      if (!polygon) return;

      const isSelected = hexId === selectedHexId;
      polygon.style.strokeWidth = isSelected ? '4' : '2';
      polygon.style.filter = isSelected
        ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.9))'
        : '';
    });
  }, [selectedHexId]);

  return (
    <div className="relative w-full h-full min-h-0">
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />

      {/* Coordinate display overlay */}
      <div className="absolute bottom-8 left-3 z-[1000] bg-[#0a0f1e]/80 border border-slate-700/50 rounded px-2 py-1">
        <span className="text-[10px] font-mono text-slate-400">Indonesia EWS Grid &bull; H3 Resolution 6</span>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-8 right-14 z-[1000] bg-[#0a0f1e]/80 border border-slate-700/50 rounded px-2 py-1">
        <span className="text-[10px] font-mono text-slate-400">
          {mockGeoJSON.features.length} Hexagons Active
        </span>
      </div>
    </div>
  );
}
