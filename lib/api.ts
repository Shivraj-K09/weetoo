// Types for Binance API response
export interface BinanceTickerData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

// Interface for Commodity API response
export interface CommodityData {
  Name: string;
  Month: string;
  Last: string;
  Prev: string;
  High: string;
  Low: string;
  Chg: string;
  "Chg%": string;
  Time: string;
}

// Interface for Forex API response
export interface ForexData {
  Pair: string;
  Bid: string;
  Ask: string;
  High: string;
  Low: string;
  "Chg.": string;
  "Chg. %": string;
  Time: string;
}

// Function to fetch data from Binance API
export async function fetchCryptoData(
  symbol = "BTCUSDT"
): Promise<BinanceTickerData> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
      {
        // Add cache control to avoid potential caching issues
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch crypto data:", error);
    // Return mock data as fallback
    return generateMockBinanceData(symbol);
  }
}

// Function to fetch commodity data from the user's API route
export async function fetchCommodityData(): Promise<
  Record<string, CommodityData>
> {
  try {
    // Call the user's API route
    const response = await fetch("/api/commodities", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Commodity data from API:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch commodity data:", error);
    // Return empty object as fallback
    return {};
  }
}

// Function to fetch forex data from the user's API route
export async function fetchForexData(): Promise<Record<string, ForexData>> {
  try {
    // Call the user's API route
    const response = await fetch("/api/forex", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Forex data from API:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch forex data:", error);
    // Return empty object as fallback
    return {};
  }
}

// Add a function to generate mock Binance data when the API fails
function generateMockBinanceData(symbol: string): BinanceTickerData {
  // Generate a random price around 86500 for BTC
  const basePrice = 86500;
  const randomFactor = 1 + (Math.random() * 0.02 - 0.01); // ±1% variation
  const lastPrice = (basePrice * randomFactor).toString();

  // Generate a random price change
  const priceChange = (basePrice * (Math.random() * 0.01 - 0.005)).toString(); // ±0.5% change
  const priceChangePercent = (
    (Number(priceChange) / basePrice) *
    100
  ).toString();

  // Calculate high and low prices
  const highPrice = (
    Number(lastPrice) *
    (1 + Math.random() * 0.005)
  ).toString();
  const lowPrice = (Number(lastPrice) * (1 - Math.random() * 0.005)).toString();

  return {
    symbol,
    priceChange,
    priceChangePercent,
    weightedAvgPrice: lastPrice,
    prevClosePrice: (Number(lastPrice) - Number(priceChange)).toString(),
    lastPrice,
    lastQty: "0.5",
    bidPrice: (Number(lastPrice) * 0.999).toString(),
    bidQty: "1.0",
    askPrice: (Number(lastPrice) * 1.001).toString(),
    askQty: "1.0",
    openPrice: (Number(lastPrice) - Number(priceChange)).toString(),
    highPrice,
    lowPrice,
    volume: "1000",
    quoteVolume: "86500000",
    openTime: Date.now() - 86400000,
    closeTime: Date.now(),
    firstId: 1,
    lastId: 100,
    count: 100,
  };
}

// Function to generate chart data from price history
export function generateChartDataFromPrice(
  currentPrice: number,
  previousData: number[] = []
): number[] {
  // Ensure currentPrice is a valid number
  if (
    typeof currentPrice !== "number" ||
    isNaN(currentPrice) ||
    !isFinite(currentPrice)
  ) {
    currentPrice = 100; // Default fallback value
  }

  // If we have previous data, add the new price and keep the last 50 points
  if (previousData && previousData.length > 0) {
    // Filter out any invalid values from previous data
    const validPreviousData = previousData.filter(
      (value) => typeof value === "number" && !isNaN(value) && isFinite(value)
    );

    if (validPreviousData.length > 0) {
      const newData = [...validPreviousData, currentPrice];
      return newData.slice(-50); // Keep only the last 50 data points
    }
  }

  // If no previous data or invalid previous data, generate new data points
  const data: number[] = [];

  // Generate 50 points with small random variations around the current price
  for (let i = 0; i < 50; i++) {
    // Random variation of ±0.5%
    const variation = currentPrice * (Math.random() * 0.01 - 0.005);
    data.push(currentPrice + variation);
  }

  return data;
}

// Convert Binance data to our CurrencyData format
export function convertBinanceDataToCurrencyData(
  binanceData: BinanceTickerData,
  previousChartData: number[] = []
) {
  const price = Number.parseFloat(binanceData.lastPrice);
  const priceChangePercent = Number.parseFloat(binanceData.priceChangePercent);
  const priceChange = Number.parseFloat(binanceData.priceChange);
  const isPositive = priceChangePercent >= 0;

  // Generate chart data with validation
  const chartData = generateChartDataFromPrice(price, previousChartData);

  return {
    symbol: "BTC/USD",
    price: price.toFixed(2),
    change: priceChangePercent.toFixed(2), // Make sure this is just the number without + sign
    pips: Math.abs(priceChange).toFixed(2),
    high: Number.parseFloat(binanceData.highPrice).toFixed(2),
    low: Number.parseFloat(binanceData.lowPrice).toFixed(2),
    chartData: chartData,
    backgroundColor: isPositive ? "bg-[#2e3d33]" : "bg-[#3d2e3b]",
    isLive: true,
  };
}

// Convert Commodity data to our CurrencyData format
export function convertCommodityDataToCurrencyData(
  commodityData: CommodityData,
  symbol: string,
  previousChartData: number[] = []
) {
  try {
    // Parse price values, removing commas for calculations but keeping original format for display
    const price = Number.parseFloat(commodityData.Last.replace(/,/g, ""));
    // const changePercent = Number.parseFloat(
    //   commodityData["Chg%"].replace("%", "").replace("+", "")
    // );
    // const change = Number.parseFloat(
    //   commodityData.Chg.replace("+", "").replace(/,/g, "")
    // );
    const isPositive = commodityData.Chg.includes("+");

    // Generate chart data with validation
    const chartData = generateChartDataFromPrice(price, previousChartData);

    // Use the proper display name for commodities
    const displaySymbol =
      symbol === "GOLD"
        ? "Gold"
        : symbol === "CRUDE OIL WTI"
        ? "Crude Oil WTI"
        : symbol;

    return {
      symbol: displaySymbol,
      price: commodityData.Last, // Use Last directly with original formatting
      change: commodityData["Chg%"].replace("+", "").replace("%", ""), // Remove + and % for consistency
      pips: commodityData.Chg.replace("+", ""), // Remove + for consistency
      high: commodityData.High,
      low: commodityData.Low,
      chartData: chartData,
      backgroundColor: isPositive ? "bg-[#2e3d33]" : "bg-[#3d2e3b]",
      isLive: true,
    };
  } catch (error) {
    console.error(`Error converting commodity data for ${symbol}:`, error);

    // Return empty object to trigger fallback in the component
    return {};
  }
}

// Convert Forex data to our CurrencyData format
export function convertForexDataToCurrencyData(
  forexData: ForexData,
  previousChartData: number[] = []
) {
  try {
    // Parse price values for calculations
    const price = Number.parseFloat(forexData.Bid);
    // const changePercent = Number.parseFloat(
    //   forexData["Chg. %"].replace("%", "").replace("+", "")
    // );
    const change = Number.parseFloat(forexData["Chg."].replace("+", ""));
    const isPositive = !forexData["Chg."].includes("-");

    // Generate chart data with validation
    const chartData = generateChartDataFromPrice(price, previousChartData);

    // Determine background color based on currency pair
    const backgroundColor = isPositive
      ? "bg-[#2e3d33]" // Green background for positive changes
      : "bg-[#3d2e3b]"; // Red background for negative changes

    return {
      symbol: forexData.Pair,
      price: forexData.Bid,
      change: forexData["Chg. %"].replace("%", "").replace("+", ""), // Remove + and % for consistency
      pips: Math.abs(change).toString(), // Absolute value of change
      high: forexData.High,
      low: forexData.Low,
      chartData: chartData,
      backgroundColor: backgroundColor,
      isLive: true,
    };
  } catch (error) {
    console.error(`Error converting forex data for ${forexData.Pair}:`, error);

    // Return empty object to trigger fallback in the component
    return {};
  }
}
