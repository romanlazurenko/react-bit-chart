export interface Trade {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed: boolean;
}

export interface BinanceKline {
  openTime: number;
  closePrice: number;
}

export class BinanceService {
  private ws: WebSocket | null = null;
  private reconnectInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private onTrade: (trade: Trade) => void,
    private onConnectionChange: (isConnected: boolean) => void
  ) {}

  async fetchHistoricalData(): Promise<Trade[]> {
    return this.fetchKlines(0);
  }

  async fetchKlines(minutes: number = 0): Promise<Trade[]> {
    const now = Date.now();
    const startTime =
      minutes === 0
        ? new Date().setHours(0, 0, 0, 0)
        : now - minutes * 60 * 1000;

    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&startTime=${startTime}&endTime=${now}&limit=1440`
    );

    const klines = await response.json();
    return klines.map((kline: any) => ({
      time: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      isClosed: true,
    }));
  }

  private lastKlineTime: number | null = null;

  connect() {
    this.ws = new WebSocket(
      "wss://stream.binance.com:443/stream?streams=btcusdt@kline_1m"
    );

    this.ws.onopen = () => {
      this.onConnectionChange(true);
      this.setupReconnection();
    };

    this.ws.onclose = () => {
      this.onConnectionChange(false);
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
      }
      setTimeout(() => this.connect(), 5000);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.stream === "btcusdt@kline_1m") {
        this.handleKlineMessage(data.data);
      }
    };
  }

  private handleKlineMessage(data: any) {
    const kline = data.k;
    const klineTime = kline.t;

    if (!this.lastKlineTime || klineTime >= this.lastKlineTime) {
      this.onTrade({
        time: klineTime,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v),
        isClosed: kline.x,
      });

      if (kline.x) {
        this.lastKlineTime = klineTime;
      }
    }
  }

  private setupReconnection() {
    this.reconnectInterval = setInterval(() => {
      if (this.ws) {
        this.ws.close();
        this.connect();
      }
    }, 23 * 60 * 60 * 1000);
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
