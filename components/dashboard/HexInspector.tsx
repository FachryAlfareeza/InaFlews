'use client';

import { HexFeatureProperties, generateForecastData } from '@/lib/mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TriangleAlert as AlertTriangle, Droplets, CloudRain, Mountain, Users, ChevronRight, X, TrendingUp, Clock, MapPin, Hash, ChevronLeft, ChevronRight as ChevronRightIcon, PanelRightOpen } from 'lucide-react';

interface HexInspectorProps {
  selected: HexFeatureProperties | null;
  onClose: () => void;
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color = 'text-slate-200',
  barPercent,
  barColor = 'bg-cyan-500',
}: {
  icon: any;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  barPercent?: number;
  barColor?: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className={`text-xl font-bold font-mono ${color}`}>
        {value}
        {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
      </div>
      {barPercent !== undefined && (
        <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-slate-600/50 rounded-md p-2 text-xs">
        <div className="text-slate-400 mb-1 font-mono">Hour +{label}</div>
        {payload.map((p: any) => (
          p.dataKey === 'risk' && (
            <div key={p.dataKey} className="text-cyan-300 font-bold">
              Risk: {(p.value * 100).toFixed(1)}%
            </div>
          )
        ))}
      </div>
    );
  }
  return null;
};

function getRiskLabel(score: number) {
  if (score > 0.85) return { label: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-900/30 border-red-700/50' };
  if (score > 0.7) return { label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-700/50' };
  if (score > 0.4) return { label: 'ELEVATED', color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-700/50' };
  return { label: 'LOW', color: 'text-green-400', bg: 'bg-green-900/30 border-green-700/50' };
}

export default function HexInspector({ selected, onClose, isMobile, isOpen, onToggle }: HexInspectorProps) {
  // Mobile: bottom drawer overlay
  if (isMobile) {
    if (!selected) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="relative w-full bg-[#060c1a] border-t border-slate-700/40 rounded-t-2xl max-h-[75vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center py-2 flex-shrink-0">
            <div className="w-8 h-1 rounded-full bg-slate-600" />
          </div>
          <InspectorContent selected={selected} onClose={onClose} />
        </div>
      </div>
    );
  }

  // Desktop: collapsible side panel
  if (!isOpen) {
    return (
      <div className="w-10 flex-shrink-0 bg-[#060c1a] border-l border-slate-700/40 flex flex-col items-center pt-3 hidden md:flex">
        <button
          onClick={onToggle}
          className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
          title="Open Inspector"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Desktop: expanded side panel
  if (!selected) {
    return (
      <div className="w-80 flex-shrink-0 bg-[#060c1a] border-l border-slate-700/40 flex-col items-center justify-center p-6 hidden md:flex">
        <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mb-4">
          <MapPin className="w-5 h-5 text-slate-600" />
        </div>
        <p className="text-slate-500 text-sm text-center leading-relaxed">
          Click any hexagon on the map to inspect risk data and forecasts
        </p>
        <div className="mt-4 flex items-center gap-2 text-slate-600 text-xs">
          <span className="w-3 h-3 rounded-sm bg-red-500/70" />
          <span>High risk zones are interactive</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 flex-shrink-0 bg-[#060c1a] border-l border-slate-700/40 flex flex-col overflow-hidden hidden md:flex">
      <InspectorContent selected={selected} onClose={onClose} />
    </div>
  );
}

function InspectorContent({ selected, onClose }: { selected: HexFeatureProperties; onClose: () => void }) {
  const forecastData = generateForecastData(selected.overallRiskScore);
  const riskInfo = getRiskLabel(selected.overallRiskScore);
  const isCritical = selected.overallRiskScore > 0.7;
  const maxForecastRisk = Math.max(...forecastData.map((d) => d.risk));
  const peakHour = forecastData.reduce((a, b) => (a.risk > b.risk ? a : b)).hour;

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/40 flex items-start justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Hash className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] font-mono text-slate-500">{selected.hexId}</span>
          </div>
          <h2 className="text-sm font-bold text-white leading-tight">{selected.regionName}</h2>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-slate-500" />
            <span className="text-[10px] text-slate-500">{selected.province}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${riskInfo.bg} ${riskInfo.color}`}>
            {riskInfo.label}
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Critical Alert Banner */}
        {isCritical && (
          <div className="mx-3 mt-3 p-3 bg-red-950/60 border border-red-700/60 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="relative flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-red-300 uppercase tracking-wide">
                  Critical Alert
                </div>
                <div className="text-xs text-red-200 mt-0.5 leading-relaxed">
                  {selected.overallRiskScore > 0.85
                    ? 'LANDSLIDE PROBABILITY > 85%'
                    : 'FLOOD RISK THRESHOLD EXCEEDED'}
                </div>
                <div className="text-[10px] text-red-400/70 mt-1">
                  BPBD {selected.province} notified - Evacuation advisory active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overall Risk Score */}
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Overall Risk Score</span>
            <span className={`text-lg font-bold font-mono ${riskInfo.color}`}>
              {(selected.overallRiskScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                selected.overallRiskScore > 0.7
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : selected.overallRiskScore > 0.4
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-green-500 to-cyan-500'
              }`}
              style={{ width: `${selected.overallRiskScore * 100}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="px-3 pt-3 grid grid-cols-2 gap-2">
          <MetricCard
            icon={Droplets}
            label="Soil Saturation"
            value={selected.soilSaturation}
            unit="%"
            color={selected.soilSaturation > 85 ? 'text-red-400' : selected.soilSaturation > 65 ? 'text-yellow-400' : 'text-green-400'}
            barPercent={selected.soilSaturation}
            barColor={selected.soilSaturation > 85 ? 'bg-red-500' : selected.soilSaturation > 65 ? 'bg-yellow-500' : 'bg-green-500'}
          />
          <MetricCard
            icon={CloudRain}
            label="Rainfall"
            value={selected.currentRainfall.toFixed(1)}
            unit="mm/hr"
            color={selected.currentRainfall > 35 ? 'text-red-400' : selected.currentRainfall > 20 ? 'text-yellow-400' : 'text-cyan-300'}
          />
          <MetricCard
            icon={Mountain}
            label="Slope Angle"
            value={selected.slopeAngle}
            unit="deg"
            color={selected.slopeAngle > 30 ? 'text-orange-400' : 'text-slate-200'}
          />
          <MetricCard
            icon={Users}
            label="Population"
            value={(selected.population / 1000).toFixed(0) + 'K'}
            color="text-slate-200"
          />
        </div>

        {/* 72-Hour Forecast Chart */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200">72-Hour Risk Forecast</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-slate-500" />
              <span className="text-[10px] text-slate-500">AI Model v2.4</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/30 rounded-lg p-2">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={forecastData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  tickLine={false}
                  label={{ value: 'Hours', position: 'insideBottom', offset: -2, fontSize: 9, fill: '#475569' }}
                />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={0.75}
                  stroke="#ef4444"
                  strokeDasharray="4 2"
                  strokeWidth={1.5}
                  label={{ value: 'Danger', position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }}
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#riskGradient)"
                  dot={false}
                  activeDot={{ r: 3, fill: '#f97316', stroke: '#fff', strokeWidth: 1 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between mt-2 px-1">
            <div className="text-[10px] text-slate-500">
              Peak: <span className="text-red-400 font-bold font-mono">Hour +{peakHour}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Max: <span className="text-red-400 font-bold font-mono">{(maxForecastRisk * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-3 pb-4 mt-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Recommended Actions</div>
          {isCritical ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 p-2 bg-red-950/30 border border-red-800/40 rounded-md">
                <ChevronRight className="w-3 h-3 text-red-400 flex-shrink-0" />
                <span className="text-[11px] text-red-300">Issue immediate evacuation advisory</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-orange-950/30 border border-orange-800/40 rounded-md">
                <ChevronRight className="w-3 h-3 text-orange-400 flex-shrink-0" />
                <span className="text-[11px] text-orange-300">Alert BPBD regional command</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-800/40 border border-slate-700/40 rounded-md">
                <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="text-[11px] text-slate-300">Deploy rapid assessment team</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 p-2 bg-yellow-950/30 border border-yellow-800/40 rounded-md">
                <ChevronRight className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                <span className="text-[11px] text-yellow-300">Continue monitoring - elevated watch</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-800/40 border border-slate-700/40 rounded-md">
                <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="text-[11px] text-slate-300">Pre-position response resources</span>
              </div>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
            </span>
            Last updated: {new Date(selected.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </>
  );
}
