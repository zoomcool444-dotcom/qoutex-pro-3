import { Asset, Candle } from './types';

export const ASSETS_DATA: Asset[] = [
  // CURRENCIES (Featured in Quotex Video)
  {
    id: 'eur-nzd-otc',
    symbol: 'EUR/NZD (OTC)',
    name: 'EUR/NZD (OTC)',
    category: 'currencies',
    change24h: 0.12,
    payout1m: 81,
    payout5m: 81,
    basePrice: 1.99145,
    decimals: 5,
    isFavorite: true,
  },
  {
    id: 'eur-jpy',
    symbol: 'EUR/JPY',
    name: 'EUR/JPY',
    category: 'currencies',
    change24h: -0.23,
    payout1m: 93,
    payout5m: 93,
    basePrice: 176.820,
    decimals: 3,
    isFavorite: true,
  },
  {
    id: 'gbp-jpy',
    symbol: 'GBP/JPY',
    name: 'GBP/JPY',
    category: 'currencies',
    change24h: -0.28,
    payout1m: 84,
    payout5m: 80,
    basePrice: 209.350,
    decimals: 3,
    isFavorite: true,
  },
  {
    id: 'cad-chf-otc',
    symbol: 'CAD/CHF (OTC)',
    name: 'CAD/CHF (OTC)',
    category: 'currencies',
    change24h: -0.35,
    payout1m: 93,
    payout5m: 93,
    basePrice: 0.63820,
    decimals: 5,
    isFavorite: true,
  },
  {
    id: 'nzd-jpy-otc',
    symbol: 'NZD/JPY (OTC)',
    name: 'NZD/JPY (OTC)',
    category: 'currencies',
    change24h: -0.57,
    payout1m: 93,
    payout5m: 93,
    basePrice: 92.150,
    decimals: 3,
  },
  {
    id: 'usd-ars-otc',
    symbol: 'USD/ARS (OTC)',
    name: 'USD/ARS (OTC)',
    category: 'currencies',
    change24h: -0.15,
    payout1m: 93,
    payout5m: 93,
    basePrice: 978.50,
    decimals: 2,
  },
  {
    id: 'aud-nzd-otc',
    symbol: 'AUD/NZD (OTC)',
    name: 'AUD/NZD (OTC)',
    category: 'currencies',
    change24h: 0.24,
    payout1m: 93,
    payout5m: 93,
    basePrice: 1.08240,
    decimals: 5,
    isFavorite: true,
  },
  {
    id: 'eur-cad-otc',
    symbol: 'EUR/CAD (OTC)',
    name: 'EUR/CAD (OTC)',
    category: 'currencies',
    change24h: 3.07,
    payout1m: 95,
    payout5m: 95,
    basePrice: 1.60940,
    decimals: 5,
  },
  {
    id: 'aud-usd-otc',
    symbol: 'AUD/USD (OTC)',
    name: 'AUD/USD (OTC)',
    category: 'currencies',
    change24h: 0.76,
    payout1m: 93,
    payout5m: 93,
    basePrice: 0.65820,
    decimals: 5,
  },
  {
    id: 'usd-jpy-otc',
    symbol: 'USD/JPY (OTC)',
    name: 'USD/JPY (OTC)',
    category: 'currencies',
    change24h: 0.51,
    payout1m: 88,
    payout5m: 88,
    basePrice: 153.240,
    decimals: 3,
  },

  // COMMODITIES
  {
    id: 'ukbrent-otc',
    symbol: 'UKBrent (OTC)',
    name: 'UKBrent (OTC)',
    category: 'commodities',
    change24h: 21.4,
    payout1m: 92,
    payout5m: 92,
    basePrice: 52.419,
    decimals: 3,
    isFavorite: true,
  },
  {
    id: 'uscrude-otc',
    symbol: 'USCrude (OTC)',
    name: 'USCrude (OTC)',
    category: 'commodities',
    change24h: -1.41,
    payout1m: 70,
    payout5m: 70,
    basePrice: 71.450,
    decimals: 3,
    isFavorite: true,
  },
  {
    id: 'gold-otc',
    symbol: 'Gold',
    name: 'Gold',
    category: 'commodities',
    change24h: 0.64,
    payout1m: 40,
    payout5m: 40,
    basePrice: 4351.55,
    decimals: 2,
    isFavorite: true,
  },
  {
    id: 'silver-otc',
    symbol: 'Silver',
    name: 'Silver',
    category: 'commodities',
    change24h: -0.40,
    payout1m: 20,
    payout5m: 20,
    basePrice: 31.420,
    decimals: 3,
  },

  // CRYPTO
  {
    id: 'ripple-otc',
    symbol: 'Ripple (OTC)',
    name: 'Ripple (OTC)',
    category: 'crypto',
    change24h: 2.7,
    payout1m: 92,
    payout5m: 60,
    basePrice: 1.5141,
    decimals: 4,
    isFavorite: true,
  },
  {
    id: 'ethereum-otc',
    symbol: 'Ethereum (OTC)',
    name: 'Ethereum (OTC)',
    category: 'crypto',
    change24h: 0.93,
    payout1m: 92,
    payout5m: 80,
    basePrice: 3241.50,
    decimals: 2,
    isFavorite: true,
  },
  {
    id: 'bitcoin-otc',
    symbol: 'Bitcoin (OTC)',
    name: 'Bitcoin (OTC)',
    category: 'crypto',
    change24h: 0.82,
    payout1m: 57,
    payout5m: 51,
    basePrice: 65420.0,
    decimals: 1,
    isFavorite: true,
  },
  {
    id: 'solana-otc',
    symbol: 'Solana (OTC)',
    name: 'Solana (OTC)',
    category: 'crypto',
    change24h: -0.27,
    payout1m: 73,
    payout5m: 50,
    basePrice: 121.43,
    decimals: 2,
  },
  {
    id: 'cosmos-otc',
    symbol: 'Cosmos (OTC)',
    name: 'Cosmos (OTC)',
    category: 'crypto',
    change24h: 2.76,
    payout1m: 72,
    payout5m: 60,
    basePrice: 1.7912,
    decimals: 4,
  },
];

