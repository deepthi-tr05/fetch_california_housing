// California Housing Dataset (1990 Census) – representative 600-row sample
// Generated to match real dataset statistics:
// MedInc, HouseAge, AveRooms, AveBedrms, Population, AveOccup, Latitude, Longitude, MedHouseVal

export const featureNames = [
  'MedInc', 'HouseAge', 'AveRooms', 'AveBedrms',
  'Population', 'AveOccup', 'Latitude', 'Longitude', 'MedHouseVal',
];

export const featureDescriptions: Record<string, string> = {
  MedInc:      'Median income in block group (in $10,000s)',
  HouseAge:    'Median house age in block group (years)',
  AveRooms:    'Average number of rooms per household',
  AveBedrms:   'Average number of bedrooms per household',
  Population:  'Block group population',
  AveOccup:    'Average number of household members',
  Latitude:    'Block group latitude',
  Longitude:   'Block group longitude',
  MedHouseVal: 'Median house value (in $100,000s)',
};

export type DataRow = Record<string, number>;

// Seeded pseudo-random number generator (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform for Gaussian samples
function gaussianPair(rand: () => number): [number, number] {
  const u1 = Math.max(rand(), 1e-10);
  const u2 = rand();
  const mag = Math.sqrt(-2 * Math.log(u1));
  return [mag * Math.cos(2 * Math.PI * u2), mag * Math.sin(2 * Math.PI * u2)];
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function generateData(): DataRow[] {
  const rand = mulberry32(42);
  const rows: DataRow[] = [];

  for (let i = 0; i < 600; i++) {
    const [g0, g1] = gaussianPair(rand);
    const [g2, g3] = gaussianPair(rand);
    const [g4, g5] = gaussianPair(rand);
    const [g6, g7] = gaussianPair(rand);

    // MedInc: mean=3.87, std=1.90, range [0.5, 15]
    const MedInc = clamp(3.87 + g0 * 1.90, 0.5, 15.0);

    // HouseAge: mean=28.6, std=12.6, range [1, 52]
    const HouseAge = clamp(Math.round(28.6 + g1 * 12.6), 1, 52);

    // AveRooms: loosely correlated with MedInc
    const AveRooms = clamp(4.0 + MedInc * 0.35 + g2 * 1.2, 0.85, 20);

    // AveBedrms: correlated with AveRooms
    const AveBedrms = clamp(AveRooms * 0.18 + 0.35 + g3 * 0.12, 0.33, 5);

    // Population: mean=1425, std=1100
    const Population = clamp(Math.round(1425 + g4 * 1100), 3, 10000);

    // AveOccup: mean=3.07, std=0.9 (clamped, real has outliers)
    const AveOccup = clamp(3.07 + g5 * 0.9, 0.69, 8);

    // Latitude: California range [32.5, 41.9]
    const Latitude = clamp(36.7 + g6 * 2.1, 32.5, 41.9);

    // Longitude: California range [-124.4, -114.3]
    const Longitude = clamp(-119.6 + g7 * 2.0, -124.4, -114.3);

    // MedHouseVal: strongly correlated with MedInc
    const baseVal = 0.45 + MedInc * 0.38 - (Latitude - 37.5) * 0.05;
    const [gv] = gaussianPair(rand);
    const MedHouseVal = clamp(baseVal + gv * 0.55, 0.15, 5.0);

    rows.push({
      MedInc:      +MedInc.toFixed(4),
      HouseAge:    +HouseAge,
      AveRooms:    +AveRooms.toFixed(4),
      AveBedrms:   +AveBedrms.toFixed(4),
      Population:  +Population,
      AveOccup:    +AveOccup.toFixed(4),
      Latitude:    +Latitude.toFixed(4),
      Longitude:   +Longitude.toFixed(4),
      MedHouseVal: +MedHouseVal.toFixed(4),
    });
  }

  return rows;
}

// Memoised dataset
let _cache: DataRow[] | null = null;
export function getDataRows(): DataRow[] {
  if (!_cache) _cache = generateData();
  return _cache;
}

// Pearson correlation
function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : num / denom;
}

export function computeCorrelationMatrix(data: DataRow[]): {
  features: string[];
  matrix: number[][];
} {
  const features = featureNames;
  const cols: Record<string, number[]> = {};
  for (const f of features) cols[f] = data.map((r) => r[f]);

  const matrix = features.map((f1) =>
    features.map((f2) => +pearson(cols[f1], cols[f2]).toFixed(4))
  );
  return { features, matrix };
}
