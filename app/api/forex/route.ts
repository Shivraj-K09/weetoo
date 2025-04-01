import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Interface for forex data
 */
interface ForexData {
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

/**
 * Fetch and extract forex data from Investing.com
 */
async function fetchForexData(): Promise<Record<string, ForexData>> {
  const url =
    "https://www.investing.com/currencies/streaming-forex-rates-majors";
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.investing.com/",
  };

  try {
    const response = await axios.get(url, { headers });
    const html: string = response.data;
    const $ = cheerio.load(html);

    // Define the allowed headers exactly as they appear in the table head.
    const allowedHeaders: string[] = [
      "Pair",
      "Bid",
      "Ask",
      "High",
      "Low",
      "Chg.",
      "Chg. %",
      "Time",
    ];

    const data: Record<string, ForexData> = {};

    $("tr").each((i, row) => {
      // Find the anchor with a title attribute that contains the currency pair.
      const aTag = $(row).find("a[title]");
      if (!aTag.length) return;

      // Extract the currency pair name from the title (e.g., "EUR/USD - (Some info)")
      const title = aTag.attr("title") || "";
      const currencyPair = title.split(" - ")[0].trim();

      // Process only if the currency pair is one of the desired ones.
      if (
        [
          "EUR/USD",
          "GBP/USD",
          "USD/JPY",
          "USD/CAD",
          "USD/CHF",
          "AUD/USD",
          "NZD/USD",
          "EUR/GBP",
          "GBP/JPY",
        ].includes(currencyPair)
      ) {
        const cells: string[] = [];
        $(row)
          .find("td")
          .each((i, cell) => {
            cells.push($(cell).text().trim());
          });
        // Remove the first cell if it's empty (commonly used for checkboxes)
        if (cells.length > 0 && cells[0] === "") {
          cells.shift();
        }

        // Build the formatted data using only the allowed headers.
        const formattedData: ForexData = {} as ForexData;
        allowedHeaders.forEach((header, idx) => {
          // For "Pair", override with the actual currency pair name.
          if (header === "Pair") {
            formattedData[header] = currencyPair;
          } else {
            formattedData[header] = cells[idx] || "";
          }
        });

        data[currencyPair] = formattedData;
      }
    });

    console.log("Forex data fetched:", data);
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching forex data:", errorMessage);
    return {};
  }
}

/**
 * API Route handler for GET requests.
 */
export async function GET(): Promise<NextResponse> {
  const data = await fetchForexData();
  return NextResponse.json(data);
}
