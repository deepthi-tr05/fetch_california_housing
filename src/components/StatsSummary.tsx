import { useMemo } from 'react';
import type { DataRow } from '../data/californiaHousing';
import { featureNames } from '../data/californiaHousing';

interface Props { data: DataRow[] }

function computeStats(vals: number[]) {
  const sorted = [...vals].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = vals.reduce((a, b) => a + b, 0) / n;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const q = (p: number) => {
    const idx = p * (n - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };
  return {
    count: n,
    mean: +mean.toFixed(4),
    std: +std.toFixed(4),
    min: +sorted[0].toFixed(4),
    q25: +q(0.25).toFixed(4),
    median: +q(0.5).toFixed(4),
    q75: +q(0.75).toFixed(4),
    max: +sorted[n - 1].toFixed(4),
  };
}

type StatKey = keyof ReturnType<typeof computeStats>;

const STAT_COLS: { key: StatKey; label: string; description: string }[] = [
  { key: 'count',  label: 'Count',  description: 'Total samples' },
  { key: 'mean',   label: 'Mean',   description: 'Arithmetic mean' },
  { key: 'std',    label: 'Std',    description: 'Standard deviation' },
  { key: 'min',    label: 'Min',    description: 'Minimum value' },
  { key: 'q25',    label: 'Q1',     description: '25th percentile' },
  { key: 'median', label: 'Median', description: '50th percentile' },
  { key: 'q75',    label: 'Q3',     description: '75th percentile' },
  { key: 'max',    label: 'Max',    description: 'Maximum value' },
];

const ROW_COLORS = [
  'from-cyan-500/10',   'from-purple-500/10', 'from-amber-500/10',
  'from-emerald-500/10','from-red-500/10',    'from-blue-500/10',
  'from-orange-500/10', 'from-pink-500/10',   'from-lime-500/10',
];

export function StatsSummary({ data }: Props) {
  const table = useMemo(() =>
    featureNames.map((f) => ({
      feature: f,
      stats: computeStats(data.map((r) => r[f])),
    })),
    [data]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile-friendly card view */}
      <div className="block xl:hidden space-y-4">
        {table.map(({ feature, stats }, fi) => (
          <div
            key={feature}
            className={`rounded-xl border border-slate-800/60 bg-gradient-to-r ${ROW_COLORS[fi]} to-transparent p-4`}
          >
            <div className="text-base font-bold text-white mb-3">{feature}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STAT_COLS.map(({ key, label, description }) => (
                <div key={key} className="flex flex-col" title={description}>
                  <span className="text-xs text-slate-500 font-medium">{label}</span>
                  <span className="text-sm font-mono text-slate-200 font-semibold">{stats[key]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden xl:block overflow-x-auto rounded-xl border border-slate-800/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/60 bg-slate-900/80">
              <th className="text-left px-4 py-3 text-slate-400 font-semibold">Feature</th>
              {STAT_COLS.map(({ key, label, description }) => (
                <th
                  key={key}
                  className="text-right px-4 py-3 text-slate-400 font-semibold cursor-help"
                  title={description}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map(({ feature, stats }, fi) => (
              <tr
                key={feature}
                className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2`}
                    style={{ background: ['#22d3ee','#a78bfa','#f59e0b','#34d399','#f87171','#60a5fa','#fb923c','#c084fc','#4ade80'][fi] }}
                  />
                  <span className="text-white font-semibold">{feature}</span>
                </td>
                {STAT_COLS.map(({ key }) => (
                  <td key={key} className="px-4 py-3 text-right font-mono text-slate-300">
                    {stats[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footnote */}
      <p className="text-xs text-slate-500 text-center">
        Statistics computed on {data.length.toLocaleString()} block group samples · 1990 US Census
      </p>
    </div>
  );
}
