import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Trade } from "../services/BinanceService";

interface PriceChangeChartProps {
  trades: Trade[];
  xDomain: [number | string, number | string];
  onPauseChange: (isPaused: boolean) => void;
  children?: React.ReactNode;
}

export function PriceChangeChart({
  trades,
  xDomain,
  onPauseChange,
  children,
}: PriceChangeChartProps) {
  const handleMouseDown = () => onPauseChange(true);
  const handleMouseUp = () => onPauseChange(false);
  const handleMouseLeave = () => onPauseChange(false);

  return (
    <div style={{ width: "100%", height: "460px" }}>
      <ResponsiveContainer>
        <AreaChart
          data={trades}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            domain={xDomain}
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
            type="number"
            scale="time"
            interval="preserveStartEnd"
            allowDataOverflow={true}
            tick={{ fontSize: 12 }}
            tickCount={8}
            minTickGap={50}
          />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            label={{
              value: "Price Change (USD)",
              angle: -90,
              position: "insideLeft",
            }}
            width={120}
            allowDataOverflow={true}
          />
          <Tooltip
            labelFormatter={(time) => new Date(time).toLocaleString()}
            formatter={(value: number, name: string) => {
              if (name === "positive") {
                return [`+$${value.toFixed(2)}`, "Increase"];
              }
              if (name === "negative") {
                return [`-$${Math.abs(value).toFixed(2)}`, "Decrease"];
              }
              return [`$${value.toFixed(2)}`, name];
            }}
          />
          <ReferenceLine y={0} stroke="#666" />
          <defs>
            <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff7777" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ff7777" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={(data) => (data.change > 0 ? data.change : 0)}
            stroke="#82ca9d"
            fill="url(#colorPositive)"
            name="positive"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey={(data) => (data.change < 0 ? data.change : 0)}
            stroke="#ff7777"
            fill="url(#colorNegative)"
            name="negative"
            isAnimationActive={false}
          />
          {children}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
