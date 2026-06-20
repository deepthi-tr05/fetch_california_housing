import { useMemo, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { DataRow } from '../data/californiaHousing';
import { featureNames } from '../data/californiaHousing';

interface Props { matrix: number[][]; features: string[]; descriptions: Record<string, string> }

const colorScale = (v: number): string => {
  // -1 → red, 0 → slate, +1 → cyan
  const t = (v + 1) / 2; // 0..1
  if (t < 0.5) {
    const s = t * 2;
    return `rgb(${Math.round(239 - s * 30)},${Math.round(68 + s * 50)},${Math.round(68 + s * 60)})`;
  } else {
    const s = (t - 0.5) * 2;
    return `rgb(${Math.round(30 + s * 6)},${Math.round(172 + s * 47)},${Math.round(172 + s * 54)})`;
  }
};

export function Heatmap({ matrix, features, descriptions }: Props) {
  const [hovered, setHovered] = useState<{ i: number; j: number; v: number } | null>(null);
  const cellSize = 52;
  const labelWidth = 80;
  const totalW = labelWidth + features.length * cellSize;
  const totalH = labelWidth + features.length * cellSize;

  return (
    <div className="flex flex-col items-center gap-4 w-full overflow-x-auto">
      <svg width={totalW} height={totalH} className="overflow-visible">
        {/* Column labels (rotated) */}
        {features.map((f, j) => (
          <text
            key={`cl-${j}`}
            x={labelWidth + j * cellSize + cellSize / 2}
            y={labelWidth - 8}
            textAnchor="start"
            fontSize={10}
            fill="#94a3b8"
            transform={`rotate(-40, ${labelWidth + j * cellSize + cellSize / 2}, ${labelWidth - 8})`}
            className="select-none"
          >
            {f}
          </text>
        ))}
        {/* Row labels */}
        {features.map((f, i) => (
          <text
            key={`rl-${i}`}
            x={labelWidth - 8}
            y={labelWidth + i * cellSize + cellSize / 2 + 4}
            textAnchor="end"
            fontSize={10}
            fill="#94a3b8"
            className="select-none"
          >
            {f}
          </text>
        ))}
        {/* Cells */}
        {features.map((_, i) =>
          features.map((_, j) => {
            const v = matrix[i][j];
            const isHov = hovered?.i === i && hovered?.j === j;
            return (
              <g key={`${i}-${j}`}>
                <rect
                  x={labelWidth + j * cellSize}
                  y={labelWidth + i * cellSize}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  rx={4}
                  fill={colorScale(v)}
                  opacity={isHov ? 1 : 0.85}
                  stroke={isHov ? '#e2e8f0' : 'transparent'}
                  strokeWidth={isHov ? 2 : 0}
                  style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={() => setHovered({ i, j, v })}
                  onMouseLeave={() => setHovered(null)}
                />
                <text
                  x={labelWidth + j * cellSize + (cellSize - 2) / 2}
                  y={labelWidth + i * cellSize + (cellSize - 2) / 2 + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill={Math.abs(v) > 0.4 ? '#fff' : '#cbd5e1'}
                  className="select-none pointer-events-none"
                >
                  {v.toFixed(2)}
                </text>
              </g>
            );
          })
        )}
      </svg>

      {/* Hover tooltip */}
      {hovered && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm shadow-xl">
          <span className="font-semibold text-cyan-300">{features[hovered.i]}</span>
          <span className="text-slate-400 mx-2">↔</span>
          <span className="font-semibold text-cyan-300">{features[hovered.j]}</span>
          <span className="text-slate-400 mx-2">r =</span>
          <span className={`font-bold font-mono ${hovered.v > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
            {hovered.v.toFixed(4)}
          </span>
        </div>
      )}

      {/* Colour legend */}
      <div className="flex items-center gap-3 mt-2">
        <span className="text-xs text-slate-400">−1 (negative)</span>
        <svg width={160} height={16}>
          <defs>
            <linearGradient id="hm-legend">
              <stop offset="0%" stopColor={colorScale(-1)} />
              <stop offset="50%" stopColor={colorScale(0)} />
              <stop offset="100%" stopColor={colorScale(1)} />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={160} height={16} rx={8} fill="url(#hm-legend)" />
        </svg>
        <span className="text-xs text-slate-400">+1 (positive)</span>
      </div>

      {/* Feature description legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 mt-2 text-xs text-slate-400 max-w-2xl">
        {featureNames.map((f) => (
          <div key={f}>
            <span className="text-slate-200 font-medium">{f}:</span>{' '}
            {descriptions[f]?.split('(')[0].trim()}
          </div>
        ))}
      </div>
    </div>
  );
}
