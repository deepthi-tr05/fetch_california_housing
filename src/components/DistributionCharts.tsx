import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import type { DataRow } from '../data/californiaHousing';

interface Props {
  data: DataRow[];
  features: string[];
}

const COLORS = [
  '#22d3ee', '#a78bfa', '#f59e0b', '#34d399',
  '#f87171', '#60a5fa', '#fb923c', '#c084fc', '#4ade80',
];

function buildHistogram(vals: number[], bins = 30) {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const step = (max - min) / bins;
  const counts = new Array(bins).fill(0);
  for (const v of vals) {
    const idx = Math.min(Math.floor((v - min) / step), bins - 1);
    counts[idx]++;
  }
  return counts.map((count, i) => ({
    bin: +(min + (i + 0.5) * step).toFixed(3),
    label: `${(min + i * step).toFixed(2)} – ${(min + (i + 1) * step).toFixed(2)}`,
    count,
  }));
}

function stats(vals: number[]) {
  const sorted = [...vals].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = vals.reduce((a, b) => a + b, 0) / n;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  return {
    mean: +mean.toFixed(4),
    std: +std.toFixed(4),
    min: +sorted[0].toFixed(4),
    max: +sorted[n - 1].toFixed(4),
    median: +median.toFixed(4),
  };
}

export function DistributionCharts({ data, features }: Props) {
  const charts = useMemo(() =>
    features.map((f, idx) => {
      const vals = data.map((r) => r[f]);
      return { f, vals, hist: buildHistogram(vals), s: stats(vals), color: COLORS[idx % COLORS.length] };
    }),
    [data, features]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {charts.map(({ f, hist, s, color }) => (
        <div
          key={f}
          className="bg-slate-900/60 rounded-xl border border-slate-800/60 p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200">{f}</h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: `${color}25`, color }}
            >
              μ={s.mean}
            </span>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={hist} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="bin"
                tick={{ fontSize: 9, fill: '#64748b' }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(val: number, _: string, props: { payload?: { label?: string } }) => [
                  val,
                  `Range: ${props?.payload?.label ?? ''}`,
                ]}
                labelFormatter={() => f}
              />
              <ReferenceLine
                x={s.mean}
                stroke={color}
                strokeDasharray="4 2"
                label={{ value: 'μ', fill: color, fontSize: 10 }}
              />
              <Bar dataKey="count" isAnimationActive={false} radius={[2, 2, 0, 0]}>
                {hist.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={color}
                    opacity={Math.abs(entry.bin - s.mean) < s.std ? 0.9 : 0.45}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Stats row */}
          <div className="flex justify-between mt-3 text-xs text-slate-400 font-mono">
            <span title="Minimum">↓ {s.min}</span>
            <span title="Median" className="text-slate-300">⊕ {s.median}</span>
            <span title="Standard deviation" style={{ color }}>σ {s.std}</span>
            <span title="Maximum">↑ {s.max}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
