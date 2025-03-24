# Bitcoin Real-time Price Chart

A React application that displays real-time Bitcoin price data using Binance's WebSocket API. The application shows both price changes and absolute price values in interactive charts.

## Features

- Real-time price updates from Binance
- Dual chart display:
  - Price changes chart (top)
  - Absolute price chart (bottom)
- Time-based zoom controls (15m, 1h, 4h)
- Historical data loading from the start of the current day
- Automatic WebSocket reconnection
- Interactive pause on hover

## Tech Stack

- React
- TypeScript
- Recharts (for charts)
- Binance WebSocket API
- Vite (build tool)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure
