import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import type { DataRow } from '../data/californiaHousing';

interface Props {
  data: DataRow[];
  features: string[];
}

const PALETTE = [
  '#22d3ee', '#a78bfa', '#f59e0b', '#34d399',
  '#f87171', '#60a5fa', '#fb923c', '#c084fc', '#4ade80',
];

export function PairPlot({ data, features }: Props) {
  const allFeatures = features;
  const [selected, setSelected] = useState<string[]>(
    allFeatures.slice(0, 4)
  );

  const toggleFeature = (f: string) => {
    setSelected((prev) =>
      prev.includes(f)
        ? prev.length > 2 ? prev.filter((x) => x !== f) : prev
        : prev.length < 5 ? [...prev, f] : prev
    );
  };

  const n = selected.length;

  // Histogram bins for diagonal
  const histograms = useMemo(() => {
    const out: Record<string, { x: number; count: number }[]> = {};
    for (const f of selected) {
      const vals = data.map((r) => r[f]);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const bins = 20;
      const step = (max - min) / bins;
      const counts = new Array(bins).fill(0);
      for (const v of vals) {
        const idx = Math.min(Math.floor((v - min) / step), bins - 1);
        counts[idx]++;
      }
      out[f] = counts.map((count, i) => ({ x: +(min + i * step).toFixed(3), count }));
    }
    return out;
  }, [data, selected]);

  const scatterData = useMemo(() => {
    // Use every 3rd row for performance
    return data.filter((_, i) => i % 3 === 0);
  }, [data]);

  const cellSize = 160;

  return (
    <div className="flex flex-col gap-4">
      {/* Feature selector */}
      <div className="flex flex-wrap gap-2">
        {allFeatures.map((f, i) => (
          <button
            key={f}
            onClick={() => toggleFeature(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
              selected.includes(f)
                ? 'border-transparent text-slate-900 shadow-md'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
            style={selected.includes(f) ? { background: PALETTE[i % PALETTE.length] } : {}}
          >
            {f}
          </button>
        ))}
        <span className="text-xs text-slate-500 self-center ml-2">
          Select 2–5 features
        </span>
      </div>

      {/* Grid */}
      <div
        className="overflow-x-auto"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${cellSize}px)` }}
      >
        {selected.map((fi, i) =>
          selected.map((fj, j) => {
            const fi_idx = allFeatures.indexOf(fi);
            const color = PALETTE[fi_idx % PALETTE.length];

            if (i === j) {
              // Diagonal: histogram
              return (
                <div
                  key={`${i}-${j}`}
                  className="border border-slate-800/60 bg-slate-900/40 flex flex-col items-center justify-center p-1"
                  style={{ width: cellSize, height: cellSize }}
                >
                  <div className="text-xs font-semibold text-slate-300 mb-1">{fi}</div>
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={histograms[fi]} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Bar dataKey="count" isAnimationActive={false}>
                        {histograms[fi].map((_, idx) => (
                          <Cell key={idx} fill={color} opacity={0.7} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            }

            // Off-diagonal: scatter
            const pts = scatterData.map((r) => ({ x: r[fj], y: r[fi] }));
            return (
              <div
                key={`${i}-${j}`}
                className="border border-slate-800/60 bg-slate-900/40"
                style={{ width: cellSize, height: cellSize }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <XAxis dataKey="x" type="number" hide />
                    <YAxis dataKey="y" type="number" hide />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      formatter={(val: number, name: string) => [
                        val.toFixed(3),
                        name === 'x' ? fj : fi,
                      ]}
                    />
                    <Scatter data={pts} isAnimationActive={false}>
                      {pts.map((_, idx) => (
                        <Cell key={idx} fill={color} opacity={0.5} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
