import React, { useMemo } from "react";
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
  onPauseChange,
  children,
}: PriceChangeChartProps) {
  const candleData = useMemo(() => {
    const currentMinute = Math.floor(Date.now() / 60000) * 60000;
    const sortedTrades = trades
      .map((trade) => ({
        x: trade.time,
        y: [trade.open, trade.high, trade.low, trade.close],
      }))
      .sort((a, b) => a.x - b.x);

    const lastCandle = sortedTrades[sortedTrades.length - 1];
    if (lastCandle && lastCandle.x < currentMinute) {
      sortedTrades.push({
        x: currentMinute,
        y: [lastCandle.y[3], lastCandle.y[3], lastCandle.y[3], lastCandle.y[3]],
      });
    }

    return sortedTrades.slice(-100);
  }, [trades]);

  const options: ApexOptions = {
    chart: {
      type: "candlestick",
      height: 460,
      animations: {
        enabled: false,
      },
      toolbar: {
        show: true,
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      background: "#000",
      events: {
        mouseDown: () => onPauseChange(true),
        mouseUp: () => onPauseChange(false),
        mouseleave: () => onPauseChange(false),
      },
    },
    xaxis: {
      type: "datetime",
      min: typeof xDomain[0] === "number" ? xDomain[0] : undefined,
      max: typeof xDomain[1] === "number" ? xDomain[1] : undefined,
      range: 24 * 60 * 60 * 1000,
      axisBorder: {
        show: true,
        color: "#78909C",
      },
      axisTicks: {
        show: true,
        color: "#78909C",
      },
      labels: {
        style: {
          colors: "#fff",
        },
        datetimeUTC: false,
        format: "HH:mm",
      },
      tickAmount: 8,
    },
    yaxis: {
      decimalsInFloat: 2,
      labels: {
        formatter: (value) => `$${value.toFixed(2)}`,
        style: {
          colors: "#fff",
        },
      },
      forceNiceScale: true,
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
    grid: {
      borderColor: "#90A4AE30",
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    theme: {
      mode: "dark",
    },
  };

  return (
    <div style={{ width: "100%", height: "460px", background: "#000" }}>
      <ReactApexChart
        options={options}
        series={[
          {
            name: "BTC/USDT",
            data: candleData,
          },
        ]}
        type="candlestick"
        height={460}
      />
      {children}
    </div>
  );
}
