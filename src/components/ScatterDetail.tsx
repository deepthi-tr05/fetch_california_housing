import { useMemo, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { DataRow } from '../data/californiaHousing';
import { featureNames } from '../data/californiaHousing';

interface Props { data: DataRow[] }

const QUARTILE_COLORS = ['#f87171', '#fb923c', '#34d399', '#22d3ee'];

function quantile(sorted: number[], q: number) {
  const idx = q * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function ScatterDetail({ data }: Props) {
  const [xFeature, setXFeature] = useState('MedInc');
  const [yFeature, setYFeature] = useState('MedHouseVal');
  const [colorFeature, setColorFeature] = useState('HouseAge');

  const plotData = useMemo(() => {
    // Use every other row for performance
    return data.filter((_, i) => i % 2 === 0);
  }, [data]);

  const colorVals = useMemo(() => {
    const vals = plotData.map((r) => r[colorFeature]).sort((a, b) => a - b);
    const q25 = quantile(vals, 0.25);
    const q50 = quantile(vals, 0.5);
    const q75 = quantile(vals, 0.75);
    return { q25, q50, q75 };
  }, [plotData, colorFeature]);

  const getQuartileColor = (v: number) => {
    if (v <= colorVals.q25) return QUARTILE_COLORS[0];
    if (v <= colorVals.q50) return QUARTILE_COLORS[1];
    if (v <= colorVals.q75) return QUARTILE_COLORS[2];
    return QUARTILE_COLORS[3];
  };

  const points = useMemo(() =>
    plotData.map((r) => ({ x: r[xFeature], y: r[yFeature], c: r[colorFeature] })),
    [plotData, xFeature, yFeature, colorFeature]
  );

  const Select = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
      >
        {featureNames.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <Select label="X Axis" value={xFeature} onChange={setXFeature} />
        <Select label="Y Axis" value={yFeature} onChange={setYFeature} />
        <Select label="Color by (quartiles)" value={colorFeature} onChange={setColorFeature} />
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="x"
            type="number"
            name={xFeature}
            tick={{ fill: '#64748b', fontSize: 11 }}
            label={{ value: xFeature, position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name={yFeature}
            tick={{ fill: '#64748b', fontSize: 11 }}
            label={{ value: yFeature, angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ stroke: '#334155', strokeWidth: 1 }}
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 10,
              fontSize: 12,
            }}
            formatter={(val: number, name: string) => [val.toFixed(4), name]}
          />
          <Scatter data={points} isAnimationActive={false}>
            {points.map((p, i) => (
              <Cell key={i} fill={getQuartileColor(p.c)} opacity={0.7} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quartile legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs">
        {[
          { label: `Q1 (≤${colorVals.q25.toFixed(2)})`, color: QUARTILE_COLORS[0] },
          { label: `Q2 (≤${colorVals.q50.toFixed(2)})`, color: QUARTILE_COLORS[1] },
          { label: `Q3 (≤${colorVals.q75.toFixed(2)})`, color: QUARTILE_COLORS[2] },
          { label: `Q4 (>${colorVals.q75.toFixed(2)})`, color: QUARTILE_COLORS[3] },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
            {colorFeature} {label}
          </div>
        ))}
      </div>
    </div>
  );
}
