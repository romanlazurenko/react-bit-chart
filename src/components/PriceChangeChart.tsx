import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
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
  children,
}: PriceChangeChartProps) {
  const candleData = trades.map((trade) => ({
    x: trade.time,
    y: [trade.open, trade.high, trade.low, trade.close],
  }));

  const options: ApexOptions = {
    chart: {
      type: "candlestick",
      height: 460,
      animations: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: "datetime",
      min: typeof xDomain[0] === "number" ? xDomain[0] : undefined,
      max: typeof xDomain[1] === "number" ? xDomain[1] : undefined,
      labels: {
        datetimeUTC: false,
        format: "HH:mm",
      },
      tickAmount: 8,
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        formatter: (value) => `$${value.toFixed(2)}`,
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#26a69a",
          downward: "#ef5350",
        },
        wick: {
          useFillColor: true,
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      x: {
        format: "yyyy-MM-dd HH:mm:ss",
      },
      y: {
        formatter: (value) => `$${value.toFixed(2)}`,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "460px" }}>
      <ReactApexChart
        options={options}
        series={[{ data: candleData }]}
        type="candlestick"
        height={460}
      />
      {children}
    </div>
  );
}
