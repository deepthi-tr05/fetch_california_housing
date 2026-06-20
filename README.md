# 🏠 California Housing Explorer

An interactive statistical analysis and visualization dashboard built with **React**, **Recharts**, and **Tailwind CSS**, powered by **Vite**. Explore the classic California Housing dataset (1990 Census) through rich, interactive charts and statistical tools.

---

## 📊 Features

| Tab | Description |
|-----|-------------|
| 🔥 **Correlation Heatmap** | Pearson correlation coefficients between all features, with hover-over details |
| 📊 **Pair Plot** | Pairwise scatter plots with KDE-style histograms on the diagonal (select 2–5 features) |
| 📈 **Distributions** | Individual feature distributions showing mean and standard deviation |
| 🔍 **Scatter Explorer** | Interactive scatter plot with customizable X/Y axes and color-coded quartiles |
| 📋 **Statistics** | Comprehensive descriptive statistics for all features |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/fetch_california_housing.git
cd fetch_california_housing

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🗂️ Project Structure

```
fetch_california_housing-main/
├── index.html              # App entry point
├── package.json            # Project metadata & scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── src/
    ├── App.tsx             # Main app component (tabs, layout, insight cards)
    ├── index.css           # Global styles
    ├── data/
    │   └── californiaHousing.ts   # Dataset rows, feature names & correlation math
    └── components/
        ├── Heatmap.tsx            # Correlation heatmap chart
        ├── PairPlot.tsx           # Pairwise scatter / histogram grid
        ├── DistributionCharts.tsx # Per-feature distribution charts
        ├── ScatterDetail.tsx      # Interactive scatter explorer
        └── StatsSummary.tsx       # Descriptive statistics table
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev/) | 19 | UI component framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type-safe JavaScript |
| [Vite](https://vitejs.dev/) | 7 | Lightning-fast build tool & dev server |
| [Recharts](https://recharts.org/) | 3 | Composable charting library |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utility-first CSS framework |
| [Lucide React](https://lucide.dev/) | latest | Icon library |

---

## 📦 Dataset

The app uses the **California Housing Dataset** sourced from the 1990 US Census. It contains **20,640 block group samples** across California with the following features:

| Feature | Description |
|---------|-------------|
| `MedInc` | Median income in block group |
| `HouseAge` | Median house age in block group |
| `AveRooms` | Average number of rooms per household |
| `AveBedrms` | Average number of bedrooms per household |
| `Population` | Block group population |
| `AveOccup` | Average household occupancy |
| `Latitude` | Block group latitude |
| `Longitude` | Block group longitude |
| `MedHouseVal` | Median house value (target variable) |

---

## 📸 Screenshots

> The dashboard features a sleek dark theme with ambient glow effects, glassmorphism cards, and smooth tab transitions.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

- Dataset originally from the [StatLib repository](http://lib.stat.cmu.edu/datasets/) and popularized via [scikit-learn](https://scikit-learn.org/stable/datasets/real_world.html#california-housing-dataset).
- Built with ❤️ using React + Vite + Tailwind CSS.