/**
 * Generate realistic historical market candles properly aligned with timeframeSeconds.
 * Snaps to the exact current timeframe bucket so live ticks develop candles at normal speed.
 */
export function generateInitialCandles(asset: Asset, timeframeSeconds = 60, totalCandles = 400): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  const stepMs = Math.max(5, timeframeSeconds) * 1000;
  
  // Snap current candle time to exact boundary
  const currentCandleTime = Math.floor(now / stepMs) * stepMs;
  const startTime = currentCandleTime - (totalCandles - 1) * stepMs;

  // Deterministic seed for unique asset chart patterns
  let seed = 0;
  for (let c = 0; c < asset.id.length; c++) {
    seed = (seed * 31 + asset.id.charCodeAt(c)) & 0xffffffff;
  }
  const pseudoRand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 4294967296;
  };

  const base = asset.basePrice;
  const volatility = base * 0.0012;

  let currentPrice = base * (0.985 + pseudoRand() * 0.03);

  for (let i = 0; i < totalCandles; i++) {
    const time = startTime + i * stepMs;

    // Macro wave pattern unique to this asset
    const wave = Math.sin((i / totalCandles) * Math.PI * 4 + (seed % 10)) * (base * 0.02);
    const target = base + wave;
    const meanPull = (target - currentPrice) * 0.04;
    const noise = (pseudoRand() - 0.495) * volatility;
    const delta = meanPull + noise;

    const open = currentPrice;
    const close = +(open + delta).toFixed(asset.decimals);

    const wickUpper = pseudoRand() * volatility * 0.5;
    const wickLower = pseudoRand() * volatility * 0.5;
    const high = +(Math.max(open, close) + wickUpper).toFixed(asset.decimals);
    const low = +(Math.min(open, close) - wickLower).toFixed(asset.decimals);
    const volume = Math.floor(pseudoRand() * 250) + 60;

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  // Smooth final candle near asset basePrice
  const lastIdx = candles.length - 1;
  candles[lastIdx].close = asset.basePrice;
  candles[lastIdx].high = Math.max(candles[lastIdx].high, asset.basePrice);
  candles[lastIdx].low = Math.min(candles[lastIdx].low, asset.basePrice);

  return candles;
}

