'use client';

import { useEffect, useRef, useState } from 'react';
import { TriangleAlert as AlertTriangle, Radio } from 'lucide-react';
import { mockAlerts } from '@/lib/mockData';

export default function AlertTicker() {
  const [currentTime, setCurrentTime] = useState('');
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const criticalAlerts = mockAlerts.filter((a) => a.severity === 'critical' || a.severity === 'high');

  const tickerContent = criticalAlerts.map((a) => {
    const icon = a.severity === 'critical' ? '🚨' : '⚠️';
    return `${icon} ${a.timestamp} — ${a.message}`;
  });

  return (
    <div className="h-9 bg-[#0a0f1e] border-b border-red-900/60 flex items-center overflow-hidden flex-shrink-0">
      {/* Label */}
      <div className="flex items-center gap-1.5 px-3 bg-red-900/80 h-full border-r border-red-700/50 flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <Radio className="w-3 h-3 text-red-300" />
        <span className="text-red-200 text-xs font-bold tracking-widest uppercase whitespace-nowrap">
          Live Alerts
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap flex gap-16 py-1">
          {[...tickerContent, ...tickerContent].map((msg, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-xs text-amber-200/90 font-mono">
              <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* Clock */}
      <div className="flex items-center gap-1.5 px-4 h-full border-l border-slate-700/50 flex-shrink-0">
        <span className="text-xs font-mono text-slate-400">UTC+7</span>
        <span className="text-xs font-mono text-cyan-300 tabular-nums">{currentTime}</span>
      </div>
    </div>
  );
}
