// Format large numbers with commas
export function formatLargeNumber(num: number | string): string {
  if (typeof num === "string") {
    num = Number.parseFloat(num);
  }
  return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// Format currency with $ sign and commas
export function formatCurrency(amount: number | string): string {
  if (typeof amount === "string") {
    amount = Number.parseFloat(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format number with commas
export function formatNumber(num: number): string {
  if (num === undefined || num === null) return "0";

  // For very small numbers, use scientific notation
  if (Math.abs(num) < 0.0001 && num !== 0) {
    return num.toExponential(4);
  }

  // For regular numbers, format with appropriate decimal places
  const absNum = Math.abs(num);
  let decimalPlaces = 2;

  if (absNum < 1) decimalPlaces = 4;
  if (absNum >= 1000) decimalPlaces = 0;

  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

// Extract base and quote currency from symbol
export function extractCurrencies(symbol: string): {
  base: string;
  quote: string;
} {
  // Common quote currencies
  const quoteCurrencies = ["USDT", "BTC", "ETH", "BNB", "BUSD"];

  for (const quote of quoteCurrencies) {
    if (symbol.endsWith(quote)) {
      return {
        base: symbol.slice(0, symbol.length - quote.length),
        quote,
      };
    }
  }

  // Default fallback
  return {
    base: symbol.slice(0, -4),
    quote: symbol.slice(-4),
  };
}

// Get room name initial for avatar
export function getRoomInitial(name: string): string {
  return name ? name.charAt(0).toUpperCase() : "R";
}