/**
 * Convert standard candles to Heiken-Ashi candlesticks
 */
export function toHeikenAshi(candles: Candle[]): Candle[] {
  if (candles.length === 0) return [];
  const haCandles: Candle[] = [];

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const haClose = (c.open + c.high + c.low + c.close) / 4;
    const haOpen = i === 0 ? (c.open + c.close) / 2 : (haCandles[i - 1].open + haCandles[i - 1].close) / 2;
    const haHigh = Math.max(c.high, haOpen, haClose);
    const haLow = Math.min(c.low, haOpen, haClose);

    haCandles.push({
      time: c.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
      volume: c.volume,
    });
  }

  return haCandles;
}

/**
 * Bill Williams Fractal calculation:
 * Identifies 5-bar swing highs and swing lows.
 */
export function calculateFractals(
  candles: Candle[]
): { highs: { index: number; price: number }[]; lows: { index: number; price: number }[] } {
  const highs: { index: number; price: number }[] = [];
  const lows: { index: number; price: number }[] = [];

  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i];
    // Swing High
    if (
      c.high > candles[i - 1].high &&
      c.high > candles[i - 2].high &&
      c.high > candles[i + 1].high &&
      c.high > candles[i + 2].high
    ) {
      highs.push({ index: i, price: c.high });
    }

    // Swing Low
    if (
      c.low < candles[i - 1].low &&
      c.low < candles[i - 2].low &&
      c.low < candles[i + 1].low &&
      c.low < candles[i + 2].low
    ) {
      lows.push({ index: i, price: c.low });
    }
  }

  return { highs, lows };
}

/**
 * Parabolic SAR (Stop and Reverse) calculation
 */
export function calculateParabolicSAR(
  candles: Candle[],
  step = 0.02,
  maxStep = 0.2
): (number | null)[] {
  const sarList: (number | null)[] = new Array(candles.length).fill(null);
  if (candles.length < 3) return sarList;

  let isUp = candles[1].close > candles[0].close;
  let sar = isUp ? candles[0].low : candles[0].high;
  let ep = isUp ? candles[1].high : candles[1].low;
  let af = step;

  sarList[0] = sar;
  sarList[1] = sar;

  for (let i = 2; i < candles.length; i++) {
    const prevSAR = sar;
    if (isUp) {
      sar = prevSAR + af * (ep - prevSAR);
      // Ensure SAR is not above prior 2 lows
      sar = Math.min(sar, candles[i - 1].low, candles[i - 2].low);

      if (candles[i].low < sar) {
        // Switch to Down trend
        isUp = false;
        sar = ep;
        ep = candles[i].low;
        af = step;
      } else {
        if (candles[i].high > ep) {
          ep = candles[i].high;
          af = Math.min(af + step, maxStep);
        }
      }
    } else {
      sar = prevSAR + af * (ep - prevSAR);
      // Ensure SAR is not below prior 2 highs
      sar = Math.max(sar, candles[i - 1].high, candles[i - 2].high);

      if (candles[i].high > sar) {
        // Switch to Up trend
        isUp = true;
        sar = ep;
        ep = candles[i].high;
        af = step;
      } else {
        if (candles[i].low < ep) {
          ep = candles[i].low;
          af = Math.min(af + step, maxStep);
        }
      }
    }

    sarList[i] = sar;
  }

  return sarList;
}

