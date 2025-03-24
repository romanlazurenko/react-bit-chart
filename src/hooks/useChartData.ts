import { useState, useEffect, useRef } from "react";
import { Trade, BinanceService } from "../services/BinanceService";

export function useChartData() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const pendingTradesRef = useRef<Trade[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const service = new BinanceService((trade) => {
      pendingTradesRef.current.push(trade);
    }, setIsConnected);

    service.fetchHistoricalData().then(setTrades);
    service.connect();

    const updateInterval = setInterval(() => {
      if (!isPaused && pendingTradesRef.current.length > 0) {
        setTrades((prev) => {
          const newTrades = [...prev, ...pendingTradesRef.current];
          pendingTradesRef.current = [];
          return newTrades.slice(-1000);
        });
      }
    }, 500);

    return () => {
      clearInterval(updateInterval);
      service.disconnect();
    };
  }, [isPaused]);

  return { trades, isConnected, isPaused, setIsPaused };
}
