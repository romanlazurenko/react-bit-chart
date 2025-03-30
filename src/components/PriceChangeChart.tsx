import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Trade } from "../services/BinanceService";

interface PriceChangeChartProps {
  trades: Trade[];
  xDomain: [number | string, number | string];
  children?: React.ReactNode;
}

export function PriceChangeChart({
  trades,
  xDomain,
  children,
}: PriceChangeChartProps) {
  const { visibleTrades, yRange } = useMemo(() => {
    const start = typeof xDomain[0] === "number" ? xDomain[0] : 0;
    const end = typeof xDomain[1] === "number" ? xDomain[1] : Date.now();

    const visibleTrades = trades.filter(
      (trade) => trade.time >= start && trade.time <= end
    );

    if (visibleTrades.length === 0)
      return { visibleTrades: [], yRange: { min: 0, max: 0 } };

    const prices = visibleTrades.flatMap((trade) => [trade.high, trade.low]);

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    const padding = (max - min) * 0.05;

    return {
      visibleTrades,
      yRange: {
        min: Math.floor(min - padding),
        max: Math.ceil(max + padding),
      },
    };
  }, [trades, xDomain]);

  const candleData = useMemo(
    () =>
      visibleTrades.map((trade) => ({
        x: trade.time,
        y: [trade.open, trade.high, trade.low, trade.close],
      })),
    [visibleTrades]
  );

  const options: ApexOptions = {
    chart: {
      type: "candlestick",
      animations: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
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
      min: yRange.min,
      max: yRange.max,
      tooltip: {
        enabled: true,
      },
      labels: {
        formatter: (value) => `$${value.toFixed(0)}`,
      },
      forceNiceScale: true,
      tickAmount: 8,
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
        format: "MM-dd HH:mm",
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
