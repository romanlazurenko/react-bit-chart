import { useState } from "react";
import { useChartData } from "../hooks/useChartData";
import { ZoomControls } from "./ZoomControls";
import { PriceChart } from "./PriceChart";
import { PriceChangeChart } from "./PriceChangeChart";

export function BitcoinChart() {
  const { trades, isConnected, setIsPaused } = useChartData();
  const [xDomain, setXDomain] = useState<[number | string, number | string]>([
    "dataMin",
    "dataMax",
  ]);

  const handleZoomChange = (minutes: number | null) => {
    if (minutes === null) {
      setXDomain(["dataMin", "dataMax"]);
    } else {
      const now = Date.now();
      const start = now - minutes * 60 * 1000;
      setXDomain([start, now]);
    }
  };

  return (
    <div>
      <h2>BTC/USDT Real-time Price Chart</h2>
      <div style={{ marginBottom: "1rem" }}>
        Status: {isConnected ? "Connected" : "Disconnecting..."}
      </div>

      <PriceChangeChart
        trades={trades}
        xDomain={xDomain}
        onPauseChange={setIsPaused}
      />

      <PriceChart
        trades={trades}
        xDomain={xDomain}
        onPauseChange={setIsPaused}
      />

      <ZoomControls onZoomChange={handleZoomChange} />
    </div>
  );
}
