export type AssetCategory = 'crypto' | 'currencies' | 'commodities' | 'stocks';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  change24h: number;
  payout1m: number; // e.g. 92%
  payout5m: number; // e.g. 70%
  basePrice: number;
  decimals: number;
  isFavorite?: boolean;
}

export interface Candle {
  time: number; // timestamp in ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TradeDirection = 'call' | 'put';

export interface ActiveTrade {
  id: string;
  assetId: string;
  assetSymbol: string;
  assetName: string;
  direction: TradeDirection;
  entryPrice: number;
  currentPrice: number;
  amount: number;
  payoutPercent: number;
  potentialProfit: number;
  startTime: number;
  durationSeconds: number;
  expiryTime: number;
  remainingSeconds: number;
  status: 'active' | 'won' | 'lost' | 'sold' | 'draw';
  exitPrice?: number;
  finalProfit?: number;
}

export type IndicatorType =
  | 'Alligator'
  | 'Bollinger Bands'
  | 'Envelopes'
  | 'Fractal'
  | 'Ichimoku Cloud'
  | 'Keltner channel'
  | 'Donchian channel'
  | 'Supertrend'
  | 'Moving Average'
  | 'Parabolic SAR'
  | 'Zig Zag'
  | 'RSI'
  | 'MACD'
  | 'Schaff Trend Cycle';

export interface IndicatorConfig {
  id: string;
  type: IndicatorType;
  enabled: boolean;
  color?: string;
  colorSecondary?: string;
  colorTertiary?: string;
  lineWidth?: number;
  // Parameters
  period?: number;
  deviation?: number;
  fastLength?: number;
  slowLength?: number;
  jawsPeriod?: number;
  teethPeriod?: number;
  lipsPeriod?: number;
  shift?: number;
  depth?: number;
  backstep?: number;
}

export type ChartType = 'area' | 'candles' | 'bars' | 'heiken-ashi' | 'line';
export type Timeframe =
  | '5s'
  | '10s'
  | '15s'
  | '30s'
  | '1m'
  | '1M'
  | '2m'
  | '5m'
  | '5M'
  | '10m'
  | '15m'
  | '15M'
  | '30m'
  | '1h'
  | '1H'
  | '4h'
  | '1d'
  | '1D';

export type DrawingToolType =
  | 'Date and Price Range'
  | 'Ray'
  | 'Disjoint Channel'
  | 'Arc'
  | 'Gann Box'
  | 'Flat Top/Bottom'
  | 'Curve'
  | 'Extended Line'
  | 'Triangle'
  | 'Cross Line'
  | 'Vertical Line'
  | 'Rectangle'
  | 'Fibonacci Fan'
  | 'Trend Line'
  | 'Fibonacci Retracement'
  | 'Pitchfan'
  | 'Horizontal Line'
  | 'Trend Angle'
  | 'Cyclic Lines'
  | 'Price Range'
  | 'Parallel Channel';

export interface DrawingItem {
  id: string;
  type: DrawingToolType;
  color: string;
  lineWidth: number;
  opacity?: number;
  price: number;
  price2?: number;
  price3?: number;
  time: number; // millisecond timestamp of anchor 1
  time2?: number; // millisecond timestamp of anchor 2
  time3?: number; // millisecond timestamp of anchor 3
  locked?: boolean;
  visible?: boolean;
  labelIndex?: number;
}

export interface PlatformSettingsState {
  language: string;
  timezone: string;
  template: 'Full Night' | 'Twilight' | 'Light Mode';
  gridOpacity: number;
  autoScrolling: boolean;
  oneClickTrade: boolean;
  performanceMode: boolean;
  shortOrderLabel: boolean;
  hideTradeResults: boolean;
  skipSignalConfirmation: boolean;
  upTrendColor: string;
  downTrendColor: string;
}

export interface AccountState {
  type: 'demo' | 'live';
  demoBalance: number;
  liveBalance: number;
  currency: string;
  accountId: string;
  userEmail: string;
  userName: string;
  firstName: string;
  lastName: string;
  dob: string;
  country: string;
  address: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface SignalItem {
  id: string;
  assetId: string;
  assetName: string;
  direction: 'call' | 'put';
  timeframe: string;
  probability: number;
  expiryMinutes: number;
  timestamp: string;
}
