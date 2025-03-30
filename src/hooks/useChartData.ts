import { useState, useEffect, useRef } from "react";
import { Trade, BinanceService } from "../services/BinanceService";

export function useChartData() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const pendingTradesRef = useRef<Trade[]>([]);
  const serviceRef = useRef<BinanceService | null>(null);
  const [xDomain, setXDomain] = useState<[number, number]>(() => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return [startOfDay.getTime(), endOfDay.getTime()];
  });

  const checkAndFillGaps = async (currentTrades: Trade[]) => {
    if (currentTrades.length < 2) return currentTrades;

    const sortedTrades = [...currentTrades].sort((a, b) => a.time - b.time);

    let lastTime = sortedTrades[0].time;
    let gapStartTime = null;
    let gapEndTime = null;

    for (let i = 1; i < sortedTrades.length; i++) {
      const expectedTime = lastTime + 60000;
      const actualTime = sortedTrades[i].time;

      if (actualTime - expectedTime > 60000) {
        gapStartTime = expectedTime;
        gapEndTime = actualTime;
        break;
      }
      lastTime = actualTime;
    }

    if (gapStartTime && gapEndTime && serviceRef.current) {
      const gapMinutes = Math.ceil((gapEndTime - gapStartTime) / 60000) + 2;
      const gapFillData = await serviceRef.current.fetchKlines(gapMinutes);

      const mergedTrades = [...sortedTrades];
      gapFillData.forEach((trade) => {
        if (!mergedTrades.some((t) => t.time === trade.time)) {
          mergedTrades.push(trade);
        }
      });

      return mergedTrades.sort((a, b) => a.time - b.time);
    }

    return sortedTrades;
  };

  useEffect(() => {
    const service = new BinanceService((trade) => {
      pendingTradesRef.current.push(trade);
    }, setIsConnected);

    serviceRef.current = service;

    service.fetchHistoricalData().then(async (historicalData) => {
      const filledData = await checkAndFillGaps(historicalData);
      setTrades(filledData);
      service.connect();
    });

    const updateInterval = setInterval(() => {
      if (pendingTradesRef.current.length > 0) {
        setTrades((prev) => {
          const newTrades = [...prev];

          pendingTradesRef.current.forEach((trade) => {
            const index = newTrades.findIndex((t) => {
              const tradeMinute = Math.floor(trade.time / 60000) * 60000;
              const existingMinute = Math.floor(t.time / 60000) * 60000;
              return tradeMinute === existingMinute;
            });

            if (index >= 0) {
              if (trade.isClosed) {
                newTrades[index] = trade;
              } else {
                newTrades[index] = {
                  ...newTrades[index],
                  high: Math.max(newTrades[index].high, trade.high),
                  low: Math.min(newTrades[index].low, trade.low),
                  close: trade.close,
                  volume: trade.volume,
                  isClosed: false,
                };
              }
            } else {
              newTrades.push(trade);
            }
          });

          pendingTradesRef.current = [];

          const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
          return newTrades
            .filter((trade) => trade.time >= twentyFourHoursAgo)
            .sort((a, b) => a.time - b.time);
        });

        setTrades((prev) => {
          checkAndFillGaps(prev).then((filledTrades) => {
            if (filledTrades !== prev) {
              setTrades(filledTrades);
            }
          });
          return prev;
        });
      }
    }, 1000);

    return () => {
      clearInterval(updateInterval);
      service.disconnect();
      serviceRef.current = null;
    };
  }, []);

  const handleZoomChange = (minutes: number | null) => {
    if (minutes === null) {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      setXDomain([startOfDay.getTime(), endOfDay.getTime()]);
    } else {
      const now = Date.now();
      setXDomain([now - minutes * 60 * 1000, now]);
    }
  };

  return {
    trades,
    isConnected,
    xDomain,
    handleZoomChange,
  };
}
