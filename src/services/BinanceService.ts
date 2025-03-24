export interface Trade {
  time: number;
  price: number;
  change: number;
}

export interface BinanceKline {
  openTime: number;
  closePrice: number;
}

export class BinanceService {
  private ws: WebSocket | null = null;
  private lastPrice: number | null = null;

  constructor(
    private onTrade: (trade: Trade) => void,
    private onConnectionChange: (isConnected: boolean) => void
  ) {}

  async fetchHistoricalData(): Promise<Trade[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&startTime=${today.getTime()}&limit=1000`
    );

    const klines = await response.json();
    return klines.map((kline: any, index: number, arr: any[]) => {
      const closePrice = parseFloat(kline[4]);
      const prevClose = index > 0 ? parseFloat(arr[index - 1][4]) : closePrice;

      return {
        time: kline[0],
        price: closePrice,
        change: closePrice - prevClose,
      };
    });
  }

  connect() {
    this.ws = new WebSocket(
      "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/btcusdt@kline_1m"
    );

    this.ws.onopen = () => {
      this.onConnectionChange(true);
    };

    this.ws.onclose = () => {
      this.onConnectionChange(false);
      setTimeout(() => this.connect(), 5000);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.stream === "btcusdt@trade") {
        this.handleTradeMessage(data.data);
      }
    };

    this.setupPing();
  }

  private handleTradeMessage(trade: any) {
    const currentPrice = parseFloat(trade.p);
    const change = this.lastPrice !== null ? currentPrice - this.lastPrice : 0;

    this.onTrade({
      time: trade.T,
      price: currentPrice,
      change: change,
    });

    this.lastPrice = currentPrice;
  }

  private setupPing() {
    const pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: "PING" }));
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
