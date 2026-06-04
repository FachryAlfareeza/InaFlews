'use client';

import { Map, Bell, ChartBar as BarChart3, Cpu, Layers, Cloud, Mountain, Shield, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Wifi, Satellite, Radio, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockAlerts } from '@/lib/mockData';

interface LayerState {
  baseTopography: boolean;
  vulnerabilityMask: boolean;
  weatherRadar: boolean;
}

interface LeftSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  layers: LayerState;
  onLayerToggle: (layer: keyof LayerState) => void;
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const TABS = [
  { id: 'map', label: 'Live Map', icon: Map },
  { id: 'alerts', label: 'Alert History', icon: Bell },
  { id: 'analytics', label: 'Regional Analytics', icon: BarChart3 },
  { id: 'status', label: 'System Status', icon: Cpu },
];

const SYSTEMS = [
  { name: 'JMA Himawari-9', type: 'Meteorological Satellite', status: 'ONLINE', icon: Satellite },
  { name: 'JAXA ALOS-3', type: 'Land Observation', status: 'ONLINE', icon: Satellite },
  { name: 'Sentinel-1 SAR', type: 'Synthetic Aperture Radar', status: 'ACTIVE', icon: Radio },
  { name: 'BMKG Rain Gauge Net.', type: 'Ground Stations', status: 'ONLINE', icon: Wifi },
  { name: 'BNPB Seismic Array', type: 'Ground Motion Sensors', status: 'ONLINE', icon: Activity },
  { name: 'AI Prediction Engine', type: 'Dual-Stream Model v2.4', status: 'RUNNING', icon: Cpu },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? 'bg-cyan-500' : 'bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles = {
    critical: 'bg-red-900/50 text-red-300 border-red-700/50',
    high: 'bg-orange-900/50 text-orange-300 border-orange-700/50',
    medium: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
  };
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${styles[severity as keyof typeof styles]}`}>
      {severity}
    </span>
  );
}

export default function LeftSidebar({ activeTab, onTabChange, layers, onLayerToggle, isOpen, onToggle, isMobile }: LeftSidebarProps) {
  // Mobile: slide-over overlay
  if (isMobile) {
    return (
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#060c1a] border-r border-slate-700/40 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: 0 }}
      >
        <SidebarContent
          activeTab={activeTab}
          onTabChange={onTabChange}
          layers={layers}
          onLayerToggle={onLayerToggle}
          onClose={onToggle}
          isMobile
        />
      </div>
    );
  }

  // Desktop: collapsible sidebar
  return (
    <div
      className={`flex-shrink-0 bg-[#060c1a] border-r border-slate-700/40 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-14'
      }`}
    >
      <SidebarContent
        activeTab={activeTab}
        onTabChange={onTabChange}
        layers={layers}
        onLayerToggle={onLayerToggle}
        onClose={onToggle}
        isMobile={false}
        collapsed={!isOpen}
      />
    </div>
  );
}

function SidebarContent({
  activeTab,
  onTabChange,
  layers,
  onLayerToggle,
  onClose,
  isMobile,
  collapsed = false,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  layers: LayerState;
  onLayerToggle: (layer: keyof LayerState) => void;
  onClose: () => void;
  isMobile: boolean;
  collapsed?: boolean;
}) {
  return (
    <>
      {/* Logo / Header */}
      <div className="px-3 py-3 border-b border-slate-700/40 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-xs font-bold text-white tracking-wide">BNPB-BMKG</div>
              <div className="text-[10px] text-slate-400 tracking-widest uppercase">EWS Command</div>
            </div>
          )}
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-200 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {!isMobile && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="px-2 py-2 border-b border-slate-700/40 flex-shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={collapsed ? tab.label : undefined}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all mb-0.5 ${
                collapsed ? 'justify-center px-0' : ''
              } ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
              {!collapsed && tab.label}
              {!collapsed && tab.id === 'alerts' && (
                <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {mockAlerts.filter((a) => a.severity === 'critical').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {activeTab === 'map' && (
            <div className="p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Map Layers</div>
              {[
                { key: 'baseTopography' as const, label: 'Base Topography', icon: Mountain, desc: 'DEM elevation overlay' },
                { key: 'vulnerabilityMask' as const, label: 'Vulnerability Mask', icon: Layers, desc: 'Static risk zones' },
                { key: 'weatherRadar' as const, label: 'Live Weather Radar', icon: Cloud, desc: 'BMKG precipitation' },
              ].map(({ key, label, icon: Icon, desc }) => (
                <div key={key} className="flex items-center justify-between py-2.5 border-b border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-200 font-medium">{label}</div>
                      <div className="text-[10px] text-slate-500">{desc}</div>
                    </div>
                  </div>
                  <Toggle checked={layers[key]} onChange={() => onLayerToggle(key)} />
                </div>
              ))}

              <div className="mt-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Risk Legend</div>
                {[
                  { color: 'bg-red-500', label: 'Critical (>0.7)' },
                  { color: 'bg-yellow-500', label: 'Elevated (0.4-0.7)' },
                  { color: 'bg-green-500', label: 'Low (<0.4)' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2 py-1">
                    <div className={`w-3 h-3 rounded-sm ${color}`} />
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2">
                Recent Alerts ({mockAlerts.length})
              </div>
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`mb-1.5 p-2.5 rounded-md border text-xs ${
                    alert.severity === 'critical'
                      ? 'bg-red-950/40 border-red-800/50'
                      : alert.severity === 'high'
                      ? 'bg-orange-950/40 border-orange-800/50'
                      : 'bg-yellow-950/30 border-yellow-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Regional Summary</div>
              {[
                { region: 'West Java', critical: 3, high: 1, risk: 87 },
                { region: 'West Sumatra', critical: 2, high: 1, risk: 91 },
                { region: 'Central Java', critical: 1, high: 1, risk: 75 },
                { region: 'Central Sulawesi', critical: 0, high: 1, risk: 62 },
              ].map(({ region, critical, high, risk }) => (
                <div key={region} className="mb-3 p-2.5 bg-slate-800/40 rounded-md border border-slate-700/30">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-slate-200">{region}</span>
                    <span className={`text-xs font-bold ${risk > 80 ? 'text-red-400' : risk > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {risk}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full ${risk > 80 ? 'bg-red-500' : risk > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${risk}%` }}
                    />
                  </div>
                  <div className="flex gap-2 text-[10px] text-slate-500">
                    <span><span className="text-red-400 font-bold">{critical}</span> Critical</span>
                    <span><span className="text-orange-400 font-bold">{high}</span> High</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'status' && (
            <div className="p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Status</div>
              {SYSTEMS.map(({ name, type, status, icon: Icon }) => (
                <div key={name} className="flex items-center gap-2.5 py-2.5 border-b border-slate-700/30">
                  <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-200 font-medium truncate">{name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{type}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                    </span>
                    <span className="text-[10px] text-green-400 font-mono font-bold">{status}</span>
                  </div>
                </div>
              ))}

              <div className="mt-4 p-2.5 bg-slate-800/40 rounded-md border border-slate-700/30">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Model Performance</div>
                {[
                  { label: 'Flood Accuracy', value: 94.2 },
                  { label: 'Landslide Accuracy', value: 91.7 },
                  { label: 'False Positive Rate', value: 6.1 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1">
                    <span className="text-[11px] text-slate-400">{label}</span>
                    <span className="text-[11px] font-bold font-mono text-cyan-300">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom status bar */}
      <div className="px-3 py-2 border-t border-slate-700/40 flex-shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
            </span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-green-400 font-medium">All Systems Nominal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">LIVE</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
