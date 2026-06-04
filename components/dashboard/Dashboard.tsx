'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AlertTicker from './AlertTicker';
import LeftSidebar from './LeftSidebar';
import HexInspector from './HexInspector';
import { HexFeatureProperties, mockGeoJSON } from '@/lib/mockData';
import { Layers, RefreshCw, Menu, PanelRight } from 'lucide-react';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#060c1a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-cyan-500/40 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-slate-500 text-sm">Loading GIS Map Engine...</span>
      </div>
    </div>
  ),
});

interface LayerState {
  baseTopography: boolean;
  vulnerabilityMask: boolean;
  weatherRadar: boolean;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedHex, setSelectedHex] = useState<HexFeatureProperties | null>(null);
  const [layers, setLayers] = useState<LayerState>({
    baseTopography: true,
    vulnerabilityMask: true,
    weatherRadar: false,
  });
  const [lastRefresh, setLastRefresh] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setLastRefresh(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar on mobile when tab changes
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleHexClick = useCallback((props: HexFeatureProperties) => {
    setSelectedHex(props);
    if (!isMobile) setInspectorOpen(true);
  }, [isMobile]);

  const handleLayerToggle = useCallback((layer: keyof LayerState) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefresh(new Date().toLocaleTimeString());
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#060c1a] text-slate-100 overflow-hidden">
      {/* Top Alert Ticker */}
      <AlertTicker />

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <LeftSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          layers={layers}
          onLayerToggle={handleLayerToggle}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          isMobile={isMobile}
        />

        {/* Center Map */}
        <div className="flex-1 relative overflow-hidden min-h-0 min-w-0">
          {/* Mobile menu button */}
          {isMobile && !sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-3 left-3 z-[1000] flex items-center justify-center w-9 h-9 bg-[#0a0f1e]/90 border border-slate-700/50 rounded-lg text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors backdrop-blur-sm"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Map toolbar - hidden on mobile, shown on tablet+ */}
          {!isMobile && (
            <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#0a0f1e]/90 border border-slate-700/50 rounded-lg px-3 py-2 backdrop-blur-sm">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-300 font-medium">
                  Indonesia EWS — Flood & Landslide Prediction
                </span>
                <span className="w-px h-3.5 bg-slate-700 mx-1" />
                <span className="text-[10px] text-slate-500 font-mono">
                  {layers.vulnerabilityMask && (
                    <span className="mr-2">
                      <span className="inline-block w-2 h-2 rounded-sm bg-cyan-500 mr-1" />
                      Vuln. Mask
                    </span>
                  )}
                  {layers.weatherRadar && (
                    <span className="mr-2">
                      <span className="inline-block w-2 h-2 rounded-sm bg-blue-400 mr-1" />
                      Weather
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Inspector toggle - desktop only, top right below zoom */}
          {!isMobile && (
            <div className="absolute top-16 right-3 z-[1000]">
              <button
                onClick={() => setInspectorOpen((v) => !v)}
                className="flex items-center justify-center w-9 h-9 bg-[#0a0f1e]/90 border border-slate-700/50 rounded-lg text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors backdrop-blur-sm"
                title={inspectorOpen ? 'Close Inspector' : 'Open Inspector'}
              >
                <PanelRight className={`w-4 h-4 ${inspectorOpen ? 'text-cyan-400' : ''}`} />
              </button>
            </div>
          )}

          {/* Weather radar overlay (when active) */}
          {layers.weatherRadar && (
            <div className="absolute inset-0 z-[500] pointer-events-none">
              <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent" />
              <div className="absolute top-1/3 left-1/4 w-64 h-48 bg-blue-400/8 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 right-1/4 w-48 h-36 bg-cyan-400/6 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.7s' }} />
            </div>
          )}

          <MapView onHexClick={handleHexClick} selectedHexId={selectedHex?.hexId ?? null} />

          {/* Critical zone pulse overlay label */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[1000]">
            <div className="flex items-center gap-2 bg-red-950/70 border border-red-800/50 rounded-full px-3 py-1 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
              </span>
              <span className="text-[10px] text-red-300 font-mono font-medium whitespace-nowrap">
                {mockGeoJSON.features.filter(f => (f.properties as any).overallRiskScore > 0.7).length} CRITICAL{!isMobile && ' ZONES ACTIVE — Click hexagon to inspect'}
              </span>
            </div>
          </div>

          {/* Refresh button - bottom right, above Leaflet attribution */}
          <div className="absolute bottom-3 right-3 z-[1000]">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 bg-[#0a0f1e]/90 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors backdrop-blur-sm"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              {!isMobile && (isRefreshing ? 'Refreshing...' : `Refresh • ${lastRefresh}`)}
            </button>
          </div>
        </div>

        {/* Right Panel — Hex Inspector */}
        <HexInspector
          selected={selectedHex}
          onClose={() => setSelectedHex(null)}
          isMobile={isMobile}
          isOpen={inspectorOpen}
          onToggle={() => setInspectorOpen((v) => !v)}
        />
      </div>
    </div>
  );
}