/**
 * Technical Indicator Math:
 * Bollinger Bands (SMA, Upper, Lower)
 */
export function calculateBollingerBands(
  candles: Candle[],
  period = 20,
  stdDevMultiplier = 2
): { middle: (number | null)[]; upper: (number | null)[]; lower: (number | null)[] } {
  const middle: (number | null)[] = [];
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      middle.push(null);
      upper.push(null);
      lower.push(null);
      continue;
    }

    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    const mean = sum / period;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(candles[j].close - mean, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    middle.push(mean);
    upper.push(mean + stdDevMultiplier * stdDev);
    lower.push(mean - stdDevMultiplier * stdDev);
  }

  return { middle, upper, lower };
}

/**
 * Moving Average (SMA)
 */
export function calculateSMA(candles: Candle[], period = 14): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    result.push(sum / period);
  }
  return result;
}

/**
 * Alligator indicator (Jaws 13/8, Teeth 8/5, Lips 5/3)
 */
export function calculateAlligator(
  candles: Candle[],
  jawsP = 13,
  teethP = 8,
  lipsP = 5
): { jaws: (number | null)[]; teeth: (number | null)[]; lips: (number | null)[] } {
  const jaws = calculateSMA(candles, jawsP);
  const teeth = calculateSMA(candles, teethP);
  const lips = calculateSMA(candles, lipsP);
  return { jaws, teeth, lips };
}

/**
 * Envelopes
 */
export function calculateEnvelopes(
  candles: Candle[],
  period = 14,
  deviation = 0.002
): { middle: (number | null)[]; upper: (number | null)[]; lower: (number | null)[] } {
  const middle = calculateSMA(candles, period);
  const upper = middle.map((val) => (val !== null ? val * (1 + deviation) : null));
  const lower = middle.map((val) => (val !== null ? val * (1 - deviation) : null));
  return { middle, upper, lower };
}

/**
 * Zig Zag indicator calculation
 */
export function calculateZigZag(
  candles: Candle[],
  depth = 12,
  deviation = 0.002
): { index: number; price: number }[] {
  const points: { index: number; price: number }[] = [];
  if (candles.length < depth) return points;

  let lastExtremeType: 'high' | 'low' | null = null;
  let lastExtremePrice = 0;
  let lastExtremeIndex = 0;

  for (let i = depth; i < candles.length; i += Math.max(1, Math.floor(depth / 2))) {
    const windowCandles = candles.slice(i - depth, i);
    let maxHigh = -Infinity;
    let maxHighIdx = -1;
    let minLow = Infinity;
    let minLowIdx = -1;

    windowCandles.forEach((c, idx) => {
      const realIdx = i - depth + idx;
      if (c.high > maxHigh) {
        maxHigh = c.high;
        maxHighIdx = realIdx;
      }
      if (c.low < minLow) {
        minLow = c.low;
        minLowIdx = realIdx;
      }
    });

    if (lastExtremeType !== 'high' && (maxHigh - lastExtremePrice) / lastExtremePrice >= deviation) {
      points.push({ index: maxHighIdx, price: maxHigh });
      lastExtremeType = 'high';
      lastExtremePrice = maxHigh;
      lastExtremeIndex = maxHighIdx;
    } else if (lastExtremeType !== 'low' && (lastExtremePrice - minLow) / lastExtremePrice >= deviation) {
      points.push({ index: minLowIdx, price: minLow });
      lastExtremeType = 'low';
      lastExtremePrice = minLow;
      lastExtremeIndex = minLowIdx;
    }
  }

  // Ensure last candle is connected
  if (points.length > 0 && points[points.length - 1].index !== candles.length - 1) {
    points.push({ index: candles.length - 1, price: candles[candles.length - 1].close });
  }

  return points;
}
