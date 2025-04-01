import { ChevronUp, ChevronDown } from "lucide-react";

interface OrderBookEntry {
  price: string;
  amount: string;
  total: string;
}

interface OrderBookProps {
  data: {
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
    currentPrice: string;
    priceDirection: "up" | "down" | "none";
    priceChange: number;
    priceChangePercent: number;
    buyPercentage: number;
    sellPercentage: number;
  };
  pricePrecision?: string;
  viewMode: "all" | "buy" | "sell";
  symbol?: string;
}

export function OrderBook({
  data,
  pricePrecision = "0.01",
  viewMode = "all",
  symbol = "BTCUSDT",
}: OrderBookProps) {
  const {
    asks,
    bids,
    currentPrice,
    priceDirection,
    priceChange,
    priceChangePercent,
    buyPercentage,
    sellPercentage,
  } = data;

  // Parse the trading pair to get base and quote currencies
  const baseCurrency = symbol.replace(/USDT$/, "") || "BTC";
  const quoteCurrency = "USDT";

  // Get decimal places based on price precision
  const getPriceDecimals = () => {
    switch (pricePrecision) {
      case "0.01":
        return 2;
      case "0.1":
        return 1;
      case "1":
        return 0;
      default:
        return 2;
    }
  };

  // Format price with the selected precision
  const formatPrice = (price: number) => {
    return price.toFixed(getPriceDecimals());
  };

  // Format large numbers with K and M
  const formatShortNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
    else if (num >= 1_000) return (num / 1_000).toFixed(2) + "K";
    else return num.toFixed(6);
  };

  // Determine how many items to display based on view mode
  const displayLimit = viewMode === "all" ? 12 : 25; // Adjusted to 25 for filtered views

  // Calculate cumulative totals for display
  const asksWithTotals = [...asks].map((ask, index, array) => {
    const total = array
      .slice(0, index + 1)
      .reduce((sum, item) => sum + Number.parseFloat(item.amount), 0)
      .toString();
    return { ...ask, total };
  });

  const bidsWithTotals = [...bids].map((bid, index, array) => {
    const total = array
      .slice(0, index + 1)
      .reduce((sum, item) => sum + Number.parseFloat(item.amount), 0)
      .toString();
    return { ...bid, total };
  });

  // Limit the number of items based on view mode
  const displayAsks =
    viewMode === "all"
      ? asksWithTotals.slice(0, displayLimit)
      : asksWithTotals.slice(0, displayLimit);

  const displayBids =
    viewMode === "all"
      ? bidsWithTotals.slice(0, displayLimit)
      : bidsWithTotals.slice(0, displayLimit);

  // Current Price component - Reduced padding for filtered views
  const CurrentPriceDisplay = () => (
    <div
      className={`flex items-center justify-between ${
        viewMode !== "all" ? "py-1 mb-1" : "border-y border-gray-700 py-2 my-2"
      }`}
    >
      <div
        className={`flex items-center text-lg font-bold ${
          priceDirection === "up"
            ? "text-green-500"
            : priceDirection === "down"
            ? "text-red-500"
            : "text-white"
        }`}
      >
        {currentPrice}
        {priceDirection === "up" && <ChevronUp className="ml-1 h-5 w-5" />}
        {priceDirection === "down" && <ChevronDown className="ml-1 h-5 w-5" />}
      </div>
      <div
        className={`text-xs ${
          priceChange >= 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
      </div>
    </div>
  );

  return (
    <div className="text-white w-full">
      {/* Show current price at top for buy-only or sell-only views */}
      {viewMode !== "all" && <CurrentPriceDisplay />}
      <div className="flex text-xs text-gray-400 mb-0.5">
        <div className="w-[100px]">Price ({quoteCurrency})</div>
        <div className="w-[100px]">Amount ({baseCurrency})</div>
        <div className="w-[90px]">Total</div>
      </div>
      {/* Sell Orders (Asks) - Only show in "all" or "sell" mode */}
      {(viewMode === "all" || viewMode === "sell") && (
        <div className="overflow-hidden">
          {[...displayAsks].reverse().map((ask, index) => (
            <div key={`ask-${index}`} className="flex text-xs py-[2px]">
              <div className="text-red-500 w-[100px]">
                {formatPrice(Number.parseFloat(ask.price))}
              </div>
              <div className="w-[100px]">
                {Number.parseFloat(ask.amount).toFixed(6)}
              </div>
              <div className="w-[90px]">
                {formatShortNumber(Number.parseFloat(ask.total))}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Current Price - Only show in the middle for "all" view */}
      {viewMode === "all" && <CurrentPriceDisplay />}
      {/* Buy Orders (Bids) - Only show in "all" or "buy" mode */}
      {(viewMode === "all" || viewMode === "buy") && (
        <div className="overflow-hidden">
          {displayBids.map((bid, index) => (
            <div key={`bid-${index}`} className="flex text-xs py-[2px]">
              <div className="text-green-500 w-[100px]">
                {formatPrice(Number.parseFloat(bid.price))}
              </div>
              <div className="w-[100px]">
                {Number.parseFloat(bid.amount).toFixed(6)}
              </div>
              <div className="w-[90px]">
                {formatShortNumber(Number.parseFloat(bid.total))}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Buy/Sell Percentage Indicator - Show in all views with slightly more top padding */}
      <div className="mt-5 pt-2 border-t border-gray-700">
        <div className="flex justify-between text-xs mb-1">
          <div className="text-green-500">B {buyPercentage.toFixed(2)}%</div>
          <div className="text-red-500">{sellPercentage.toFixed(2)}% S</div>
        </div>
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-green-500"
            style={{ width: `${buyPercentage}%` }}
          />
          <div
            className="h-full bg-red-500"
            style={{ width: `${sellPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
