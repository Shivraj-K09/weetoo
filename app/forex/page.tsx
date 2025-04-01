"use client";

import { useEffect, useState } from "react";

/**
 * Interface for forex data that matches the API response
 */
interface ForexItem {
  Pair: string;
  Bid: string;
  Ask: string;
  High: string;
  Low: string;
  "Chg.": string;
  "Chg. %": string;
  Time: string;
  [key: string]: string; // For any additional fields
}

type ForexData = Record<string, ForexItem>;

export default function ForexPage() {
  const [forexData, setForexData] = useState<ForexData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Only fetch from /api/forex
        const forexRes = await fetch("/api/forex");
        const forexJson = await forexRes.json();
        setForexData(forexJson);
      } catch (error) {
        console.error("Error fetching API data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading Forex data...</div>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Forex Data</h1>
      {/* Display the JSON for debugging */}
      <pre>{JSON.stringify(forexData, null, 2)}</pre>
    </div>
  );
}
