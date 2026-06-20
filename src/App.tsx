import { useMemo, useState } from 'react';
import {
  getDataRows,
  featureNames,
  featureDescriptions,
  computeCorrelationMatrix,
} from './data/californiaHousing';
import { Heatmap } from './components/Heatmap';
import { PairPlot } from './components/PairPlot';
import { DistributionCharts } from './components/DistributionCharts';
import { ScatterDetail } from './components/ScatterDetail';
import { StatsSummary } from './components/StatsSummary';

type TabId = 'heatmap' | 'pairplot' | 'distributions' | 'scatter' | 'stats';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'heatmap', label: 'Correlation Heatmap', icon: '🔥' },
  { id: 'pairplot', label: 'Pair Plot', icon: '📊' },
  { id: 'distributions', label: 'Distributions', icon: '📈' },
  { id: 'scatter', label: 'Scatter Explorer', icon: '🔍' },
  { id: 'stats', label: 'Statistics', icon: '📋' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('heatmap');

  const data = useMemo(() => getDataRows(), []);
  const { features, matrix } = useMemo(() => computeCorrelationMatrix(data), [data]);

  // Key correlations for insight cards
  const keyInsights = useMemo(() => {
    const pairs: { f1: string; f2: string; r: number }[] = [];
    for (let i = 0; i < features.length; i++) {
      for (let j = i + 1; j < features.length; j++) {
        pairs.push({ f1: features[i], f2: features[j], r: matrix[i][j] });
      }
    }
    pairs.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
    return pairs.slice(0, 4);
  }, [features, matrix]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-lg shadow-lg shadow-cyan-500/20">
                    🏠
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                      California Housing Explorer
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                      Interactive statistical analysis & visualization dashboard
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {data.length} samples
                </div>
                <div className="bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                  {featureNames.length} features
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Insight Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyInsights.map((insight, i) => {
              const isPositive = insight.r > 0;
              const strength = Math.abs(insight.r) > 0.5 ? 'Strong' : Math.abs(insight.r) > 0.3 ? 'Moderate' : 'Weak';
              const colors = [
                'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20',
                'from-purple-500/10 to-purple-500/5 border-purple-500/20',
                'from-amber-500/10 to-amber-500/5 border-amber-500/20',
                'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
              ];
              return (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${colors[i]} border rounded-xl p-4 hover:scale-[1.02] transition-transform duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-slate-400">{strength} Correlation</span>
                    <span className={`text-lg font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{insight.r.toFixed(3)}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {insight.f1} <span className="text-slate-500">↔</span> {insight.f2}
                  </div>
                  <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-red-400'}`}
                      style={{ width: `${Math.abs(insight.r) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6 shadow-xl">
            {/* Tab Title */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{tabs.find(t => t.id === activeTab)?.icon}</span>
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {activeTab === 'heatmap' && 'Pearson correlation coefficients between all features. Hover over cells for detailed values.'}
                {activeTab === 'pairplot' && 'Pairwise scatter plots with KDE-style histograms on the diagonal. Select 2-5 features to compare.'}
                {activeTab === 'distributions' && 'Individual feature distributions with key statistics (mean, standard deviation).'}
                {activeTab === 'scatter' && 'Interactive scatter plot with customizable axes and color-coded quartiles.'}
                {activeTab === 'stats' && 'Comprehensive descriptive statistics for all features in the dataset.'}
              </p>
            </div>

            {/* Tab Content */}
            {activeTab === 'heatmap' && (
              <div className="flex justify-center">
                <Heatmap features={features} matrix={matrix} descriptions={featureDescriptions} />
              </div>
            )}

            {activeTab === 'pairplot' && (
              <PairPlot data={data} features={featureNames} />
            )}

            {activeTab === 'distributions' && (
              <DistributionCharts data={data} features={featureNames} />
            )}

            {activeTab === 'scatter' && (
              <ScatterDetail data={data} />
            )}

            {activeTab === 'stats' && (
              <StatsSummary data={data} />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              California Housing Dataset • Based on 1990 Census data • {data.length} block group samples
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                React + Recharts
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Tailwind CSS
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Interactive Analysis
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
