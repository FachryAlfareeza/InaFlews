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

function getRiskOpacity(risk: number): number {
  if (risk > 0.7) return 0.75;
  if (risk > 0.4) return 0.45;
  return 0.25;
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
  const hexLayersRef = useRef<Map<string, any>>(new Map());
  const onHexClickRef = useRef(onHexClick);
  onHexClickRef.current = onHexClick;

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return;

    let L: any;
    let map: any;
    let intervals: any[] = [];

    const init = async () => {
      // Ensure CSS is loaded before initializing the map
      ensureLeafletCSS();

      L = await import('leaflet');

      if (!containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [-2.5, 118.0],
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
      });

      // CartoDB dark tiles (verified working URL)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add GeoJSON hexagons
      (mockGeoJSON.features as any[]).forEach((feature) => {
        const props = feature.properties as HexFeatureProperties;
        const color = getRiskColor(props.overallRiskScore);
        const opacity = getRiskOpacity(props.overallRiskScore);

        const layer = L.geoJSON(feature, {
          style: {
            fillColor: color,
            fillOpacity: opacity,
            color: color,
            weight: props.overallRiskScore > 0.7 ? 2 : 1,
            opacity: 0.8,
          },
        });

        layer.on('click', () => {
          onHexClickRef.current(props);
        });

        layer.on('mouseover', (e: any) => {
          e.target.setStyle({ weight: 3, opacity: 1 });
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
          e.target.bindTooltip(tooltipContent, {
            sticky: true,
            opacity: 1,
            className: 'hex-tooltip',
          }).openTooltip();
        });

        layer.on('mouseout', (e: any) => {
          e.target.setStyle({
            weight: props.overallRiskScore > 0.7 ? 2 : 1,
            opacity: 0.8,
          });
          e.target.closeTooltip();
        });

        layer.addTo(map);
        hexLayersRef.current.set(props.hexId, layer);

        // Pulse animation for critical hexagons
        if (props.overallRiskScore > 0.7) {
          const subLayer = layer.getLayers()[0] as any;
          if (subLayer && subLayer._path) {
            subLayer._path.style.transition = 'fill-opacity 1.2s ease-in-out';
            let bright = true;
            const interval = setInterval(() => {
              if (!subLayer._path) { clearInterval(interval); return; }
              subLayer._path.style.fillOpacity = bright ? String(opacity * 0.5) : String(opacity);
              bright = !bright;
            }, 1200);
            intervals.push(interval);
          }
        }
      });

      // Force resize after mount to ensure tiles render
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
      setTimeout(() => {
        map.invalidateSize();
      }, 500);

      mapRef.current = map;
    };

    init();

    return () => {
      intervals.forEach(clearInterval);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      hexLayersRef.current.clear();
    };
  }, []);

  // Highlight selected hex
  useEffect(() => {
    hexLayersRef.current.forEach((layer, hexId) => {
      const isSelected = hexId === selectedHexId;
      const subLayer = layer.getLayers?.()?.[0] as any;
      if (subLayer?._path) {
        subLayer._path.style.strokeWidth = isSelected ? '3px' : '';
        subLayer._path.style.filter = isSelected
          ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))'
          : '';
      }
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
