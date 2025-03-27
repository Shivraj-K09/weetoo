import type { CurrencyData, CandlestickData, PerformanceItem } from "@/types";

// Generate random chart data
function generateChartData(
  length = 50,
  trend: "up" | "down" | "neutral" = "neutral"
): number[] {
  const data: number[] = [];
  let value = 50 + Math.random() * 10;

  for (let i = 0; i < length; i++) {
    // Add some randomness but follow the trend
    const change = (Math.random() - 0.5) * 2;
    const trendFactor = trend === "up" ? 0.2 : trend === "down" ? -0.2 : 0;

    value += change + trendFactor;
    value = Math.max(0, Math.min(100, value)); // Keep within bounds
    data.push(value);
  }

  return data;
}

// Currency data
export const currencyData: CurrencyData[] = [
  {
    symbol: "EUR/USD",
    price: "1.0804",
    change: "+0.03",
    pips: "0.0003",
    high: "1.0809",
    low: "1.0784",
    chartData: generateChartData(50, "neutral"),
    backgroundColor: "#2c3038",
  },
  {
    symbol: "GBP/USD",
    price: "1.2922",
    change: "+0.00",
    pips: "0.0000",
    high: "1.2929",
    low: "1.2912",
    chartData: generateChartData(50, "neutral"),
    backgroundColor: "#2c3038",
  },
  {
    symbol: "USD/JPY",
    price: "150.44",
    change: "-0.17",
    pips: "0.25",
    high: "150.95",
    low: "150.42",
    chartData: generateChartData(50, "down"),
    backgroundColor: "#3d2e3b",
  },
  {
    symbol: "CRUDE OIL WTI",
    price: "69.12",
    change: "+0.01",
    pips: "0.01",
    high: "69.27",
    low: "69.02",
    chartData: generateChartData(50, "up"),
    backgroundColor: "#2e3d33",
  },
  {
    symbol: "USD/CAD",
    price: "1.4320",
    change: "+0.05",
    pips: "0.0007",
    high: "1.4327",
    low: "1.4311",
    chartData: generateChartData(50, "up"),
    backgroundColor: "#2c3038",
  },
  {
    symbol: "USD/CHF",
    price: "0.8828",
    change: "+0.03",
    pips: "0.0003",
    high: "0.8835",
    low: "0.8824",
    chartData: generateChartData(50, "neutral"),
    backgroundColor: "#2c3038",
  },
  {
    symbol: "AUD/USD",
    price: "0.6290",
    change: "+0.06",
    pips: "0.0004",
    high: "0.6295",
    low: "0.6277",
    chartData: generateChartData(50, "up"),
    backgroundColor: "#2c3038",
  },
  {
    symbol: "GOLD",
    price: "3021.80",
    change: "+0.21",
    pips: "6.20",
    high: "3025.40",
    low: "3010.80",
    chartData: generateChartData(50, "up"),
    backgroundColor: "#2e3d33",
  },
  {
    symbol: "NZD/USD",
    price: "0.5726",
    change: "-0.03",
    pips: "0.0002",
    high: "0.5730",
    low: "0.5717",
    chartData: generateChartData(50, "down"),
    backgroundColor: "#3d2e3b",
  },
  {
    symbol: "EUR/GBP",
    price: "0.8360",
    change: "+0.05",
    pips: "0.0004",
    high: "0.8363",
    low: "0.8351",
    chartData: generateChartData(50, "up"),
    backgroundColor: "#2c3038",
  },
  {
    symbol: "GBP/JPY",
    price: "194.38",
    change: "-0.18",
    pips: "0.35",
    high: "195.01",
    low: "194.37",
    chartData: generateChartData(50, "down"),
    backgroundColor: "#3d2e3b",
  },
  {
    symbol: "BTC/USD",
    price: "86625.10",
    change: "+0.15",
    pips: "132.10",
    high: "86745.60",
    low: "86275.10",
    chartData: generateChartData(50, "up"),
    backgroundColor: "#2e3d33",
  },
];

// Pre-generated candlestick data for each symbol to ensure consistency
const candlestickDataCache: Record<string, CandlestickData[]> = {};

// Generate candlestick data
export function getCandlestickData(symbol: string): CandlestickData[] {
  // Return cached data if it exists
  if (candlestickDataCache[symbol]) {
    return candlestickDataCache[symbol];
  }

  const data: CandlestickData[] = [];
  let basePrice = 0;

  // Set base price based on symbol
  switch (symbol) {
    case "EUR/USD":
      basePrice = 1.08;
      break;
    case "GBP/USD":
      basePrice = 1.29;
      break;
    case "USD/JPY":
      basePrice = 150;
      break;
    case "CRUDE OIL WTI":
      basePrice = 69;
      break;
    case "USD/CAD":
      basePrice = 1.43;
      break;
    case "USD/CHF":
      basePrice = 0.88;
      break;
    case "AUD/USD":
      basePrice = 0.62;
      break;
    case "GOLD":
      basePrice = 3020;
      break;
    case "NZD/USD":
      basePrice = 0.57;
      break;
    case "EUR/GBP":
      basePrice = 0.83;
      break;
    case "GBP/JPY":
      basePrice = 194;
      break;
    case "BTC/USD":
      basePrice = 86500;
      break;
    default:
      basePrice = 100;
  }

  // Generate 30 candles with a fixed seed for consistency
  const seed = symbol.charCodeAt(0) + symbol.charCodeAt(symbol.length - 1);
  let pseudoRandom = seed;

  const getPseudoRandom = () => {
    pseudoRandom = (pseudoRandom * 9301 + 49297) % 233280;
    return pseudoRandom / 233280;
  };

  for (let i = 0; i < 30; i++) {
    const volatility = basePrice * 0.005; // 0.5% volatility
    const open = basePrice * (1 + (getPseudoRandom() - 0.5) * 0.002);
    const close = open * (1 + (getPseudoRandom() - 0.5) * 0.002);
    const high = Math.max(open, close) + getPseudoRandom() * volatility;
    const low = Math.min(open, close) - getPseudoRandom() * volatility;

    data.push({
      time: `${i}:00`,
      open,
      high,
      low,
      close,
    });

    // Update base price for next candle
    basePrice = close;
  }

  // Cache the generated data
  candlestickDataCache[symbol] = data;

  return data;
}

// Performance data
export const performanceData: PerformanceItem[] = [
  {
    label: "JPY",
    value: "0.17%",
    color: "#2e7d32",
  },
  {
    label: "AUD",
    value: "0.06%",
    color: "#2e7d32",
  },
  {
    label: "EUR",
    value: "0.03%",
    color: "#2e7d32",
  },
  {
    label: "USD",
    value: "0.00%",
    color: "#2c3038",
  },
  {
    label: "GBP",
    value: "-0.03%",
    color: "#c62828",
  },
  {
    label: "CHF",
    value: "-0.03%",
    color: "#c62828",
  },
  {
    label: "NZD",
    value: "-0.05%",
    color: "#c62828",
  },
  {
    label: "CAD",
    value: "-0.04%",
    color: "#c62828",
  },
];
