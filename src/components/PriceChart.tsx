import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trade } from "../services/BinanceService";

interface PriceChartProps {
  trades: Trade[];
  xDomain: [number | string, number | string];
  children?: React.ReactNode;
}

export function PriceChart({ trades, xDomain, children }: PriceChartProps) {
  const transformedTrades = trades.map((trade) => ({
    ...trade,
    price: trade.close,
  }));

  return (
    <div style={{ width: "100%", height: "260px" }}>
      <ResponsiveContainer>
        <AreaChart
          data={transformedTrades}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            domain={xDomain}
            tickFormatter={(time) => {
              const date = new Date(time);
              return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
            }}
            type="number"
            scale="time"
            interval="preserveStartEnd"
            allowDataOverflow={true}
            tick={{ fontSize: 12 }}
            tickCount={12}
            minTickGap={50}
          />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            label={{
              value: "Price (USD)",
              angle: -90,
              position: "insideLeft",
            }}
            width={120}
            allowDataOverflow={true}
          />
          <Tooltip
            labelFormatter={(time) => new Date(time).toLocaleString()}
            formatter={(value: number, name: string) => {
              if (name === "price") {
                return [`$${value.toFixed(2)}`, "Price"];
              }
              return [`$${value.toFixed(2)}`, name];
            }}
          />
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            fill="url(#colorPrice)"
            isAnimationActive={false}
          />
          {children}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
